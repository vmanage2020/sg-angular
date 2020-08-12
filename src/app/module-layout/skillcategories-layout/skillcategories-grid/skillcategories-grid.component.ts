import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable, Subject } from 'rxjs';

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
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-skillcategories-grid',
  templateUrl: './skillcategories-grid.component.html',
  styleUrls: ['./skillcategories-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})

/**
 * Advanced table component - handling the advanced table with sidebar and content
 */
export class SkillcategoriesGridComponent implements OnInit {
  // bread crum data
  breadCrumbItems: any;
  private _success = new Subject<string>();
  sportId: any;
  positionInfo: any;
  loading = false;
  loaded = true
  sportsInfo: any;
  sportsList: any = '';
  noDataDefault = true

  staticAlertClosed = false;
  successMessage: string;
  
  skillCategoryInfo:any;
  term: any;
  // sellersData: Sellers[];
  // page number
  page = 1;
  // default page size
  pageSize = 10;
  // total number of records
  totalRecords = 0;
  sportName:any;
  // start and end index
  startIndex = 1;
  endIndex = 10;
  uid:any;

  // Table data
  tableData: Table[];

  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(private sharedService:SharedService,private modalService: NgbModal, public cookieService:CookieService,private dataServices: DataService, public router: Router, public service: AdvancedService, private activatedRoute: ActivatedRoute) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
    this.activatedRoute.params.subscribe(params => {
      this.sportId = params['sid'];
    });
  }

  ngOnInit() {
    this.sharedService.announceMission('skillcategory');
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' }, { label: 'Skill Category Details', path: '/', active: true }];
    this.uid=this.cookieService.getCookie('uid')
    this.activatedRoute
    .queryParams
    .subscribe(params => {
      console.log(params)
      this.sportId = params['sport_id'];
    });
    this.getAllSports(this.uid)    
    if(this.sportId && this.uid) {
       this.getGridResponse(this.sportId,this.uid,this.page,this.pageSize); 
       this.sportName=this.sportId
    }    
       
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
    this._fetchData();
  }
  getAllSports(uid){

    this.dataServices.postData(apiURL.GET_ALL_SPORTS,{'uid':uid},this.cookieService.getCookie('token')).toPromise().then(res => {
      try {        
        this.sportsInfo = res.data;   
          // console.log(this.sportsInfo)
        this.loaded=false;  
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })


  }

  onSportsChange(event){    
    console.log(event)

    if(event){
      if(event.sport_id){
       this.sportId = event.sport_id;
    
       this.getGridResponse(event.sport_id,this.uid,this.page,this.pageSize);      
      }
    }
  }
  getGridResponse(sportId,uid,pageNo,itemPerPage) {
    this.noDataDefault=false
    this.loading=true;
    this.dataServices.postData(apiURL.GET_SKILLCAT_FOR_GRID, {'sport_id':sportId,'uid':uid,'page_no':pageNo,'item_per_page':itemPerPage,'search':''},this.cookieService.getCookie('token')).subscribe(res => {
      try {   
        // console.log(res)     
        this.skillCategoryInfo = res.data.data;   
        this.skillCategoryInfo.forEach(element => {
          element.created_datetime = moment(element.created_datetime).format('DD MMM-YYYY HH:mm').toString();
          element.sport_id = this.sportId;
        });  
        this.totalRecords = res.data.total_items;   
        if (this.endIndex > this.totalRecords) {
          this.endIndex = this.totalRecords;
        }  
        
        this.loading=false
      } catch (error) {
        console.log(error)
      }
    })
  }
  onPageChange(page: any): void {
    this.startIndex = (page - 1) * this.pageSize + 1;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.skillCategoryInfo = this.skillCategoryInfo.slice(this.startIndex - 1, this.endIndex - 1);
    this.getGridResponse(this.sportId,this.uid,page,this.pageSize);
  }



  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = tableData;
  }

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */
  // onSort({ column, direction }: SortEvent) {
  //   // resetting other headers
  //   this.headers.forEach(header => {
  //     if (header.sortable !== column) {
  //       header.direction = '';
  //     }
  //   });
  //   this.service.sortColumn = column;
  //   this.service.sortDirection = direction;
  // }
}
