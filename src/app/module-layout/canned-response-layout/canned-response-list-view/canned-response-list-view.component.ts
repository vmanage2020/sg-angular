import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
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
  selector: 'app-canned-response-list-view',
  templateUrl: './canned-response-list-view.component.html',
  styleUrls: ['./canned-response-list-view.component.scss']
})
export class CannedResponseListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    db: any = firebase.firestore();
    value: any = [];
  
    
    getCannedResponseValue: any = [];
    getCannedResponseValueData: any = [];
    getCannedResponseValueArray: any = [];
  
    
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
      //this.getCannedResponseInfo();
      this.getCannedResponseInfoAPI();
      //this.getAllSports();
      this.getAllSportsAPI();
      this.loading = false;
      this.displayLoader = false;
    }

    async getCannedResponseInfo(){   
       
      this.getCannedResponseValue = await this.db.collection('CannedResponse').doc(this.resourceID).get();
      if (this.getCannedResponseValue.exists) {
        this.getCannedResponseValueData = await this.getCannedResponseValue.data();
      } else {
        this.getCannedResponseValueData = [];
      }
    
      this.getCannedResponseValueArray = this.getCannedResponseValueData; 
      console.log(this.getCannedResponseValueArray);

      //this.getAllPositionBySport(this.getPositionValueData.sport_id, this.uid)
    
      this.loading = false;
      this.displayLoader = false; 
        
    }
    
    async getCannedResponseInfoAPI(){
             
      let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/cannedresponse/'+this.resourceID;
      //let Metaurl = this.baseAPIUrl+'cannedresponse/'+this.resourceID;

      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getCannedResponseValueData = lists;
          this.getCannedResponseValueArray = this.getCannedResponseValueData; 
        } else {
          this.getCannedResponseValueData = [];
          this.getCannedResponseValueArray = this.getCannedResponseValueData; 
        }

        console.log(this.getCannedResponseValueArray);

        this.loading = false;
        this.displayLoader = false; 
      
      });

      
    }

    async getAllSports(){    
      
      //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
      this.getSports = await this.db.collection('/organization').doc(this.orgId).collection('/sports').orderBy('sport_id').get();
      this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
      this.getSportsArray = this.getSportsData; 
      console.log(this.getSportsArray);
  
    }
    
    async getAllSportsAPI(){
      
      let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/sports';
      //let Metaurl = this.baseAPIUrl+'sports';
  
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
  
   
  listCannedResponses(){
    this.router.navigate(['/cannedresponse/list']);
  }

  addCannedResponses(){
    this.router.navigate(['/cannedresponse/createlist']);
  }
  
  viewCannedResponses(resourceId: string){
    this.router.navigate(['/cannedresponse/viewlist/'+resourceId]);
  }
  
  editCannedResponses(resourceId: string){
    this.router.navigate(['/cannedresponse/editlist/'+resourceId]);
  }

  async deleteCannedResponses(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'CannedResponse Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          await this.db.collection('CannedResponse').doc(resourceId).delete();
          this.notification.isNotification(true, "CannedResponse Data", "CannedResponse Data has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "CannedResponse Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/cannedresponse/list']);
}

   
  }
  
  
  



