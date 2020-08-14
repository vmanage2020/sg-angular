import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { CookieService } from 'src/app/core/services/cookie.service';
import { NgiNotificationService } from 'ngi-notification';
import * as moment from 'moment';
import { TitleCasePipe } from '@angular/common';
import { UserService } from '../user-service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  userId: any; 
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  userInfo: any;
  guardian: any;
  player: any;
  isSaveUp:any;
  isShowResendInvite:any;
  error:any;
  
  id: any;
  roleList: any[] = [];
  sortedRoles: any = [];
  roles: any
  role: any;
  selectedRoles: any[] = [];
  guardianInfo: any[] = [];
  playerInfo: any[] = [];
  stateList: any;
  countryCodeList: any;
  dialCode: any = '';
  data: any;
  commonDataOtherRoles: any = {
    organization_abbrev: '',
    season_id: "",
    season_end_date: "",
    organization_id: "",
    season_label: "",
    organization_name: "",
    season_start_date: "",
    sport_name: "",
    sport_id: ''
  }
   suspendInfo: any = [];
  commonDataAdmin: any = {
    organization_abbrev: '',
    organization_id: "",
    organization_name: "",
  }
   isSuspendLength :boolean= false;
  injectedData: any;
  deafulltImagePlaceholder: boolean = true;
  ProfileUrl = null;
  constructor(private dropDownService: DropdownService, private titlecasePipe: TitleCasePipe, private notification: NgiNotificationService, private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public userService: UserService) {
    sharedService.missionAnnounced$.subscribe((data) => {
      // console.log(data)
      if (data) {
        this.data = data
        if (this.data.action === "organizationFilter") {
          this.change.emit({ action: "usergrid" })
        } else if (this.data == "userRouter") {
          this.change.emit({ action: "usergrid" })
        }
      }
    })
  }

  ngOnInit() {
    this.getRoleList();
    this.sharedService.announceMission('user');
    this.injectedData = this.injector.get('injectData');
    this.getPlayerById(this.injectedData.data.user_id)
    this.getGuardianById(this.injectedData.data.user_id)
    this.getUserGyId(this.injectedData.data.user_id)

  }

  ngAfterViewInit() {

  }
  // getAllCountryCodeList() {
  //   this.dataServices.getData(apiURL.GET_COUNTRY_LIST, this.cookieService.getCookie('token')).toPromise().then(res => {
  //     try {
  //       if (res.status) {
  //         this.countryCodeList = res.data;
  //       } else {
  //         this.countryCodeList = [];
  //       }
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }).catch(error => {
  //     console.log(error);
  //   })
  // }

  async getPlayerById(uid) {
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


  }
  async getGuardianById(uid) {
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
  }
  async getRoleList() {
    this.sortedRoles = [];
    let getRolesDropdownResponse: any = await this.dropDownService.getRoles();
    try {
      if (getRolesDropdownResponse.status) {
        this.roleList = getRolesDropdownResponse.data;
        this.role = JSON.parse(localStorage.getItem('roleList'));
        let roleListArr = this.role.map(roles => {
          if (roles.role) {
            return roles.role.toLowerCase();
          }
        });
        if (roleListArr.includes(Constant.admin)) {
          this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
          this.getSortedRoleList(this.roleList)
        }
        if (roleListArr.includes(Constant.sysAdmin)) {
          if (localStorage.getItem('org_id') === Constant.organization_id) {
            this.roleList = this.roleList.filter(order => order.role_id === "sys-admin");
            this.getSortedRoleList(this.roleList)
          }
          else {
            this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
            this.getSortedRoleList(this.roleList)
          }
        }
        if (this.userInfo) {
          if (this.userInfo.roles_by_seasons) {
            this.selectedRoles = [];
            this.userInfo.roles_by_seasons.forEach(roles => {
              let selectedRole = this.sortedRoles.filter(item => item.role_id.toLowerCase() === roles.role.toLowerCase());
              if (selectedRole.length !== 0) {
                if (roles.hasRoleEnabled) {
                  this.sortedRoleWithTerminate(roles);
                }
              }

            });
          }
        }
        // this.sortedRoles=this.sortedRoles.sort()
        // Usage
        this.selectedRoles.sort((a, b) => {
          if (a['id'] < b['id'])
            return -1;
          if (a['id'] < b['id'])
            return 1;
          return 0;
        });
      }
      else {
        this.loading = false;
        this.roleList = [];
      }
    } catch (error) {
      console.log(error);
    }
  }
  sortedRoleWithTerminate(roleList) {

    if (roleList.is_terminated) {
      let roleObj:any = {};
      switch (roleList.role.toLowerCase()) {
        
        case 'admin':          
        let adminInfo:any = this.selectedRoles.some(role => role.id == 1);
        if(!adminInfo) {
          this.selectedRoles.push({ id: 1, name: this.titlecasePipe.transform(roleList.role), isBanned: true })
        }           
          break;
        case 'coach':
          let coachInfo:any = this.selectedRoles.some(role => role.id == 2);
          if(!coachInfo) {
            this.selectedRoles.push({ id: 2, name: this.titlecasePipe.transform(roleList.role), isBanned: true })
          }          
          break;
        case 'manager':
          let managerInfo:any = this.selectedRoles.some(role => role.id == 3);
          if(!managerInfo) {
            this.selectedRoles.push({ id: 3, name: this.titlecasePipe.transform(roleList.role), isBanned: true })
          }   
          
          break;
        case 'evaluator':
          let evaluatorInfo:any = this.selectedRoles.some(role => role.id == 4);
          if(!evaluatorInfo) {
            this.selectedRoles.push({ id: 4, name: this.titlecasePipe.transform(roleList.role), isBanned: true })
          } 
          
          break;
        case 'guardian':
          let guardianInfo:any = this.selectedRoles.some(role => role.id == 5);
          if(!guardianInfo) {
            this.selectedRoles.push({ id: 5, name: this.titlecasePipe.transform(roleList.role), isBanned: true }) 
          }    
          break;
        case 'player':
          let playerInfo:any = this.selectedRoles.some(role => role.id == 6);
          if(!playerInfo) {
            this.selectedRoles.push({ id: 6, name: this.titlecasePipe.transform(roleList.role), isBanned: true })
          }  
          
          break;
        case 'sys-admin':
          let sysInfo:any = this.selectedRoles.some(role => role.id == 1);
          if(!sysInfo) {
            this.selectedRoles.push({ id: 1, name: this.titlecasePipe.transform("super admin"), isBanned: true })
          } 
          break;
      }
    } else {
      switch (roleList.role.toLowerCase()) {
        case 'admin':
          let adminInfo:any = this.selectedRoles.some(role => role.id == 1);
          if(!adminInfo) {
            this.selectedRoles.push({ id: 1, name: this.titlecasePipe.transform(roleList.role), isBanned: false })
          }  
          break;
        case 'coach':
          let coachInfo:any = this.selectedRoles.some(role => role.id == 2);
          if(!coachInfo) {
            this.selectedRoles.push({ id: 2, name: this.titlecasePipe.transform(roleList.role), isBanned: false })
          }
          break;
        case 'manager':
          let managerInfo:any = this.selectedRoles.some(role => role.id == 3);
          if(!managerInfo) {
            this.selectedRoles.push({ id: 3, name: this.titlecasePipe.transform(roleList.role), isBanned: false })
          } 
          break;
        case 'evaluator':
          let evaluatorInfo:any = this.selectedRoles.some(role => role.id == 4);
          if(!evaluatorInfo) {
            this.selectedRoles.push({ id: 4, name: this.titlecasePipe.transform(roleList.role), isBanned: false })
          } 
          break;
        case 'guardian':
          let guardianInfo:any = this.selectedRoles.some(role => role.id == 5);
          if(!guardianInfo) {
            this.selectedRoles.push({ id: 5, name: this.titlecasePipe.transform(roleList.role), isBanned: false }) 
          }           
          break;
        case 'player':
           let playerInfo:any = this.selectedRoles.some(role => role.id == 6);
          if(!playerInfo) {
            this.selectedRoles.push({ id: 6, name: this.titlecasePipe.transform(roleList.role), isBanned: false })
          } 
          break;
        case 'sys-admin':
          let sysInfo:any = this.selectedRoles.some(role => role.id == 1);
          if(!sysInfo) {
            this.selectedRoles.push({ id: 1, name: this.titlecasePipe.transform("super admin"), isBanned: false })
          } 
         
          break;
      }
    }

  }
  getSortedRoleList(list) {
    list.forEach(eachrole => {
      switch (eachrole.role_id) {
        case 'admin':
          this.sortedRoles.push({ id: 1, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: false, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
        case 'coach':
          this.sortedRoles.push({ id: 2, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: true, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
        case 'manager':
          this.sortedRoles.push({ id: 3, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: true, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
        case 'evaluator':
          this.sortedRoles.push({ id: 4, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: true, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
        case 'guardian':
          this.sortedRoles.push({ id: 5, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: false, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
        case 'player':
          this.sortedRoles.push({ id: 6, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: true, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
        case 'sys-admin':
          this.sortedRoles.push({ id: 1, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: false, isdisabledBanned: true, isChecked: false, isBanCheck: false })
          break;
      }
    })
  }
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  async getUserGyId(uid) {
    try {
      this.loading = true;
      let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
      let getUserDetailsResponse: any = await this.userService.getUserDetailsById({ 'uid': uid });
      if (getUserDetailsResponse.status) {
        setTimeout(() => {
          if (getUserDetailsResponse.data) {
            if (getUserDetailsResponse.data.country_code) {
              if (this.countryCodeList) {
                this.countryCodeList.forEach((element: any) => {
                  if (getUserDetailsResponse.data.country_code === element.country_code) {
                    this.dialCode = element.dial_code;
                  }
                });
              }

            }
            this.loading = false;
            this.displayLoader = false;
            this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
            clearInterval(loaderToGetUserInfo);
          }
        }, 320);
        this.userInfo = getUserDetailsResponse.data;
        if(this.userInfo.is_signup_completed === true){
          this.isShowResendInvite = false;
        }else if(this.userInfo.lastSentInviteTime && this.userInfo.is_signup_completed === false && this.userInfo.email_address){
          this.userInfo.lastSentInviteTime = this.userInfo.lastSentInviteTime.toDate();
          let dt = this.userInfo.lastSentInviteTime.getTime();
          let currentDate = new Date().getTime();
          let hours =Math.floor((currentDate - dt) / (1000 * 60 * 60));
          if(hours >= 24){
            this.isShowResendInvite = true;
          }else{
            this.isShowResendInvite = false;
          }
        }else if(this.userInfo.is_signup_completed === false && this.userInfo.email_address){
          this.isShowResendInvite = true;
        }
        if (getUserDetailsResponse.data.profile_image && getUserDetailsResponse.data.profile_image != "null" && getUserDetailsResponse.data.profile_image != undefined && getUserDetailsResponse.data.profile_image != null) {
          this.ProfileUrl = getUserDetailsResponse.data.profile_image;
          this.deafulltImagePlaceholder = false;
        }
        else {
          this.deafulltImagePlaceholder = true;
          let name = getUserDetailsResponse.data.first_name;
          let lastname = getUserDetailsResponse.data.last_name;
          let initials = name.charAt(0) + "" + lastname.charAt(0);
          document.getElementById("abbreviation").innerHTML = initials;
          document.getElementById("abbreviation").style.fontSize = "40px";
          this.ProfileUrl = null
        }
        let arrayInfo:any=[];
        if (this.userInfo) {
          if (this.userInfo.roles_by_seasons) {
            this.selectedRoles = [];
            this.userInfo.roles_by_seasons.forEach(roles => {
              if (roles.organization_id === localStorage.getItem('org_id')) {
                let selectedRole = this.sortedRoles.filter(item => item.role_id.toLowerCase() === roles.role.toLowerCase());
                if (selectedRole.length !== 0) {
                  if (roles.hasRoleEnabled) {               
                    this.sortedRoleWithTerminate(roles);
                  }
                }
              }
            });
          }
        }
        this.selectedRoles.sort((a, b) => {
          if (a['id'] < b['id'])
            return -1;
          if (a['id'] < b['id'])
            return 1;
          return 0;
        });
        if (this.userInfo.date_of_birth) {
          if(typeof(this.userInfo.date_of_birth) !== "string"){
            this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth.toDate()).format('MM-DD-YYYY').toString();
          }else{
            this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
          }
          // this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
        }

        if (this.userInfo.suffix) {
          if (this.userInfo.middle_initial) {
            this.userInfo['name'] = this.userInfo.first_name + " " + this.userInfo.middle_initial + " " + this.userInfo.last_name + " " + this.userInfo.suffix
          } else {
            this.userInfo['name'] = this.userInfo.first_name + " " + this.userInfo.last_name + " " + this.userInfo.suffix
          }

        }
        else {
          if (this.userInfo.middle_initial) {
            this.userInfo['name'] = this.userInfo.first_name + " " + this.userInfo.middle_initial + " " + this.userInfo.last_name
          } else {
            this.userInfo['name'] = this.userInfo.first_name + " " + this.userInfo.last_name
          }

        }
        
       
        console.log( getUserDetailsResponse.data.roles_by_seasons);
        this.suspendInfo=[];
        getUserDetailsResponse.data.roles_by_seasons.forEach(element => {
          // User suspend related to topbar organization
          if (element.organization_id === localStorage.getItem('org_id')) {
            if (element.is_suspended) {
              this.isSuspendLength = true;
              if (element.suspension_start_date) {
                if(typeof(element.suspension_start_date) !== "string"){
                  element.suspension_start_date = moment(element.suspension_start_date.toDate()).format('MM-DD-YYYY').toString()
                }else{
                  element.suspension_start_date = moment(element.suspension_start_date).format('MM-DD-YYYY').toString() 
                }                
              }
              if (element.suspension_end_date) {
                if(typeof(element.suspension_end_date) !== "string"){
                  element.suspension_end_date = moment(element.suspension_end_date.toDate()).format('MM-DD-YYYY').toString()
                }else{
                  element.suspension_end_date = moment(element.suspension_end_date).format('MM-DD-YYYY').toString()
                }
              }
              // this.userInfo['isSuspended'] = "Yes"
              this.suspendInfo.push(element);
            }
            else {
              this.userInfo['isSuspended'] = "No"
            }
          }
        })
      } else {
        this.loading = false;
      }
    } catch (err) {
      console.log(err);
      this.loading = false;

    }
  }
  navigateView() {
    this.injectedData.data.viewBy = "view";
    console.log(this.injectedData.data)
    this.change.emit({ action: "edituser", data: this.injectedData.data })
  }
  goBack() {
    this.change.emit({ action: "usergrid", data: this.injectedData.data })
  }
  async resendInvite(value : any){
    try{
      
      if (value === "up") {
        this.isSaveUp = true;
      } else {
        this.isSaveUp = false;
      }
      this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: "Sending Invite" });
      this.loading = true;
      let loaderWhileUpdate = setInterval(this.sendInviteTimerFunction, 100, this.loaderInfo, "");
      console.log("success");
    let uid = this.injectedData.data.user_id;
    let sendInviteRes = await this.userService.resendInviteService(uid);
    if(sendInviteRes.status){
      this.isShowResendInvite = false;
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Sent Invite" });
      this.loading = false;
      this.displayLoader = false;
      clearInterval(loaderWhileUpdate);
      this.notification.isNotification(true, "Users", sendInviteRes.message, "check-square");
    }else{
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      this.loading = false;
        this.displayLoader = false;
        clearInterval(loaderWhileUpdate);
        this.error = sendInviteRes.message;
    }
    }catch(error){
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      this.loading = false;
      this.displayLoader = false;
      this.error = error.message;
    }
      

  }
  sendInviteTimerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if(loaderInfo.value === 5){
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Processing Request" });
    }else if(loaderInfo.value === 35){
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Finding User" });
    }else if(loaderInfo.value === 50){
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Found User" });
    }else if(loaderInfo.value === 75){
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Invite sent" });
    }
    
  }
}
