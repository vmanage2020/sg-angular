import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import * as moment from 'moment';
import { ImportLogService } from '../importLog-service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-success-user-import-record',
  templateUrl: './success-user-import-record.component.html',
  styleUrls: ['./success-user-import-record.component.scss']
})
export class SuccessUserImportRecordComponent implements OnInit {
  @Output() change = new EventEmitter();
  showColumns: any = [];
  pushSingleValueForHeaders: any;
  sportId: any;
  pager: any = {};
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  sportsInfo: any;
  sportName: any = null;
  noDataDefault = true
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  searchTerm: any = '';
  //Save first document in snapshot of items received
  firstInResponse: any = [];
  //Save last document in snapshot of items received
  lastInResponse: any = [];
  //Keep the array of first document of previous pages
  prev_strt_at: any = [];
  //Maintain the count of clicks on Next Prev button
  pagination_clicked_count = 0;
  //Disable next and prev buttons
  disable_next: boolean = false;
  disable_prev: boolean = false;
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  nextEnabled = false;
  prevEnabled = false;
  staticAlertClosed = false;
  successMessage: string;
  term: any;
  // sellersData: Sellers[];
  // page number
  page = 1;
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;
  userImportedRecordInfo: any;
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
  ];

  data: any;
  orgId: any;
  injectedData: any;
  constructor(public injector: Injector, public dataService: DataService, public importLogService: ImportLogService, private datatableservice: NgiDatatableService, public cookieService: CookieService, public router: Router, private sharedService: SharedService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data.action == "organizationFilter") {
        this.sharedService.announceMission('welcome');
        this.router.navigate(['/welcome']);
      } else if (data === "userImportRouter") {
        this.change.emit({ action: "userImport" })
      }
    })
    this.injectedData = injector.get('injectData')
  }

  ngOnInit() {
    this.sharedService.announceMission('userImport');
    this.getImportedUserList(this.uid, this.injectedData.data.organization_id, this.page, this.pageSize, this.injectedData.data.viewBy,
      this.injectedData.data.imported_file_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }

  async getImportedUserList(uid: any, orgId: any, pageNo: any, itemPerPage: any, filterType: any, importedFileId: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {

    try {
      this.loading = true;
      let gridTimer = setInterval(this.timerFunction, 300, this.loaderInfo);
      if (this.term) {
        this.searchTerm = this.term.toLowerCase();
      } else {
        this.searchTerm = ''
      }
      let obj = {
        'user_id': uid,
        'page_no': pageNo,
        'item_per_page': itemPerPage,
        'filterType': filterType,
        'organization_id': orgId,
        'imported_file_id': importedFileId,
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
      let res = await this.importLogService.getImportUserData(obj);
      if (res.status) {
        let val = JSON.stringify(res.data);
        this.firstInResponse = res.snapshot.docs[0];
        this.lastInResponse = res.snapshot.docs[res.snapshot.docs.length - 1];
        //Initialize values
        // this.prev_strt_at = [];
        if (isNextReq) {
          this.pagination_clicked_count++;
          this.push_prev_startAt(this.firstInResponse);
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
          this.push_prev_startAt(this.firstInResponse);
        }
        this.userImportedRecordInfo = JSON.parse(val);        
        this.pushSingleValueForHeaders = this.userImportedRecordInfo[0];
        // for (let key of this.pushSingleValueForHeaders) {
        //   this.showColumns.push(key)
        // }
        Object.keys(this.pushSingleValueForHeaders).forEach(async (key) => {
          this.showColumns.push(key)
        });       
        this.userImportedRecordInfo.forEach(element => {
          // debugger;         
          element.processed_flag = element.processed_flag ? element.processed_flag.toLowerCase() : "-"
          if (element.error_for_status) {
            element.error_for_status = element.error_for_status.toString();
          }

          if (element.athlete_1_dob) {
            if (typeof (element.athlete_1_dob) !== "string") {
              element.athlete_1_dob = moment(element.athlete_1_dob.toDate()).format('MMMM DD, YYYY').toString();
            } else {
              element.athlete_1_dob = moment(element.athlete_1_dob).format('MMMM DD, YYYY').toString();
            }
            
          } 
        });
        this.totalRecords = res.totalRecords;
        this.getPaging(pageNo);
        this.pager = await this.datatableservice.getPager(res.totalRecords, pageNo, itemPerPage);
        this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
        clearInterval(gridTimer);
        this.loading = false;
        this.displayLoader = false;
      }
      else {
        this.noData(gridTimer);
      }
    } catch (error) {
      console.log(error);
      this.noData();
    }
  }
  reInitialiseGrid() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  noData(id?: any) {
    this.userImportedRecordInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }

  selectedPage(event) {
    this.nextEnabled = false;
    this.prevEnabled = false;
    this.pageSize = parseInt(event.value);
    this.reInitialiseGrid();
    this.getImportedUserList(this.uid, this.injectedData.data.organization_id, this.page, this.pageSize,
      this.injectedData.data.viewBy, this.injectedData.data.imported_file_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
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

  backImportedLogs() {
    this.change.emit({ action: "userImport", data: this.injectedData.data })
  }

  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.userImportedRecordInfo = [];
      this.reInitialiseGrid();
      this.getImportedUserList(this.uid, this.injectedData.data.organization_id, this.page, this.pageSize, this.injectedData.data.viewBy,
        this.injectedData.data.imported_file_id, this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse)
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
      this.userImportedRecordInfo = [];
      this.reInitialiseGrid();
      this.getImportedUserList(this.uid, this.injectedData.data.organization_id, this.page, this.pageSize, this.injectedData.data.viewBy,
        this.injectedData.data.imported_file_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } catch (err) {
      console.log(err);
      this.disable_next = false;
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

  //Date formate
  readableDate(time) {
    var d = new Date(time);
    return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
  }

}
