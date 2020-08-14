import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';


import { Observable, Subject } from 'rxjs';

import { Table } from '../../../dataTable/advanced.model';



import { AdvancedService } from '../../../dataTable/advanced.service';

import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { DecimalPipe } from '@angular/common';
import { apiURL } from 'src/app/core/services/config';

@Component({
  selector: 'app-position-skill-grid',
  templateUrl: './position-skill-grid.component.html',
  styleUrls: ['./position-skill-grid.component.scss'],
  providers: [AdvancedService, DecimalPipe]
})
export class PositionSkillGridComponent implements OnInit {

  breadCrumbItems: any;
  private _success = new Subject<string>();
  sportId: any;
  positionskillInfo: any;
  loading = false;
  loaded = true
  sportsInfo: any;
  sportName: any = '';
  noDataDefault = true

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

  // start and end index
  startIndex = 1;
  endIndex = 10;
 
  uid:any;


  // Table data
  tableData: Table[];

  tables$: Observable<Table[]>;
  total$: Observable<number>;

  constructor(private sharedService:SharedService,public cookieService:CookieService, private modalService: NgbModal, private dataServices: DataService, public router: Router, public service: AdvancedService, private activatedRoute: ActivatedRoute) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
   
  }

  ngOnInit() {
    
    this.breadCrumbItems = [{ label: 'Sports Gravy', path: '/' },{ label: 'Position Details', path: '/', active: true }];
    this.sharedService.announceMission('positionskill');
    this.uid = this.cookieService.getCookie('uid')
    this.getAllSports(this.uid)  
    this.activatedRoute
    .queryParams
    .subscribe(params => {
      this.sportId = params['sport_id'];
    });
    if(this.sportId) {
      this.getGridResponse(this.sportId,this.uid,this.page,this.pageSize); 
       this.sportName=this.sportId
    }    
  
  }
  getAllSports(uid){

    this.dataServices.postData(apiURL.GET_ALL_SPORTS,{'uid':uid},this.cookieService.getCookie('token')).toPromise().then(res => {
      try {        
        this.sportsInfo = res.data;   
        
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })


  }
  

  onSportsChange(event){    
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
    this.dataServices.postData(apiURL.GET_POSITIONSKILL_FOR_GRID, {'sport_id':sportId,'uid':uid,'page_no':pageNo,'item_per_page':itemPerPage,'search':''},this.cookieService.getCookie('token')).subscribe(res => {
      try {        
        this.positionskillInfo = res.data.data;   
        // console.log(res.data.data)
        this.positionskillInfo.forEach(element => {
          element.created_datetime = moment(element.created_datetime).format('DD MMM-YYYY HH:mm').toString();
          element.sport_id=element.sport_id.split('_').join(' ') 
       });
        // console.log(this.positionskillInfo)
        this.loading=false;
        this.totalRecords = res.data.total_items;   
        if (this.endIndex > this.totalRecords) {
          this.endIndex = this.totalRecords;
        }
      } catch (error) {
        console.log(error)
      }
    })
  }
  onPageChange(page: any): void {
    // this.page=page
    this.startIndex = (page - 1) * this.pageSize + 1;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.positionskillInfo = this.positionskillInfo.slice(this.startIndex - 1, this.endIndex - 1);
    this.getGridResponse(this.sportId,this.uid,page,this.pageSize);
  }



  /**
   * fetches the table value
   */
 

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */

}
