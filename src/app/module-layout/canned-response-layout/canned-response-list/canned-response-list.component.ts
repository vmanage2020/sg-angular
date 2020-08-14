import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-canned-response-list',
  templateUrl: './canned-response-list.component.html',
  styleUrls: ['./canned-response-list.component.scss']
})
export class CannedResponseListComponent implements OnInit {


  db: any = firebase.firestore();
  value: any = [];
  getAllCannedResponse: any = [];
  getAllCannedResponseData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;

  constructor(private router: Router, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document,public cookieService: CookieService, private restApiService: RestApiService, private http:HttpClient) { }

  ngOnInit() { 

    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    //this.getCannedResponses();  
    this.getCannedResponsesAPI();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getCannedResponses(){
    console.log(this.orgId);
    if(this.orgId=='') {
      this.getAllCannedResponse = await this.db.collection('CannedResponse').orderBy('sport_id').get();
    } else {
      this.getAllCannedResponse = await this.db.collection('CannedResponse').where('organization_id', '==', this.orgId).get();
    }

    //this.getAllCannedResponse = await this.db.collection('CannedResponse').orderBy('sport_id').get();

    this.getAllCannedResponseData = await this.getAllCannedResponse.docs.map((doc: any) => doc.data());
    this.data = this.getAllCannedResponseData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
    console.log(this.data);

  }

  async getCannedResponsesAPI(){
    
    console.log(this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/cannedresponse';
      //let Metaurl = this.baseAPIUrl+'cannedresponse';
    } else {
      Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/cannedresponsebyorg/'+this.orgId;
      //let Metaurl = this.baseAPIUrl+'cannedresponsebyorg/'+this.orgId;
    }
    
    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getAllCannedResponseData = lists;
       this.data = this.getAllCannedResponseData;
       this.dtTrigger.next();
       this.loading = false;
       this.displayLoader = false;      
 
      } catch (error) {
       
        console.log(error);
        this.data = [];
        this.dtTrigger.next();
        this.loading = false;
        this.displayLoader = false;
        
      }
  
      console.log(this.data);
     
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
          /*
          await this.db.collection('CannedResponse').doc(resourceId).delete();
          this.notification.isNotification(true, "CannedResponse Data", "CannedResponse Data has been deleted successfully.", "check-square");
          this.refreshPage();
          */

          
         let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/cannedresponse/'+resourceId;
         //let Metaurl = this.baseAPIUrl+'cannedresponse/'+resourceId;

         this.restApiService.remove(Metaurl).subscribe(data=> 
           {                 
             console.log(data);
             this.notification.isNotification(true, "CannedResponse Data", "CannedResponse Data has been deleted successfully.", "check-square");
             this.refreshPage();
           },
           error => {
             console.log(error);    
           }
           );

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



