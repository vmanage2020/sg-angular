import { AppConfig } from './../../../../src/app/app.config';
import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import * as moment from 'moment'
import { NgiDatatableService } from './ngi-datatable.service';
@Component({
  selector: 'ngi-datatable',
  templateUrl: './ngi-datatable.component.html',
  styleUrls: ['./ngi-datatable.component.scss']
})
export class NgiDatatableComponent implements OnInit {
  getUserListInfo: any = {};
  @Input('config') config;
  @Output() editEvent: EventEmitter<any> = new EventEmitter();
  @Output() viewEvent: EventEmitter<any> = new EventEmitter();
  @Output() selectedSportEvent: EventEmitter<any> = new EventEmitter();
  @Output() succesRecordEvent: EventEmitter<any> = new EventEmitter();
  @Output() errorRecordEvent: EventEmitter<any> = new EventEmitter();
  @Output() recordDetailEvent: EventEmitter<any> = new EventEmitter();
  @Output() fixEvent: EventEmitter<any> = new EventEmitter();
  @Output() reuploadEvent: EventEmitter<any> = new EventEmitter();

  @Output() searchKeyToSearchEvent: EventEmitter<any> = new EventEmitter();
  @Output() searchValueToSearchEvent: EventEmitter<any> = new EventEmitter();
  @Output() loaderEvent: EventEmitter<any> = new EventEmitter();

  @Output() valueForAddEvent: EventEmitter<any> = new EventEmitter();


  showColumns: any;
  pager: any = {};
  resData: any;
  totalRecords: number;
  startIndex: number = 1;
  endIndex: number = 10;
  page = 1;
  selectedPageSize: any;
  sortingOrder: any;
  sortingKey: any;
  constants: any;
  recordPerPage: any;
  term: any;
  searchKey: any;
  selecteColumn: any = null;
  searchValue: any;
  filterKey: any;
  selectedSeason: any;
  loading: boolean = false;
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

  constructor(private datatableservice: NgiDatatableService, private injector: Injector) {
    this.constants = AppConfig.constants.tableDropdown;
  }

