import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

@Component({
  selector: 'app-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.scss']
})
export class LevelListComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllLevel: any = [];
  getAllLevelData: any = [];

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
    this.getLevel();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getLevel(){
    console.log(this.orgId);
    if(this.orgId=='') {
      this.getAllLevel = await this.db.collection('levels').orderBy('sport_id').get();
    } else {
      this.getAllLevel = await this.db.collection('levels').where('organization_id', '==', this.orgId).get();
    }

    //this.getAllLevel = await this.db.collection('levels').orderBy('sport_id').get();

    this.getAllLevelData = await this.getAllLevel.docs.map((doc: any) => doc.data());
    this.data = this.getAllLevelData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
    console.log(this.data);

  }
 
  listLevel(){
    this.router.navigate(['/level/list']);
  }

  addLevel(){
    this.router.navigate(['/level/createlist']);
  }
  
  viewLevel(resourceId: string){
    this.router.navigate(['/level/viewlist/'+resourceId]);
  }
  
  editLevel(resourceId: string){
    this.router.navigate(['/level/editlist/'+resourceId]);
  }

  async deleteLevel(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Level Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          await this.db.collection('levels').doc(resourceId).delete();
          this.notification.isNotification(true, "Level Data", "Level Data has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Level Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/level/list']);
}

}

