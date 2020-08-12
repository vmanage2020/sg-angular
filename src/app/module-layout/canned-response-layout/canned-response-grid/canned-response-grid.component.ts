import { Component, OnInit, Output, EventEmitter, Injector, ViewEncapsulation } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import * as Quill from '../../../../../node_modules/quill/dist/quill.js';
import { DomSanitizer } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';
import { CannedResponseCrudService } from '../canned-response-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service.js';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api.js';
import { NgiNotificationService } from 'ngi-notification';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface.js';
@Component({
  selector: 'app-canned-response-grid',
  templateUrl: './canned-response-grid.component.html',
  styleUrls: ['./canned-response-grid.component.scss']
})
export class CannedResponseGridComponent implements OnInit {
  @Output() change = new EventEmitter();
  sportId: any = null;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  sportsInfo: any;
  sportName: any = null;
  // noDataDefault = true
  term: any = '';
  searchTerm: any = '';
  page = 1;
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;
  cannedResponseRecordInfo: any = [];
  // start and end index
  startIndex = 0;
  endIndex = 0;
  selectedPageSize: number = 10;
  org_id: any;
  uid: any;
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ]
  data: any;
  orgId: any;
  showColumns: any;
  eachCol: any[] = [];
  SelectedColumns: any = null;
  noOfCol: any = [
    { name: Constant.searchFilterKey, allCol: "All Columns", value: "All Columns" },
    { id: 2, name: 'canned_response_title', allCol: "All Columns", value: ' Canned Response Title' },
    { id: 2, name: 'canned_response_description', allCol: "All Columns", value: 'Canned Response Description' },
    { id: 1, name: 'sport', allCol: "All Columns", value: "Sport" },
    { id: 2, name: 'copied_from', allCol: "All Columns", value: ' Copied From' },
  ];
  columnWidth: any = '100';
  cols: any;
  injectedData: any;
  allSports: any;
  quill: any;
  initalValue: any = 'All Canned Responses';
  selectedSeason: any = this.initalValue;
  pager: any = {};
  nextEnabled: boolean = false;
  prevEnabled: boolean = false;
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  getUserListInfo: any = {};
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

  constructor(private dropDownService: DropdownService, private notification: NgiNotificationService, private datatableservice: NgiDatatableService, private cannedResponseService: CannedResponseCrudService, private titlecasePipe: TitleCasePipe, private sanitizer: DomSanitizer, public injector: Injector, public dataService: DataService, public cookieService: CookieService, public router: Router, private sharedService: SharedService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data.action === "organizationFilter") {
        this.sharedService.announceMission('welcome');
        this.router.navigate(['/welcome']);
      } else if (data === "cannedResponseRouter") {
        this.change.emit({ action: "cannedResponseGrid", data: null });
      }
    })
    this.injectedData = injector.get('injectData');
  }

  ngOnInit() {
    this.sharedService.announceMission('cannedResponse')
    this.orgId = localStorage.getItem('org_id');
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.getSportsByOrganization(this.orgId);
    this.SelectedColumns = this.eachCol
    this.showColumns = this.SelectedColumns;
    this.getAlignedColumnSize(this.showColumns.length);
    if (this.injectedData) {
      if (this.injectedData.data) {
        if (this.injectedData.data.userAction === "create" && this.injectedData.data.userAction) {
          if (this.injectedData.data.selectedSport) {
            this.sportId = this.injectedData.data.selectedSport
            this.selectedSeason = this.injectedData.data.selectedSportName;
            this.loaddataAfterCreate(this.injectedData.data);
          } else {
            this.loaddataAfterCreate(this.injectedData.data);
          }
        } else if (this.injectedData.data.userAction === "edit" && this.injectedData.data.userAction) {
          this.totalRecords = this.injectedData.data.totalRecords;
          this.loaddataAfterEdit(this.injectedData.data.getInjectedDataFromgrid);
          this.pager = this.datatableservice.getPager(this.injectedData.data.totalRecords,
            this.injectedData.data.requestData.pageNo, this.injectedData.data.requestData.itemPerPage);
          this.cannedResponseRecordInfo = this.injectedData.data.userInfo;
          this.getUserListInfo = this.injectedData.data.requestData;
          this.firstInResponse = this.injectedData.data.snapshot[0];
          this.lastInResponse = this.injectedData.data.snapshot[this.injectedData.data.snapshot.length - 1];
          // this.push_prev_startAt(this.firstInResponse, this.injectedData.data.requestData.page_no);          
         
          this.getPaging(this.injectedData.data.requestData.pageNo);
          this.pagination_clicked_count = this.injectedData.data.getInjectedDataFromgrid.pagination_clicked_count;
          this.displayLoader = false;
        } else {
          if (this.injectedData.data.pageSize && this.injectedData.data.selectedSport || (this.injectedData.data.pageSize && this.injectedData.data.selectedSportName === this.initalValue)) {
            this.loaddataAfterEdit(this.injectedData.data);
            if (this.injectedData.data.forPaginationFirstResponse) {
              this.firstInResponse = this.injectedData.data.forPaginationFirstResponse;
            } if (this.injectedData.data.forPaginationLastResponse) {
              this.lastInResponse = this.injectedData.data.forPaginationLastResponse;
            }
            if (this.nextEnabled) {
              this.getCannedResponseInfoList(this.uid, this.orgId, this.injectedData.data.selectedSport, this.injectedData.data.pageNo, this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            } else if (this.prevEnabled) {
              this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count + 1;
              this.getCannedResponseInfoList(this.uid, this.orgId, this.injectedData.data.selectedSport, this.injectedData.data.pageNo,
                this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.injectedData.data.pageNo), this.firstInResponse, this.lastInResponse)
            } else {
              this.getCannedResponseInfoList(this.uid, this.orgId, this.injectedData.data.selectedSport, this.injectedData.data.pageNo,
                this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            }
          } else if (this.injectedData.data.selectedSport) {
            this.sportId = this.injectedData.data.selectedSport
            this.selectedSeason = this.injectedData.data.selectedSportName;
            this.getCannedResponseInfoList(this.uid, this.orgId, this.injectedData.data.selectedSport, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
          } else {
            this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
          }
        }

      }
      else {
        this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
      }
    }
    else {
      this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    }
  }
  loaddataAfterCreate(data: any) {
    this.totalRecords = data.totalRecords;
    this.getPaging(data.requestData.page_no);
    this.pager = this.datatableservice.getPager(data.totalRecords,
      data.requestData.page_no, data.requestData.item_per_page);
    this.cannedResponseRecordInfo = data.userInfo;
    this.getUserListInfo = data.requestData;
    this.firstInResponse = data.snapshot[0];
    this.lastInResponse = data.snapshot[data.snapshot.length - 1];
    this.push_prev_startAt(this.firstInResponse, data.requestData.page_no);
    this.displayLoader = false;
  }
  loaddataAfterEdit(data: any) {
    this.sportId = data.selectedSport
    this.selectedSeason = data.selectedSportName;
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

  getAlignedColumnSize(columnlength) {
    if (columnlength != 0) {
      this.columnWidth = Math.floor(100 / columnlength);
    }
  }

  addCannedResponse() {
    this.getUserListInfo.isNextReq = false;
    this.getUserListInfo.isPrevReq = false;
    this.getUserListInfo.page_no = 1;
    this.getUserListInfo.item_per_page = 10;
    this.getUserListInfo.searchVal = '';
    if (this.selectedSeason !== 'All Canned Responses' && this.allSports.length > 2) {
      this.getUserListInfo.selectedSport = this.sportId;
      this.getUserListInfo.selectedSportName = this.selectedSeason;
      this.change.emit({ action: "cannedResponseCreate", data: this.getUserListInfo })
    } else {
      this.change.emit({ action: "cannedResponseCreate", data: this.getUserListInfo })
    }
  }

  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }

  async getCannedResponseInfoList(uid: any, orgId: any, sportId: any, pageNo: any, itemPerPage: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {
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
    let getAllCannedResponseRequest: any = {
      'auth_id': uid,
      'pageNo': pageNo,
      'itemPerPage': itemPerPage,
      'sport_id': sportId,
      'organization_id': orgId,
      'collectionName': "CannedResponse",
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
    this.getUserListInfo = getAllCannedResponseRequest;
    let getAllCannedResponseResponse: any = await this.cannedResponseService.getCannedResponseForGrid(getAllCannedResponseRequest);
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Done" });
    try {
      if (getAllCannedResponseResponse) {
        if (getAllCannedResponseResponse.status) {
          if (getAllCannedResponseResponse.data.data.length !== 0) {
            if (typeof (getAllCannedResponseResponse.data.data) !== "string") {
              this.firstInResponse = getAllCannedResponseResponse.data.snapshot.docs[0];
              this.lastInResponse = getAllCannedResponseResponse.data.snapshot.docs[getAllCannedResponseResponse.data.snapshot.docs.length - 1];
              //Initialize values
              // this.prev_strt_at = [];
              if (isNextReq) {
                this.pagination_clicked_count++;
                this.push_prev_startAt(this.firstInResponse, pageNo);
              }
              else if (isPrevReq) {
                //Maintaing page no.
                this.pagination_clicked_count--;

                //Pop not required value in array
                // this.pop_prev_startAt(this.firstInResponse);
              } else {
                this.pagination_clicked_count = 0;
                pageNo = 1;
                this.page = 1;
                //Push first item to use for Previous action
                this.push_prev_startAt(this.firstInResponse, pageNo);
              }

              getAllCannedResponseResponse.data.data.forEach(element => {
                // element.canned_response_title = element.cannedResponseTitle;
                // element.canned_response_description = this.sanitizer.bypassSecurityTrustHtml(element.cannedResponseDesc);
                element.sport = element.sport_name;
                element.sport = this.titlecasePipe.transform(element.sport)
              });
              this.cannedResponseRecordInfo = getAllCannedResponseResponse.data.data;
              this.totalRecords = getAllCannedResponseResponse.data.totalRecords;
              this.getPaging(pageNo);
              this.pager = await this.datatableservice.getPager(getAllCannedResponseResponse.data.totalRecords, pageNo, itemPerPage);
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
      } else {
        this.noData(gridTimer);
      }
    } catch (error) {
      console.log(error);
      this.noData(gridTimer);
      this.notification.isNotification(true, "Canned Responses", error.message, "times-circle");
      this.dropDownService.getNotificationForError();
    }
  }
  reInitialiseGrid() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  noData(id?: any) {
    this.cannedResponseRecordInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }
  async getSportsByOrganization(orgId) {
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        if (getSportsByOrganizationResponse.data) {
          getSportsByOrganizationResponse.data.splice(0, 0, { name: 'All Canned Responses', sport_id: null });
          getSportsByOrganizationResponse.data.forEach(element => {
            if (element.sport_id !== null) {
              element.value = "Canned Responses By Sports"
            }
            else {
              element.value = null
            }
          });
          this.allSports = getSportsByOrganizationResponse.data;
        }
      } else {
        this.allSports = [];
      }
    } catch (error) {
      console.log(error);
      this.allSports = [];
    }
  }
  //Search Input (to hide icon)
  onClear(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.term = '';
    this.reInitialiseGrid();
    this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  selectedCol(event) {
    switch (event.value.trim()) {
      case "Canned Response Title":
        this.searchKey = "keywordForTittle"
        break;
      case "Sport":
        this.searchKey = "keywordForSportName"
        break;
      case "Canned Response Description":
        this.searchKey = "keywordForDesc"
        break;
      default:
        this.searchKey = "keywords"
        break;
    }
  }
  searchInput(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value);
    this.reInitialiseGrid();
    this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
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


  selectedSport(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.sportId = event.sport_id;
    this.selectedSeason = event.name;
    this.reInitialiseGrid();
    this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)

  }

  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.cannedResponseRecordInfo = [];
      this.reInitialiseGrid();
      await this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled,
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
      this.cannedResponseRecordInfo = [];
      this.reInitialiseGrid();
      await this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled,
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
    return this.prev_strt_at[pageNo - 1];
  }


  editCannedResponse(data) {
    this.loadData(data);
    data.viewBy = "edit";
    this.change.emit({ action: "cannedResponseUpdate", data: data })
  }

  viewCannedResponse(data) {
    this.loadData(data);
    // console.log(data)
    this.change.emit({ action: "cannedResponseView", data: data })
  }

  loadData(data: any) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.selectedSport = this.sportId;
    data.selectedSportName = this.selectedSeason;
    data.prevEnabled = this.prevEnabled;
    data.nextEnabled = this.nextEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    data.prev_strt_at_arr = this.prev_strt_at;
    data.requestPayloadGrid = this.getUserListInfo;
  }

  async deleteCannedResponse(data) {
    try {
      this.notification.isConfirmation('', '', 'Canned Responses', ' Are you sure to delete ' + data.canned_response_title + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          let isDeleted: any = await this.cannedResponseService.deleteCannedResponse(data);
          if (isDeleted) {
            if (isDeleted.status) {
              this.prevEnabled = false;
              this.nextEnabled = false;
              this.reInitialiseGrid();
              await this.getCannedResponseInfoList(this.uid, this.orgId, this.sportId, this.page, this.pageSize, this.nextEnabled,
                this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
              this.notification.isNotification(true, "Canned Responses", isDeleted.message, "check-square");

            } else {
              this.notification.isNotification(true, "CannedResponses", isDeleted.message, "times-circle");
              this.dropDownService.getNotificationForError();
            }
          } else {
            this.notification.isNotification(true, "Canned Responses", "Unable to delete.Please try again later.", "times-circle");
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
      this.notification.isNotification(true, "Canned Responses", "Unable to delete.Please try again later.", "times-circle");
      this.dropDownService.getNotificationForError();
    }
  }

}
