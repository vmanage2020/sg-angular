import { Component, OnInit, ViewChildren, QueryList, ElementRef, Injector, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable, BehaviorSubject } from 'rxjs';

import { Table } from '../../../dataTable/advanced.model';

import { tableData } from '../../../dataTable/data';

import { AdvancedService } from '../../../dataTable/advanced.service';
import { AdvancedSortableDirective, SortEvent } from '../../../dataTable/advanced-sortable.directive';
import { DataService } from 'src/app/core/services/data.service';
import { DbService } from 'src/app/core/services/db.service';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { Logoinfo } from '../../logoinfo.interface';

import { RestApiService } from '../../../shared/rest-api.services';

@Component({
  selector: 'app-team-grid',
  templateUrl: './team-grid.component.html',
  styleUrls: ['./team-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})
export class TeamGridComponent implements OnInit {
  @Output() change = new EventEmitter();
  teamInfo: any[] = [];
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  page = 1;
  pageSize = 10;
  startIndex = 1;
  endIndex = 10;
  SelectedColumns: any = null;
  eachCol: any[] = [];
  uid: any;
  org_id: any;
  showColumns: any;
  lastVisibleRecord: any = {}
  selectedPageSize: number = 10;

  teamList: any[] = [];
  noOfCol: any = [
    { name: Constant.searchFilterKey, allCol: "All Columns", value: 'All Columns' },
    { name: 'team_name', allCol: "All Columns", value: 'Team Name' },

    { name: 'level', allCol: "All Columns", value: 'Level' },

    { name: 'players', allCol: "All Columns", value: 'Players' },

    { name: 'coaches', allCol: "All Columns", value: 'Coaches' },

    { name: 'managers', allCol: "All Columns", value: 'Managers' },

    { name: 'season', allCol: "All Columns", value: 'Season' },

    { name: 'sport', allCol: "All Columns", value: 'Sport' }

  ];
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ];
  nextEnabled = false;
  prevEnabled = false;
  pager: any = {};
  allSeason: any;
  term: any = '';
  searchTerm: any = '';
  selectedSeason: any = Constant.seasonName;
  seasonType: any = Constant.seasonType;
  isSeasonAvailable: boolean = false;
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  sortingInfo: any = {};
  totalRecords: any = 0;
  data: any;
  teamData: any;
  isdescending: boolean = false;
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


  tables$: Observable<Table[]>;
  total$: Observable<number>;
  injectedData: any;
  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private dropDownService: DropdownService, 
    private datatableservice: NgiDatatableService, 
    private db: DbService, 
    public injector: Injector, 
    private sharedService: SharedService, 
    public service: AdvancedService, 
    private restApiService: RestApiService,
    private eref: ElementRef, 
    public dataService: DataService, 
    public router: Router, 
    public cookieService: CookieService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        // this.data = data
        if (data.action == "organizationFilter") {
          if (data.organization_id === Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          } else {
            this.prevEnabled = false;
            this.nextEnabled = false;
            this.org_id = data.organization_id;
            this.selectedSeason = Constant.seasonName;
            this.seasonType = Constant.seasonType;
            this.getTeamList(this.uid, data.organization_id, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
          }

        } else if (data == "teamRouter") {
          this.change.emit({ action: "teamgrid" })
        }
      }
    })
  }

  ngOnInit() {


    this.getTeam();
    this.injectedData = this.injector.get('injectData')
    this.sharedService.announceMission('team');
    this.getSeasonDropDown();
    this.org_id = localStorage.getItem('org_id');
    this.noOfCol.forEach(element => {
      if (element.name !== Constant.searchFilterKey) {
        this.eachCol.push(element.name)
      }
    });
    this.SelectedColumns = this.eachCol;
    this.showColumns = this.SelectedColumns;   
    console.log('---list inject dsta---', this.injectedData)
    if (this.injectedData) {
      if (this.injectedData.action) {
        if (this.injectedData.data) {
          this.selectedPageSize = this.injectedData.data.pageSize;
          this.pageSize = this.injectedData.data.pageSize;
          if (this.injectedData.data.pageNo) {
            this.selectedSeason = this.injectedData.data.seaonName;
            this.seasonType = this.injectedData.data.seasonId;
            this.nextEnabled = this.injectedData.data.nextEnabled;
            this.prevEnabled = this.injectedData.data.prevEnabled;
            this.getTeamList(this.uid, this.org_id, this.injectedData.data.pageNo, this.injectedData.data.pageSize,
              this.injectedData.data.seasonId, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
          } else {
            this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType,
              this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
          }
        } else {
          this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType,
            this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
      }
      else {
        this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType,
          this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
    } else {
      this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType,
        this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    }
  }

  getTeam()
  {
    this.restApiService.lists('teams').subscribe( res =>{
      this.teamList = res;
    }, e=>{
      console.log('----API error for team list----', e)
    })
  }

  async getSeasonDropDown() {
    this.isSeasonAvailable = true;
    let seasonDropdownForGrid: any = await this.dropDownService.getSeasondropdownForGrid();
    try {
      if (seasonDropdownForGrid.status) {
        this.allSeason = seasonDropdownForGrid.data;
        this.isSeasonAvailable = false;
      } else {
        this.allSeason = [];
        this.isSeasonAvailable = false;
      }
    } catch (error) {
      console.log(error);
    }
  }
  sorting(header, type, index) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    if (type !== "asc") {
      this.sortingInfo['type'] = 'desc';
      this.sortingInfo['index'] = index;
      if (header.includes('Team Name')) {
        this.sortedKey = "team_name"
      } else {
        this.sortedKey = header.toLowerCase();
      }
      this.sortedValue = type;
      this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    } else {
      this.sortingInfo['type'] = 'asc';
      this.sortingInfo['index'] = index;
      if (header.includes('Team Name')) {
        this.sortedKey = "team_name"
      } else {
        this.sortedKey = header.toLowerCase();
      }
      this.sortedValue = type;
      this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType,
        this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse);
    }
  }

  //Search Input (to hide icon)
  onClear(event) {

    this.prevEnabled = false;
    this.nextEnabled = false;
    this.term = '';
    this.reInitialiseGrid();
    this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType
      , this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }
  searchInput(event: any) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.reInitialiseGrid();
    this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  addTeam() {
    this.change.emit({ action: "createteam" })
  }
  onSeasonChange(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.seasonType = event.name
    this.selectedSeason = event.value;
    this.reInitialiseGrid();
    this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType
      , this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value)
    this.selectedPageSize = this.pageSize;
    this.reInitialiseGrid();
    this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType
      , this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  reInitialiseGrid(){
    this.displayLoader=true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
  }

  async getTeamList(uid, orgId, pageNo, itemPerPage, seasonId, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {

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
    this.teamInfo = [];
    let getTeamListObj: any = {
      'authId': uid,
      'page_no': pageNo,
      'item_per_page': itemPerPage,
      'organizationId': orgId,
      'seasonType': seasonId,
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
    let result = await this.db.getData(getTeamListObj);    
    try {
      if (result.status) {
        if (result.data) {
          this.firstInResponse = result.snapshot.docs[0];
          this.lastInResponse = result.snapshot.docs[result.snapshot.docs.length - 1];
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

          result.data.forEach(element => {
            if (element !== null) {
              element['players'] = element.players_count;
              element['coaches'] = element.coaches_count;
              element['managers'] = element.managers_count;
              element['sport'] = element.sport_name;
              element['season'] = element.season_lable;
              // element.level = element.level_id;
              // element.team_name = element.team_name.replace('_', " ");
              // this.teamInfo.push(element);
            }
          });
          this.teamInfo = result.data;
          this.totalRecords = result.totalRecords;
          this.getPaging(pageNo);
          this.pager = await this.datatableservice.getPager(this.totalRecords, pageNo, itemPerPage);
          this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
          clearInterval(id);
          this.loading = false;
          this.displayLoader = false;
        } else {          
          this.resetGrid(id);
        }
      } else {
        this.resetGrid(id);
      }
    } catch (error) {
      console.log(error);
      this.resetGrid(id);
    }
  }
  resetGrid(id?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.teamInfo = [];
    this.displayLoader = false;
    this.loading = false;
    if (id) {
      clearInterval(id);
    }
  }


  selectedCol(event) {

    switch (event.value.trim()) {
      case "Team Name":
        this.searchKey = "keywordForTeamName"
        break;
      case "Level":
        this.searchKey = "keywordForLevel"
        break;
      case "Players":
        this.searchKey = "keywordForPlayersCount"
        break;
      case "Coaches":
        this.searchKey = "keywordForCoachesCount"
        break;
      case "Managers":
        this.searchKey = "keywordForManagersCount"
        break;
      case "Season":
        this.searchKey = "keywordForSeasonLable"
        break;
      case "Sport":
        this.searchKey = "keywordForSportName"
        break;
      default:
        this.searchKey = "keywords"
        break;
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

  userEdit(id) {

    this.restApiService.lists('teams/'+id).subscribe( teamdata =>{
      this.restApiService.lists('teammembers/'+id).subscribe( memberdata =>{
        this.teamData = {'team': teamdata, 'member': memberdata}
       
        this.change.emit({ action: "editteam", data: this.teamData })
      })
       
      
    }, e=>{
      console.log('----API error for team list----', e)
    })
    console.log('---id---', id)

    return false;


    /* data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.seasonId = this.seasonType;
    data.seaonName = this.selectedSeason;
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

    this.change.emit({ action: "editteam", data: data }) */
  }

  userView(id) {

    this.restApiService.lists('teams/'+id).subscribe( teamdata =>{
      this.restApiService.lists('teammembers/'+id).subscribe( memberdata =>{
        this.teamData = {'team': teamdata, 'member': memberdata}

        this.change.emit({ action: "viewteam", data: this.teamData })
        
      })
      
      
    }, e=>{
      console.log('----API error for team list----', e)
    })
    console.log('---id---', id)

    return false;

    /* data.pageNo = this.page;
    data.pageSize = this.pageSize;
    data.seasonId = this.seasonType;
    data.seaonName = this.selectedSeason;
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
    this.change.emit({ action: "viewteam", data: data }) */
  }

  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.teamInfo = [];
      this.reInitialiseGrid();
      await this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType, this.nextEnabled,
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
      this.teamInfo = [];
      this.reInitialiseGrid();
      await this.getTeamList(this.uid, this.org_id, this.page, this.pageSize, this.seasonType, this.nextEnabled,
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
  readableDate(time) {
    var d = new Date(time);
    return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
  }

}
