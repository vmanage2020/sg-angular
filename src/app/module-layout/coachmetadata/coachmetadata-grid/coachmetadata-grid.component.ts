import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { BehaviorSubject } from 'rxjs';
import { Constant } from 'src/app/core/services/config';
import { Logoinfo } from '../../logoinfo.interface';
import { CookieService } from 'src/app/core/services/cookie.service';
import { NgiNotificationService } from 'ngi-notification';
import { Router } from '@angular/router';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { CoachCustomFieldService } from '../coachmetadata-services';


@Component({
  selector: 'app-coachmetadata-grid',
  templateUrl: './coachmetadata-grid.component.html',
  styleUrls: ['./coachmetadata-grid.component.scss']
})
export class CoachmetadataGridComponent implements OnInit {

  @Output() change = new EventEmitter();

  getCoachfieldListInfo: any = {};
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  sportsInfo: any;
  noDataDefault = true
  initalValue: any = "All Coach Custom Field";
  sportName: any = this.initalValue;
  sportId: any = null;
  //  Search Filter
  term: any = '';
  searchTerm: any = '';
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  //  Pagination
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  startIndex = 0;
  endIndex = 0;
  // Sorting header Filter
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  sortingInfo: any = {};

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

  nextEnabled = false;
  prevEnabled = false;

  // start and end index

