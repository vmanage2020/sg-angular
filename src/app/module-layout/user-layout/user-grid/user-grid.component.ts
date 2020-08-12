import { Component, OnInit, ViewChildren, QueryList, ElementRef, Output, EventEmitter, Injector, AfterViewInit } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Table } from '../../../dataTable/advanced.model';
import { tableData } from '../../../dataTable/data';
import { AdvancedService } from '../../../dataTable/advanced.service';
import { AdvancedSortableDirective, SortEvent } from '../../../dataTable/advanced-sortable.directive';
import { DataService } from 'src/app/core/services/data.service';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import * as firebase from 'firebase';
import { UserService } from '../user-service';
import { Logoinfo } from '../../logoinfo.interface'
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { DropdownService } from 'src/app/core/services/dropdown.service';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})

/**
 * Advanced table component - handling the advanced table with sidebar and content
 */
export class UserGridComponent implements OnInit {
  @Output() change = new EventEmitter();
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  userInfo: any[] = [];
  loading = false;
  displayLoader: any = true;
  page = 1;
  nextEnabled = false;
  prevEnabled = false;
  pageSize = 10;
  startIndex = 1;
  endIndex = 10;
  SelectedColumns: any = null;
  eachCol: any[] = [];
  uid: any;
  role_id: any = "all";
  org_id: any;
  showColumns: any;
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  isAscending: boolean = false;
  sortingInfo: any = {};
  selectedPageSize: number = 10;
  noOfCol: any = [
    { name: Constant.searchFilterKey, allCol: "All Columns", value: 'All Columns' },
    { name: 'name', allCol: "All Columns", value: "Name" },
    { name: 'status', allCol: "All Columns", value: "Status" },
    { name: 'role(s)', allCol: "All Columns", value: "Role(s)" },
    { name: 'email_address', allCol: "All Columns", value: 'Email Address' },
    { name: 'mobile_phone', allCol: "All Columns", value: 'Mobile Phone' },
    { name: 'city', allCol: "All Columns", value: 'City' },
    { name: 'state', allCol: "All Columns", value: 'State' },
  ];
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ]
  allRoles: any;
  isRoleSelected: boolean = false;
  term: any = '';
  searchTerm: any = '';
  pager: any = {};
  initialValue = "All Users";
  selectedRole: any = this.initialValue;
  totalRecords = 0;
  data: any;
  injectedData: any;
  adminref: any = firebase.firestore();
  //Models for Input fields
  nameValue: string;
  placeValue: string;

  //Save first document in snapshot of items received
  firstInResponse: any = [];

  forPaginationFirstResponse: any = [];
  //Save last document in snapshot of items received
  lastInResponse: any = [];
  forPaginationLastResponse: any = [];

  //Keep the array of first document of previous pages
  prev_strt_at: any = [];

  //Maintain the count of clicks on Next Prev button
  pagination_clicked_count = 0;

  //Disable next and prev buttons
  disable_next: boolean = false;
  disable_prev: boolean = false;
  // Value for injecting data
  getUserListInfo: any = {
    'uid': '',
    'page_no': '', 'item_per_page': '', 'organization_id': '', 'role_id': '',
    'sortingKey': '',
    'sortingValue': '',
    'isNextReq': '',
    'isPrevReq': '',
    'prevStartAt': '',
    'prevEndAt': '',
    'nextStartAt': '',
    'searchVal': '',
    'searchKey': ''
  }
  constructor(private dropDownService: DropdownService, private titlecasePipe: TitleCasePipe, private datatableservice: NgiDatatableService, private notification: NgiNotificationService, private injector: Injector, private sharedService: SharedService, public service: AdvancedService, private eref: ElementRef, public dataService: DataService, public router: Router, public cookieService: CookieService, public userService: UserService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        // this.data = data
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "userRouter") {
          this.change.emit({ action: "usergrid" })
        }
      }
    })
  }

  ngOnInit() {
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('user');
    this.org_id = localStorage.getItem('org_id');
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;
    this.getRoleList();
    console.log(this.injectedData.data);

    if (this.injectedData) {
      if (this.injectedData.data) {
        if (this.injectedData.data.userAction === "create" && this.injectedData.data.userAction) {
          this.totalRecords = this.injectedData.data.totalRecords;
          this.getPaging(this.injectedData.data.requestData.page_no);
          this.pager = this.datatableservice.getPager(this.injectedData.data.totalRecords, this.injectedData.data.requestData.page_no, this.injectedData.data.requestData.item_per_page);
          this.userInfo = this.injectedData.data.userInfo;
          this.getUserListInfo = this.injectedData.data.requestData;
          this.firstInResponse = this.injectedData.data.snapshot[0];
          this.lastInResponse = this.injectedData.data.snapshot[this.injectedData.data.snapshot.length - 1];
          this.push_prev_startAt(this.firstInResponse, this.injectedData.data.requestData.page_no);
          this.displayLoader = false;
        } else if (this.injectedData.data.userAction === "edit" && this.injectedData.data.userAction) {
          this.totalRecords = this.injectedData.data.totalRecords;
          
          this.getPagesizerole(this.injectedData.data.getInjectedDataFromgrid);
          this.loadDataForGrid(this.injectedData.data.getInjectedDataFromgrid);
          this.pager = this.datatableservice.getPager(this.injectedData.data.totalRecords, this.injectedData.data.requestData.page_no, this.injectedData.data.requestData.item_per_page);
          this.userInfo = this.injectedData.data.userInfo;
          this.getUserListInfo = this.injectedData.data.requestData;
          this.firstInResponse = this.injectedData.data.snapshot[0];
          this.lastInResponse = this.injectedData.data.snapshot[this.injectedData.data.snapshot.length - 1];
          this.getPaging(this.injectedData.data.requestData.page_no);
          this.pagination_clicked_count = this.injectedData.data.getInjectedDataFromgrid.pagination_clicked_count;
          this.displayLoader = false;
        } else {
          this.getPagesizerole(this.injectedData.data);
          if (this.injectedData.data.pageNo) {
            this.loadDataForGrid(this.injectedData.data);
            this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count - 1;
            if (this.injectedData.data.forPaginationFirstResponse) {
              this.firstInResponse = this.injectedData.data.forPaginationFirstResponse;
            } if (this.injectedData.data.forPaginationLastResponse) {
              this.lastInResponse = this.injectedData.data.forPaginationLastResponse;
            } if (this.nextEnabled) {
              this.getUserList(this.uid, this.org_id, this.injectedData.data.pageNo, this.injectedData.data.pageSize, this.injectedData.data.roleId,
                this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            } else if (this.prevEnabled) {
              this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count + 1;
              this.getUserList(this.uid, this.org_id, this.injectedData.data.pageNo, this.injectedData.data.pageSize, this.injectedData.data.roleId,
                this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.injectedData.data.pageNo), this.firstInResponse, this.lastInResponse)
            } else {
              this.getUserList(this.uid, this.org_id, this.injectedData.data.pageNo, this.injectedData.data.pageSize, this.injectedData.data.roleId,
                this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            }

          } else {
            this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
          }
        }

      }
      else {
        this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }

  }
  getPagesizerole(listDataForGrid: any) {
    this.selectedPageSize = listDataForGrid.pageSize;
    this.pageSize = listDataForGrid.pageSize;
    this.selectedRole = listDataForGrid.roleName;
  }

  loadDataForGrid(listDataForGrid: any) {
    this.role_id = listDataForGrid.roleId;
    this.term = listDataForGrid.term;
    this.nextEnabled = listDataForGrid.nextEnabled;
    this.prevEnabled = listDataForGrid.prevEnabled;
    this.searchKey = listDataForGrid.searchKey;
    this.searchFilter = listDataForGrid.searchFilter;
    this.sortedKey = listDataForGrid.sortedKey;
    this.sortedValue = listDataForGrid.sortedValue;
    this.sortingInfo = listDataForGrid.sortingInfo;
    this.prev_strt_at = listDataForGrid.prev_strt_at_arr;
  }
  //Search Input (to hide icon)
  onClear(event) {
    this.term = '';
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  searchInput(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  sorting(header, type, index) {
    this.isAscending != this.isAscending
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    if (type !== "asc") {
      this.isAscending = false;
      this.sortingInfo['type'] = 'desc';
      this.sortingInfo['index'] = index;
      switch (header.trim()) {
        case "Name":
          this.sortedKey = "first_name"
          break;
        case "City":
          this.sortedKey = "city"
          break;
        case "State":
          this.sortedKey = "state"
          break;
        case "Country Code":
          this.sortedKey = "country_code"
          break;
        case "Postal Code":
          this.sortedKey = "postal_code"
          break;
        case "Email Address":
          this.sortedKey = "email_address"
          break;
        case "Mobile Phone":
          this.sortedKey = "mobile_phone"
          break;
        default:
          this.sortedKey = "created_datetime"
          break;
      }
      this.sortedValue = type;
      this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } else {
      this.isAscending = true;
      this.sortingInfo['type'] = 'asc';
      this.sortingInfo['index'] = index;
      switch (header.trim()) {
        case "Name":
          this.sortedKey = "first_name"
          break;
        case "City":
          this.sortedKey = "city"
          break;
        case "State":
          this.sortedKey = "state"
          break;
        case "Country Code":
          this.sortedKey = "country_code"
          break;
        case "Postal Code":
          this.sortedKey = "postal_code"
          break;
        case "Email Address":
          this.sortedKey = "email_address"
          break;
        case "Mobile Phone":
          this.sortedKey = "mobile_phone"
          break;
        default:
          this.sortedKey = "created_datetime"
          break;
      }
      this.sortedValue = type;
      this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    }
  }

  onRoleChange(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.role_id = event.role_id;
    this.selectedRole = event.name;
    this.reInitialiseGrid();
    this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  async getRoleList() {
    this.isRoleSelected = true;
    let getRolesDropdownResponse: any = await this.dropDownService.getRoles();
    try {
      if (getRolesDropdownResponse.status) {
        if (getRolesDropdownResponse.data) {
          getRolesDropdownResponse.data.splice(0, 0, { name: 'All Users', role_id: 'all' });
          // getRolesDropdownResponse.data.push({  })
          this.allRoles = getRolesDropdownResponse.data;
          if (this.cookieService.getCookie('admin')) {
            this.allRoles = this.allRoles.filter(order => order.role_id !== "sys-admin");
          } else if (this.cookieService.getCookie('sysAdmin')) {
            if (localStorage.getItem('org_id') !== Constant.organization_id) {
              this.allRoles = this.allRoles.filter(order => order.role_id !== "sys-admin");
            }
            else {
              this.allRoles = this.allRoles.filter(order => order.role_id === "sys-admin" || order.role_id === "all");
            }
          }
          this.isRoleSelected = false;
        } else {
          this.isRoleSelected = false;
          this.allRoles = [];
        }
      } else {
        this.isRoleSelected = false;
        this.allRoles = [];
      }
    } catch (error) {
      console.log(error);
    }
  }
  addUser() {
    this.getUserListInfo.isNextReq = false;
    this.getUserListInfo.isPrevReq = false;
    this.getUserListInfo.page_no = 1;
    this.getUserListInfo.item_per_page = 10;
    this.getUserListInfo.searchVal = '';
    this.change.emit({ action: "createuser", data: this.getUserListInfo })
  }
  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value);
    this.selectedPageSize = this.pageSize;
    this.reInitialiseGrid();
    this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  reInitialiseGrid() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }

  async getUserList(uid: any, orgId: any, pageNo: any, itemPerPage: any, roleId: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {
    try {
      this.loading = true;
      let id = setInterval(this.timerFunction, 300, this.loaderInfo);
      if (this.term) {
        this.searchTerm = this.term.toLowerCase();
      } else {
        this.searchTerm = ''
      }
      if (this.firstInResponse) {
        this.forPaginationFirstResponse = this.firstInResponse;
      }
      if (this.lastInResponse) {
        this.forPaginationLastResponse = this.lastInResponse;
      }
      this.userInfo = [];
      let getUserList: any = {
        'uid': uid,
        'page_no': pageNo, 'item_per_page': itemPerPage, 'organization_id': orgId, 'role_id': roleId,
        'sortingKey': this.sortedKey,
        'sortingValue': this.sortedValue,
        'isNextReq': isNextReq,
        'isPrevReq': isPrevReq,
        'prevStartAt': prevStartAt,
        'prevEndAt': prevEndAt,
        'nextStartAt': nextStartAt,
        'searchVal': this.searchTerm,
        'searchKey': this.searchKey
      }

      getUserList.isNextReq = isNextReq ? true : false;
      getUserList.isPrevReq = isPrevReq ? true : false;
      this.getUserListInfo = getUserList;
      let getUsersResponse = await this.userService.getAllUsers(getUserList);
      console.log(getUsersResponse.data);

      if (getUsersResponse.status) {
        if (getUsersResponse.data) {
          this.firstInResponse = getUsersResponse.snapshot.docs[0];
          this.lastInResponse = getUsersResponse.snapshot.docs[getUsersResponse.snapshot.docs.length - 1];
          if (isNextReq) {
            this.pagination_clicked_count++;
            this.push_prev_startAt(this.firstInResponse, pageNo);
          }
          else if (isPrevReq) {
            //Maintaing page no.
            this.pagination_clicked_count--;
          } else {
            this.pagination_clicked_count = 0;
            pageNo = 1;
            this.page = 1;
            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse, pageNo);
          }
          for (let element of getUsersResponse.data) {
            if (element !== null) {
              if (element.roles && element.roles.length) {
                element['role(s)'] = element.roles.join(', ')
              } else {
                element['role(s)'] = "-"
              }
              if (element.mobile_phone) {
                element.mobile_phone = element.mobile_phone.replace(/^(\d{3})(\d{3})(\d{4}).*/, "($1) $2-$3");
              }
              if (element.suffix) {
                element['name'] = element.first_name + " " + element.middle_initial + " " + element.last_name + " " + element.suffix
              }
              else {
                element['name'] = element.first_name + " " + element.middle_initial + " " + element.last_name
              }
              if (element.is_signup_completed !== null)
              {
                if(element.is_signup_completed)
                {
                  element['status'] = 'Registered'
                }
                else{
                  element['status'] = 'Pending'
                }
              }
              else{
                element['status'] = 'Pending'
              }
              this.userInfo.push(element);
            }
          }
          this.totalRecords = getUsersResponse.totalRecords;
          this.getPaging(pageNo);
          this.pager = await this.datatableservice.getPager(getUsersResponse.totalRecords, pageNo, itemPerPage);
          this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
          this.sharedService.announceMission('userLoaded');
          this.loading = false;
          clearInterval(id);
          this.displayLoader = false;
        } else {
          this.resetGrid(id);
        }
      }
      else {
        this.resetGrid(id);
      }
    } catch (error) {
      this.resetGrid();
      console.log(error)
    }
  }

  resetGrid(id?: any) {
    this.sharedService.announceMission('userLoaded');
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.userInfo = [];
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }
  getRoleListForEachUser(roles: any) {
    let roleContains = [];
    roles.forEach(element => {
      switch (element.toLowerCase()) {
        case 'admin':
          roleContains.push(this.titlecasePipe.transform(element))
          break;
        case 'coach':
          roleContains.push(this.titlecasePipe.transform(element))
          break;
        case 'manager':
          roleContains.push(this.titlecasePipe.transform(element))
          break;
        case 'evaluator':
          roleContains.push(this.titlecasePipe.transform(element))
          break;
        case 'guardian':
          roleContains.push(this.titlecasePipe.transform(element))
          break;
        case 'player':
          roleContains.push(this.titlecasePipe.transform(element))
          break;
        case 'sys-admin':
          roleContains.push(this.titlecasePipe.transform("super admin"))
          break;
      }
    });
    return roleContains
  }
  getPaging(page) {
    this.page = page;
    this.startIndex = (page - 1) * +this.pageSize + 1;
    this.endIndex = (page - 1) * +this.pageSize + +this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    if (this.endIndex === 0) {
      this.startIndex = 0;
    }
  }

  userEdit(data) {
    this.loadData(data);
    data.viewBy = "edit";
    this.change.emit({ action: "edituser", data: data })
  }
  userView(data) {
    this.loadData(data);
    this.change.emit({ action: "viewuser", data: data })
  }

  loadData(data: any) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.roleId = this.role_id;
    data.roleName = this.selectedRole;
    data.prevEnabled = this.prevEnabled;
    data.nextEnabled = this.nextEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.sortedKey = this.sortedKey;
    data.sortedValue = this.sortedValue;
    data.sortingInfo = this.sortingInfo;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    data.prev_strt_at_arr = this.prev_strt_at;
    data.requestPayloadGrid = this.getUserListInfo;
  }
  selectedCol(event) {

    switch (event.value.trim()) {
      case "Name":
        this.searchKey = "keywordForFirstName"
        break;
      case "City":
        this.searchKey = "keywordForcity"
        break;
      case "State":
        this.searchKey = "keywordForstate"
        break;
      case "Country Code":
        this.searchKey = "keywordForcountrycode"
        break;
      case "Postal Code":
        this.searchKey = "keywordPostalCode"
        break;
      case "Email Address":
        this.searchKey = "keywordEmail"
        break;
      case "Mobile Phone":
        this.searchKey = "keywordMobileno"
        break;
      default:
        this.searchKey = "keywords"
        break;
    }
  }


  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.userInfo = [];
      this.reInitialiseGrid();
      await this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled,
        this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse)
    } catch (error) {
      console.log(error);
      this.disable_prev = false;
    }
  }

  async nextPage() {
    try {
      this.nextEnabled = true;
      this.page += 1
      this.prevEnabled = false;
      this.userInfo = [];
      this.reInitialiseGrid();
      await this.getUserList(this.uid, this.org_id, this.page, this.pageSize, this.role_id, this.nextEnabled,
        this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } catch (err) {
      console.log(err);
      this.disable_next = false;
    }
  }

  //Add document
  push_prev_startAt(prev_first_doc, pageNo) {
    this.prev_strt_at.splice(pageNo - 1, 0, prev_first_doc);
    // this.prev_strt_at.push(prev_first_doc);    
  }

  //Remove not required document 
  pop_prev_startAt(prev_first_doc) {
    this.prev_strt_at.forEach(element => {
      if (prev_first_doc.data().id == element.data().id) {
        element = null;
      }
    });
  }

  //Return the Doc rem where previous page will startAt
  get_prev_startAt(pageNo: any) {

    // if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
    //   this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
    return this.prev_strt_at[pageNo - 1];
  }

  //Date formate
  readableDate(time) {
    var d = new Date(time);
    return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
  }
}
