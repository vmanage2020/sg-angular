import { Component, OnInit, ViewChildren, QueryList, ElementRef, Output, EventEmitter, Injector } from '@angular/core';


import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { apiURL, Constant } from 'src/app/core/services/config';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { SeasonCrudService } from '../season-crud.service';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-season-grid',
  templateUrl: './season-grid.component.html',
  styleUrls: ['./season-grid.component.scss'],
  providers: [DecimalPipe]
})
export class SeasonGridComponent implements OnInit {
  @Output() change = new EventEmitter();
  breadCrumbItems: any;
  private _success = new Subject<string>();
  sportId: any = null;
  positionskillInfo: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;  
  sportsInfo: any;
  initalValue: any = "All Seasons"
  sportName: any = this.initalValue;
  staticAlertClosed = false;
  successMessage: string;
  term: any = '';
  searchTerm: any = '';
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  seasonInfo: any = [];

  // start and end index
  startIndex = 0;
  endIndex = 0;
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  sortingInfo: any = {};
  pager: any = {};
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
  selectedPageSize: number = 10;
  selectedSport: boolean = false;
  SelectedColumns: any = null;
  uid: any;
  showColumns: any;
  eachCol: any[] = [];
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ]
  data: any;
  orgId: any;
  cols: any;
  noOfCol: any = [
    { name: Constant.searchFilterKey, allCol: "All Columns", value: "All Columns" },
    { name: 'sport', allCol: "All Columns", value: "Sport" },
    { name: 'season_name', allCol: "All Columns", value: 'Season Name' },
    { name: 'start_date', allCol: "All Columns", value: 'Start Date' },
    { name: 'end_date', allCol: "All Columns", value: 'End Date' },

  ];

  injectedData: any;

  constructor(private seasonService: SeasonCrudService, private datatableservice: NgiDatatableService, private dropDownService: DropdownService, private titlecasePipe: TitleCasePipe, private injector: Injector, private sharedService: SharedService, public cookieService: CookieService, private modalService: NgbModal, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute) {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {        
        if (data.action === "organizationFilter") {         
          this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);          
       } else if (data === "seasonRouter") {
          this.change.emit({ action: "seasongrid", data: null });
        }
      }
    })
  }

  ngOnInit() {    
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('season');
    this.getSportsByOrg(this.orgId);
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;
    if (this.injectedData) {
      if (this.injectedData.data) {
        this.sportId = this.injectedData.data.selectedSport;
        this.sportName = this.injectedData.data.selectedSportName;
        if ((this.injectedData.data.pageSize && this.injectedData.data.selectedSport) || (this.injectedData.data.pageSize && this.injectedData.data.selectedSportName === this.initalValue)) {
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
          this.getGridResponse(this.sportId, this.uid, this.injectedData.data.pageNo, this.injectedData.data.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
        else if (this.injectedData.data.sport_id) {
          this.sportId = this.injectedData.data.sport_id
          this.sportName = this.injectedData.data.sport_name;
          this.getGridResponse(this.injectedData.data.sport_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
        else if (this.injectedData.data.sports_id) {
          this.sportId = this.injectedData.data.sports_id
          this.sportName = this.injectedData.data.sportName;
          this.getGridResponse(this.injectedData.data.sports_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        } else if (!this.injectedData.data.sport_id) {
          this.sportId = this.injectedData.data.sport_id;
          this.sportName = this.injectedData.data.sport_name;
          this.getGridResponse(this.injectedData.data.sport_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
        }
      }else{
        this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }

  }

  //Search Input (to hide icon)
  onClear(event) {
    this.term = '';
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  searchInput(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  async getSportsByOrg(orgId) {
    this.selectedSport = true;
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }

    console.log(getSportsByOrganizationRequest,"dropdownRequest");
    
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        if (getSportsByOrganizationResponse.data) {
          getSportsByOrganizationResponse.data.splice(0, 0, { name: 'All Seasons', sport_id: null });
          getSportsByOrganizationResponse.data.forEach(element => {
            if (element.sport_id !== null) {
              element.value = "Seasons By Sport"
            }
            else {
              element.value = null;
            }
          });
          this.sportsInfo = getSportsByOrganizationResponse.data;
        }
        this.selectedSport = false;
      } else {
        this.sportsInfo = [];
        this.selectedSport = false;
      }
    } catch (error) {
      console.log(error);
      this.sportsInfo = [];
      this.selectedSport = false;
    }
  }

  onSportsChange(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    if (event) {
      this.sportId = event.sport_id;
      this.sportName = event.name
      this.getGridResponse(event.sport_id, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    }

  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }
  async getGridResponse(sportId: any, uid: any, pageNo: any, itemPerPage: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {

    this.loading = true;
    let gridTimer = setInterval(this.timerFunction, 300, this.loaderInfo);
    let orgId = localStorage.getItem('org_id');

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
    try {
      let getSeasonGridRequest: any = {
        'sports_id': sportId, 'auth_uid': uid, 'pageNo': pageNo, 'itemPerPage': itemPerPage, 'organization_id': orgId,
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
      let getSeasonGridResponse: any = await this.seasonService.getGridResponseForSeason(getSeasonGridRequest);     
      if (getSeasonGridResponse.status) {
        this.loading = false;
        if (getSeasonGridResponse.data && getSeasonGridResponse.data.length !== 0) {
          this.firstInResponse = getSeasonGridResponse.snapshot.docs[0];
          this.lastInResponse = getSeasonGridResponse.snapshot.docs[getSeasonGridResponse.snapshot.docs.length - 1];
          //Initialize values
          // this.prev_strt_at = [];
          if (isNextReq) {
            this.pagination_clicked_count++;
            this.push_prev_startAt(this.firstInResponse);
          }
          else if (isPrevReq) {
            //Maintaing page no.
            this.pagination_clicked_count--;
          } else {
            this.pagination_clicked_count = 0;
            pageNo = 1;
            this.page = 1;
            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse);
          }

          getSeasonGridResponse.data.forEach(element => {
            element.start_date = moment(element.season_start_date.toDate()).format('MMMM DD, YYYY').toString();
            element.end_date = moment(element.season_end_date.toDate()).format('MMMM DD, YYYY').toString();
            element['sport'] = element.sports_name;
          });
          this.seasonInfo = getSeasonGridResponse.data;
          this.totalRecords = getSeasonGridResponse.totalRecords;
          this.getPaging(parseInt(pageNo));
          this.pager = await this.datatableservice.getPager(getSeasonGridResponse.totalRecords, pageNo, itemPerPage);
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
      console.log(error);
      this.noData(gridTimer);
    }
  }

  reInitialiseGrid(){
    this.displayLoader=true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  noData(id?:any) {
    this.seasonInfo = [];
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });    
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
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
  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.seasonInfo = [];
      this.reInitialiseGrid();
      await this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled,
        this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse);
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
      this.seasonInfo = [];
      this.reInitialiseGrid();
      await this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
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
    return this.prev_strt_at[pageNo - 1];
  }

  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value)
    this.selectedPageSize = this.pageSize;
    this.reInitialiseGrid();
    this.getGridResponse(this.sportId, this.uid, this.page, this.pageSize, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
  }
  addSeason() {
    this.change.emit({ action: "createseason", data: { "sport_id": this.sportId, "sport_name": this.sportName } })
  }
  selectedCol(event) {
    switch (event.value.trim()) {
      case "Sport":
        this.searchKey = "keywordForSportName"
        break;
      case "Season Name":
        this.searchKey = "keywordForSeasonName"
        break;
      case "Start Date":
        this.searchKey = "keywordForSeasonStartDate"
        break;
      case "End Date":
        this.searchKey = "keywordForSeasonEndDate"
        break;
      default:
        this.searchKey = "keywords"
        break;
    }
  }

  navigateEdit(data) {
    data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.selectedSport = this.sportId;
    data.selectedSportName = this.sportName;
    data.viewBy = "edit";
    data.prevEnabled = this.prevEnabled;
    data.nextEnabled = this.nextEnabled;
    data.pagination_clicked_count = this.pagination_clicked_count;
    data.forPaginationFirstResponse = this.forPaginationFirstResponse;
    data.forPaginationLastResponse = this.forPaginationLastResponse;
    data.term = this.term;
    data.searchKey = this.searchKey;
    data.searchFilter = this.searchFilter;
    this.change.emit({ action: "editseason", data: data })
  }

  navigateView(data) {
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
    this.change.emit({ action: "viewseason", data: data })
  }

}
