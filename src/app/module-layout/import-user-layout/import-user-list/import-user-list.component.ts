import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { ImportLogService } from '../importLog-service';
@Component({
  selector: 'app-import-user-list',
  templateUrl: './import-user-list.component.html',
  styleUrls: ['./import-user-list.component.scss']
})
export class ImportUserListComponent implements OnInit {

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

  constructor(private router: Router, 
    private notification: NgiNotificationService,
     @Inject(DOCUMENT) private _document: Document,
     private importLogService: ImportLogService,
     public cookieService: CookieService) { }

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
    
    if(this.orgId !='') {
      if(this.importLogService.dataStore.userlogs.length >0)
      {
        console.log('---logs----', this.importLogService.dataStore.userlogs)
      
        this.data = this.importLogService.dataStore.userlogs;
        this.dtTrigger.next();
        this.loading = false;
        this.displayLoader = false;

      }else{
        setTimeout(() => {
          this.getLevel();
        }, 1000);
      }

    }
    

    /* if(this.orgId=='') {
      
      //this.getAllLevel = await this.db.collection('levels').orderBy('sport_id').get();

      this.getAllLevel = await this.db.collection('/organization').collection('/import_users_log').get();              

    } else {

      //this.getAllLevel = await this.db.collection('levels').where('organization_id', '==', this.orgId).get();
      
      this.getAllLevel = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').get();              
    }

    //this.getAllLevel = await this.db.collection('levels').orderBy('sport_id').get();

    this.getAllLevelData = await this.getAllLevel.docs.map((doc: any) => doc.data());
    this.data = this.getAllLevelData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false;  */
 
    console.log(this.data);

  }
 
  listUser(){
    this.router.navigate(['/useruploads/list']);
  }

  addUser(){
    this.router.navigate(['/useruploads/createlist']);
  }
  
  viewUser(resourceId: string){
    this.router.navigate(['/useruploads/viewlist/'+resourceId]);
  }
  
  editUser(resourceId: string){
    this.router.navigate(['/useruploads/editlist/'+resourceId]);
  }

  async deleteUser(resourceId: string, resourceName: string){
    
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


  viewUserList(resourceId: string, type: any){
    localStorage.setItem('viewUserListType',type);
    this.router.navigate(['/useruploads/userlist/'+resourceId]);
  }

}


