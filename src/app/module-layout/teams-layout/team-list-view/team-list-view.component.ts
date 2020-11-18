import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { ActivatedRoute } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

//import { TagCrudService } from '../tag-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-team-list-view',
  templateUrl: './team-list-view.component.html',
  styleUrls: ['./team-list-view.component.scss']
})
export class TeamListViewComponent implements OnInit {

  //db: any = firebase.firestore();
  value: any = [];
  getAllTeams: any = [];
  getAllTeamsData: any = [];

  teamData:any=[];
  change:any=[];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  resourceID = this.route.snapshot.paramMap.get('resourceId'); 

  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;


  playerMetaList: any[] = [];
  coachMetaList: any[] = [];
  managerMetaList: any[] = [];

  constructor(private router: Router, 
    private route: ActivatedRoute,
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

  memberData:any=[];

  async getTeams(){
    console.log(this.orgId);
 
      await this.restApiService.lists('teams/'+this.resourceID).subscribe( teamdata =>{

          this.getMetaData('player',teamdata.sport_id,this.orgId);
          this.getMetaData('coach',teamdata.sport_id,this.orgId);
          this.getMetaData('manager',teamdata.sport_id,this.orgId);

        this.restApiService.lists('teammembers/'+this.resourceID).subscribe( memberdata =>{

          this.teamData = {'team': teamdata, 'member': memberdata};
          this.memberData = memberdata;
          
          this.loading = false;
          this.displayLoader = false;

        });        
      }, e=>{
        console.log('----API error for team list----', e)
      });
      console.log('---id---', this.resourceID);  
    
  }

  
  getMetaData( type, sports, orgid)
  {

    if( type == 'player')
    {
      var url = 'playermetadatabysportsorg/'+orgid+'/'+sports
    }
    else if( type == 'coach')
    {
      var url = 'coachmetadatabysportsorg/'+orgid+'/'+sports
    }
    else if( type == 'manager')
    {
      var url = 'managermetadatabysportsorg/'+orgid+'/'+sports
    }
    this.restApiService.lists(url).subscribe( res => {
      if( type == 'player')
      {
        //this.playerMetaList = res;
        res.forEach( play => {
          this.playerMetaList.push({
            "ID": play._id,
            "Key": play.field_name.replace(/ +/g, "").toLowerCase(),
            "Name": play.field_name,
            "Type": play.field_type,
            "Value": play.value
            })
        })
        
      }
      else if( type == 'coach')
      {
        //this.coachMetaList = res;
        res.forEach( play => {
          this.coachMetaList.push({
            "ID": play._id,
            "Key": play.field_name.replace(/ +/g, "").toLowerCase(),
            "Name": play.field_name,
            "Type": play.field_type,
            "Value": play.value
            })
        })
      }
      else if( type == 'manager')
      {
        //this.managerMetaList = res;
        res.forEach( play => {
          this.managerMetaList.push({
            "ID": play._id,
            "Key": play.field_name.replace(/ +/g, "").toLowerCase(),
            "Name": play.field_name,
            "Type": play.field_type,
            "Value": play.value
            })
        })
      }
      
      
    }, e => {
      console.log('---Level API error----', e)
    })
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
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/teams/list']);
}

}