  selectedPageSize: number = 10;
  org_id: any;
  uid: any;
  systemadmin: boolean = false;
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ]
  data: any;
  pager: any = {};
  orgId: any;
  showColumns: any;
  eachCol: any[] = [];
  selectedSport: any = null;
  SelectedColumns: any = null;
  sportSelect: boolean = false;
  noOfCol: any = [
    { name: Constant.searchFilterKey, allCol: "All Columns", value: "All Columns" },
    { name: 'sport', allCol: "All Columns", value: "Sport" },
    { name: 'field_name', allCol: "All Columns", value: "Field Name" },
    { name: 'field_type', allCol: "All Columns", value: 'Field Type' },
    { name: 'value', allCol: "All Columns", value: 'Value' },
    { name: 'is_editable', allCol: "All Columns", value: "is_Editable" },
    { name: 'is_required', allCol: "All Columns", value: "is_Required" },
    { name: 'is_deletable', allCol: "All Columns", value: "is_Deletable" },



  ];
  roleId: any;
  cols: any;
  coachfieldInfo: any = [];
  injectedData: any;

  constructor(private notification: NgiNotificationService, private sharedService: SharedService, public cookieService: CookieService, 
    public router: Router, public injector: Injector, private dropDownService: DropdownService, private datatableservice: NgiDatatableService, 
    public CoachCustomFieldService: CoachCustomFieldService) { 
      
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    if (this.cookieService.getCookie('sysAdmin'))
    {
      this.systemadmin = true
    }
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data.action === "organizationFilter") {
        this.sharedService.announceMission('welcome');
        this.router.navigate(['/welcome']);
      } else if (data == "coachcustomRouter") {
        this.change.emit({ action: "coachcustomfield", data: null });
      }
    })
    }

  ngOnInit() {
    this.sharedService.announceMission('coachcustomfield');
    this.injectedData = this.injector.get('injectData');
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol
    this.showColumns = this.SelectedColumns;
    if ((this.cookieService.getCookie('admin'))) {
      this.roleId = Constant.admin
    }
    else if ((this.cookieService.getCookie('sysAdmin'))) {
      this.roleId = Constant.sysAdmin
    }
    if (this.orgId === Constant.organization_id) {
      this.getAllSports(this.uid);
    }
    else {
      this.getSportsByOrganization(this.orgId);
    }
    if (this.injectedData) {
      if (this.injectedData.data) {
        if(this.injectedData.data.userAction === "create" && this.injectedData.data.userAction){
          if (this.injectedData.data.sport_id) {
            this.sportId = this.injectedData.data.sport_id;
            this.sportName = this.injectedData.data.sport_name;
            this.loaddataAfterCreate(this.injectedData.data);
          } else {
            this.loaddataAfterCreate(this.injectedData.data);
          }
        }else if(this.injectedData.data.userAction === "edit" && this.injectedData.data.userAction){
          this.sportId = this.injectedData.data.getInjectedDataFromgrid.selectedSport;
          this.sportName = this.injectedData.data.getInjectedDataFromgrid.selectedSportName;
          this.totalRecords = this.injectedData.data.totalRecords;
          this.loaddataAfterEdit(this.injectedData.data.getInjectedDataFromgrid);
          this.pager = this.datatableservice.getPager(this.injectedData.data.totalRecords,
            this.injectedData.data.requestData.page_no, this.injectedData.data.requestData.item_per_page);
          this.coachfieldInfo = this.injectedData.data.userInfo;
          this.getCoachfieldListInfo = this.injectedData.data.requestData;
          this.firstInResponse = this.injectedData.data.snapshot[0];
          this.lastInResponse = this.injectedData.data.snapshot[this.injectedData.data.snapshot.length - 1];
          // this.push_prev_startAt(this.firstInResponse, this.injectedData.data.requestData.page_no);                   
          this.getPaging(this.injectedData.data.requestData.page_no);
          this.pagination_clicked_count = this.injectedData.data.getInjectedDataFromgrid.pagination_clicked_count;
          this.displayLoader = false;
        }else{
          this.sportId = this.injectedData.data.selectedSport;
          this.sportName = this.injectedData.data.selectedSportName;
          if ((this.injectedData.data.pageSize && this.injectedData.data.selectedSport) || (this.injectedData.data.pageSize && this.injectedData.data.selectedSportName === this.initalValue)) {
            this.loaddataAfterEdit(this.injectedData.data);
            if (this.injectedData.data.forPaginationFirstResponse) {
              this.firstInResponse = this.injectedData.data.forPaginationFirstResponse;
            } if (this.injectedData.data.forPaginationLastResponse) {
              this.lastInResponse = this.injectedData.data.forPaginationLastResponse;
            }
            if (this.nextEnabled) {
              this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.injectedData.data.pageNo, this.injectedData.data.pageSize,
                this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            } else if (this.prevEnabled) {
              this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count + 1;
              this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.injectedData.data.pageNo, this.injectedData.data.pageSize,
                this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.injectedData.data.pageNo), this.firstInResponse, this.lastInResponse)              
            } else {
              this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.injectedData.data.pageNo, this.injectedData.data.pageSize,
                this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)  
            }
            
          }
          else if (this.injectedData.data.sport_id) {
            this.sportId = this.injectedData.data.sport_id
            this.sportName = this.injectedData.data.sport_name;
            this.getCoachcustomfield(this.uid, this.orgId, this.injectedData.data.sport_id, this.roleId, this.page,
              this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
          }
          else if (!this.injectedData.data.sport_id) {
            this.sportId = this.injectedData.data.sport_id;
            this.sportName = this.injectedData.data.sport_name;
            this.getCoachcustomfield(this.uid, this.orgId, this.injectedData.data.sport_id, this.roleId, this.page,
              this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
          }
        }
       
      } else {
        this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } 
  }
  

  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }
  
  noData(id?: any) {
    this.coachfieldInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }

  loaddataAfterCreate(data: any) {
    this.totalRecords = data.totalRecords;
    this.getPaging(data.requestData.page_no);
    this.pager = this.datatableservice.getPager(data.totalRecords,
      data.requestData.page_no, data.requestData.item_per_page);
    this.coachfieldInfo = data.userInfo;
    this.getCoachfieldListInfo = data.requestData;
    this.firstInResponse = data.snapshot[0];
    this.lastInResponse = data.snapshot[data.snapshot.length - 1];
    this.push_prev_startAt(this.firstInResponse, data.requestData.page_no);
    this.displayLoader = false;
  }

  loaddataAfterEdit(data: any) {   
    this.pageSize = data.pageSize;
    this.selectedPageSize = data.pageSize;
    this.term = data.term;
    this.nextEnabled = data.nextEnabled;
    this.prevEnabled = data.prevEnabled;
    this.pagination_clicked_count = data.pagination_clicked_count - 1;
    this.searchKey = data.searchKey;
    this.searchFilter = data.searchFilter;
    this.prev_strt_at = data.prev_strt_at_arr;
  }
  
  getPaging(page) {
    this.page = page
    this.startIndex = (page - 1) * +this.pageSize + 1;
    this.endIndex = (page - 1) * +this.pageSize + +this.pageSize;

    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    if (this.endIndex === 0) {
      this.startIndex = 0
    }
  }

  loadData(data: any) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.selectedSport = this.sportId;
    data.selectedSportName = this.sportName;
    data.prevEnabled = this.prevEnabled;
    data.nextEnabled = this.nextEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter; 
    data.prev_strt_at_arr = this.prev_strt_at;
    data.requestPayloadGrid = this.getCoachfieldListInfo;
  }
  //Return the Doc rem where previous page will startAt
  get_prev_startAt(pageNo: any) {
    if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
      this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
    return this.prev_strt_at[this.pagination_clicked_count - 1];
  }
  
  //Add document
  push_prev_startAt(prev_first_doc, pageNo) {
    this.prev_strt_at.splice(pageNo - 1, 0, prev_first_doc);
    // this.prev_strt_at.push(prev_first_doc);
  }

  async getAllSports(uid) {
    this.sportSelect = true;
    this.sportsInfo = [];
    try {
      let allSportResponse: any = await this.dropDownService.getAllSportsmetaGeneral({ 'uid': uid });
      if (allSportResponse.status) {
        if (allSportResponse.data) {
          allSportResponse.data.splice(0, 0, { name: 'All Coach Custom field', sport_id: null });
          allSportResponse.data.forEach(element => {
            if (element.sport_id !== null) {
              element.value = "All Coach Custom field"
            }
            else {
              element.value = null
            }
          });
          this.sportsInfo = allSportResponse.data;
        }
        this.sportSelect = false;
      }
      else {
        this.sportsInfo = [];
        this.sportSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.sportsInfo = [];
      this.sportSelect = false;
    }
  }

  
  async getSportsByOrganization(orgId) {
    this.sportSelect = true;
    this.sportsInfo = [];
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        if (getSportsByOrganizationResponse.data) {
          getSportsByOrganizationResponse.data.splice(0, 0, { name: 'All Coach Custom field', sport_id: null });
          getSportsByOrganizationResponse.data.forEach(element => {
            if (element.sport_id !== null) {
              element.value = "All Coach Custom field"
            }
            else {
              element.value = null
            }
          });
          this.sportsInfo = getSportsByOrganizationResponse.data;
        }
        this.sportSelect = false;
      } else {
        this.sportsInfo = [];
        this.sportSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.sportsInfo = [];
      this.sportSelect = false;
    }
  }

  OnSportChange(event) {
    this.sportId = event.sport_id;
    this.sportName = event.name
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  
  reInitialiseGrid() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  
  
  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value);
    this.reInitialiseGrid();
    this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  
  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.reInitialiseGrid();
      await this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse);
    } catch (error) {
      this.disable_prev = false;
    }
  }

  async nextPage() {
    try {
      this.nextEnabled = true;
      this.prevEnabled = false;
      this.page += 1;
      this.reInitialiseGrid();
      await this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    } catch (err) {
      this.disable_next = false;
    }
  }
  
  async getCoachcustomfield(uid, orgId, sportId, roleId, pageNo, itemPerPage, isNextReq, isPrevReq, prevStartAt, prevEndAt, nextStartAt) {
    try {
      this.loading = true;
      let gridTimer = setInterval(this.timerFunction, 300, this.loaderInfo);
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
      let getUserList: any = {
        'auth_uid': uid,
        'page_no': pageNo, 'item_per_page': itemPerPage,
        'organization_id': orgId, 'role_id': roleId,
        'sport_id': sportId,
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
      this.getCoachfieldListInfo = getUserList;
      // get service for fetch levels      
      let getplayermeta: any = await this.CoachCustomFieldService.getCoachCustomFielddata(getUserList);    
      if (getplayermeta.status) {
        if (getplayermeta.data) {
          if (typeof (getplayermeta.data) !== "string") {
            this.firstInResponse = getplayermeta.snapshot.docs[0];
            this.lastInResponse = getplayermeta.snapshot.docs[getplayermeta.snapshot.docs.length - 1];
            //Initialize values
            if (isNextReq) {
              this.pagination_clicked_count++;
              this.push_prev_startAt(this.firstInResponse,pageNo);
            }
            else if (isPrevReq) {
              //Maintaing page no.
              this.pagination_clicked_count--;
            } else {
              this.pagination_clicked_count = 0;
              pageNo = 1;
              this.page = 1;
              //Push first item to use for Previous action
              this.push_prev_startAt(this.firstInResponse,pageNo);
            }

            getplayermeta.data.forEach(element => {
              let valuesdata = "";

              if ( typeof (element.value) !== "string")
              {
                element.value.forEach(value => {
                  if (valuesdata === "")
                  {
                    valuesdata = valuesdata + value;
                  }
                  else
                  {
                    valuesdata = valuesdata + ", " + value;
                  }
                })
                element['value'] = valuesdata;
              }
              if (element.is_editable === "true"){
                element['is_editable'] = "Yes";
              }
              else{
                element['is_editable'] = "No";
              }
              if (element.is_required === "true"){
                element['is_required'] = "Yes";
              }
              else{
                element['is_required'] = "No";
              }
              if (element.is_deletable === "true"){
                element['is_deletable'] = "Yes";
              }
              else{
                element['is_deletable'] = "No";
              }
      
            });
            this.coachfieldInfo = getplayermeta.data;
            this.totalRecords = getplayermeta.totalRecords;
            this.getPaging(pageNo);
            this.pager = await this.datatableservice.getPager(getplayermeta.totalRecords, pageNo, itemPerPage);
            this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
            clearInterval(gridTimer);
            this.loading = false;
            this.displayLoader = false;
          }
          else {
            this.noData(gridTimer);
          }
        }
        else {
          this.noData(gridTimer);
        }
      } else {
        this.noData(gridTimer);
      }
    } catch (error) {
      console.log(error);
      this.noData();
      this.notification.isNotification(true, "Coach Custom Field", error.message, "times-circle");
      this.dropDownService.getNotificationForError();
    }
  }
  
  addCoachField() {
    this.getCoachfieldListInfo.isNextReq = false;
    this.getCoachfieldListInfo.isPrevReq = false;
    this.getCoachfieldListInfo.page_no = 1;
    this.getCoachfieldListInfo.item_per_page = 10;
    this.getCoachfieldListInfo.searchVal = '';
    this.getCoachfieldListInfo.sport_id = this.sportId;
    this.getCoachfieldListInfo.sport_name = this.sportName;
    this.change.emit({
      action: "createcoachfield", data: this.getCoachfieldListInfo
    })
  }
  
  editcoachfield(data: any) {
    this.loadData(data);
    data.viewBy = "edit";
    this.change.emit({ action: "editcoachfield", data: data })
  }

  viewcoachfield(data: any) {
    this.loadData(data);  
    this.change.emit({ action: "viewcoachfield", data: data })
  }
  

  async deletecoachfield(data: any) {
    try {
      this.notification.isConfirmation('', '', 'Coach Custom Field', ' Are you sure to delete ' + data.field_name + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          let isDeleted: any = await this.CoachCustomFieldService.deleteCoachfield(data);
          if (isDeleted) {
            if (isDeleted.status) {
              this.prevEnabled = false;
              this.nextEnabled = false;
              this.reInitialiseGrid();
              this.getCoachcustomfield(this.uid, this.orgId, this.sportId, this.roleId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
              this.notification.isNotification(true, "Coach Custom Field", isDeleted.message, "check-square");
            } else {
              this.notification.isNotification(true, "Coach Custom Field", isDeleted.message, "times-circle");
              this.dropDownService.getNotificationForError();
            }
          } else {
            this.notification.isNotification(true, "Coach Custom Field", "Unable to delete.Please try again later.", "times-circle");
            this.dropDownService.getNotificationForError();
          }
        } else {
          /* Do nothing */

        }

      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Coach Custom Field", "Unable to delete.Please try again later.", "times-circle");
      this.dropDownService.getNotificationForError();
    }
  }


}
