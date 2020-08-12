import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllTeams: any = [];
  getAllTeamsData: any = [];
  public getAllTagsData:any= [
    {
        "tag_id": 1,
        "col_code_fk": 5,
        "team_name": "A",
        "level": 0,
        "players": "indian",
        "coaches": "India",
        "managers": "venkat",
        "season": "USR",
        "sport": "USR",
        "create_date": "2014-02-08 06:13:55",
        "edit_by": 0,
        "edit_date": "0000-00-00 00:00:00"
    }
]

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
    
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
    this.getTeams();  
  }

  async getTeams(){
    console.log(this.orgId);
    if(this.orgId=='') {
      this.getAllTeams = await this.db.collection('/teams').orderBy('sport_id').get();
    } else {
      this.getAllTeams = await this.db.collection('/teams').where('organization_id', '==', this.orgId).get();
    }

    this.getAllTeamsData = await this.getAllTeams.docs.map((doc: any) => doc.data());
    this.data = this.getAllTeamsData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
    console.log(this.data);

  }
 
  listTag(){
    this.router.navigate(['/teams/list']);
  }

  addTag(){
    this.router.navigate(['/teams/listcreate']);
  }
  
  viewTag(resourceId: string){
    this.router.navigate(['/teams/listview/'+resourceId]);
  }
  
  editTag(resourceId: string){
    this.router.navigate(['/teams/listedit/'+resourceId]);
  }

  async deleteTag(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Tags Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          await this.db.collection('Tags').doc(resourceId).delete();
          this.notification.isNotification(true, "Tags Data", "Tags Data has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Tags Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/tags/list']);
}

}


