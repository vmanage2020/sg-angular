import { Component, OnInit } from '@angular/core';

import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { CookieService } from 'src/app/core/services/cookie.service';

import * as moment from 'moment';

import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-organizations-view',
  templateUrl: './organizations-view.component.html',
  styleUrls: ['./organizations-view.component.scss']
})
export class OrganizationsViewComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];

  getAllPlayermeta: any = []; 
  getAllPlayermetaData: any = [];

  getUser: any = [];
  getUserData: any = [];
  sportsRef: any = [];
  sportsRefData: any = [];
  
  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  resourceID = this.route.snapshot.paramMap.get('resourceId'); 

  loading = true;
  displayLoader: any = true;

  
  uid: any;
  orgId: any;
  selectedRoles: any = [];
  
  
  constructor(private router: Router, private route: ActivatedRoute,public cookieService: CookieService, private titlecasePipe: TitleCasePipe,) { }
  

  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getOrganizationInfo();  
    console.log(this.resourceID);

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
   

    this.getUser = await this.db.collection('/organization').doc(this.resourceID).get();

    if (this.getUser.exists) {
   
      

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
    }
    

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
