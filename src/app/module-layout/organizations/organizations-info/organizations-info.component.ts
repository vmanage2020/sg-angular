import { Component, OnInit } from '@angular/core';

import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { CookieService } from 'src/app/core/services/cookie.service';

import * as moment from 'moment';

import { TitleCasePipe } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { OrganizationsService } from './../organizations.service';


@Component({
  selector: 'app-organizations-info',
  templateUrl: './organizations-info.component.html',
  styleUrls: ['./organizations-info.component.scss']
})
export class OrganizationsInfoComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];

  getAllPlayermeta: any = []; 
  getAllPlayermetaData: any = [];

  getUser: any = [];
  getUserData: any = [];
  sportsRef: any = [];
  sportsRefData: any = [];
  sportList:any;
  
  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  //resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  resourceID = localStorage.getItem('org_id');

  loading = true;
  displayLoader: any = true;

  
  uid: any;
  orgId: any;
  selectedRoles: any = [];
  sportsName: any[]  = [];
  
  constructor(private router: Router, 
    private route: ActivatedRoute,
    public cookieService: CookieService,
    private restApiService: RestApiService, 
    private organizationsService: OrganizationsService,
    private titlecasePipe: TitleCasePipe,) { }

  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getSports();
    setTimeout(() => {
      this.getOrganizationInfo();  
    }, 3000);
    
    
    console.log(this.resourceID);

  }

  async getSports()
  {
    if(this.organizationsService.dataStore.sports.length>0)
    {
      this.sportList = this.organizationsService.dataStore.sports;

      
    }else{
      setTimeout(() => {
        this.getSports()
      }, 1000);
    }
  }


  async getOrganizationInfo(){

    /*
    
    try {
      let getOrganizationById: any = await this.adminref.collection('/organization').doc(organizationObj.organization_id).get();
      if (getOrganizationById.exists) {
        const organizationDetail: any = getOrganizationById.data();
        const sportsRef = await this.adminref.collection('/organization').doc(organizationObj.organization_id).collection('/sports').where('isDeleted', '==', false).get();
        return { 'status': true, 'message': 'Organization List info', 'data': organizationDetail }
      } else {
        return { 'status': false, 'message': 'No data available.' }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }

    */
        //this.getRoles();
        //this.getPlayers();
        //this.getGuardians();
  
        /*
        let roles_by_seasons = [];
      let roleBySeasonInfo = await this.db.collection('/users').doc(this.resourceID).collection('roles_by_season').get();
      let rolesList: any =  await roleBySeasonInfo.docs.map((doc: any) => doc.data());
      
      if (rolesList) {
        rolesList.forEach(element => {
          if (element !== null) {
            roles_by_seasons.push(this.titlecasePipe.transform(element.role))
          }
        });
      }
        */

       this.restApiService.lists('organization/'+this.resourceID).subscribe( res => {
        console.log('----res----', res)
        this.getUserData = res;
  
        console.log('---this.sportList----', this.sportList)
        if( this.sportList.length >0)
        {
          this.sportList.forEach( sp => {
            if(res.sports.indexOf(sp._id) !== -1){
              this.sportsName.push(sp.name)
            }
          })
        }
        console.log('----this.sportsName----', this.sportsName)
      /* if (this.getUser.exists) {
   
        this.getUserData = this.getUser.data();
  
        
      console.log(this.getUserData.avatar);
      if (this.getUserData.avatar==null) {
        this.getUserData.avatarstatus==1;
        console.log("getUserData.avatarstatus=1");
      } else {
        this.getUserData.avatarstatus==2;
        console.log("getUserData.avatarstatus=2");
      }
  
        console.log(this.getUserData.avatarstatus);
        console.log(this.getUserData.nationalGoverningOrganizations);
  
        console.log(this.getUserData.stateGoverningOrganizations);
        
  
        this.sportsRef = await this.db.collection('/organization').doc(this.resourceID).collection('/sports').where('isDeleted', '==', false).get();
        this.sportsRefData =  await this.sportsRef.docs.map((doc: any) => doc.data());
  
        console.log(this.sportsRefData);
  
        if (this.sportsRefData) {  
          let sportsRefValue: any = [];
            this.sportsRefData.forEach(element => {
              if (element !== null) {
                sportsRefValue.push( element.name )
              }
            });
  
          this.getUserData.sportsRef = sportsRefValue;
        } else {
          this.getUserData.sportsRef = [];
        }
  
      } else {
        this.getUserData = [];
      } */

    })
    //this.getUser = await this.db.collection('/organization').doc(this.resourceID).get();

   
    

    /*
    if (this.getUserData.date_of_birth) {
      if(typeof(this.getUserData.date_of_birth) !== "string"){
        this.getUserData.date_of_birth = moment(this.getUserData.date_of_birth.toDate()).format('MM-DD-YYYY').toString();
      }else{
        this.getUserData.date_of_birth = moment(this.getUserData.date_of_birth).format('MM-DD-YYYY').toString();
      }
      // this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
    }
    */
   
    console.log(this.getUserData);

    this.loading = false;
    this.displayLoader = false; 
  }

  listOrganization(){
    this.router.navigate(['/organizations']);
  }

  addOrganization(){
    this.router.navigate(['/organizations/create']);
  }
  
  viewOrganization(resourceId: string){
    this.router.navigate(['/organizations/view/'+resourceId]);
  }
  
  editOrganization(resourceId: string){
    this.router.navigate(['/organizations/edit/'+resourceId]);
  }

  refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/organizations']);
  }

}
