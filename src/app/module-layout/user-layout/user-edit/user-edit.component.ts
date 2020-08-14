import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from '../../../core/services/config';
declare var $: any;
import { NgiNotificationService } from 'ngi-notification';
import * as moment from 'moment';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { UserService } from '../user-service';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  @Output() change = new EventEmitter();
  getValuesToDisplay: any = {};
  submitted: boolean = false;
  enableSendInvite: boolean = false;
  error: any = '';
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  stateList: any;
  state: boolean = false;
  country: boolean = false;
  roleList: any[] = [];
  dialCode = '';
  countryCodeList: any;
  isSaveUp: any = false;
  guardian: any;
  player: any;
  userInfo: any;
  guardianInfo: any[] = [];
  playerInfo: any[] = [];
  updateUserForm: FormGroup;
  ProfileUrl: any = null;
  emailVaildation = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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
  commonDataAdmin: any = {
    organization_abbrev: '',
    organization_id: "",
    organization_name: "",
  }
  deafulltImagePlaceholder: boolean = true;
  constructor(private dropDownService: DropdownService, private notification: NgiNotificationService, private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService, private userService: UserService) {
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        // this.data = data
        if (data.action === "organizationFilter") {
          this.change.emit({ action: "usergrid" })
        } else if (data == "userRouter") {
          this.change.emit({ action: "usergrid" })
        }
      }
    })
  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "edit";
    this.getRoleList();
    this.injectedData = this.injector.get('injectData');
    console.log(this.injectedData);    
    this.getAllCountryCodeList();
    this.getAllStateList();
    this.updateUserForm = this.formBuilder.group({
      uid: [''],
      profile_image: [''],
      user_id: [''],
      organization_id: [''],
      organization_name: [''],
      organization_abbrev: [''],
      first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3),]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email_address: [{ value: "", disabled: true }],
      mobile_phone: [{ value: "", disabled: true }],
      date_of_birth: [{ value: "", disabled: true }],
      suffix: [null],
      city: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      country_code: [null],
      country_name: [''],
      state_name: [''],
      postal_code: ['', [Validators.pattern('^[0-9]*$')]],
      state: [null, [Validators.pattern('^[a-zA-Z0-9- ]*$')]],
      street2: [''],
      street1: [''],
      roles: this.formBuilder.array([this.rolesInformation()])
    });
    this.getPlayerById(this.injectedData.data.user_id)
    this.getGuardianById(this.injectedData.data.user_id)
    this.getUserGyId(this.injectedData.data.user_id)
  }
  get roleArr() {
    return this.updateUserForm.get('roles') as FormArray;
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
      suspended_start_date: [''],
      suspended_end_date: [''],
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
            this.getSortedRoleList(this.roleList);
          }
          else {
            this.roleList = this.roleList.filter(order => order.role_id !== "sys-admin");
            this.getSortedRoleList(this.roleList);
          }
        }
        this.sortedRoles.sort((a, b) => {
          if (a['id'] < b['id'])
            return -1;
          if (a['id'] < b['id'])
            return 1;
          return 0;
        });
        if (this.userInfo) {
          if (this.sortedRoles) {
            this.userInfo.roles_by_seasons.forEach((element, index) => {
              if (element.organization_id === localStorage.getItem('org_id')) {

                let selectedRole = this.sortedRoles.filter(item => item.role_id.toLowerCase() === element.role.toLowerCase());
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
              }
            });
          }
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
      switch (eachrole.role_id.toLowerCase()) {
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
  selectedRole(event, form, index) {
    if (event.target.checked) {
      let valueExist = this.updateUserForm.controls['roles'].value.filter(item => {
        let getActualOrgId = localStorage.getItem('org_id');
        if (item.organization_id === getActualOrgId && item.role.toLowerCase() === event.target.value.toLowerCase()) {
          return item
        }
      });
      if (valueExist.length !== 0) {
        let index = this.updateUserForm.controls['roles'].value.findIndex(item => {
          let getActualOrgId = localStorage.getItem('org_id');
          if (item.organization_id === getActualOrgId && item.role.toLowerCase() === event.target.value.toLowerCase()) {
            return item
          }

        });
        if (!this.roleArr.at(index).value.hasRoleEnabled) {
          this.roleArr.at(index)['controls'].hasRoleEnabled.patchValue(true)
        }
      } else {
        let roleArrlength = this.roleArr.length
        this.roleArr.push(this.rolesInformation());
        if (event.target.value.toLowerCase() !== Constant.admin || event.target.value.toLowerCase() !== Constant.sysAdmin) {
          this.roleArr.at(roleArrlength).patchValue(this.commonDataAdmin);
          this.roleArr.at(roleArrlength)['controls'].hasRoleEnabled.patchValue(true);
          this.roleArr.at(roleArrlength)['controls'].role.patchValue(event.target.value)
        }
        else {
          this.roleArr.at(roleArrlength).patchValue(this.commonDataAdmin);
          this.roleArr.at(roleArrlength)['controls'].hasRoleEnabled.patchValue(true);
          this.roleArr.at(roleArrlength)['controls'].role.patchValue(event.target.value)
        }
      }
    } else {
      let valueExist = this.updateUserForm.controls['roles'].value.filter(item => {
        let getActualOrgId = localStorage.getItem('org_id');
        if (item.organization_id === getActualOrgId && item.role.toLowerCase() === event.target.value.toLowerCase()) {
          return item
        }

      }
      );
      if (valueExist.length !== 0) {
        let index = this.updateUserForm.controls['roles'].value.findIndex(item => {
          let getActualOrgId = localStorage.getItem('org_id');
          if (item.organization_id === getActualOrgId && item.role.toLowerCase() === event.target.value.toLowerCase()) {
            return item
          }
        }
        );
        if (this.roleArr.at(index).value.isAlreadyExist) {
          if (this.roleArr.at(index).value.hasRoleEnabled) {
            this.roleArr.at(index)['controls'].hasRoleEnabled.patchValue(false)
          }
        } else {
          this.roleArr.removeAt(index);
        }
      }
    }
  }

  selectBan(event, form, index) {
    if (event.target.checked) {
      this.notification.isConfirmation('', '', 'User Banned', ' Are you sure to ban the user?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then((dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          let valueExist = this.updateUserForm.controls['roles'].value.filter(item => {
            let getActualOrgId = localStorage.getItem('org_id');
            if (item.organization_id === getActualOrgId && item.role.toLowerCase() === event.target.value.toLowerCase()) {
              return item
            }
          });
          if (valueExist.length !== 0) {
            let index = this.updateUserForm.controls['roles'].value.findIndex(item => {
              let getActualOrgId = localStorage.getItem('org_id');
              if (item.organization_id === getActualOrgId && item.role.toLowerCase() === event.target.value.toLowerCase()) {
                return item
              }
            });
            this.roleArr.at(index)['controls'].is_terminated.patchValue(true);
            this.roleArr.at(index)['controls'].terminated_datetime.patchValue(new Date());
          }
        } else {
          /* Do nothing */
          console.log(this.sortedRoles[index], "sortedRoles");
          event.target.checked = false;
          this.sortedRoles[index].isBanCheck = false;
        }

      }, (err) => {
        console.log(err);
      })
    } else {
      let valueExist = this.updateUserForm.controls['roles'].value.filter(item => item.role.toLowerCase() === event.target.value.toLowerCase());
      if (valueExist.length !== 0) {
        let index = this.updateUserForm.controls['roles'].value.findIndex(item => item.role.toLowerCase() === event.target.value.toLowerCase());
        if (this.roleArr.at(index)['controls'].is_terminated) {
          this.roleArr.at(index)['controls'].is_terminated.patchValue(false);
          this.roleArr.at(index)['controls'].terminated_datetime.patchValue('');
        }
      }
    }

  }


  onStateChange(event) {
    this.stateNull = false;
    if (event.name === "Select state") {
      this.updateUserForm.patchValue({
        state: null,
        state_name: '',
      })
    } else if (event.state_code) {
      this.updateUserForm.patchValue({
        state_name: event.name
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
        country_name: ''
      })
      this.updateUserForm.get('mobile_phone').enable();
      this.updateUserForm.get('mobile_phone').setValidators([Validators.pattern('^[0-9-()]*$'), Validators.minLength(10)]);
      this.updateUserForm.get('mobile_phone').updateValueAndValidity();
      this.updateUserForm.patchValue({
        mobile_phone: ''
      })
    }
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

    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    try {
      let res = await this.userService.getUserDetailsById({ 'uid': uid });
      if (res.status) {
        this.userInfo = res.data;
        setTimeout(() => {
          if (res.data) {
            if (res.data.country_code) {
              this.countryCodeList.forEach(element => {
                if (res.data.country_code === element.country_code) {
                  console.log(element);
                  this.dialCode = element.dial_code;
                  this.userInfo.country = element.name;
                }
              });
            }
            this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
            clearInterval(loaderToGetUserInfo);
            this.loading = false;
            this.displayLoader = false;
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
          this.deafulltImagePlaceholder = true;
          let name = res.data.first_name;
          let lastname = res.data.last_name;
          let initials = name.charAt(0) + "" + lastname.charAt(0);
          document.getElementById("abbreviation").innerHTML = initials;
          document.getElementById("abbreviation").style.fontSize = "40px";
          this.ProfileUrl = null;
          this.updateUserForm.patchValue({
            profile_image: null
          })
        }
        if (res.data.date_of_birth) {
          this.isDate = false;
        } else {
          this.isDate = true;
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
          this.isEmail = false;
        } else {
          this.isEmail = true;
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
          if (typeof (this.userInfo.date_of_birth) !== "string") {
            this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth.toDate()).format('MM-DD-YYYY').toString();
          } else {
            this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
          }

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

        this.updateUserForm.patchValue({
          uid: this.cookieService.getCookie('uid'),
          user_id: this.injectedData.data.user_id,
          first_name: this.userInfo.first_name,
          middle_initial: this.userInfo.middle_initial,
          last_name: this.userInfo.last_name,
          email_address: this.userInfo.email_address,
          mobile_phone: this.userInfo.mobile_phone,
          date_of_birth: this.userInfo.date_of_birth,
          suffix: this.userInfo.suffix,
          street2: this.userInfo.street2,
          street1: this.userInfo.street1,
          country_code: this.userInfo.country_code,
          country_name: this.userInfo.country,
          state_name: this.userInfo.state,
          city: this.userInfo.city,
          state: this.userInfo.state_code,
          postal_code: this.userInfo.postal_code,
        })
        if (this.userInfo.roles_by_seasons) {
          res.data.roles_by_seasons.forEach((element, index) => {
            this.roleArr.push(this.rolesInformation());
          });
          this.roleArr.patchValue(res.data.roles_by_seasons)
          this.roleArr['controls'].forEach(eachRole => {
            eachRole['controls'].isAlreadyExist.patchValue(true)
          });
        }

        // Other role
        this.commonDataAdmin.organization_id = localStorage.getItem('org_id');
        this.commonDataAdmin.organization_name = localStorage.getItem('org_name');
        this.commonDataAdmin.organization_abbrev = localStorage.getItem('org_abbrev');
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
        if (!this.userInfo.state_code) {
          this.updateUserForm.patchValue({
            state: null
          })
        }

        this.ageValidation(this.userInfo.date_of_birth);
        if (this.sortedRoles) {
          this.userInfo.roles_by_seasons.forEach((element, index) => {
            if (element.organization_id === localStorage.getItem('org_id')) {
              let selectedRole = this.sortedRoles.filter(item => item.role_id.toLowerCase() === element.role.toLowerCase());
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
            }
          });
        }
      } else {
        this.displayLoader = false;
        this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
        clearInterval(loaderToGetUserInfo);
        this.loading = false;
      }
    } catch (error) {
      console.log(error);
      this.displayLoader = false;
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      clearInterval(loaderToGetUserInfo);
      this.loading = false;
    }
  }
  ageValidation(value) {
    if (value) {
      const bdate = new Date(value);
      const timeDiff = Math.abs(Date.now() - bdate.getTime());
      let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
      console.log(age)
      if (age <= 13) {
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

  reInitialise() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
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
  async onSubmit(form) {
    try {
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
      if (form.value.date_of_birth) {
        form.value.date_of_birth = new Date(form.value.date_of_birth);
      }
      if (!form.value.date_of_birth) {
        form.value.date_of_birth = '';
      }
      if (!form.value.email_address) {
        form.value.email_address = '';
      }
      if (!form.value.mobile_phone) {
        form.value.mobile_phone = '';
      }
      this.updateUserForm.patchValue({
        organization_id: localStorage.getItem('org_id'),
        organization_name: localStorage.getItem('org_name'),
        organization_abbrev: localStorage.getItem('org_abbrev'),
      })
      this.reInitialise();
      this.loading = true;
      let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
      // delete form.value.email_address;
      form.value.roles.forEach(element => {
        delete element.isAlreadyExist
      });
      let updateUserRes: any = await this.userService.updateUser(form.value);
      if (updateUserRes.status) {
        await this.getUserList(this.injector.get('injectData'));
        this.change.emit({ action: "usergrid", data: this.getValuesToDisplay });
        this.notification.isNotification(true, "Users", updateUserRes.data, "check-square");
        this.loading = false;
        clearInterval(loaderWhileUpdate);
      }
      else {
        this.loading = false;
        this.displayLoader = false;
        clearInterval(loaderWhileUpdate);
        this.submitted = false;
        this.error = updateUserRes.updateUserRes;
      }
    } catch (error) {
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      this.loading = false;
      this.displayLoader = false;
      this.submitted = false;
      this.error = error.message;
    }

  }
  
  async getUserList(injectedData: any) {
    try {
      this.userInfo = [];
      this.getValuesToDisplay.getInjectedDataFromgrid = this.injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;
      let getUsersResponse = await this.userService.getAllUsers(injectedData.data.requestPayloadGrid);      
      if (getUsersResponse.status) {
        if (getUsersResponse.data) {
          for (let element of getUsersResponse.data) {
            if (element !== null) {
              if (element.roles && element.roles.length) {
                element['role(s)'] = element.roles.join(', ')
              } else {
                element['role(s)'] = "-"
              }
              if (element.mobile_phone) {
                element.mobile_phone = element.mobile_phone.replace(/^(\d{3})(\d{3})(\d{4}).*/, "($1) $2-$3");
              }
              if (element.suffix) {
                element['name'] = element.first_name + " " + element.middle_initial + " " + element.last_name + " " + element.suffix
              }
              else {
                element['name'] = element.first_name + " " + element.middle_initial + " " + element.last_name
              }
              this.userInfo.push(element);
            }
          }
          this.getValuesToDisplay.totalRecords = getUsersResponse.totalRecords;
          this.getValuesToDisplay.userInfo = this.userInfo;
          this.getValuesToDisplay.snapshot=getUsersResponse.snapshot.docs;          
        } else {
          this.getValuesToDisplay.totalRecords = 0;
          this.getValuesToDisplay.userInfo = [];
        }
      }
      else {
        this.getValuesToDisplay.totalRecords = 0;
        this.getValuesToDisplay.userInfo = [];
      }
    } catch (error) {
      this.getValuesToDisplay.totalRecords = 0;
      this.getValuesToDisplay.userInfo = [];
      console.log(error)
    }
  }
  closeError() {
    this.error = '';
  }
  goBack() {
    this.change.emit({ action: "usergrid", data: this.injectedData.data })
  }
}
