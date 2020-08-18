import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-season-list-view',
  templateUrl: './season-list-view.component.html',
  styleUrls: ['./season-list-view.component.scss']
})
export class SeasonListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    value: any = [];
  
    
    getSeasonValue: any = [];
    getSeasonValueData: any = [];
    getSeasonValueArray: any = [];
  
    
    getSports: any = [];
    getSportsData: any = [];
    getSportsArray: any = [];
  
    data: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
  
    uid: any;
    orgId: any;
    
    loading = true;
    displayLoader: any = true;
  
    submitted = false;
    createtagForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
    }
    
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getSeasonInfoAPI();
      this.getAllSportsAPI();
      this.loading = false;
      this.displayLoader = false;
    }

    
    async getSeasonInfoAPI(){   
       
      let Metaurl='seasons/'+this.resourceID;
 
      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getSeasonValueData = lists;
          this.getSeasonValueArray = this.getSeasonValueData; 
        } else {
          this.getSeasonValueData = [];
          this.getSeasonValueArray = this.getSeasonValueData; 
        }

        console.log(this.getSeasonValueArray);

        this.loading = false;
        this.displayLoader = false; 
      
      });
     
    }
   
    
  async getAllSportsAPI(){
    
    let Metaurl='sports';
  
    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getSportsData = lists;
       this.getSportsArray = this.getSportsData;
       
      } catch (error) {
       
        console.log(error);
        this.getSportsArray = [];
        
      }
  
      console.log(this.getSportsArray);
      
    });
 
   } 
   
  
    listSeason(){
      this.router.navigate(['/season/list']);
    }
  
    addSeason(){
      this.router.navigate(['/season/createlist']);
    }
    
    viewSeason(resourceId: string){
      this.router.navigate(['/season/viewlist/'+resourceId]);
    }
    
    editSeason(resourceId: string){
      this.router.navigate(['/season/editlist/'+resourceId]);
    }
  
    async deleteSeason(resourceId: string, resourceName: string){
       
    }
   
   refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/season/list']);
  }
   
  }
  
  
  




