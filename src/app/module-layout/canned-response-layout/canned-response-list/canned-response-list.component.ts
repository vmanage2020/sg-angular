import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

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

  constructor(private router: Router, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document,public cookieService: CookieService) { }

  ngOnInit() { 

    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getTags();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getTags(){
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



