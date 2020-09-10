import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { apiURL, Constant } from '../../../core/services/config';

import { NgiNotificationService } from 'ngi-notification';

import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

import { UserService } from '../user-service'
import { RestApiService } from '../../../shared/rest-api.services';

@Component({
  selector: 'app-user-list-edit',
  templateUrl: './user-list-edit.component.html',
  styleUrls: ['./user-list-edit.component.scss']
})
export class UserListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 

  db: any = firebase.firestore();
  value: any = [];

  getUserSuffixData: any = [];
  
  getUserRoleData: any = [];
  getUserRoleDataArray: any = [];
  roleList: any = [];

  rolesArrayList: any = [];

  getUserSuffixDataArray: any = [
    { name: 'Sr' },
    { name: 'Jr' },
    { name: 'II' },
    { name: 'III' },
    { name: 'IV' },
    { name: 'V' },
  ];

  emailVaildation = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  
  loading = true;
  displayLoader: any = true;
 
  submitted = false;
  createuserForm: FormGroup;

  uid: any;
  orgId: any;
  
  organization_id: any;
  organization_name: any;
  organization_abbrev: any;


  role: any;

  roleListToPatch: any = [];
  //createUserForm: any[];
  roles: any = [];

  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    private notification: NgiNotificationService,
    private restApiService: RestApiService,
    private userService:UserService, 
    public cookieService: CookieService) { 
    this.createForm(); 
 }

