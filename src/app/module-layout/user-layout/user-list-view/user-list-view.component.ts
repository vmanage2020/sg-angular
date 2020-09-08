import { Component, OnInit } from '@angular/core';

import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { CookieService } from 'src/app/core/services/cookie.service';

import * as moment from 'moment';

import { TitleCasePipe } from '@angular/common';

import { UserService } from '../user-service'
import { RestApiService } from '../../../shared/rest-api.services';

@Component({
  selector: 'app-user-list-view',
  templateUrl: './user-list-view.component.html',
  styleUrls: ['./user-list-view.component.scss']
})
export class UserListViewComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];

  getAllPlayermeta: any = []; 
  getAllPlayermetaData: any = [];

  getUser: any = [];
  getUserData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  resourceID = this.route.snapshot.paramMap.get('resourceId'); 

  loading = true;
  displayLoader: any = true;

  
  uid: any;
  orgId: any;
  selectedRoles: any = [];
  
  constructor(private router: Router, 
    private route: ActivatedRoute,
    public cookieService: CookieService,
     private titlecasePipe: TitleCasePipe,
     private restApiService: RestApiService,
     private userService: UserService
     ) { }
  
  ngOnInit() { 
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getUserInfo();  
    console.log(this.resourceID);

    
  }


  async getUserInfo(){

    /*
    if(this.orgId=='') {
      this.getAllplayerlist = await this.db.collection('users').get();
    } else {
      console.log("orgId"+this.orgId);
      
      //this.getAllplayerlist = await this.db.collection('users').where('organization_id', '==', this.orgId).get();

      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/users')
                            .where('isUserDuplicated', '==', false).get();
    }
    */

    //this.getUser = await this.db.collection('users').doc(this.resourceID).get();

    //this.getUser = await this.db.collection('users').doc(this.resourceID).collection('roles_by_season').where('hasRoleEnabled','==',true).where('is_suspended','==',false).where('is_terminated','==',false).get();

   /*  this.getUser = await this.db.collection('users').doc(this.resourceID).get();

    if (this.getUser.exists) {
      
      this.getRoles();
      this.getPlayers();
      this.getGuardians();

      this.getUserData = this.getUser.data();
    } else {
      this.getUserData = [];
    } */

    this.restApiService.lists('users/'+this.resourceID).subscribe( users =>{
      console.log('----users----', users)

      //this.getRoles();
      //this.getPlayers();
      //this.getGuardians();

      this.getUserData =  users;
    }, error => {
      console.log('---error Api----')
    })
    
    if (this.getUserData.date_of_birth) {
      if(typeof(this.getUserData.date_of_birth) !== "string"){
        this.getUserData.date_of_birth = moment(this.getUserData.date_of_birth.toDate()).format('MM-DD-YYYY').toString();
      }else{
        this.getUserData.date_of_birth = moment(this.getUserData.date_of_birth).format('MM-DD-YYYY').toString();
      }
      // this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
    }

    console.log(this.getUserData);

    this.loading = false;
    this.displayLoader = false; 
  }

  async getRoles() {

    console.log('ROLEEEEEEEEE');

    if(this.resourceID) {
    //userInfo.roles_by_seasons = [];
    //Role By Season Info
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

    if (roles_by_seasons) {
      this.getUserData.roles = roles_by_seasons.join(', ')
    } else {
      this.getUserData.roles = '';
    }

    console.log(roles_by_seasons);            
    }

  }

  async getPlayers() {

    if(this.resourceID) {

      let playerInfo = await this.db.collection('/users').where('parent_user_id', 'array-contains', this.resourceID).get()
      let playersList: any = playerInfo.docs.map(doc => doc.data());
      console.log(playersList);
      this.getUserData.players = playersList;

    } else {

      this.getUserData.players = '';

    }
    /*
    try {
      let getUsersResponse = await this.userService.getPalyersById({ 'uid': uid });
      if (getUsersResponse.status) {
        if (getUsersResponse.data) {
          getUsersResponse.data.forEach(element => {
            if (element !== null) {
              this.playerInfo.push(element.first_name + " " + element.last_name)
            }
          });
        }
      }

      if (this.playerInfo) {
        this.player = this.playerInfo.join(', ')
      } else {
        this.player = '';
      }
    } catch (error) {
      console.log(error)
    }
  */  

  }
  async getGuardians() {

    if(this.getUserData.parent_user_id) {

      let guardianInfo = await this.db.collection('/users').where('user_id', 'in', this.getUserData.parent_user_id).get();
      let guardiansList: any = guardianInfo.docs.map(doc => doc.data());
      console.log(guardiansList);
      this.getUserData.guardian = guardiansList;

    } else {

      this.getUserData.guardian = '';

    }
      
    /*
    try {
      let getGuardiansRes = await this.userService.getGuardianById({ 'uid': uid });
      if (getGuardiansRes.status) {
        if (getGuardiansRes.data) {
          getGuardiansRes.data.forEach(element => {
            if (element !== null) {
              this.guardianInfo.push(element.first_name + " " + element.last_name)
            }
          });
        }
      }
      if (this.guardianInfo) {
        this.guardian = this.guardianInfo.join(', ')
      } else {
        this.guardian = '';
      }
    } catch (error) {
      console.log(error.message);

    }
    */
  }


  
listUser(){
  this.router.navigate(['/users/list']);
}

addUser(){
  this.router.navigate(['/users/createlist']);
}

viewUser(resourceId: string){
  this.router.navigate(['/users/viewlist/'+resourceId]);
}

editUser(resourceId: string){
  console.log('/users/editlist/'+resourceId);
  this.router.navigate(['/users/editlist/'+resourceId]);
}

deleteUser(resourceId: string){
  this.router.navigate(['/users/deletelist/'+resourceId]);
}

}
