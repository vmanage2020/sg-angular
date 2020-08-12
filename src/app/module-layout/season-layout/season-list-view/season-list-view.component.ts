import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';


import { NgiNotificationService } from 'ngi-notification';



@Component({
  selector: 'app-season-list-view',
  templateUrl: './season-list-view.component.html',
  styleUrls: ['./season-list-view.component.scss']
})
export class SeasonListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    db: any = firebase.firestore();
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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService) { 
    }
    
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getSeasonInfo();
      this.getAllSports();
      //this.loading = false;
      //this.displayLoader = false;
    }

    async getSeasonInfo(){   
       
      this.getSeasonValue = await this.db.collection('seasons').doc(this.resourceID).get();
      if (this.getSeasonValue.exists) {
        this.getSeasonValueData = await this.getSeasonValue.data();
      } else {
        this.getSeasonValueData = [];
      }
    
      this.getSeasonValueArray = this.getSeasonValueData; 
      console.log(this.getSeasonValueArray);

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
  
  
  




