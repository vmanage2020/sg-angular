import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

@Component({
  selector: 'app-import-user-list-user',
  templateUrl: './import-user-list-user.component.html',
  styleUrls: ['./import-user-list-user.component.scss']
})
export class ImportUserListUserComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 

  viewUserListType: any;

  db: any = firebase.firestore();
  value: any = [];
  getAllplayerlist: any = [];
  getAllPlayerlistData: any = [];

  data: any;
  datax: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;

  constructor(private router: Router, private route: ActivatedRoute, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document,public cookieService: CookieService) { }

  ngOnInit() {
    
    this.viewUserListType = localStorage.getItem('viewUserListType');

    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getUserList();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getUserList(){

    /*
    //this.getAllplayerlist = await this.db.collection('users').orderBy('sport_id').get();
    if(this.orgId=='') {
      this.getAllplayerlist = await this.db.collection('users').get();
    } else {
      console.log("orgId"+this.orgId);
      
      //this.getAllplayerlist = await this.db.collection('users').where('organization_id', '==', this.orgId).get();

      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/users')
                            .where('isUserDuplicated', '==', false).get();
    }
    */

  /*  
   if (validateData.filterType === "All") {
    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data');
} else if (validateData.filterType === "Error") {
    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data').where('processed_flag', 'in', ['e', 'E']);
} else if (validateData.filterType === "UnProcessed") {
    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data').where('processed_flag', 'in', ['n', 'N'])
} else if (validateData.filterType === "Success") {
    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data').where('processed_flag', 'in', ['y', 'Y'])
} else {
    return { "status": false, "error": "invalid request" };
}
if (validateData.searchKey && validateData.searchVal) {
    logData = await logData.where(validateData.searchKey, 'array-contains', validateData.searchVal);
}
  */

/*
 logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
 .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data');
*/

    this.viewUserListType = localStorage.getItem('viewUserListType');

    localStorage.setItem('resourceID',this.resourceID);
    
    if(this.viewUserListType==1) {

      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').doc(this.resourceID).collection('/imported_users_data').get();

    } else if(this.viewUserListType==2) {

      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').doc(this.resourceID).collection('/imported_users_data').where('processed_flag', 'in', ['y', 'Y']).get();

    } else if(this.viewUserListType==3) {
      
      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').doc(this.resourceID).collection('/imported_users_data').where('processed_flag', 'in', ['e', 'E']).get();

    }
    

    this.getAllPlayerlistData = await this.getAllplayerlist.docs.map((doc: any) => doc.data());
    console.log(this.getAllPlayerlistData);
    this.data = this.getAllPlayerlistData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
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

  refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/useruploads/list']);
  }
 
  injectedData: any;
  
  editUserRecord(data) {
    /*
    data.imported_file_id = this.injectedData.data.imported_file_id
    data.user_id = this.uid;
    if (this.injectedData.data.sports_id) {
      data.sport_id = this.injectedData.data.sports_id;
      data.sportName = this.injectedData.data.sports_name;
    }
    else {
      data.sport_id = this.injectedData.data.sport_id;
      data.sportName = this.injectedData.data.sport_name;
    }
    data.organization_id = this.injectedData.data.organization_id
    data.selectedSeason = this.injectedData.data.selectedSeason
    data.seasonType = this.injectedData.data.seasonType
    data.pageSize = this.injectedData.data.pageSize;
    data.pageNo = this.injectedData.data.pageNo;
    this.change.emit({ action: "UpdateUserImport", data: data })
    */
   this.router.navigate(['/useruploads/editlist/'+data]);
  }

}