createForm() {
  this.createuserForm = this.formBuilder.group({
   uid: [''],
   first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
   middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3),]],
   last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
   email: ['', [Validators.required, Validators.pattern(this.emailVaildation)]],
   date_of_birth: [''],
   suffix: [null],
   roles: [''],
   organization_id: [''],
   organization_name: [''],
   organization_abbrev: [''],
   mobile_phone: [''],
   city: [''],
   country_code: [''],
   postal_code: [''],
   state: [''],
   street2: [''],
   street1: [''],
  });
}


  ngOnInit() {
    
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getUserRoles();
    this.getUserSuffix();
    this.getUserInfo();  
    console.log(this.resourceID);
    
    this.loading = false;
    this.displayLoader = false;
  }

  getUser: any;
  getUserData: any;

  async getUserInfo(){

   
    /* this.getUser = await this.db.collection('users').doc(this.resourceID).get();

    if (this.getUser.exists) {
      
      this.getRoles();
      //this.getPlayers();
      //this.getGuardians();

      this.getUserData = this.getUser.data();
    } else {
      this.getUserData = [];
    } */

    this.restApiService.lists('users/'+this.resourceID).subscribe( users => {
      
      console.log('---users----', users)
      
      users.roles.forEach( rr => { 
        this.rolesArrayList.push(rr.role_id)
      })
      //this.rolesArrayList = users.roles;

      this.getUserData =  users;
      this.createuserForm.patchValue({
        first_name: users.first_name,
        middle_initial: users.middle_initial,
        last_name: users.last_name,
        suffix: users.suffix,
        email: users.email_address
      })
    }, error => {
      console.log('---error API response----')
    })
    
    /* if ( this.getUserData.date_of_birth != undefined && this.getUserData.date_of_birth !='') {
      if(typeof(this.getUserData.date_of_birth) !== "string"){
        this.getUserData.date_of_birth = moment(this.getUserData.date_of_birth.toDate()).format('MM-DD-YYYY').toString();
      }else{
        this.getUserData.date_of_birth = moment(this.getUserData.date_of_birth).format('MM-DD-YYYY').toString();
      }
      
    } */

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
    let rolesListData: any =  await roleBySeasonInfo.docs.map((doc: any) => doc.data());
    
    if (rolesListData) {
      rolesListData.forEach(element => {
        if (element !== null) {
          roles_by_seasons.push(element.role)
        }
      });
    }

    if (roles_by_seasons) {
      
      //this.getUserData.roles = roles_by_seasons.join(', ');

      this.getUserData.roles = roles_by_seasons;

      this.rolesArrayList = roles_by_seasons;
    } else {
      this.getUserData.roles = '';
    }

    console.log(this.rolesArrayList);    
    
    this.roles = this.rolesArrayList;
    
    console.log("STARTA");    
    console.log(this.roles);
    console.log("ENDA");


    }

  }

  isChecked(rolevalue){
    console.log("ISCHECKED FUNCTION "+rolevalue);
    return true;
  }


  /*
  roleListUser: any[];  

  async getUserRoles(){
    
    this.getUserRoleData = await this.db.collection('roles').orderBy('role_id').get();
    this.roleList = await this.getUserRoleData.docs.map((doc: any) => doc.data()); 
    this.role = JSON.parse(localStorage.getItem('roleList'));
    let roleListArr = this.role.map(userroles => {
      if (userroles.role) {
        return userroles.role.toLowerCase();
      }
    });

    this.roleList = this.roleList.filter(order => order.role_id !== "player" && order.role_id !== "guardian")
        if (roleListArr.includes(Constant.admin)) {
          this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
        }
        if (roleListArr.includes(Constant.sysAdmin)) {
          if (localStorage.getItem('org_id') === Constant.organization_id) {
            this.roleList = this.roleList.filter(order => order.role_id === "sys-admin");
          }
          else {
            this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
          }
        }

    console.log(this.roleList);

         
  }
  */

  
 async getUserRoles(){
    
  if(this.userService.roledataStore.roles.length > 0)
    {
      this.roleList = this.userService.roledataStore.roles;
      this.role = JSON.parse(localStorage.getItem('roleList'));
      let roleListArr = this.role.map(roles => {
        if (roles.role) {
          return roles.role.toLowerCase(); 
        }
      });

      this.roleList = this.roleList.filter(order => order.role_id !== "player" && order.role_id !== "guardian")
          if (roleListArr.includes(Constant.admin)) {
            this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
          }
          if (roleListArr.includes(Constant.sysAdmin)) {
            if (localStorage.getItem('org_id') === Constant.organization_id) {
              this.roleList = this.roleList.filter(order => order.role_id === "sys-admin");
            }
            else {
              this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
            }
          }

      console.log(this.roleList);

    }else{
      setTimeout(() => {
          this.getUserRoles();
      }, 1000);
    }

  /* this.getUserRoleData = await this.db.collection('roles').orderBy('role_id').get();
  this.roleList = await this.getUserRoleData.docs.map((doc: any) => doc.data());
  this.role = JSON.parse(localStorage.getItem('roleList'));
  let roleListArr = this.role.map(roles => {
    if (roles.role) {
      return roles.role.toLowerCase(); 
    }
  });

  this.roleList = this.roleList.filter(order => order.role_id !== "player" && order.role_id !== "guardian")
      if (roleListArr.includes(Constant.admin)) {
        this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
      }
      if (roleListArr.includes(Constant.sysAdmin)) {
        if (localStorage.getItem('org_id') === Constant.organization_id) {
          this.roleList = this.roleList.filter(order => order.role_id === "sys-admin");
        }
        else {
          this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
        }
      }*/

  console.log(this.roleList); 
}

  async getUserSuffix(){
    this.getUserSuffixData = this.getUserSuffixDataArray;
  }

  get f() { return this.createuserForm.controls; }


  async onSubmit(form) {
    
    console.log("SUBMITEED");

    try {
      this.submitted = true;
      if (form.invalid) {
        return;
      }
      
    this.displayLoader = true;
    this.loading = true;

    var roleArray = [];
    if( this.roleList.length>0)
    {
      this.roleList.forEach( rol => {

        if(this.roles.indexOf(rol.role_id) !== -1){
          roleArray.push(rol)
        }

        
      })
    }

    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
  
    this.organization_id = localStorage.getItem('org_id');
    this.organization_name = localStorage.getItem('org_name');
    this.organization_abbrev = localStorage.getItem('org_abbrev');

    const userObj = {
      user_id: '',
      first_name: form.value.first_name || "",
      middle_initial: form.value.middle_initial || '',
      last_name: form.value.last_name || "",
      suffix: form.value.suffix || '',
      gender: '',
      date_of_birth: form.value.date_of_birth || "",
      email_address: form.value.email || "",
      mobile_phone: form.value.mobile_phone || "",
      parent_user_id: [],
      city: form.city || "",
      country_code: form.value.country_code || "",
      country: form.value.country_name || "",
      postal_code: form.value.postal_code || "",
      state: form.value.state_name || "",
      state_code: form.value.state || "",
      street1: form.value.street1 || "",
      street2: form.value.street2 || "",
      organization_id: this.organization_id || "",
      organization_name: this.organization_name || "",
      organization_abbrev: this.organization_abbrev || "",
      updated_datetime: new Date() || "",
      updated_uid: this.uid || "",
      is_invited: false,
      is_signup_completed: false,
      profile_image: '',
      roles: roleArray,
      organizations: [this.orgId]
  }

  
  //let saveUserData = await this.db.collection('/users').add(userObj);
    //console.log('-----userObj-----', userObj)
    //return false;

    this.restApiService.update('users/'+this.resourceID,userObj).subscribe( users => {

      this.notification.isNotification(true, "User Update", "User updated successfully.", "times-circle");   
      this.router.navigate(['/users/list']);

    },error => {
      console.log('-----Error API update-----')
      this.displayLoader = true;
      this.loading = true;

      this.notification.isNotification(true, "User Update", "Unable to insert.Issues on data.Please check data.", "times-circle"); 

    })

  /* let saveUserData = await this.db.collection('/users').doc(this.resourceID).update(userObj);
  if(this.resourceID) {

    //console.log(this.roles);
    
    for (let idx of this.roles) {
        
        await this.addRole(form.value, idx, this.resourceID, userObj);
    }
    

   this.notification.isNotification(true, "User Update", "User updated successfully.", "times-circle");   
   this.router.navigate(['/users/list']);
    
  } else {


    this.displayLoader = true;
    this.loading = true;

    this.notification.isNotification(true, "User Update", "Unable to insert.Issues on data.Please check data.", "times-circle");   

  } */
  
  
    
      
    
    } catch (error) {
      
      console.log(error);
      this.notification.isNotification(true, "User Update", "Unable to insert.Please try again later.", "times-circle");   
    }
  }



  selectedRole(event, form) {


    try {

      console.log("CHECKED "+event.target.checked);
      if (event.target.checked) {
        console.log("VALUE Add "+event.target.value);
        this.roleListToPatch.push(event.target.value);
        this.roles = this.roleListToPatch
        /*
        this.createUserForm.patchValue({
          roles: this.roleListToPatch
        })
        */
      } else {
        console.log("VALUE Remove "+event.target.value);
        this.roleListToPatch = this.roleListToPatch.filter(role => role !== event.target.value.toLowerCase())
        this.roles = this.roleListToPatch
      } 
      /*
      if (event.target.checked) {
        this.roleListToPatch.push(event.target.value);
        this.createUserForm.patchValue({
          roles: this.roleListToPatch
        })
      } else {
        this.roleListToPatch = this.roleListToPatch.filter(role => role !== event.target.value.toLowerCase())
        this.createUserForm.patchValue({
          roles: this.roleListToPatch
        })
      }
      */
    }
    catch (error) {
      console.log(error)
    }

  }

  // Create Role By season for the user
  async addRole(validateData: any, role: any, user_id: any, userObj: any) {
    //console.log(validateData);
    //console.log(role);
    //console.log(user_id);
    //console.log(userObj);
    
    


    try {
        // Mapping role obj
        const roleObj = {
            user_id: user_id,
            role_by_season_id: '',
            role: role || "",
            organization_id: this.organization_id || "",
            organization_name: this.organization_name || "",
            organization_abbrev: this.organization_abbrev || "",
            created_datetime: new Date(),
            hasRoleEnabled: true,
            terminated_datetime: new Date(),
            team_name: "",
            is_terminated: false,
            season_id: "",
            team_id: "",
            is_suspended: false,
            suspension_start_date: '',
            suspension_end_date: '',
            season_end_date: new Date(),
            season_label: "",
            sport_id: "",
            season_start_date: new Date(),
            level_id: "",
            sport_name: "",
            level_name: "",
        }
        userObj.role = role;
        userObj.hasRoleEnabled = true;

        //console.log(userObj);
        let checkUserExistRes = await this.db.collection('/organization').doc(this.organization_id).collection('/users').where('user_id', '==', userObj.user_id).get();
        if (checkUserExistRes.size) {
            userObj.isUserDuplicated = true
        } else {
            userObj.isUserDuplicated = false
        }
        
        //let roles:any = [validateData.roles];

        let roles:any = [this.roles];

        //console.log(validateData);
        //console.log(userObj);
        //console.log(roles);
        
        
        let getUserRoles = await this.db.collection('/users').doc(user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
        getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
        roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
        roles = [...new Set(roles)];

        if (roles[0] && roles[0].length) {
          let getRolesFromMaster = await this.db.collection('/roles').where('role_id', 'in', roles[0]).get();
          userObj.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
        } else {
          userObj.roles = [];
        }
        await this.db.collection('/organization').doc(this.organization_id).collection('/users').add(userObj);
        let saveRole = await this.db.collection('/users').doc(user_id).collection('/roles_by_season').add(roleObj);
        await saveRole.set({ role_by_season_id: saveRole.id }, { merge: true });
        return {
            status: true,
            data: "Success"
        }
    } catch (err) {
        console.log(err);

        return {
            status: false,
            error: err.message
        }
    }

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
  this.router.navigate(['/users/editlist/'+resourceId]);
}

deleteUser(resourceId: string){
  this.router.navigate(['/users/deletelist/'+resourceId]);
}

} 

