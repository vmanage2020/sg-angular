import { Component, OnInit, ViewChildren, QueryList, ElementRef, Output, EventEmitter, Injector } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable } from 'rxjs';

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
  // bread crum data
  breadCrumbItems: any;
  @Output() change = new EventEmitter();
  SportInfo: any;
  loading = false;
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
  sortedValue: any = 1;
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
    { id: 2, name: 'created_date', allCol: "All Columns", value: 'Created Date' },
  ];
  // Table data
  tableData: Table[];
  data: any;
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  injectedData: any;
  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private injector: Injector,private datatableservice: NgiDatatableService, private sportService: SportsCrudService, public dataTableService: DataTableService, private sharedService: SharedService, private modalService: NgbModal, private dataServices: DataService, public router: Router, public service: AdvancedService, public cookieService: CookieService) {
    sharedService.missionAnnounced$.subscribe((data) => {
      if (data) {
        this.data = data;
        if (this.data.action === "organizationFilter") {
          if (this.data.data !== Constant.organization_id) {
            this.sharedService.announceMission('welcome');
        this.router.navigate(['/welcome']);
          }

        }else if (data == "sportRouter") {
            this.change.emit({ action: "sportgrid"})
          
        }
      }
    })

  }


  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('sport');
    let currentPage: number = parseInt(localStorage.getItem('sportPage'))
    let currentPageSize: number = parseInt(localStorage.getItem('sportPageSize'))
      if (currentPage && currentPageSize) {
      this.selectedPageSize=currentPageSize
      this.pageSize=currentPageSize
      // this.page=currentPage
      //  console.log(currentPage,"local")
      this.getGridResponse(this.uid, currentPage, currentPageSize,null,null,null,null,null)
      }
      else {
        // console.log(this.pageSize)
      // console.log(this.page,"initial")
        this.getGridResponse(this.uid, this.page, this.pageSize,null,null,null,null,null)
      }
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;
    // if (this.injectedData) {
    //   if (this.injectedData.action) {
    //     if (this.injectedData.data) {
    //       if ((this.injectedData.data.pageSize)) {
    //         this.pageSize = this.injectedData.data.pageSize;
    //         this.selectedPageSize = this.injectedData.data.pageSize;
    //         this.term = this.injectedData.data.term;
    //         this.nextEnabled = this.injectedData.data.nextEnabled;
    //         this.prevEnabled = this.injectedData.data.prevEnabled;
    //         this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count - 1;
    //         this.searchKey = this.injectedData.data.searchKey;
    //         this.searchFilter = this.injectedData.data.searchFilter;
    //         this.sortedKey=this.injectedData.data.sortedKey;
    //         this.sortedValue=this.injectedData.data.sortedValue;
    //         this.sortingInfo=this.injectedData.data.sortingInfo;
    //         if (this.injectedData.data.forPaginationFirstResponse) {
    //           this.firstInResponse = this.injectedData.data.forPaginationFirstResponse;
    //         } if (this.injectedData.data.forPaginationLastResponse) {
    //           this.lastInResponse = this.injectedData.data.forPaginationLastResponse;
    //         }
    //         this.getGridResponse(this.uid, this.injectedData.data.pageNo, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    //       }else {
    //         this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    //       }
    //      }else {
    //       this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    //     }
    //   }
    //   else {
    //     this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    //   }
    // } else {
    //   this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    // }
  }
  //Search Input (to hide icon)
  onClear(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.term = '';
    this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  searchInput(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  addSport(){
    this.change.emit({ action: "createSport", data: '' })
  }

  async getGridResponse(uid: any, pageNo: any, itemPerPage: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {

    this.loading = true;
    if (this.term) {
      this.searchTerm = this.term.toLowerCase();
    } else {
      this.searchTerm = ''
    }
    let getAllSportsListResquest: any = {
      'page_no': pageNo,
      'item_per_page': itemPerPage,
      'sortingKey': this.sortedKey,
      'sortingValue': this.sortedValue,
      'searchVal': this.searchTerm
    }
    console.log(getAllSportsListResquest);
    

    await this.dataServices.postData(apiURL.GET_SPORTS_FOR_GRID,getAllSportsListResquest,localStorage.getItem('token')).toPromise().then(getAllSportsListResponse => {
    try {
      if (getAllSportsListResponse) {
        if (getAllSportsListResponse.status) {
          this.SportInfo = getAllSportsListResponse.data.data;
          if (getAllSportsListResponse.data.data && getAllSportsListResponse.data.data.length) {
            // this.firstInResponse = getAllSportsListResponse.data.snapshot.docs[0];
            // this.lastInResponse = getAllSportsListResponse.data.snapshot.docs[getAllSportsListResponse.data.snapshot.docs.length - 1];
            //Initialize values
            // this.prev_strt_at = [];
            // if (isNextReq) {
            //   this.pagination_clicked_count++;
            //   this.push_prev_startAt(this.firstInResponse);
            // }
            // else if (isPrevReq) {
            //   //Maintaing page no.
            //   this.pagination_clicked_count--;

            //   //Pop not required value in array
            //   // this.pop_prev_startAt(this.firstInResponse);
            // } else {
              // this.pagination_clicked_count = 0;
              pageNo = 1;
              this.page = 1;
              //Push first item to use for Previous action
              // this.push_prev_startAt(this.firstInResponse);
            // }
            this.SportInfo.forEach(element => {
              element['created_date'] = moment(element.created_datetime).format('MMMM DD, YYYY').toString();
              element['sport'] = element.sport;
            });
            this.loading = false;
            this.totalRecords = getAllSportsListResponse.data.total_items;
            this.getPaging(pageNo);
            // this.pager = this.datatableservice.getPager(getAllSportsListResponse.data.total_items, pageNo, itemPerPage);
          } else {
            this.SportInfo = [];
            this.loading = false;
          }
        } else {
          this.SportInfo=[];
          this.loading = false;
          this.startIndex=0;
          this.endIndex=0;
          this.totalRecords=0
        }
      } else {
        this.SportInfo=[];
          this.loading = false;
          this.startIndex=0;
          this.endIndex=0;
          this.totalRecords=0
      }
    } catch (error) {
      console.log(error);
      this.SportInfo = [];
      this.loading = false;
    }
  });
  }
  onPageChange(page: any): void {
   
    this.getGridResponse(this.uid, page, this.pageSize,null,null,null,null,null)
    this.getPaging(page);
 
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

  sportView(data) {

    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    // data.selectedSport = this.;
    // data.selectedSportName = this.selectedSeason;
    // data.prevEnabled = this.prevEnabled;
    // data.nextEnabled = this.nextEnabled;
    // data.pagination_clicked_count = this.pagination_clicked_count;
    // data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    // data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "viewsport", data: data })
  }

  
  
  selectedCol(event) {
    switch (event.value.trim()) {
      case "Sport":
        this.searchKey = "keywordForSportName"
        break;
      case "Created Date":
        this.searchKey = "keywordForDateTime"
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
      await this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } catch (err) {
      console.log(err);
      this.disable_next = false;
    }


  }

  sorting(header, type, index) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    if (type !== "asc") {
      this.sortingInfo['type'] = -1;
      this.sortingInfo['index'] = index;
      switch (header) {
        case "Sport":
          this.sortedKey = "sport"
          break;
        default:
          this.sortedKey = "created_datetime"
          break;
      }
      this.sortedValue = type;
      this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } else {
      this.sortingInfo['type'] = 1;
      this.sortingInfo['index'] = index;
      switch (header) {
        case "Sport":
          this.sortedKey = "sport"
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
  push_prev_startAt(prev_first_doc) {
    this.prev_strt_at.push(prev_first_doc);
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
    data.sortedKey=this.sortedKey;
    data.sortedValue=this.sortedValue;
    data.sortingInfo=this.sortingInfo;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "editSport", data: data })
  }


  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value)
    this.selectedPageSize = this.pageSize
    this.getGridResponse(this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }




}
