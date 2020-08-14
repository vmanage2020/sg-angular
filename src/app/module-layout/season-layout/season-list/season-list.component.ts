import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

@Component({
  selector: 'app-season-list',
  templateUrl: './season-list.component.html',
  styleUrls: ['./season-list.component.scss']
})
export class SeasonListComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllSeasons: any = [];
  getAllSeasonsData: any = [];

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
    this.getSeasons();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getSeasons(){
    console.log(this.orgId);
    if(this.orgId=='') {
      this.getAllSeasons = await this.db.collection('seasons').orderBy('sports_id').get();
    } else {
      this.getAllSeasons = await this.db.collection('seasons').where('organization_id', '==', this.orgId).get();
    }

    //this.getAllLevel = await this.db.collection('levels').orderBy('sport_id').get();

    this.getAllSeasonsData = await this.getAllSeasons.docs.map((doc: any) => doc.data());
    this.data = this.getAllSeasonsData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
    console.log(this.data);

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