  ngOnInit() {
    this.showColumns = this.config.showColumninfo;
    this.sortingOrder = this.config.sortingValue;
    this.sortingKey = this.config.sortingKey;
    this.recordPerPage = this.config.item_per_page;
    this.searchKey = this.config.searchKey;
    this.searchValue = this.config.searchValue;
    this.selectedPageSize = this.config.item_per_page;
    if (this.config.isFilterKeyNull) {
      this.filterKey = null;
    } else {
      this.filterKey = "all";
    }    
    // this.term = this.config.searchValue;
    this.config['index'];
    if (this.config.isDataAlreadyLoaded === "create") {
      this.loaddataAfterCreate(this.config.Data);
    } else if (this.config.isDataAlreadyLoaded === "edit") {
      this.totalRecords = this.config.Data.totalRecords;
      this.loaddataAfterEdit(this.config.Data.getInjectedDataFromgrid);
      this.pager = this.datatableservice.getPager(this.config.Data.totalRecords,
        this.config.Data.requestData.pageNo, this.config.Data.requestData.itemPerPage);
      this.resData = this.config.Data.userInfo;
      this.getUserListInfo = this.config.Data.requestData;
      this.firstInResponse = this.config.Data.snapshot[0];
      this.lastInResponse = this.config.Data.snapshot[this.config.Data.snapshot.length - 1];
      // this.push_prev_startAt(this.firstInResponse, this.injectedData.data.requestData.page_no);                   
      this.getPaging(this.config.Data.requestData.pageNo);
      this.pagination_clicked_count = this.config.Data.getInjectedDataFromgrid.pagination_clicked_count;    
    } else if(this.config.isDataAlreadyLoaded === "none"){
      this.loaddataAfterEdit(this.config.Data);
      if (this.config.Data.forPaginationFirstResponse) {
        this.firstInResponse = this.config.Data.forPaginationFirstResponse;
      } if (this.config.Data.forPaginationLastResponse) {
        this.lastInResponse = this.config.Data.forPaginationLastResponse;
      }
      if (this.nextEnabled) {
        this.initPage(this.config.Data.pageNo);
      } else if (this.prevEnabled) {
        this.pagination_clicked_count = this.config.Data.pagination_clicked_count + 1;
        this.initPage(this.config.Data.pageNo, this.get_prev_startAt(this.config.Data.pageNo));     
      } else {
        this.initPage();
      }      
    }else{
      this.initPage();
    }
    // this.initPage();

    if (this.config.isSearchDropdownEnable) {
      this.selecteColumn = this.config.searchDropdownData[0].value;
    }
    if (this.config.viewDropdownData) {
      this.selectedSeason = this.config.viewDropdownData[0].value;
    }
  }
  loaddataAfterCreate(data: any) {
    this.totalRecords = data.totalRecords;
    this.getPaging(data.requestData.page_no);
    this.pager = this.datatableservice.getPager(data.totalRecords,
      data.requestData.page_no, data.requestData.item_per_page);
    this.resData = data.userInfo;
    this.getUserListInfo = data.requestData;
    this.valueForAddEvent.emit({ gridRequestInput: this.getUserListInfo, utiliseFor: "add Organization" });
    this.firstInResponse = data.snapshot[0];
    this.lastInResponse = data.snapshot[data.snapshot.length - 1];
    this.push_prev_startAt(this.firstInResponse, data.requestData.page_no);
  }
  loaddataAfterEdit(data: any) {   
    this.recordPerPage = data.pageSize;
    this.selectedPageSize = data.pageSize;
    this.searchValue = data.searchValue;
    this.nextEnabled = data.nextEnabled;
    this.prevEnabled = data.prevEnabled;
    this.pagination_clicked_count = data.pagination_clicked_count - 1;
    this.searchKey = data.searchKey;    
    this.prev_strt_at = data.prev_strt_at_arr;
  }
  ngAfterViewInit() {

  }
  async initPage(page: number = 1, prevStartAt: any = null, isNextReq: boolean = this.nextEnabled, isPrevReq: boolean = this.prevEnabled,
    prevEndAt: any = this.firstInResponse, nextStartAt: any = this.lastInResponse, keyword: string = this.searchValue, sortorder: string = this.sortingOrder, sortingkey: string = this.sortingKey,
    itemPerPage: number = this.recordPerPage, searchKey: string = this.searchKey, filterKey: string = this.filterKey) {
    try {
      if (this.firstInResponse) {
        this.forPaginationFirstResponse = this.firstInResponse;
      }
      if (this.lastInResponse) {
        this.forPaginationLastResponse = this.lastInResponse;
      }
      this.config.params['pageNo'] = page;
      this.config.params['searchVal'] = keyword;
      this.config.params['searchKey'] = searchKey;
      this.config.params['sortingValue'] = sortorder;
      this.config.params['sortingKey'] = sortingkey;
      this.config.params['itemPerPage'] = +itemPerPage;
      this.config.params['isNextReq'] = isNextReq;
      this.config.params['isPrevReq'] = isPrevReq;
      this.config.params['prevStartAt'] = prevStartAt;
      this.config.params['prevEndAt'] = prevEndAt;
      this.config.params['nextStartAt'] = nextStartAt;
      if (this.config.filterKey) {
        this.config.params[this.config.filterKey] = filterKey;
      }
      this.getUserListInfo = this.config.params;
      let getGridResponse: any = await this.datatableservice.getOrganizationGridResponse(this.config.params, this.config.dataTableType);
      this.valueForAddEvent.emit({ gridRequestInput: this.getUserListInfo, utiliseFor: "add Organization" });
      if (getGridResponse.status) {
        if (getGridResponse.data && getGridResponse.data.length !== 0) {
          this.firstInResponse = getGridResponse.snapshot.docs[0];
          this.lastInResponse = getGridResponse.snapshot.docs[getGridResponse.snapshot.docs.length - 1];
          //Initialize values
          if (isNextReq) {
            this.pagination_clicked_count++;
            this.push_prev_startAt(this.firstInResponse, page);
          }
          else if (isPrevReq) {
            //Maintaing page no.
            this.pagination_clicked_count--;
          } else {
            this.pagination_clicked_count = 0;
            page = 1;
            this.page = 1;
            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse, page);
          }
          this.resData = getGridResponse.data;
          this.totalRecords = getGridResponse.totalRecords;
          this.getPaging(page);
          this.page = page;
          this.pager = this.datatableservice.getPager(this.totalRecords, page, itemPerPage);
          this.showColumns.forEach(element => {
            if (element.type === "normal") {
              this.resData.forEach(eachdata => {
                Object.keys(eachdata).forEach(keys => {
                  if (eachdata[keys] === "" || eachdata[keys] === null || eachdata[keys] === undefined || !eachdata[keys]) {
                    eachdata[keys] = "-"
                  }
                });
              });
            }
            else if (element.type === "concatenation") {
              this.resData.forEach(eachrespdata => {
                element.keyname.forEach((eachkey, index) => {
                  if (eachrespdata.hasOwnProperty(element.key)) {
                    if (index == 0) {
                      element.key = "concatedValue"
                      if (eachrespdata[element.key]) {
                        eachrespdata[element.key] = eachrespdata[element.key] + element.concat_symbol + eachrespdata[eachkey];
                      } else {
                        eachrespdata[element.key] = eachrespdata[eachkey];
                      }
                    } else {
                      eachrespdata[element.key] = eachrespdata[element.key] + element.concat_symbol + eachrespdata[eachkey];
                    }
                  } else {
                    if (eachrespdata[element.key]) {
                      eachrespdata[element.key] = eachrespdata[element.key] + element.concat_symbol + eachrespdata[eachkey];
                    } else {
                      eachrespdata[element.key] = eachrespdata[eachkey];
                    }
                  }
                });
              });

            }
            else if (element.type === "date") {
              this.resData.forEach(resp => {
                if (resp[element.key] !== "") {
                  resp[element.key] = moment(resp[element.key]).format(element.format).toString();
                }
                else {
                  resp[element.key] = '-'
                }
              });
            } else if (element.type === "mobile") {
              this.resData.forEach(resp => {
                if (resp[element.key] !== "" && resp[element.key] !== null && resp[element.key] !== undefined) {
                  resp[element.key] = resp[element.key].replace(/^(\d{3})(\d{3})(\d{4}).*/, "($1) $2-$3");
                }
                else {
                  resp[element.key] = '-'
                }
              });
            }
          });
          this.loading = false;
          this.loaderEvent.emit("data Loaded");
        }
        else {
          this.loading = false;
          this.loaderEvent.emit("data Loaded")
          this.resData = [];
          this.totalRecords = 0;
          this.getPaging(page);
          this.pager = this.datatableservice.getPager(this.totalRecords, page, itemPerPage);
        }
      }
      else {
        this.loading = false;
        this.loaderEvent.emit("data Loaded")
        this.resData = [];
        this.totalRecords = 0;
        this.getPaging(page);
        this.pager = this.datatableservice.getPager(this.totalRecords, page, itemPerPage);
      }
    } catch (error) {
      console.log(error);
      this.loaderEvent.emit("data Loaded")
    }
  }


  getPaging(page) {
    this.page = page
    this.startIndex = (page - 1) * +this.recordPerPage + 1;
    this.endIndex = (page - 1) * +this.recordPerPage + +this.recordPerPage;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    if (this.endIndex === 0) {
      this.startIndex = 0
    }
  }

  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.loaderEvent.emit("hide data")
      this.initPage(this.page, this.get_prev_startAt(this.page))
    } catch (error) {
      console.log(error);
    }
  }

  async nextPage() {
    try {
      this.nextEnabled = true;
      this.page += 1;
      this.prevEnabled = false;
      this.loaderEvent.emit("hide data")
      this.initPage(this.page)
    } catch (err) {
      console.log(err);
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

  searchData(event) {
    this.nextEnabled = false;
      this.prevEnabled = false;
    this.searchValue = event.target.value;
    this.loaderEvent.emit("hide data")
    this.initPage();
  }
  onDataChange(event) {
    this.searchKey = event.value;
    this.loaderEvent.emit("hide data")
    this.initPage();
  }
  selectedSport(event) {
    this.nextEnabled = false;
      this.prevEnabled = false;
    this.filterKey = event.id
    this.initPage();
    this.selectedSportEvent.emit(event)
  }
  onRoleChange(event) {
    this.nextEnabled = false;
      this.prevEnabled = false;
    this.filterKey = event.value;
    this.initPage();
  }
  sorting(sortingKey, sortingType, index) {
    if (sortingType === "asc") {
      this.config.sortingValue = 'asc'
      this.config['index'] = index
    }
    else if (sortingType === "desc") {
      this.config.sortingValue = 'desc'
      this.config['index'] = index

    }
    this.sortingOrder = sortingType;
    if (sortingKey.type === "normal" || sortingKey.type === "date" || sortingKey.type === "mobile") {
      this.sortingKey = sortingKey.key;
    }
    else if (sortingKey.type === "concatenation") {
      this.sortingKey = sortingKey.keyname[0]
    }
    this.initPage();
  }
  changePageRecordCount(event) {
    this.nextEnabled = false;
      this.prevEnabled = false;
    this.recordPerPage = event.count;
    this.loaderEvent.emit("hide data");
    this.initPage();
  }
  onClear(event) {
    this.nextEnabled = false;
      this.prevEnabled = false;
    this.term = '';
    this.searchValue = '';
    this.loaderEvent.emit("hide data");
    this.initPage();
  }
  edit(data) {
    data.pageNo = this.page;
    data.pageSize = this.recordPerPage;
    data.viewBy = "edit";
    // data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchValue = this.searchValue;
    data.prevEnabled = this.prevEnabled;
    data.nextEnabled = this.nextEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.prev_strt_at_arr = this.prev_strt_at;
    data.requestPayloadGrid = this.getUserListInfo;
    this.editEvent.emit(data);
  }
  view(data) {
    data.pageNo = this.page;
    data.pageSize = this.recordPerPage;
    data.viewBy = "view";
    // data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchValue = this.searchValue;
    data.prevEnabled = this.prevEnabled;
    data.nextEnabled = this.nextEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.prev_strt_at_arr = this.prev_strt_at;
    data.requestPayloadGrid = this.getUserListInfo;
    this.viewEvent.emit(data)
  }
  delete(data) {

  }
  reUploadEvent(data) {
    this.reuploadEvent.emit(data);

  }
  successRecord(data) {
    this.succesRecordEvent.emit(data);

  }
  errorRecord(data) {
    this.errorRecordEvent.emit(data)

  }
  viewDetailRecords(data) {
    this.recordDetailEvent.emit(data)
  }
  fixEvents(data) {
    this.fixEvent.emit(data)

  }

}
