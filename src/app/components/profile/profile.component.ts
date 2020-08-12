import { Component, OnInit, Output, EventEmitter, Injector, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from '../../../app/core/services/config';
declare var $: any;
import { NgiNotificationService } from 'ngi-notification';
import * as moment from 'moment';
import * as firebase from 'firebase';
import { AngularFireStorage } from '@angular/fire/storage';
import { TitleCasePipe } from '@angular/common';
import { UPLOADCONFIG } from '../../../app/core/services/upload.config';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { UserService } from 'src/app/module-layout/user-layout/user-service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @Output() change = new EventEmitter();
  @ViewChild('fileUploader', { static: false }) fileUploader: ElementRef;
  breadCrumbItems: Array<{}>;
  submitted = false;
  error = '';
  isSaveUp:any=false;
  loading = false;
  stateList: any;
  state: boolean = false;
  country: boolean = false;
  roleList: any[] = [];
  orgList: any;
  parentList: any;
  parentField = false;
  dialCode = '';
  countryCodeList: any;
  suffixList: any = [
    { name: "Select suffix" },
    { name: 'Sr' },
    { name: 'Jr' },
    { name: 'II' },
    { name: 'III' },
    { name: 'IV' },
    { name: 'V' }

  ];
  uploadedimg: any;
  deafulltImagePlaceholder: boolean = true;
  basePath: string = '/uploads';
  imageUpload: boolean = false;
  config: any = UPLOADCONFIG[0];
  imgSize: any;
  guardian: any;
  player: any;
  id: any;
  userInfo: any;
  roles: any;
  guardianInfo: any[] = [];
  playerInfo: any[] = [];
  imgSrc = '/assets/image_placeholder.jpg';
  selectedImage = null;
  updateUserForm: FormGroup;
  ProfileUrl: any = null;
  emailId: any;
  fileExist: boolean = false;
  action: any;
  emailVaildation = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  data: any;
  stateNull: boolean = false;
  countryNull: boolean = false;
  isDate: boolean = true;
  isEmail: boolean = true;
  isNumber: boolean = true;
  emailNotReq: boolean = false;
  injectedData: any;
  sortedRoles: any = [];
  role: any;
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
  selectedRoles: any[] = [];
  commonDataAdmin: any = {
    organization_abbrev: '',
    organization_id: "",
    organization_name: "",
  }
  userData: any;
  imageSize = false;
  imageType = false;
  profileObj: any = {
    auth_uid: '',
    profile_uid: '',
    avatar_url: ''
  }
  progress: boolean = true;
  constructor(private userService: UserService, private dropDownService: DropdownService, private titlecasePipe: TitleCasePipe, private storage: AngularFireStorage, private notification: NgiNotificationService, private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    sharedService.missionAnnounced$.subscribe((data) => {
      if (data) {

      }
    })
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('userInfo'));
    localStorage.setItem('uploadedAccountProfileImg', null);
    this.getRoleList();
    this.getAllStateList();
    this.getAllCountryCodeList();
    this.updateUserForm = this.formBuilder.group({
      uid: [''],
      user_id: [''],
      profile_image: [''],
      first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3),]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      organization_id: [''],
      organization_name: [''],
      organization_abbrev: [''],
      email_address: [{ value: "", disabled: true }],
      mobile_phone: [{ value: "", disabled: true }],
      date_of_birth: [{ value: "", disabled: true }],
      suffix: [null],
      city: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      country_code: [null],
      country_name:[''],
      state_name:[''],
      postal_code: ['', [Validators.pattern('^[0-9]*$')]],
      state: [null, [Validators.pattern('^[a-zA-Z0-9- ]*$')]],
      street2: [''],
      street1: [''],
      roles: this.formBuilder.array([this.rolesInformation()])
    });
    this.getPlayerById(this.userData.user_id);;
    this.getGuardianById(this.userData.user_id);
    this.getUserGyId(this.userData.user_id);
  }
  get roleArr() {
    return this.updateUserForm.get('roles') as FormArray;
  }
  onSuffixChange(event: any) {
    if (event.name === "Select suffix") {
      this.updateUserForm.patchValue({
        suffix: null
      })
    }
  }

  rolesInformation() {
    return this.formBuilder.group({
      hasRoleEnabled: [''],
      terminated_datetime: [''],
      team_name: [''],
      organization_abbrev: [''],
      is_terminated: [''],
      role_by_season_id: [''],
      season_id: [''],
      team_id: [''],
      is_suspended: [''],
      season_end_date: [''],
      role: [''],
      organization_id: [''],
      season_label: [''],
      sport_id: [''],
      created_datetime: [''],
      player_user_id: [''],
      organization_name: [''],
      season_start_date: [''],
      level_id: [''],
      sport_name: [''],
      suspended_datetime: [''],
      level_name: [''],
      isAlreadyExist: false
    })
  }

  get f() { return this.updateUserForm.controls; }
  async getAllStateList() {
    this.state = true;
    let getAllStateResponse: any = await this.dropDownService.getAllStates();
    try {
      if (getAllStateResponse.status) {
        if (getAllStateResponse.data) {
          getAllStateResponse.data.splice(0, 0, { name: 'Select state', state_code: null });
          this.stateList = getAllStateResponse.data;
          this.state = false;
        } else {
          this.stateList = [];
          this.state = false;
        }

      }
      else {
        this.stateList = [];
        this.state = false;
      }
    } catch (error) {
      console.log(error);
      this.stateList = [];
      this.state = false;
    }
  }
  async getAllCountryCodeList() {
    this.country = true;
    let getAllCountryResponse: any = await this.dropDownService.getAllCountry();
    try {
      if (getAllCountryResponse.status) {
        if (getAllCountryResponse.data) {
          getAllCountryResponse.data.splice(0, 0, { name: 'Select country', country_code: null });
          this.countryCodeList = getAllCountryResponse.data;
          this.country = false;
        } else {
          this.countryCodeList = [];
          this.country = false;
        }

      }
      else {
        this.countryCodeList = [];
        this.country = false;
      }
    } catch (error) {
      console.log(error);
      this.countryCodeList = [];
      this.country = false;
    }
  }
  ngAfterViewInit() {
    $('#datetime-datepicker').flatpickr({
      enableTime: false,
      dateFormat: "m-d-Y",
      maxDate: "today"
    });
  }
  ngAfterContentInit() {
    this.roleArr.removeAt(0);
  }

  async getRoleList() {
    this.sortedRoles = [];
    let res: any = await this.dropDownService.getRoles();
    try {
      if (res.status) {
        this.roleList = res.data;
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
          this.getSortedRoleList(this.roleList)

        }

        this.sortedRoles.sort((a, b) => {
          if (a['id'] < b['id'])
            return -1;
          if (a['id'] < b['id'])
            return 1;
          return 0;
        });
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
        if (this.selectedRoles) {
          this.selectedRoles.sort((a, b) => {
            if (a['id'] < b['id'])
              return -1;
            if (a['id'] < b['id'])
              return 1;
            return 0;
          })
        }
      }
      else {
        this.loading = false;
        this.roleList = [];
      }
    } catch (error) {
      console.log(error);
      this.loading = false;
      this.roleList = [];
    }
  }
  getSortedRoleList(list) {
    list.forEach(eachrole => {
      switch (eachrole.role_id) {
        case 'admin':
          this.sortedRoles.push({ id: 1, name: eachrole.name, role_id: eachrole.role_id, isdisabled: false, isBanned: false, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
        case 'coach':
          this.sortedRoles.push({ id: 2, name: eachrole.name, role_id: eachrole.role_id, isdisabled: false, isBanned: true, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
        case 'manager':
          this.sortedRoles.push({ id: 3, name: eachrole.name, role_id: eachrole.role_id, isdisabled: false, isBanned: true, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
        case 'evaluator':
          this.sortedRoles.push({ id: 4, name: eachrole.name, role_id: eachrole.role_id, isdisabled: false, isBanned: true, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
        case 'guardian':
          this.sortedRoles.push({ id: 5, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: false, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
        case 'player':
          this.sortedRoles.push({ id: 6, name: eachrole.name, role_id: eachrole.role_id, isdisabled: true, isBanned: true, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
        case 'sys-admin':
          this.sortedRoles.push({ id: 1, name: eachrole.name, role_id: eachrole.role_id, isdisabled: false, isBanned: false, isdisabledBanned: false, isChecked: false, isBanCheck: false })
          break;
      }
    })
  }

  onStateChange(event) {
    this.stateNull = false;
    if (event.name === "Select state") {
      this.updateUserForm.patchValue({
        state: null,
        state_name:''
      })
    }else{
      this.updateUserForm.patchValue({
        state_name:event.name
      })
    }
  }
  onNationalChange(event) {
    this.countryNull = false;
    if (event.name !== "Select country") {
      this.dialCode = event.dial_code;
      this.updateUserForm.patchValue({
        country_name: event.name
      })
    } else {
      this.dialCode = '';
      this.updateUserForm.patchValue({
        country_code: null,
        country_name:''
      })

      this.updateUserForm.get('mobile_phone').enable();
      this.updateUserForm.get('mobile_phone').setValidators([Validators.pattern('^[0-9-()]*$'), Validators.minLength(10)]);
      this.updateUserForm.get('mobile_phone').updateValueAndValidity();
      this.updateUserForm.patchValue({
        mobile_phone: ''
      })
    }
  }
  async getUserGyId(uid) {
    this.loading = true;
    try {
      let res = await this.userService.getUserDetailsById({ 'uid': uid });
      if (res.status) {
        this.userInfo = res.data;
        setTimeout(() => {
          if (res.data) {            
              if (res.data.country_code) {
                this.countryCodeList.forEach(element => {
                  if (res.data.country_code === element.country_code) {
                    this.dialCode = element.dial_code;
                  }
                });
              }
          
            this.loading = false;
          }
        }, 320);
        if (res.data.profile_image && res.data.profile_image != "null" && res.data.profile_image != undefined && res.data.profile_image != null) {
          this.ProfileUrl = res.data.profile_image;
          this.deafulltImagePlaceholder = false;
          this.updateUserForm.patchValue({
            profile_image: res.data.profile_image
          })
        }
        else {
          let name = res.data.first_name;
          this.deafulltImagePlaceholder = true;
          let lastname = res.data.last_name;
          let initials = name.charAt(0) + "" + lastname.charAt(0);
          document.getElementById("abbreviation").innerHTML = initials;
          document.getElementById("abbreviation").style.fontSize = "40px";
          // this.ProfileUrl = null;
          this.updateUserForm.patchValue({
            profile_image: null
          })
        }
        if (res.data.date_of_birth) {
          this.isDate = false;
        } else {
          this.isDate = true
          $('#datetime-datepicker').flatpickr({
            enableTime: false,
            dateFormat: "m-d-Y",
            maxDate: "today"
          });
          if (!this.updateUserForm.get('date_of_birth').enabled) {
            this.updateUserForm.get('date_of_birth').enable();
            this.updateUserForm.controls.date_of_birth.setValidators([Validators.required]);
            this.updateUserForm.controls.date_of_birth.updateValueAndValidity();
          }
        }
        if (res.data.email_address) {
          this.isEmail = false
        } else {
          this.isEmail = true
          if (!this.updateUserForm.get('email_address').enabled) {
            this.updateUserForm.get('email_address').enable()
            this.updateUserForm.controls.email_address.setValidators([Validators.pattern(this.emailVaildation), Validators.required]);
            this.updateUserForm.controls.email_address.updateValueAndValidity();
          }
        }
        if (res.data.mobile_phone) {
          this.isNumber = false
        } else {
          this.isNumber = true;
          if (!this.updateUserForm.get('mobile_phone').enabled) {
            this.updateUserForm.get('mobile_phone').enable();
            this.updateUserForm.get('mobile_phone').setValidators([Validators.pattern('^[0-9-()]*$'), Validators.minLength(10)]);
            this.updateUserForm.get('mobile_phone').updateValueAndValidity();
          }
        }
        if (this.userInfo.date_of_birth) {
          if (typeof (this.userInfo.date_of_birth) === 'string') {
            this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
          } else {
            this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth.toDate()).format('MM-DD-YYYY').toString();
          }
        }
        this.updateUserForm.patchValue({
          uid: this.cookieService.getCookie('uid'),
          user_id: this.userInfo.user_id,
          first_name: this.userInfo.first_name,
          // organization_id: this.userInfo.organization_id,
          organization_name: this.userInfo.organization_name,
          organization_abbrev: this.userInfo.organization_abbrev,
          middle_initial: this.userInfo.middle_initial,
          last_name: this.userInfo.last_name,
          email_address: this.userInfo.email_address,
          mobile_phone: this.userInfo.mobile_phone,
          date_of_birth: this.userInfo.date_of_birth,
          suffix: this.userInfo.suffix,
          street2: this.userInfo.street2,
          street1: this.userInfo.street1,
          country_code: this.userInfo.country_code,
          country_name:this.userInfo.country,
          state_name:this.userInfo.state,
          city: this.userInfo.city,
          state: this.userInfo.state_code,
          postal_code: this.userInfo.postal_code,
        })
        if (this.userInfo.organization_id) {
         this.updateUserForm.patchValue({
          organization_id: this.userInfo.organization_id
         })
        }else{
          this.updateUserForm.patchValue({
            organization_id: ''
           })
        }
        if (this.userInfo.roles_by_seasons) {
          res.data.roles_by_seasons.forEach((element, index) => {
            this.roleArr.push(this.rolesInformation());
          });
          this.roleArr.patchValue(res.data.roles_by_seasons)
          this.roleArr['controls'].forEach(eachRole => {
            eachRole['controls'].isAlreadyExist.patchValue(true)
          });
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
        if (!this.userInfo.suffix) {
          this.updateUserForm.patchValue({
            suffix: null
          })
        }
        if (!this.userInfo.country_code) {
          this.updateUserForm.patchValue({
            country_code: null
          })
        }
        if (!this.userInfo.state) {
          this.updateUserForm.patchValue({
            state: null
          })
        }
        // Other role
        this.userInfo.roles_by_seasons.forEach(element => {
          if (element.role.toLowerCase() !== Constant.admin && element.role.toLowerCase() !== Constant.sysAdmin) {
            this.commonDataOtherRoles.organization_id = element.organization_id;
            this.commonDataOtherRoles.organization_name = element.organization_name;
            this.commonDataOtherRoles.organization_abbrev = element.organization_abbrev;
            this.commonDataOtherRoles.sport_id = element.sport_id;
            this.commonDataOtherRoles.sport_name = element.sport_name;
            this.commonDataOtherRoles.season_id = element.season_id;
            this.commonDataOtherRoles.season_label = element.season_label;
            this.commonDataOtherRoles.season_start_date = element.season_start_date;
            this.commonDataOtherRoles.season_end_date = element.season_end_date;
          } else {
            this.commonDataAdmin.organization_id = element.organization_id;
            this.commonDataAdmin.organization_name = element.organization_name;
            this.commonDataAdmin.organization_abbrev = element.organization_abbrev;
          }
        });

        if (this.sortedRoles) {
          // console.log(this.sortedRoles, "roles");
          this.userInfo.roles_by_seasons.forEach((element, index) => {
            let selectedRole = this.sortedRoles.filter(item => item.role_id.toLowerCase() === element.role.toLowerCase());
            console.log(selectedRole, "singleRole");

            if (selectedRole.length !== 0) {
              if (element.hasRoleEnabled) {
                selectedRole[0].isChecked = true;
                if (element.is_terminated) {
                  selectedRole[0].isBanCheck = true;
                  selectedRole[0].isdisabled = true;
                  selectedRole[0].isdisabledBanned = true;
                }
                if (element.isPrimaryAdmin) {
                  selectedRole[0].isdisabled = true;
                }
                if (element.isSecondaryAdmin) {
                  selectedRole[0].isdisabled = true;
                }
              }
            }
          });
        }
        this.ageValidation(this.userInfo.date_of_birth)
        // console.log(this.updateUserForm, "Form");
      }
    } catch (error) {
      this.loading = false;
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
            this.selectedRoles.push({ id: 1, name: this.titlecasePipe.transform(roleList.role), isBanned: true })
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

  removeFile(event) {

    localStorage.setItem('uploadedAccountProfileImg', null);
    this.fileUploader.nativeElement.value = "";
    this.deafulltImagePlaceholder = true;
    this.ProfileUrl = null;
    let name = this.userInfo.first_name;
    let lastname = this.userInfo.last_name;
    let initials = name.charAt(0) + "" + lastname.charAt(0);
    document.getElementById("abbreviation").innerHTML = initials;
    document.getElementById("abbreviation").style.fontSize = "40px";
    this.ProfileUrl = null;
    this.fileExist = false;
  }
  async showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.deafulltImagePlaceholder = false;
      if (this.extensionValidation(event.target.files[0])) {
        this.imageType = false;
        if (this.maxsizeValidation(event.target.files[0])) {
          this.progress = false;
          this.imageSize = false;
          const reader = new FileReader();
          reader.onload = (e: any) => this.ProfileUrl = e.target.result;
          reader.readAsDataURL(event.target.files[0]);
          this.selectedImage = event.target.files[0];
          this.fileExist = true;
          let storageRef = firebase.storage().ref();
          let uploadTask = storageRef.child(`${this.basePath}/${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${this.cookieService.getCookie('uid')}_${new Date().getTime()}`).put(this.selectedImage);

          uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
              // upload in progress
              // this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // 
            },
            (error) => {
              // upload failed
              console.log(error)
            },
            () => {
              // upload success
              uploadTask.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
                console.log(downloadURL);
                await downloadURL
                if (downloadURL) {
                  localStorage.setItem('uploadedAccountProfileImg', downloadURL);
                } 
              });
              this.progress = true;
            }
          );
        } else {
          // console.log("exceeded the max size")
          this.imageSize = true;
          this.deafulltImagePlaceholder = true;
        }
      }
      else {
        // console.log("type is not match")
        this.imageType = true;
        this.deafulltImagePlaceholder = true;
      }
    }
    else {
      this.ProfileUrl = this.ProfileUrl;
      this.deafulltImagePlaceholder = true;
    }
  }
  extensionValidation(file: any): boolean { // extension validation
    // console.log('type', file);
    // console.log(this.config.isAllowFileFormats);
    let re = /(?:\.([^.]+))?$/;
    let ext = re.exec(file.name)[1];

    try {
      let isAllowed: any;
      if (file.type == "") {
        isAllowed = this.config.isAllowFileFormats.find(val => { return val === ext })
      } else {
        isAllowed = this.config.isAllowFileFormats.find(val => { return val === file.type })
      }
      return isAllowed ? true : false;
    } catch (error) {
      return false;
    }

  }
  maxsizeValidation(file: any): boolean {
    try {
      let fileSize = file.size / (1024 * 1000); // MB Convert
      let size = Math.round(fileSize * 100) / 100;
      // console.log(size)
      return (size < this.config.maxSize);
    } catch (error) {
      return false;
    }
  }
  ageValidation(value) {
    if (value) {
      const bdate = new Date(value);
      const timeDiff = Math.abs(Date.now() - bdate.getTime());
      let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
      console.log(age)
      if (age < 13) {
        this.updateUserForm.controls.email_address.setValidators([Validators.pattern(this.emailVaildation)]);
        this.emailNotReq = false;
      }
      else {
        this.updateUserForm.controls.email_address.setValidators([Validators.required, Validators.pattern(this.emailVaildation)]);
        this.emailNotReq = true;
      }
      this.updateUserForm.controls.email_address.updateValueAndValidity();
    }
  }
  mobileNumberInput(event, form) {
    // console.log(event)
    if (event.target.value) {
      if (form.value.country_code) {
        this.countryNull = false
      }
      else {
        this.countryNull = true
        this.updateUserForm.patchValue({
          mobile_phone: ''
        })
      }
    }

  }
  async getPlayerById(uid) {
    this.loading = true
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
      this.loading = false
    } catch (error) {
      console.log(error)
    }


  }

  async getGuardianById(uid) {
    try {
      this.loading = true
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
      this.loading = false
    } catch (error) {
      console.log(error)
    }
  }
  saveUp(value:any) {
    if(value === "up"){
      this.isSaveUp = true;
    }else{
      this.isSaveUp = false;
      setTimeout(() => {
        window.scrollTo(0,document.body.scrollHeight);
      }, 100);
    }    
  }
  async onSubmit(form) {
    this.closeError();
    this.submitted = true;

    if (form.invalid) {

      return;
    }
    
    if (!this.updateUserForm.get('email_address').enabled) {
      this.updateUserForm.get('email_address').enable()
    }
    if (!this.updateUserForm.get('date_of_birth').enabled) {
      this.updateUserForm.get('date_of_birth').enable()
    }
    if (!this.updateUserForm.get('mobile_phone').enabled) {
      this.updateUserForm.get('mobile_phone').enable()
    }
    this.uploadedimg = localStorage.getItem('uploadedAccountProfileImg');
    if (this.uploadedimg !== "null") {
      if (this.ProfileUrl && (this.ProfileUrl != this.uploadedimg)) {
         form.value.profile_image= this.uploadedimg;
      }
    }else{
      form.value.profile_image= null;
    }
    form.value.date_of_birth = new Date(form.value.date_of_birth);
    this.loading = true;
    form.value.roles.forEach(element => {
      delete element.isAlreadyExist
    });
  let res: any = await this.userService.updateUser(form.value);
    try {
      if (res.status) {
        
        this.sharedService.announceMission({ action: 'updatedProfile', data: form.value });
        this.notification.isNotification(true, "Profile", res.data, "check-square");
        this.loading = false;        
      }
      else {
        this.loading = false;
        this.submitted = false;
        this.error = res.error;
     }
      localStorage.setItem('uploadedAccountProfileImg', null);
    } catch (error) {
      console.log(error);
      this.loading = false;
      this.submitted = false;
      this.error = res.error;
    }

  }

  closeError() {
    this.error = '';
  }
  goBack() {
    this.getUserGyId(this.userData.user_id);
  }
}
