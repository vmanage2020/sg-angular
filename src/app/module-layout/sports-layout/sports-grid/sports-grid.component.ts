import { Component, OnInit, ViewChildren, QueryList, ElementRef, Output, EventEmitter, Injector } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable, BehaviorSubject } from 'rxjs';

import { Table } from '../../../dataTable/advanced.model';

import { tableData } from '../../../dataTable/data';

import { AdvancedService } from '../../../dataTable/advanced.service';
import { AdvancedSortableDirective, SortEvent } from '../../../dataTable/advanced-sortable.directive';
import { DataService } from 'src/app/core/services/data.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { DataTableService } from 'src/app/dataTable/data-table.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { SportsCrudService } from '../sports-crud.service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-sports-grid',
  templateUrl: './sports-grid.component.html',
  styleUrls: ['./sports-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})

/**
 * Advanced table component - handling the advanced table with sidebar and content
 */
export class SportsGridComponent implements OnInit {
  getUserListInfo: any = {};
  @Output() change = new EventEmitter();
  SportInfo: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  term: any = '';
  searchTerm: any = '';
  // sellersData: Sellers[];
  // page number
  page = 1;
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;
  prevEnabled: boolean = false;
  nextEnabled: boolean = false;
  uid: any;
  selectedPageSize: number = 10;

  // start and end index
  startIndex = 1;
  endIndex = 10;

  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  sortingInfo: any = {};
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;

  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ];
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

  pager: any = {};
  showColumns: any;
  eachCol: any[] = [];
  SelectedColumns: any = null;
  noOfCol: any = [
    { id: 1, name: Constant.searchFilterKey, allCol: "All Columns", value: "All Columns" },
    { id: 1, name: 'sport', allCol: "All Columns", value: "Sport" },
    { id: 1, name: 'country', allCol: "All Columns", value: "Country" },
    { id: 2, name: 'created_date', allCol: "All Columns", value: 'Created Date' },
  ];
  // Table data
  tableData: Table[];
  data: any;
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  injectedData: any;
  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private injector: Injector, private datatableservice: NgiDatatableService, private sportService: SportsCrudService, public dataTableService: DataTableService, private sharedService: SharedService, private modalService: NgbModal, private dataServices: DataService, public router: Router, public service: AdvancedService, public cookieService: CookieService) {
    sharedService.missionAnnounced$.subscribe((data) => {
      if (data) {
        this.data = data;
        if (this.data.action === "organizationFilter") {
          if (this.data.data !== Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          }

        } else if (data == "sportRouter") {
          this.change.emit({ action: "sportgrid" })

        }
      }
    })

  }


  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('sport');
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;
    if (this.injectedData) {
      if (this.injectedData.action) {
        if (this.injectedData.data) {
          if (this.injectedData.data.userAction === "create" && this.injectedData.data.userAction) {
            this.loaddataAfterCreate(this.injectedData.data);
          } else if (this.injectedData.data.userAction === "edit" && this.injectedData.data.userAction) {
            this.totalRecords = this.injectedData.data.totalRecords;
            this.loaddataAfterEdit(this.injectedData.data.getInjectedDataFromgrid);
            this.pager = this.datatableservice.getPager(this.injectedData.data.totalRecords,
              this.injectedData.data.requestData.page_no, this.injectedData.data.requestData.item_per_page);
            this.SportInfo = this.injectedData.data.userInfo;
            this.getUserListInfo = this.injectedData.data.requestData;
            this.firstInResponse = this.injectedData.data.snapshot[0];
            this.lastInResponse = this.injectedData.data.snapshot[this.injectedData.data.snapshot.length - 1];
            // this.push_prev_startAt(this.firstInResponse, this.injectedData.data.requestData.page_no);                   
            this.getPaging(this.injectedData.data.requestData.page_no);
            this.pagination_clicked_count = this.injectedData.data.getInjectedDataFromgrid.pagination_clicked_count;
            this.displayLoader = false;
          } else {
            if ((this.injectedData.data.pageSize)) {
              this.loaddataAfterEdit(this.injectedData.data);
              if (this.injectedData.data.forPaginationFirstResponse) {
                this.firstInResponse = this.injectedData.data.forPaginationFirstResponse;
              } if (this.injectedData.data.forPaginationLastResponse) {
                this.lastInResponse = this.injectedData.data.forPaginationLastResponse;
              }
              if (this.nextEnabled) {
                this.getGridResponse(this.uid, this.injectedData.data.pageNo, this.pageSize,
                  this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
              } else if (this.prevEnabled) {
                this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count + 1;
                this.getGridResponse(this.uid, this.injectedData.data.pageNo, this.pageSize,
                  this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.injectedData.data.pageNo), this.firstInResponse, this.lastInResponse)
              } else {
                this.getGridResponse(this.uid, this.injectedData.data.pageNo, this.pageSize,
                  this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
              }

            } else {
              this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
            }
          }
        } else {
          this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
      }
      else {
        this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }
  }
  loaddataAfterCreate(data: any) {
    this.totalRecords = data.totalRecords;
    this.getPaging(data.requestData.page_no);
    this.pager = this.datatableservice.getPager(data.totalRecords,
      data.requestData.page_no, data.requestData.item_per_page);
    this.SportInfo = data.userInfo;
    this.getUserListInfo = data.requestData;
    this.firstInResponse = data.snapshot[0];
    this.lastInResponse = data.snapshot[data.snapshot.length - 1];
    this.push_prev_startAt(this.firstInResponse, data.requestData.page_no);
    this.displayLoader = false;
  }
  loaddataAfterEdit(data: any) {
    this.sortedKey = data.sortedKey;
    this.sortedValue = data.sortedValue;
    this.sortingInfo = data.sortingInfo;
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
  onClear(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.term = '';
    this.reInitialiseGrid();
    this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  searchInput(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  addSport() {
    this.getUserListInfo.isNextReq = false;
    this.getUserListInfo.isPrevReq = false;
    this.getUserListInfo.page_no = 1;
    this.getUserListInfo.item_per_page = 10;
    this.getUserListInfo.searchVal = '';
    this.change.emit({ action: "createSport", data: this.getUserListInfo })
  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }

  async getGridResponse(uid: any, pageNo: any, itemPerPage: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {

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
    let getAllSportsListResquest: any = {
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
    this.getUserListInfo = getAllSportsListResquest;
    let getAllSportsListResponse: any = await this.sportService.getSportsListForGrid(getAllSportsListResquest);
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    try {
      if (getAllSportsListResponse) {
        if (getAllSportsListResponse.status) {
          this.SportInfo = getAllSportsListResponse.data.data;
          if (getAllSportsListResponse.data.data && getAllSportsListResponse.data.data.length) {
            this.firstInResponse = getAllSportsListResponse.data.snapshot.docs[0];
            this.lastInResponse = getAllSportsListResponse.data.snapshot.docs[getAllSportsListResponse.data.snapshot.docs.length - 1];
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
            this.SportInfo.forEach(element => {
              element['created_date'] = moment(element.created_datetime.toDate()).format('MMMM DD, YYYY').toString();
              element['sport'] = element.name;
            });
            this.totalRecords = getAllSportsListResponse.data.total_items;
            this.getPaging(pageNo);
            this.pager = await this.datatableservice.getPager(getAllSportsListResponse.data.total_items, pageNo, itemPerPage);
            clearInterval(gridTimer);
            this.loading = false;
            this.displayLoader = false;
          } else {
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
    }
  }
  reInitialiseGrid() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  noData(id?: any) {
    this.SportInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }
  getPaging(page) {
    this.page = page;
    this.startIndex = (page - 1) * +this.pageSize + 1;
    this.endIndex = (page - 1) * +this.pageSize + +this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    if (this.endIndex === 0) {
      this.startIndex = 0
    }
  }

  selectedCol(event) {
    switch (event.value.trim()) {
      case "Sport":
        this.searchKey = "keywordForSportName"
        break;
      case "Created Date":
        this.searchKey = "keywordForDateTime"
        break;
      case "Country":
        this.searchKey = "keywordForCountry"
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
      this.SportInfo = [];
      this.reInitialiseGrid();
      await this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse)
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
      this.SportInfo = [];
      this.reInitialiseGrid();
      await this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } catch (err) {
      console.log(err);
      this.disable_next = false;
    }


  }

  sorting(header, type, index) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    if (type !== "asc") {
      this.sortingInfo['type'] = 'desc';
      this.sortingInfo['index'] = index;
      switch (header) {
        case "Sport":
          this.sortedKey = "name"
          break;
        case "Country":
          this.sortedKey = "country"
          break;
        default:
          this.sortedKey = "created_datetime"
          break;
      }
      this.sortedValue = type;
      this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } else {
      this.sortingInfo['type'] = 'asc';
      this.sortingInfo['index'] = index;
      switch (header) {
        case "Sport":
          this.sortedKey = "name"
          break;
        case "Country":
          this.sortedKey = "country"
          break;
        default:
          this.sortedKey = "created_datetime"
          break;
      }
      this.sortedValue = type;
      this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
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

  editSport(data) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.viewBy = "edit";
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
    this.change.emit({ action: "editSport", data: data })
  }


  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value)
    this.selectedPageSize = this.pageSize;
    this.reInitialiseGrid();
    this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
}
