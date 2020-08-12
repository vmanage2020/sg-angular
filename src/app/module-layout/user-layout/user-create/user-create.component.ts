import { Component, OnInit, EventEmitter, Output, Injector, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
declare var $: any;
import { apiURL, Constant } from '../../../core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { UserService } from '../user-service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  // For grid value
  getValuesToDisplay: any = {};
  userInfo: any = [];
  submitted = false;
  error = '';
  isSaveUp: any = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  stateList: any;
  roleList: any;
  orgList: any;
  roleSelect = false;
  parentList: any;
  roleIdValid = false;
  guardianIdValid = false;
  parentField = false;
  emailNotReq = false
  dialCode = null;
  emailCheck: any;
  guardian = false;
  uid: any;
  userExist = false;
  isUserExist = false
  userNotExist = false
  useExistG1 = false
  createNewG1 = false
  useExistG2 = false
  createNewG2 = false
  countryCodeList: any;
  isOrgSelect = false;
  saves: boolean = false;
  allSports: any = [];
  suffixList: any = [
    { name: "Select suffix" },
    { name: 'Sr' },
    { name: 'Jr' },
    { name: 'II' },
    { name: 'III' },
    { name: 'IV' },
    { name: 'V' }

  ]
  stateSelect: any;
  roleListToPatch: any = [];
  showSelect: boolean = false;
  sportSelect: boolean = false;
  countryCodeSelect: any;
  userExistLoader: boolean = false
  role: any;
  stateNull: boolean = false;
  countryNull: boolean = false;
  createUserForm: FormGroup;
  data: any;
  orgId: any;
  seasonSelect: boolean = false;
  isOrgIdOne: boolean = false;
  seasonList: any = [];
  productDetViewInitiatorIdentity: string = this.dataService.randomCodeGenerator();
  emailVaildation = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  constructor(private injector: Injector, private dropDownService: DropdownService, private notification: NgiNotificationService, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService, public userService: UserService) {
    this.uid = this.cookieService.getCookie('uid');    
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "userRouter") {
          this.change.emit({ action: "usergrid" })
        }
      }
    })
  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "create";    
    this.sharedService.announceMission('user');
    this.orgId = localStorage.getItem('org_id');
    if (this.orgId === Constant.organization_id) {
      this.isOrgIdOne = true;
    } else {
      this.isOrgIdOne = false;
    }
    this.getRoleList();
    this.createUserForm = this.formBuilder.group({
      uid: [''],
      first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3),]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.pattern(this.emailVaildation)]],
      date_of_birth: [''],
      suffix: [null],
      roles: ['', [Validators.required]],
      organization_id: [''],
      organization_name: [''],
      organization_abbrev: [''],
      mobile_phone: ['', [Validators.pattern('^[0-9-()]*$')]],
      city: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      country_code: [''],
      postal_code: ['', [Validators.pattern('^[0-9]*$')]],
      state: ['', [Validators.pattern('^[a-zA-Z0-9- ]*$')]],
      street2: ['', [Validators.pattern('^[a-zA-Z0-9- ]*$')]],
      street1: ['', [Validators.pattern('^[a-zA-Z0-9- ]*$')]]
    });

  }
  get f() { return this.createUserForm.controls; }

  onSuffixChange(event: any) {
    if (event.name === "Select suffix") {
      this.createUserForm.patchValue({
        suffix: null
      })
    }
  }

  selectedRole(event, form) {
    try {
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
    }
    catch (error) {
      console.log(error)
    }

  }

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.createUserForm.patchValue({
        sport_name: event.name,
      })
    }
  }
  saveNew(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
    this.saves = false;
  }
  save(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
    this.saves = true;
  }


  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "role") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Loading" });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: "Creating" });
    }
  }


  async getRoleList() {
    this.loading = true;
    let loaderToGetRoles = setInterval(this.timerFunction, 100, this.loaderInfo, "role");
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
      }
      else {
        this.roleList = [];
      }
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      this.loading = false;
      clearInterval(loaderToGetRoles);
      this.displayLoader = false;
    } catch (error) {
      console.log(error);
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      this.loading = false;
      clearInterval(loaderToGetRoles);
      this.displayLoader = false;
    }
  }

  reInitialise() {
    this.displayLoader = true;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  async onSubmit(form) {
    this.closeError();
    if (!this.orgId) {
      this.sharedService.announceMission('selectOrganization');
      return;
    }
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    this.createUserForm.patchValue({
      organization_id: localStorage.getItem('org_id'),
      organization_name: localStorage.getItem('org_name'),
      organization_abbrev: localStorage.getItem('org_abbrev'),
      uid: this.uid
    })
    form.value.email = form.value.email.toLowerCase();
    this.displayLoader = true;
    this.loading = true;
    this.reInitialise();
    console.log(form.value);
    
    let loaderWhileSaving = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    try {
      let createUserResult: any = await this.userService.createUser(form.value);
      if (createUserResult.status) {
        if (this.saves) {
         await this.getUserList(this.injector.get('injectData'));
          this.change.emit({ action: "usergrid" , data:this.getValuesToDisplay})
          this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
          clearInterval(loaderWhileSaving);
          this.loading = false;
          this.notification.isNotification(true, "Users", createUserResult.data, "check-square");
        }
        else {        
          this.checkboxes.forEach((element) => {
            element.nativeElement.checked = false;
          });            
          this.showSelect = false;
          // this.roleList = [];
          this.roleListToPatch = [];
          form.reset();
          this.submitted = false;
          this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
          clearInterval(loaderWhileSaving);
          this.reInitialise();
          this.loading = false;
          this.displayLoader = false;
          // this.getRoleList();
          this.notification.isNotification(true, "Users", createUserResult.data, "check-square");
        }
      } else {
        this.displayLoader = false;
        this.submitted = false;
        clearInterval(loaderWhileSaving);
        this.loading = false;
        this.error = createUserResult.error;

      }
    } catch (error) {
      console.log(error);
      this.displayLoader = false;
      this.submitted = false;
      this.loading = false;
      this.error = error.message;
      clearInterval(loaderWhileSaving);
    }
  }
  closeError() {
    this.error = ''
  }

  goBack() {
    this.change.emit({ action: "usergrid" })
  }
  async getUserList(injectedData: any) {
    try {
      this.userInfo = [];
      this.getValuesToDisplay.requestData = injectedData.data;
      let getUsersResponse = await this.userService.getAllUsers(injectedData.data);
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
              if (element.is_signup_completed !== null)
              {
                if(element.is_signup_completed)
                {
                  element['status'] = 'Registered'
                }
                else{
                  element['status'] = 'Pending'
                }
              }
              else{
                element['status'] = 'Pending'
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
}
