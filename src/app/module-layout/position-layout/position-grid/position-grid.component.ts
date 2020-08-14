import { Component, OnInit, ViewChildren, QueryList, ElementRef, Output, EventEmitter, Injector } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { Table } from '../../../dataTable/advanced.model';

import { tableData } from '../../../dataTable/data';

import { AdvancedService } from '../../../dataTable/advanced.service';
import { AdvancedSortableDirective, SortEvent } from '../../../dataTable/advanced-sortable.directive';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { DataTableService } from 'src/app/dataTable/data-table.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { PositionCrudService } from '../position-crud.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-position-grid',
  templateUrl: './position-grid.component.html',
  styleUrls: ['./position-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})

/**
 * Advanced table component - handling the advanced table with sidebar and content
 */
export class PositionGridComponent implements OnInit {
  getUserListInfo: any = {};
  @Output() change = new EventEmitter();
  breadCrumbItems: any;
  private _success = new Subject<string>();
  sportId: any = null;
  positionInfo: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;  
  sportsInfo: any;
  initalValue: any = "All Positions"
  sportName: any = this.initalValue;
  noDataDefault = true
  pager: any = {};
  staticAlertClosed = false;
  successMessage: string;
  term: any = '';
  searchTerm: any = '';
  // sellersData: Sellers[];
  // page number
  page = 1;
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;

  // start and end index
  startIndex = 0;
  endIndex = 0;
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  sortingInfo: any = {};
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  selectedPageSize: number = 10;
  uid: any;
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
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ];
  prevEnabled: boolean = false;
  nextEnabled: boolean = false;
  showColumns: any;
  eachCol: any[] = [];
  SelectedColumns: any = null;
  noOfCol: any = [
    { name: 'keywords', allCol: "All Columns", value: 'All Columns' },
    { name: 'sport', allCol: "All Columns", value: "Sport" },
    { name: 'position_name', allCol: "All Columns", value: 'Position Name' },
    { name: 'abbreviation', allCol: "All Columns", value: 'Abbreviation' },
    { name: 'parent_position_name', allCol: "All Columns", value: 'Parent Position Name' },
  ];

  selectedSports: boolean = false;
  injectedData: any;
  constructor(private datatableservice: NgiDatatableService, private positionService: PositionCrudService, private dropDownService: DropdownService, private injector: Injector, public dataTableService: DataTableService, private sharedService: SharedService, public cookieService: CookieService, private modalService: NgbModal, private dataServices: DataService, public router: Router, public service: AdvancedService, private activatedRoute: ActivatedRoute) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          if (data.data !== Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          }
        } else if (data == "positionRouter") {          
            this.change.emit({ action: "positiongrid", data: null })          
        }
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('position');
    this.injectedData = this.injector.get('injectData');
    this.noOfCol.forEach(element => {
      if (element.name !== "keywords") {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;
    this.getAllSports(this.uid);
    if (this.injectedData) {
      if (this.injectedData.action) {
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
            this.positionInfo = this.injectedData.data.userInfo;
            this.getUserListInfo = this.injectedData.data.requestData;
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
                this.getGridResponse(this.sportId, this.uid, this.injectedData.data.pageNo, 
                  this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
              } else if (this.prevEnabled) {
                this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count + 1;
                this.getGridResponse(this.sportId, this.uid, this.injectedData.data.pageNo,
                   this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.injectedData.data.pageNo), this.firstInResponse, this.lastInResponse)
              } else {
                this.getGridResponse(this.sportId, this.uid, this.injectedData.data.pageNo, 
                  this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse) 
              }
              
            }
            else if (this.injectedData.data.sport_id) {
              this.sportId = this.injectedData.data.sport_id
              this.sportName = this.injectedData.data.sport_name;
              this.getGridResponse(this.injectedData.data.sport_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            } else if (!this.injectedData.data.sport_id) {
              this.sportId = this.injectedData.data.sport_id
              this.sportName = this.injectedData.data.sport_name;
              this.getGridResponse(this.injectedData.data.sport_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            }
          }
         
        } else {
          this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
      } else {
        this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }
  }
  loaddataAfterCreate(data: any) {
    this.totalRecords = data.totalRecords;
    this.getPaging(data.requestData.page_no);
    this.pager = this.datatableservice.getPager(data.totalRecords,
      data.requestData.page_no, data.requestData.item_per_page);
    this.positionInfo = data.userInfo;
    this.getUserListInfo = data.requestData;
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
  //Search Input (to hide icon)
  onClear(event: any) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.term = '';
    this.reInitialiseGrid();
    this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
  }
  searchInput(event: any) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
  }
  async getAllSports(uid: any) {
    this.selectedSports = true;
    try {
      let allSportResponse: any = await this.dropDownService.getAllSports({ 'uid': uid });
      if (allSportResponse.status) {
        if (allSportResponse.data) {
          allSportResponse.data.splice(0, 0, { name: 'All Positions', sport_id: null });
          allSportResponse.data.forEach(element => {
            if (element.sport_id !== null) {
              element.value = "Positions By Sport"
            }
            else {
              element.value = null
            }
          });
          this.sportsInfo = allSportResponse.data;
          this.selectedSports = false;
        }
      } else {
        this.sportsInfo = [];
        this.selectedSports = false;
      }
    } catch (error) {
      console.log(error);
      this.sportsInfo = [];
      this.selectedSports = false;
    }
  }
  addPosition() {
    this.getUserListInfo.isNextReq = false;
    this.getUserListInfo.isPrevReq = false;
    this.getUserListInfo.page_no = 1;
    this.getUserListInfo.item_per_page = 10;
    this.getUserListInfo.searchVal = '';
    this.getUserListInfo.sport_id = this.sportId;
      this.getUserListInfo.sport_name = this.sportName;
    this.change.emit({ action: "createposition", data: this.getUserListInfo })
  }

  onSportsChange(event) {
    if (event) {
      this.sportId = event.sport_id;
      this.sportName = event.name;
      this.prevEnabled = false;
      this.nextEnabled = false;
      this.reInitialiseGrid();
      this.getGridResponse(event.sport_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    }
  }

  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }
  async getGridResponse(sportId: any, uid: any, pageNo: any, itemPerPage: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {
    this.noDataDefault = false;
    this.loading = true;
    let gridTimer = setInterval(this.timerFunction, 300, this.loaderInfo);
    if (this.term) {
      this.searchTerm = this.term.toLowerCase();
    } else {
      this.searchTerm = '';
    }
    if (this.firstInResponse) {
      this.forPaginationFirstResponse = this.firstInResponse;
    }
    if (this.lastInResponse) {
      this.forPaginationLastResponse = this.lastInResponse;
    }
    let getPositionListForGridRequest: any = {
      'sport_id': sportId,
      'uid': uid,
      'page_no': pageNo,
      'item_per_page': itemPerPage,
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
    this.getUserListInfo = getPositionListForGridRequest;
    let getPositionListForGridResponse: any = await this.positionService.getPositionListForGrid(getPositionListForGridRequest);
    try {
      if (getPositionListForGridResponse.status) {
        if (getPositionListForGridResponse.data) {
          this.firstInResponse = getPositionListForGridResponse.snapshot.docs[0];
          this.lastInResponse = getPositionListForGridResponse.snapshot.docs[getPositionListForGridResponse.snapshot.docs.length - 1];
          //Initialize values
          // this.prev_strt_at = [];
          if (isNextReq) {
            this.pagination_clicked_count++;
            this.push_prev_startAt(this.firstInResponse,pageNo);
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
            this.push_prev_startAt(this.firstInResponse,pageNo);
          }
          this.positionInfo = getPositionListForGridResponse.data;
          if (this.positionInfo) {
            this.positionInfo.forEach(element => {
              element.sport = element.sport_name
              element.position_name = element.name
            });
          }         
          this.totalRecords = getPositionListForGridResponse.totalRecords;
          this.getPaging(pageNo);
          this.pager = await this.datatableservice.getPager(getPositionListForGridResponse.totalRecords, pageNo, itemPerPage);
          this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });              
            clearInterval(gridTimer);
            this.loading = false;
            this.displayLoader = false;
        } else {
          this.noData(gridTimer);
        }
      }
      else {
        this.noData(gridTimer);
      }
    } catch (error) {
      
      this.noData(gridTimer);
      console.log(error);
    }
  }

  reInitialiseGrid(){
    this.displayLoader=true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  noData(id?:any) {
    this.positionInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });    
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }
  selectedCol(event) {
    switch (event.value.trim()) {
      case "Position Name":
        this.searchKey = "keywordForPositionName"
        break;
      case "Sport":
        this.searchKey = "keywordForSportName"
        break;
      case "Abbreviation":
        this.searchKey = "keywordForAbbre"
        break;
      case "Parent Position Name":
        this.searchKey = "keywordForParentPosiiton"
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
      this.positionInfo = [];
      this.reInitialiseGrid();
      await this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse);
    } catch (error) {
      console.log(error);
      this.disable_prev = false;
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

  async nextPage() {
    try {
      this.nextEnabled = true;
      this.page += 1
      this.prevEnabled = false;
      this.positionInfo = [];
      this.reInitialiseGrid();
      await this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize,
         this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    } catch (err) {
      console.log(err);
      this.disable_next = false;
    }
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

  editPosition(position) {

    position.pageNo = this.page;
    position.pageSize = this.pageSize;
    position.selectedSport = this.sportId;
    position.selectedSportName = this.sportName;
    position.viewBy = "edit";
    position.prevEnabled = this.prevEnabled;
    position.nextEnabled = this.nextEnabled;
    position.pagination_clicked_count = this.pagination_clicked_count;
    position.forPaginationFirstResponse = this.forPaginationFirstResponse;
    position.forPaginationLastResponse = this.forPaginationLastResponse;
    position.term = this.term;
    position.searchKey = this.searchKey;
    position.searchFilter = this.searchFilter;
    position.prev_strt_at_arr = this.prev_strt_at;
    position.requestPayloadGrid = this.getUserListInfo;
    this.change.emit({ action: "editposition", data: position })
  }


  selectedPage(event) {
    this.pageSize = parseInt(event.value);
    this.selectedPageSize = this.pageSize;
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
  }

}
