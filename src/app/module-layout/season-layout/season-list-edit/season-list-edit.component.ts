import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';


import { NgiNotificationService } from 'ngi-notification';

import { DatePipe } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-season-list-edit',
  templateUrl: './season-list-edit.component.html',
  styleUrls: ['./season-list-edit.component.scss']
})
export class SeasonListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    value: any = [];
  
    getSeasonValue: any = [];
    getSeasonValueData: any = [];
    getSeasonValueArray: any = [];
      
    getSports: any = [];
    getSportsData: any = [];
    getSportsArray: any = [];
      
    getSeasons: any = [];
    getSeasonsData: any = [];
    getSeasonsArray: any = [];
  
    country: any = [];
    countryCodeSelect: any = [];
    
    data: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
  
    uid: any;
    orgId: any;
    orgName: any;
    orgAbbrev: any;
    
    loading = true;
    displayLoader: any = true;
  
    submitted = false;
    createseasonForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService,private datePipe: DatePipe, private restApiService: RestApiService, private http:HttpClient) { 
       this.createForm(); 
    }
    
  createForm() {
    this.createseasonForm = this.formBuilder.group({
        season_name: ['', Validators.required ],
        season_start_date: ['', Validators.required ],
        season_end_date: ['', Validators.required ],
        sport_id: ['', Validators.required ],
        sport_name: [''],
        season: [''],
        organization_id: [''],
        organization_name: [''],
        organization_abbreviation: [''],
    });
  }
    
  
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.orgName = localStorage.getItem('org_name');
      this.orgAbbrev = localStorage.getItem('org_abbrev');
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
   
    sdate:any;
    edate:any;
 
     
    get f() { return this.createseasonForm.controls; }
  
    async onSubmit(form) {
      try {
        this.submitted = true;
        if (form.invalid) {
          return;
        }
        
      this.displayLoader = true;
      this.loading = true;
          
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.orgName = localStorage.getItem('org_name');
      this.orgAbbrev = localStorage.getItem('org_abbrev');
      
      for(let sports of this.getSportsArray){
        if(form.value.sport_id==sports.sport_id)
          {
            form.value.sport_name = sports.name;
          }      
      }
    
      
    let insertObj = {
      "season_name": form.value.season_name,
      "season": form.value.season_name,
      "season_start_date": new Date(form.value.season_start_date),
      "season_end_date": new Date(form.value.season_end_date),
      "sports_id": form.value.sport_id,
      "sports_name": form.value.sport_name,
      "isUsed": false,
      "organization_id": this.orgId,
      "organization_name": this.orgName,
      "organization_abbreviation": this.orgAbbrev,
      "created_datetime": new Date(),
      "created_uid": this.uid,
      "updated_datetime": new Date(),
      "updated_uid": "",
      "sort_order": 0,
    }
       
    let Metaurl='seasons/'+this.resourceID;
       
    this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
      {
            
        console.log(data);
        this.router.navigate(['/season/list']);
        this.notification.isNotification(true, "Season Data", "Season has been updated successfully.", "check-square");
      
      },
      error => {
        console.log(error);    
      }
      );

        
      } catch (error) {
        
        console.log(error);
         
      }
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


