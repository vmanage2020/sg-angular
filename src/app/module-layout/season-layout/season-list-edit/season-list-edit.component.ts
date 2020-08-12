import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';


import { NgiNotificationService } from 'ngi-notification';

import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-season-list-edit',
  templateUrl: './season-list-edit.component.html',
  styleUrls: ['./season-list-edit.component.scss']
})
export class SeasonListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    db: any = firebase.firestore();
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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService,private datePipe: DatePipe) { 
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
      this.getSeasonInfo();
      this.getAllSports();
      //this.loading = false;
      //this.displayLoader = false;
    }

    sdate:any;
    edate:any;

    async getSeasonInfo(){   
       
      this.getSeasonValue = await this.db.collection('seasons').doc(this.resourceID).get();
      if (this.getSeasonValue.exists) {
        this.getSeasonValueData = await this.getSeasonValue.data();
      } else {
        this.getSeasonValueData = [];
      }
    
      this.getSeasonValueArray = this.getSeasonValueData; 
      //console.log(this.getSeasonValueArray);
      
      //console.log(this.getSeasonValueArray.season_start_date);
      console.log(this.getSeasonValueArray.season_start_date.toDate());
      console.log(new Date(this.getSeasonValueArray.season_start_date.toDate()));


      this.sdate = this.datePipe.transform(this.getSeasonValueArray.season_start_date.toDate(), 'MM/dd/yyyy');
      this.edate = this.datePipe.transform(this.getSeasonValueArray.season_end_date.toDate(), 'MM/dd/yyyy');
      
       
      //this.getAllPositionBySport(this.getPositionValueData.sport_id, this.uid)
    
      this.loading = false;
      this.displayLoader = false; 
        
    }
   

    async getAllSports(){    
      
      //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
      this.getSports = await this.db.collection('/organization').doc(this.orgId).collection('/sports').orderBy('sport_id').get();
      this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
      this.getSportsArray = this.getSportsData; 
      console.log(this.getSportsArray);
  
    }
  
     
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
      
        await this.db.collection('seasons').doc(this.resourceID).update(insertObj);
        
        this.router.navigate(['/season/list']);
  
        this.notification.isNotification(true, "Season Data", "Season has been updated successfully.", "check-square");
        
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
      
      try {
        this.notification.isConfirmation('', '', 'Seasons Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
          if (dataIndex[0]) {
            console.log("yes");
            await this.db.collection('seasons').doc(resourceId).delete();
            this.notification.isNotification(true, "Seasons Data", "Seasons Data has been deleted successfully.", "check-square");
            this.refreshPage();
          } else {
            console.log("no");
          }
        }, (err) => {
          console.log(err);
        })
      } catch (error) {
        console.log(error);
        this.notification.isNotification(true, "Seasons Data", "Unable to delete.Please try again later.", "times-circle");
      }
    }
   
   refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/season/list']);
  }

}


