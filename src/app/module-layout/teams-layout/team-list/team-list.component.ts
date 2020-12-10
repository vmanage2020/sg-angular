import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

//import { TagCrudService } from '../tag-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  //db: any = firebase.firestore();
  value: any = [];
  getAllTeams: any = [];
  getAllTeamsData: any = [];
  

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
     public cookieService: CookieService, 
     private restApiService: RestApiService, 
     private http:HttpClient,
      private logger: NGXLogger) { }

  ngOnInit() { 
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getTeams();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    };     
  }

  async getTeams(){
    console.log(this.orgId);


  await this.restApiService.lists('teams').subscribe( res =>{
      this.getAllTeamsData = res;
      console.log("==getAllTeamsData==",this.getAllTeamsData);
      this.data = res;
      this.dtTrigger.next();
      this.loading = false;
      this.displayLoader = false;  
    }, e=>{
      console.log('----API error for team list----', e)
    })

    /*
    
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
    
    */


  }
 
  listTeam(){
    this.router.navigate(['/teams/list']);
  }

  addTeam(){
    this.router.navigate(['/teams/listcreate']);
  }
  
  viewTeam(resourceId: string){
    this.router.navigate(['/teams/listview/'+resourceId]);
  }
  
  editTeam(resourceId: string){
    this.router.navigate(['/teams/listedit/'+resourceId]);
  }

  async deleteTag(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Tags Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          //await this.db.collection('Tags').doc(resourceId).delete();
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


  deleteTeam( id, name)
  {
    var result = confirm("Want to delete?");
    if(result) {
      console.log(id+' '+name)

      this.restApiService.remove( 'teams/'+id ).subscribe( res => {
        console.log('---res---', res)
        this.notification.isNotification(true, "Tags Data", "Tags Data has been deleted successfully.", "check-square");
        this.refreshPage();
      }, e => {

      })
    }else{
      console.log('---no---')
    }
    
  } 
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/teams/list']);
}

}


