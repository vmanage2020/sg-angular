import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { DatePipe } from '@angular/common'
declare var $: any;
import * as moment from 'moment';
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-update-user-import-record',
  templateUrl: './update-user-import-record.component.html',
  styleUrls: ['./update-user-import-record.component.scss']
})
export class UpdateUserImportRecordComponent implements OnInit {
  @Output() change = new EventEmitter();
  updateUserImportForm: FormGroup;
  injectedData: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  error = '';
  data: any;
  stateList: any;
  state: boolean = false;
  country: boolean = false;
  submitted = false;
  countryCodeList: any;
  gender: any = [
    { name: 'Male' },
    { name: 'Female' }
  ];
  isSaveUp: boolean = false;
  emailNotReqG1: boolean = false;
  emailNotReqG2: boolean = false;
  emailValidation = new RegExp(Constant.email_validation)
  userErrorRecordInfo: any;
  levelSelect: boolean = false;
  levelList: any = [];
  uid: any;
  roleId: any;
  constructor(private dropDownService: DropdownService, public datepipe: DatePipe, private notification: NgiNotificationService, public injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.injectedData = injector.get('injectData')
    this.uid = this.cookieService.getCookie('uid');
    if ((this.cookieService.getCookie('admin'))) {
      this.roleId = Constant.admin
      this.getLevel(this.uid, this.injectedData.data.organization_id, this.roleId, this.injectedData.data.sport_id);
    }
    else if ((this.cookieService.getCookie('sysAdmin'))) {
      this.roleId = Constant.sysAdmin;
      this.getLevel(this.uid, this.injectedData.data.organization_id, this.roleId, this.injectedData.data.sport_id);
    }
    sharedService.missionAnnounced$.subscribe((data: any) => {     
      if (data.action == "organizationFilter") {
        this.sharedService.announceMission('welcome');
        this.router.navigate(['/welcome']);
      } else if (data === "userImportRouter") {
        this.change.emit({ action: "userImport" })
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('userImport');
    this.updateUserImportForm = this.formBuilder.group({
      user_id: [''],
      imported_file_id: [''],
      organization_id: [''],
      imported_log_data_id: [''],
      intelimObj: this.formBuilder.group({
        id: [''],
        player_first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        player_last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        player_initial: [''],
        player_gender: [null],
        player_DOB: ['', [Validators.required]],
        level_of_play: [''],
        level_id: [''],
        guardian1_first_name: [''],
        guardian1_last_name: [''],
        guardian1_email_address: [''],
        guardian2_first_name: [''],
        guardian2_last_name: [''],
        guardian2_email_address: [''],
        status: [''],
        processed_flag: [''],
        error_description: [''],
        address: [''],
        city: [''],
        state: [null],
        country: [null],
        postal_code: ['']
      })
    });

    this.getAllStateList()
    this.getAllCountryCodeList()
    this.getErrorRecordById()
  }
  get f() { return this.updateUserImportForm.controls; }
  ngAfterViewInit() {
    $('#datetime-datepicker').flatpickr({
      enableTime: false,
      dateFormat: "m-d-Y",
      maxDate: "today"
    });
  }

  date(event) {
    console.log(event);

  }
  async getLevel(uid, orgId, roleId, sportId) {

    this.levelSelect = true;

    let getLevelDropdownRequest: any = {
      'auth_uid': uid, 'role_id': roleId, 'sport_id': sportId, 'organization_id': orgId
    }
    let getLevelDropdownResponse: any = await this.dropDownService.getLevelDropdown(getLevelDropdownRequest);
    console.log(getLevelDropdownResponse);

    try {
      if (getLevelDropdownResponse.status) {
        this.levelSelect = false;
        if (getLevelDropdownResponse.message != 0) {
          if (typeof (getLevelDropdownResponse.message) !== "string") {
            getLevelDropdownResponse.message.forEach(element => {
              if (element.alternate_level_name) {
                element.level_name = element.alternate_level_name
              }
            });
            this.levelList = getLevelDropdownResponse.message;
            if (this.userErrorRecordInfo) {
              if (this.levelList.length !== 0) {
                let levelexist = this.levelList.filter(lvl => lvl.level_name === this.userErrorRecordInfo.level_of_play);
                if (levelexist.length !== 0) {
                  this.updateUserImportForm.controls.intelimObj['controls'].level_of_play.patchValue(levelexist[0].level_name);
                  this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue(levelexist[0].level_id);
                } else {
                  this.updateUserImportForm.controls.intelimObj['controls'].level_of_play.patchValue('');
                  this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue('');
                }
              } else {
                this.updateUserImportForm.controls.intelimObj['controls'].level_of_play.patchValue('');
                this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue('');
              }
            }
          }
          else {
            this.levelList = [];
            this.levelSelect = false;
          }
        }
        else {
          this.levelList = [];
          this.levelSelect = false;
        }
      } else {
        this.levelList = [];
        this.levelSelect = false;
      }
    }
    catch (error) {
      console.log(error);
      this.levelList = [];
      this.levelSelect = false;
    }
  }
  async getAllStateList() {
    this.state = true;
    let getAllStateResponse: any = await this.dropDownService.getAllStates();
    try {
      if (getAllStateResponse.status) {
        this.stateList = getAllStateResponse.data;
        this.state = false;
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
        this.countryCodeList = getAllCountryResponse.data;
        this.country = false;
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
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  getErrorRecordById() {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    this.dataService.postData(apiURL.GET_USERIMPORT_ERROR_RECORD, { 'user_id': this.injectedData.data.user_id, 'organization_id': this.injectedData.data.organization_id, 'imported_file_id': this.injectedData.data.imported_file_id, 'imported_log_data_id': this.injectedData.data.id }, localStorage.getItem('token')).toPromise().then(res => {
      try {
        if (res.status) {         
          this.userErrorRecordInfo = res.data
          this.updateUserImportForm.patchValue({
            user_id: this.injectedData.data.user_id,
            imported_file_id: this.injectedData.data.imported_file_id,
            organization_id: this.injectedData.data.organization_id,
            imported_log_data_id: res.data.id,
          })
          this.updateUserImportForm.controls.intelimObj.patchValue(res.data);
          if (res.data.player_DOB) {
            if (typeof (res.data.player_DOB) !== "string") {
              res.data.player_DOB = moment(res.data.player_DOB).format('MM-DD-YYYY').toString();
            } else {
              res.data.player_DOB = moment(res.data.player_DOB).format('MM-DD-YYYY').toString();
            }

          }
          this.updateUserImportForm.controls.intelimObj['controls'].player_DOB.patchValue(res.data.player_DOB)
          if (res.data.error_description.length !== 0 && typeof (res.data.error_description) !== "string") {
            this.submitted = true;
            res.data.error_description.forEach(element => {
              if (element.property_name === "player_DOB") {
                if (element.is_required) {
                  this.updateUserImportForm.controls.intelimObj['controls'].player_DOB.patchValue('')
                }
              }
              let formKey = Object.keys(this.updateUserImportForm.controls.intelimObj['controls'])
              let filterObj = element.property_name
              let filterObjValue = formKey.filter(item => item === filterObj)
              if (filterObjValue.length !== 0) {
                if (element.is_required) {
                  this.updateUserImportForm.get('intelimObj').get(filterObjValue).setValidators([Validators.required]);
                  this.updateUserImportForm.get('intelimObj').get(filterObjValue).updateValueAndValidity();
                }
                else {
                  this.updateUserImportForm.get('intelimObj').get(filterObjValue).setValidators(null);
                  this.updateUserImportForm.get('intelimObj').get(filterObjValue).updateValueAndValidity();
                }
              }
              else {
                this.error = Constant.unhandleError_update_userImport;
                this.isSaveUp = true;
              }
            });
          }
          if (res.data.guardian1_email_address) {
            this.emailNotReqG2 = false;
            this.emailNotReqG1 = true;
            this.updateUserImportForm.controls.intelimObj['controls'].guardian1_email_address.setValidators([Validators.required, Validators.pattern(this.emailValidation)]);
            this.updateUserImportForm.controls.intelimObj['controls'].guardian2_email_address.setValidators([Validators.pattern(this.emailValidation)])
            this.updateUserImportForm.controls.intelimObj['controls'].guardian1_email_address.updateValueAndValidity();
            this.updateUserImportForm.controls.intelimObj['controls'].guardian2_email_address.updateValueAndValidity();
          }
          else if (res.data.guardian2_email_address) {
            this.emailNotReqG2 = true;
            this.emailNotReqG1 = false;
            this.updateUserImportForm.controls.intelimObj['controls'].guardian2_email_address.setValidators([Validators.required, Validators.pattern(this.emailValidation)]);
            this.updateUserImportForm.controls.intelimObj['controls'].guardian1_email_address.setValidators([Validators.pattern(this.emailValidation)])
            this.updateUserImportForm.controls.intelimObj['controls'].guardian1_email_address.updateValueAndValidity();
            this.updateUserImportForm.controls.intelimObj['controls'].guardian2_email_address.updateValueAndValidity();
          }
          else if (!res.data.guardian1_email_address && !res.data.guardian2_email_address) {
            this.emailNotReqG2 = false;
            this.emailNotReqG1 = true;
            this.updateUserImportForm.controls.intelimObj['controls'].guardian1_email_address.setValidators([Validators.required, Validators.pattern(this.emailValidation)]);
            this.updateUserImportForm.controls.intelimObj['controls'].guardian2_email_address.setValidators(Validators.pattern(this.emailValidation));
            this.updateUserImportForm.controls.intelimObj['controls'].guardian1_email_address.updateValueAndValidity();
            this.updateUserImportForm.controls.intelimObj['controls'].guardian2_email_address.updateValueAndValidity();
          }
          if (this.levelList) {
            if (this.levelList.length !== 0) {
              let levelexist = this.levelList.filter(lvl => lvl.level_name === this.userErrorRecordInfo.level_of_play);
              if (levelexist.length !== 0) {
                this.updateUserImportForm.controls.intelimObj['controls'].level_of_play.patchValue(levelexist[0].level_name);
                this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue(levelexist[0].level_id);
              } else {
                this.updateUserImportForm.controls.intelimObj['controls'].level_of_play.patchValue('');
                this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue('');
              }
            } else {
              this.updateUserImportForm.controls.intelimObj['controls'].level_of_play.patchValue('');
              this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue('');
            }
          }
          this.afterLoading(loaderToGetUserInfo);    
        }
        else {
          this.userErrorRecordInfo = [];
          this.afterLoading(loaderToGetUserInfo);
        }
      } catch (error) {
        console.log(error);
        this.afterLoading(loaderToGetUserInfo);
      }

    }).catch(error => {
      console.log(error);
    })
  }
  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  selectedLevel(event) {
    if (event) {
      this.updateUserImportForm.controls.intelimObj['controls'].level_id.patchValue(event.level_id);
    }
  }
  closeError() {
    this.error = '';
  }
  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 100);
    }
  }
  onSubmit(form) {
    this.submitted = true;
    console.log(form)
    if (form.invalid) {
      return
    }
    form.controls.intelimObj['controls'].processed_flag.patchValue("N");
    form.value.intelimObj.player_DOB = new Date(form.value.intelimObj.player_DOB);
    form.value.intelimObj.error_description = [];
    
    console.log(form.value);
    return;
    
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    this.dataService.postData(apiURL.UPDATE_ERROR_RECORD, form.value, localStorage.getItem('token')).subscribe(res => {
      try {
        if (res.status) {
          this.injectedData.data.viewBy = "Error";
          this.afterSavingData(loaderWhileUpdate);          
          this.change.emit({ action: "errorUserImport", data: this.injectedData.data })
          this.notification.isNotification(true, "Import Users", res.message, "check-square");
        }
        else {
          this.submitted = false;
          this.afterSavingData(loaderWhileUpdate);
          this.reInitialise();
          this.error = res.message;
        }
      } catch (error) {
        console.log(error);
        this.afterSavingData(loaderWhileUpdate);
        this.reInitialise();
      }
    })
  }
  afterSavingData(loaderForCreate?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  goBack() {
    this.injectedData.data.viewBy = "Error";
    this.change.emit({ action: "errorUserImport", data: this.injectedData.data })
  }
}
