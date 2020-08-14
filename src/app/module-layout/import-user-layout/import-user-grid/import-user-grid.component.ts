import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AppConfig } from 'src/app/app.config';
import { TitleCasePipe } from '@angular/common';
import { ImportLogService } from '../importLog-service'
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-import-user-grid',
  templateUrl: './import-user-grid.component.html',
  styleUrls: ['./import-user-grid.component.scss']
})
export class ImportUserGridComponent implements OnInit {
  @Output() change = new EventEmitter();
  sportId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;  
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  loaded = true
  sportsInfo: any;
  sportName: any = null;
  noDataDefault = true

  staticAlertClosed = false;
  successMessage: string;
  term: any = '';

  sortedKey: any = "imported_datetime";
  sortedValue: any = Constant.sortingValue;
  sortingInfo: any = {};
  // sellersData: Sellers[];
  // page number
  page = 1;

  pager: any = {};
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;
  userImportInfo: any;
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
  searchTerm: any = '';
  noOfCol: any = [
    { name: 'status', allCol: "All Columns", value: 'Status' },
    { name: 'total_rows', allCol: "All Columns", value: 'Total Rows' },
    { name: 'success_rows', allCol: "All Columns", value: 'Success Rows' },
    { name: 'error_rows', allCol: "All Columns", value: 'Error Rows' },
    { name: 'total_users_created', allCol: "All Columns", value: 'Total Users Created' },
    { name: 'players_created', allCol: "All Columns", value: 'Players Created' },
    { name: 'duplicate_players', allCol: "All Columns", value: "Duplicate Players" },
    { name: 'guardians_created', allCol: "All Columns", value: 'Guardians Created' },
    { name: 'duplicate_guardians', allCol: "All Columns", value: "Duplicate Guardians" },
    { name: 'sport', allCol: "All Columns", value: 'Sport' },
    { name: 'season', allCol: "All Columns", value: 'Season' },
    { name: 'file_name', allCol: "All Columns", value: 'File Name' },
    { name: 'uploaded_by', allCol: "All Columns", value: 'Uploaded By' },
    { name: 'uploaded_date/Time', allCol: "All Columns", value: "Uploaded Date/Time" },
  ];
  searchFilterDropDown: any = [
    { name: Constant.searchFilterKey, allCol: "All Columns", value: 'All Columns' },
    { name: 'sport', allCol: "All Columns", value: 'Sport' },
    { name: 'season', allCol: "All Columns", value: 'Season' },
    { name: 'file_name', allCol: "All Columns", value: 'File Name' },
    { name: 'uploaded_by', allCol: "All Columns", value: 'Uploaded By' },
  ];
  allSeason: any[];
  cols: any;
  selectedSeason: any = Constant.seasonName;
  seasonType: any = Constant.seasonType;
  injectedData: any;
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
  constructor(private dropDownService: DropdownService, private titlecasePipe: TitleCasePipe, public injector: Injector, public dataService: DataService,
    public cookieService: CookieService, public router: Router, private sharedService: SharedService,
    public importLogService: ImportLogService, private datatableservice: NgiDatatableService, private datepipe: DatePipe ) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data.action === "organizationFilter") {
        this.sharedService.announceMission('welcome');
        this.router.navigate(['/welcome']);
      } else if (data === "userImportRouter") {
        this.change.emit({ action: "userImport" })
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('userImport');
    this.orgId = localStorage.getItem('org_id');
    this.injectedData = this.injector.get('injectData');
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.getSeasonDropDown();
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;
    if (this.injectedData) {
      if (this.injectedData.data) {
        this.selectedSeason = this.injectedData.data.selectedSeason
        this.seasonType = this.injectedData.data.seasonType
        this.pageSize = this.injectedData.data.pageSize;
        this.selectedPageSize = this.injectedData.data.pageSize;
        this.term = this.injectedData.data.term;
        this.nextEnabled = this.injectedData.data.nextEnabled;
        this.prevEnabled = this.injectedData.data.prevEnabled;
        this.pagination_clicked_count = this.injectedData.data.pagination_clicked_count - 1;
        this.searchKey = this.injectedData.data.searchKey;
        this.searchFilter = this.injectedData.data.searchFilter;
        if (this.injectedData.data.forPaginationFirstResponse) {
          this.firstInResponse = this.injectedData.data.forPaginationFirstResponse;
        } if (this.injectedData.data.forPaginationLastResponse) {
          this.lastInResponse = this.injectedData.data.forPaginationLastResponse;
        }
        this.getUserImportList(this.uid, this.orgId, this.injectedData.data.pageNo, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      } else {
        this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }

  }

  async getSeasonDropDown() {
    let seasonDropdownForGrid: any = await this.dropDownService.getSeasondropdownForGrid();
    try {
      if (seasonDropdownForGrid.status) {
        this.allSeason = seasonDropdownForGrid.data;
      } else {
        this.allSeason = [];
      }
    } catch (error) {
      console.log(error);
    }
  }

  addUser() {
    this.change.emit({ action: "createUserImport" })
  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }

  async getUserImportList(uid: any, orgId: any, pageNo: any, itemPerPage: any, seasonId: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {
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
        'user_id': uid,
        'page_no': pageNo, 'item_per_page': itemPerPage, 'seasonType': seasonId, 'organization_id': orgId,
        'sortingKey': this.sortedKey,
        'sortingValue': this.sortedValue,
        'isNextReq': this.nextEnabled,
        'isPrevReq': this.prevEnabled,
        'prevStartAt': prevStartAt,
        'prevEndAt': prevEndAt,
        'nextStartAt': nextStartAt,
        'searchVal': this.searchTerm,
        'searchKey': this.searchKey
      }
      console.log(getUserList);

      let getGetImportLogList: any = await this.importLogService.getImportUserList(getUserList);
      if (getGetImportLogList.status) {

        this.firstInResponse = getGetImportLogList.snapshot.docs[0];
        this.lastInResponse = getGetImportLogList.snapshot.docs[getGetImportLogList.snapshot.docs.length - 1];
        //Initialize values
        // this.prev_strt_at = [];
        if (this.nextEnabled) {
          this.pagination_clicked_count++;
          this.push_prev_startAt(this.firstInResponse);
        }
        else if (this.prevEnabled) {
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
        getGetImportLogList.data.forEach(element => {
          if (element !== null && element !== undefined) {
            element.original_status = element.status;
            if (element.season_start_date && element.season_end_date) {
              element.season_start_date = element.season_start_date.toDate();
              element.season_end_date = element.season_end_date.toDate();
              element['season'] = element.season_name + " | " + moment(element.season_start_date).format('MMMM DD, YYYY').toString() + " to " + moment(element.season_end_date).format('MMMM DD, YYYY').toString();
            }
            element.processed_Flag = element.processed_Flag.toLowerCase();
            console.log(element.imported_datetime.toDate())
            element['uploaded_date/Time'] = new DatePipe('en-Us').transform(element.imported_datetime.toDate(), 'MMMM dd, yyyy h:mm a', 'GMT')
            //element['uploaded_date/Time'] = _date.toLocaleString('en-US', { timeZone: 'America/Chicago' }).toString();
            // element['uploaded_date/Time'] = moment(element.imported_datetime).format('MMMM DD, YYYY LT' ).toString();
            element['success_rows'] = (element.processed_records > 0) ? element.processed_records : "0";
            element['players_created'] = (element.player_records_created > 0) ? element.player_records_created : "0";
            element['guardians_created'] = (element.guardian_records_created > 0) ? element.guardian_records_created : "0";
            element['error_rows'] = (element.error_records > 0) ? element.error_records : "0";
            element['status_description'] = element.status.toString();

            element.file_name = element.imported_file_name;
            element.uploaded_by = element.imported_by
            element.sport = element.sports_name;
            element.total_rows = element.total_records_found || "0"
            element.total = ((element.processed_records + element.error_records) > 0) ? (element.processed_records + element.error_records) : "0"
            // element.guardian_duplicate_records_found = element.guardian_duplicate_records_found ? element.guardian_duplicate_records_found : 0;
            // element.guardian_mapped_records = element.guardian_mapped_records ? element.guardian_mapped_records : 0;
            // element.player_mapped_records = element.player_mapped_records ? element.player_mapped_records : 0;
            // element.player_duplicate_records_found = element.player_duplicate_records_found ? element.player_duplicate_records_found : 0;


            element.duplicate_guardians = (element.guardian_duplicate_records_found > 0)? element.guardian_duplicate_records_found : "0"
            element.duplicate_players = (element.player_duplicate_records_found > 0) ? element.player_duplicate_records_found : "0"
            element.total_users_created = element.total_user_records || "0"
            if (element.processed_Flag) {
              if (element.processed_Flag === 'n') {
                element['status'] = "Processing";
              }
              else if (element.processed_Flag === 'y') {
                if (element.total_records_found === element.total) {
                  element['status'] = "Processed";
                }
                else {
                  element['status'] = "Processing";
                }
              } else if (element.processed_Flag === 'e') {
                element['status'] = "The file contains unsupported values.";
              }
            }
            else {
              element['status'] = "Processing";
            }

          }
        });
        this.userImportInfo = getGetImportLogList.data;
        this.totalRecords = getGetImportLogList.totalRecords;
        this.getPaging(pageNo);
        this.pager = await this.datatableservice.getPager(getGetImportLogList.totalRecords, pageNo, itemPerPage);
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

  reInitialiseGrid(){
    this.displayLoader=true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  noData(id?:any) {
    this.userImportInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });    
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }

  //Search Input (to hide icon)
  onClear(event: any) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.term = '';
    this.reInitialiseGrid();
    this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  searchInput(event: any) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  viewUserDetailRecords(data) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.seasonType = this.seasonType;
    data.selectedSeason = this.selectedSeason;
    data.nextEnabled = this.nextEnabled;
    data.prevEnabled = this.prevEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "viewUserImport", data: data })
  }

  refresh() {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  selectedPage(event) {
    this.pageSize = parseInt(event.value);
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  onSeasonChange(event) {
    this.seasonType = event.name
    this.selectedSeason = event.value;
    this.reInitialiseGrid();
    this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  reUpload(data) {
    this.change.emit({ action: "createUserImport", data: data })
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


  successRecord(data: any) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.seasonType = this.seasonType;
    data.selectedSeason = this.selectedSeason;
    data.viewBy = "Success";
    data.nextEnabled = this.nextEnabled;
    data.prevEnabled = this.prevEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "successUserImport", data: data })
  }
  errorRecord(data: any) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.seasonType = this.seasonType;
    data.selectedSeason = this.selectedSeason;
    data.viewBy = "Error";
    data.nextEnabled = this.nextEnabled;
    data.prevEnabled = this.prevEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "errorUserImport", data: data })
  }
  viewAllRecords(data: any) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.seasonType = this.seasonType;
    data.selectedSeason = this.selectedSeason;
    data.viewBy = "All";
    data.nextEnabled = this.nextEnabled;
    data.prevEnabled = this.prevEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "successUserImport", data: data })
  }
  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.reInitialiseGrid();
      await this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType,
        this.nextEnabled, this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse)
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
      this.reInitialiseGrid();
      await this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled,
        this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
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
  readableDate(time: any) {
    var d = new Date(time);
    return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
  }
  selectedCol(event: any) {
    switch (event.value.trim()) {
      case "Sport":
        this.searchKey = "keywordForSportsName"
        break;
      case "Season":
        this.searchKey = "keywordForSeasonLable"
        break;
      case "File Name":
        this.searchKey = "keywordForImportedFileName"
        break;
      case "Uploaded By":
        this.searchKey = "keywordForImportedBy"
        break;
      default:
        this.searchKey = "keywords"
        break;
    }
  }


  sorting(header: any, type: any, index: any) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    if (type !== "asc") {
      this.sortingInfo['type'] = 'desc';
      this.sortingInfo['index'] = index;
      switch (header) {
        case "Total Rows":
          this.sortedKey = "total_records_found"
          break;
        case "Success Rows":
          this.sortedKey = "processed_records"
          break;
        case "Error Rows":
          this.sortedKey = "error_records"
          break;
        case "Total Users":
          this.sortedKey = "total_user_records"
          break;
        case "Players Created":
          this.sortedKey = "player_records_created"
          break;
        case "Player Duplicated Records":
          this.sortedKey = "guardian_mapped_records"
          break;
        case "Guardians Created":
          this.sortedKey = "guardian_records_created"
          break;
        case "Guardian Duplicated Records":
          this.sortedKey = "guardian_records_created"
          break;
        case "Sport":
          this.sortedKey = "sports_name"
          break;
        case "Season":
          this.sortedKey = "season_name"
          break;
        case "File Name":
          this.sortedKey = "season_name"
          break;
        default:
          this.sortedKey = "imported_datetime"
          break;
      }
      this.sortedValue = type;
      this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } else {
      this.sortingInfo['type'] = 'asc';
      this.sortingInfo['index'] = index;
      switch (header) {
        case "Total Rows":
          this.sortedKey = "total_records_found"
          break;
        case "Success Rows":
          this.sortedKey = "processed_records"
          break;
        case "Error Rows":
          this.sortedKey = "error_records"
          break;
        case "Total Users":
          this.sortedKey = "total_user_records"
          break;
        case "Players Created":
          this.sortedKey = "player_records_created"
          break;
        case "Player Duplicated Records":
          this.sortedKey = "guardian_mapped_records"
          break;
        case "Guardians Created":
          this.sortedKey = "guardian_records_created"
          break;
        case "Guardian Duplicated Records":
          this.sortedKey = "guardian_records_created"
          break;
        case "Sport":
          this.sortedKey = "sports_name"
          break;
        case "Season":
          this.sortedKey = "season_name"
          break;
        case "File Name":
          this.sortedKey = "season_name"
          break;
        default:
          this.sortedKey = "imported_datetime"
          break;
      }
      this.sortedValue = type;
      this.getUserImportList(this.uid, this.orgId, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }
  }

}
