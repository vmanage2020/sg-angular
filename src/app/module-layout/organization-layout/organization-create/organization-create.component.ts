import { Component, OnInit, EventEmitter, Output, ElementRef } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import * as moment from 'moment';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { UPLOADCONFIG } from '../../../core/services/upload.config'
import { Upload } from '../../../core/services/upload';
import * as _ from "lodash";
import { UploadService } from 'src/app/core/services/upload.service';
import { AngularFireDatabase } from '@angular/fire/database';
declare var $: any;
import * as firebase from 'firebase';
import { NgiNotificationService } from 'ngi-notification';

import { apiURL, Constant } from '../../../core/services/config';
import { ViewChild } from '@angular/core';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { OrganizationCrudService } from '../organization-crud.service';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss'],
  providers: [AngularFireStorage, UploadService, AngularFireDatabase]

})
export class OrganizationCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  @ViewChild('fileUploader', { static: false }) fileUploader: ElementRef;

  error = '';
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  isSaveUp: any = false;
  isSaveUpEnable: boolean = false
  isSaveDown: any = false;
  fileExist: boolean = false;
  breadCrumbItems: Array<{}>;
  stateGoverningDropdown = false;
  nationalGoverningDropdown = false;
  dialCode = null;
  orgCreateForm: FormGroup;
  sportsInfo: any;
  submitted = false;
  sports: any;
  default = false
  nationalList = false;
  stateList = false;
  stateSelect: any;
  countryCodeSelect: any;
  stateOrgInfo: any[] = [];
  nationalOrgInfo: any;
  stateNull = false;
  countryNull = false;
  stateGoverningState = false;
  nationalGoverningState = false;
  uid: any;
  sportIdValid = false;
  selectedImage: any = null;
  imgSrc = "../../../../assets/image_placeholder.jpg"
  imgCompare = "../../../../assets/image_placeholder.jpg"
  imageUpload = false
  imgSize: any;
  currentUpload: Upload;
  deafulltImagePlaceholder: boolean = true;
  basePath: string = '/uploads';
  suffixList: any = [
    { name: 'Select suffix' },
    { name: 'Sr' },
    { name: 'Jr' },
    { name: 'II' },
    { name: 'III' },
    { name: 'IV' },
    { name: 'V' },

  ];
  errors = '';
  config: any = UPLOADCONFIG[0];
  imageSize = false;
  imageType = false;
  progress: any;
  url: string;
  uploadedimg: any;
  websiteValidation = new RegExp(Constant.websiteValidation);
  secondaryContactRequired: boolean = false;
  state: boolean = false;
  country: boolean = false;
  sport: boolean = false;
  stateGoverning: boolean = false;
  nationalGoverning: boolean = false;
  data: any;
  showErrorInArr: any = [];
  productDetViewInitiatorIdentity: string = this.dataServices.randomCodeGenerator();
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  constructor(private organizationService: OrganizationCrudService, private dropDownService: DropdownService, private notification: NgiNotificationService, public upSvc: UploadService, private storage: AngularFireStorage, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataServices: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "organizationRouter") {
          this.change.emit({ action: "organizationgrid" })
        }
      }
    })
  }

  ngOnInit() {
    this.displayLoader = false;
    this.getstateInfo();
    this.getCountryCodeList();
    this.sharedService.announceMission('organization');
    localStorage.setItem('uploadedImg', null);
    this.orgCreateForm = this.formBuilder.group({
      uid: [''],
      name: ['', [Validators.required]],
      abbrev: ['', [Validators.required, Validators.maxLength(6), Validators.pattern('^[a-zA-Z]*$')]],
      street1: ['', [Validators.required]],
      street2: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      state: [null, [Validators.required]],
      state_name: [''],
      postal_code: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9 ]*$')]],
      country_code: [null, [Validators.required]],
      country_name: [''],
      phone: ['', Validators.compose([
        Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10)
      ])],
      fax: ['', [Validators.pattern('^[0-9-()]*$'), , Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.pattern(this.regexp)]],
      website: ['', [Validators.pattern("^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$")]],
      governing_body_info: this.formBuilder.array([this.getGoverningInfo()]),
      primary_first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      primary_middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3)]],
      primary_last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      primary_admin_email: ['', [Validators.required, Validators.pattern(this.regexp)]],
      primary_suffix: [null],
      sports: ['', [Validators.required]],
      avatar: [null],
      secondary_first_name: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      secondary_middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3)]],
      secondary_last_name: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      secondary_admin_email: ['', [Validators.pattern(this.regexp)]],
      secondary_suffix: [null],
    });

    this.orgCreateForm.patchValue({
      uid: this.uid
    })
  }
  getGoverningInfo() {
    return this.formBuilder.group({
      sport_id: [''],
      sport_name: [''],
      is_used: false,
      is_national_governing_organization: ['', [Validators.required]],
      national_governing_organization_id: [null],
      is_state_governing_organization: ['', [Validators.required]],
      state_governing_organization_id: [null],
      state_governing_organization_name: [''],
      national_governing_organization_name: [''],
      is_state_visible: [true],
      is_national_visible: [true],
      is_select_dropdown_for_state: [false],
      is_hypen_for_state: [false],
      is_select_dropdown_for_national: [false],
      is_hypen_for_national: [false],
      is_national_true: [''],
      is_national_false: [''],
      is_state_true: [''],
      is_state_false: [''],
      lov_for_state: [''],
      lov_for_national: ['']
    })
  }
  randomGenerator(): string {
    return Math.floor(Math.random() * 100) + 2 + "" + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5));
  }
  get governingBodyArr() {
    return this.orgCreateForm.get('governing_body_info') as FormArray;
  }
  ngAfterViewInit() {
    this.governingBodyArr.removeAt(0);
    // window.scrollTo(0,document.body.scrollHeight);
  }

  removeFile(event) {
    this.fileUploader.nativeElement.value = "";
    this.deafulltImagePlaceholder = true;
    this.imgSrc = this.imgCompare;
    localStorage.setItem('uploadedImg', null);
    this.fileExist = false;
  }

  get f() { return this.orgCreateForm.controls; }
  async getstateInfo() {
    this.state = true;
    let getAllStateResponse: any = await this.dropDownService.getAllStates();
    try {
      if (getAllStateResponse.status) {
        this.stateSelect = getAllStateResponse.data;
        this.state = false;
      }
      else {
        this.stateSelect = [];
        this.state = false;
      }
    } catch (error) {
      console.log(error);
      this.stateSelect = [];
      this.state = false;
    }
  }
  async getCountryCodeList() {
    this.country = true;
    let getAllCountryResponse: any = await this.dropDownService.getAllCountry();
    try {
      if (getAllCountryResponse.status) {
        this.countryCodeSelect = getAllCountryResponse.data;
        this.country = false;
      }
      else {
        this.countryCodeSelect = [];
        this.country = false;
      }
    } catch (error) {
      console.log(error);
      this.countryCodeSelect = [];
      this.country = false;
    }
  }

  onSuffixChangePrimary(event: any) {
    if (event.name === "Select suffix") {
      this.orgCreateForm.patchValue({
        primary_suffix: null
      })
    }
  }
  onSuffixChangeSecondary(event: any) {
    if (event.name === "Select suffix") {
      this.orgCreateForm.patchValue({
        secondary_suffix: null
      })
    }
  }

  secondaryContactReqCheck(event, formdata, errorValue) {

    if (this.showErrorInArr && this.showErrorInArr.length !== 0) {
      if (this.showErrorInArr[0].includes(errorValue.trim())) {
        this.showErrorInArr = [];
      }
    }
    if (formdata.secondary_first_name || formdata.secondary_last_name || formdata.secondary_admin_email) {
      this.secondaryContactRequired = true;
      this.orgCreateForm.controls["secondary_first_name"].setValidators([Validators.required]);
      this.orgCreateForm.controls["secondary_first_name"].updateValueAndValidity();
      this.orgCreateForm.controls["secondary_last_name"].setValidators([Validators.required]);
      this.orgCreateForm.controls["secondary_last_name"].updateValueAndValidity();
      this.orgCreateForm.controls["secondary_admin_email"].setValidators([Validators.required]);
      this.orgCreateForm.controls["secondary_admin_email"].updateValueAndValidity();
    } else {
      this.secondaryContactRequired = false;
      this.orgCreateForm.controls["secondary_first_name"].setValidators(null);
      this.orgCreateForm.controls["secondary_first_name"].updateValueAndValidity();
      this.orgCreateForm.controls["secondary_last_name"].setValidators(null);
      this.orgCreateForm.controls["secondary_last_name"].updateValueAndValidity();
      this.orgCreateForm.controls["secondary_admin_email"].setValidators(null);
      this.orgCreateForm.controls["secondary_admin_email"].updateValueAndValidity();
    }
  }

  async getAllSports(uid) {
    this.sport = true;
    try {
      if (this.orgCreateForm.value.country_code) {
        let allSportResponse: any = await this.dropDownService.getAllSportsGeneral({ 'uid': uid, 'country_code': this.orgCreateForm.value.country_code });
        if (allSportResponse.status) {
          this.sportsInfo = allSportResponse.data;
          this.sport = false;
        } else {
          this.sportsInfo = [];
          this.sport = false;
        }
      } else {
        this.sportsInfo = [];
        this.sport = false;
      }

    } catch (error) {
      console.log(error);
      this.sportsInfo = [];
      this.sport = false;
    }
  }



  getstateList(event: any, form, rowIndex: any) {
    try {
      if (event.target.value === "false") {
        this.governingBodyArr.at(rowIndex).patchValue({
          is_select_dropdown_for_state: true,
          is_hypen_for_state: false,
          state_governing_organization_id: null,
          state_governing_organization_name: '',
        })
      }
      else {
        this.governingBodyArr.at(rowIndex).patchValue({
          is_select_dropdown_for_state: false,
          is_hypen_for_state: true,
          state_governing_organization_id: null,
          state_governing_organization_name: '',
        })
      }
    }
    catch (error) {
      console.log(error)
    }
  }
  async getnationalList(event: any, form, rowIndex: any, individualObject: any) {
    try {
      if (event.target.value === "false") {
        this.governingBodyArr.at(rowIndex).patchValue({
          is_select_dropdown_for_national: true,
          is_hypen_for_national: false,
          national_governing_organization_name: '',
          national_governing_organization_id: null
        })
      }
      else {
        this.governingBodyArr.at(rowIndex).patchValue({
          is_select_dropdown_for_national: false,
          is_hypen_for_national: true,
          national_governing_organization_name: '',
          national_governing_organization_id: null
        })
      }
      console.log(this.governingBodyArr);
    }
    catch (error) {
      console.log(error)
    }
  }

  onStateChange(event, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        form.controls.state.markAsTouched();
      }
    }
    if (event.state_code) {
      this.showErrorInArr = [];
      this.isSaveInWhichPosition();
      form.patchValue({
        state_name: event.name,
      })
      if (this.governingBodyArr.value.length !== 0) {
        this.governingBodyArr.value.forEach((eachGoverningBody: any, index: any) => {
          if (eachGoverningBody.is_state_governing_organization === "false") {
            this.governingBodyArr.at(index).patchValue({
              state_governing_organization_id: null,
              state_governing_organization_name: '',
              lov_for_state: '',
            })
          } else {
            this.governingBodyArr.at(index).patchValue({
              lov_for_state: '',
            })
          }
          this.getServiceForState(event.state_code, form.value.country_code, eachGoverningBody.sport_id)
        });
      }
    }
  }
  onNationalChange(event, form) {
    if (event.country_code) {
      this.showErrorInArr = [];
      this.isSaveInWhichPosition();
      form.controls.state.markAsUntouched();
      form.controls.sports.markAsUntouched();
      this.dialCode = event.dial_code;
      form.patchValue({
        country_name: event.name,
        sports: null,
        state_name: '',
        state_code: null
      })
      this.governingBodyArr.reset();
      this.getAllSports(this.uid);
      console.log(form);

    } else {
      this.dialCode = null
    }
  }
  OnSportChange(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      this.isSaveInWhichPosition();
      event.forEach((sportInfo: any) => {
        let isSportExist = this.orgCreateForm.controls['governing_body_info'].value.filter(item => item.sport_id === sportInfo.sport_id);
        if (isSportExist.length !== 0) {

        } else {
          this.governingBodyArr.push(this.getGoverningInfo());
          this.governingBodyArr.at(this.orgCreateForm.controls['governing_body_info'].value.length - 1).patchValue({
            sport_name: sportInfo.name,
            sport_id: sportInfo.sport_id,
            is_national_true: this.randomGenerator() + true,
            is_state_true: this.randomGenerator() + true,
            is_national_false: this.randomGenerator() + false,
            is_state_false: this.randomGenerator() + false,
          })
          this.getServiceForNational(form.value.country_code, sportInfo.sport_id);
          this.getServiceForState(form.value.state, form.value.country_code, sportInfo.sport_id)
        }
      });
      if (this.orgCreateForm.controls['governing_body_info'].value.length !== event.length) {
        if (this.orgCreateForm.controls['governing_body_info'].value) {
          this.orgCreateForm.controls['governing_body_info'].value.forEach((formValue: any, index) => {
            let removeGoverningBody = event.filter(eachSport => eachSport.sport_id === formValue.sport_id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.governingBodyArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {
      this.governingBodyArr.removeAt(0);
      form.patchValue({
        sports: ''
      })
    }
  }

  saveDown() {
    this.isSaveDown = true;
    this.isSaveUp = false;
    this.isSaveUpEnable = false
  }
  saveUp() {
    this.isSaveUp = true;
    this.isSaveDown = false;
    this.isSaveUpEnable = true
  }

  closeErrors(errorValue) {
    this.isSaveInWhichPosition();
    if (this.showErrorInArr && this.showErrorInArr.length !== 0) {
      if (this.showErrorInArr[0].includes(errorValue.trim())) {
        this.showErrorInArr = [];
      }
    }
  }

  close(alert: any, alertData: any[]) {
    this.isSaveInWhichPosition();
    alertData.splice(alertData.indexOf(alert), 1);
  }

  isSaveInWhichPosition() {
    if (this.isSaveUp) {
      this.isSaveUp = false
    } else if (this.isSaveDown) {
      this.isSaveDown = false
    }
  }

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }

  async onSubmit(form) {
    this.uploadedimg = localStorage.getItem('uploadedImg');
    form.value.avatar = this.uploadedimg
    this.submitted = true;
    form.value.email = form.value.email.toLowerCase()
    form.value.primary_admin_email = form.value.primary_admin_email.toLowerCase()
    form.value.secondary_admin_email = form.value.secondary_admin_email.toLowerCase()
    let length: any = 0
    if (form.invalid) {
      this.showErrorInArr = [];
      Object.keys(form.controls).forEach(async (key) => {
        if (form.controls[key].status === "INVALID" && length === 0) {
          length += 1;
          this.getWhichInputMissing(key, form);
        }
      });

      if (this.isSaveDown) {
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
        }, 100);
      }
      return;
    }

    form.value.governing_body_info.forEach(element => {
      delete element.is_state_visible
      delete element.is_national_visible
      delete element.is_select_dropdown_for_state
      delete element.is_hypen_for_state
      delete element.is_select_dropdown_for_national
      delete element.is_hypen_for_national
      delete element.is_national_true
      delete element.is_national_false
      delete element.is_state_true
      delete element.is_state_false
      delete element.lov_for_state
      delete element.lov_for_national
    });
    this.displayLoader = true;
    this.loading = true;
    let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
    let createOrganizationObj: any = await this.organizationService.createOrganization(form.value);
    try {
      if (createOrganizationObj.status) {
        this.afterSavingData(loaderForCreate);
        this.sharedService.announceMission('updateOrganizationList');
        this.change.emit({ action: "organizationgrid" })
        this.notification.isNotification(true, "Organizations", createOrganizationObj.message, "check-square");
      } else {
        this.errors = createOrganizationObj.message;
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
      }
    } catch (error) {
      console.log(error);
      this.errors = error.message;
      this.afterSavingData(loaderForCreate);
      this.reInitialise();
    }
  }

  afterSavingData(loaderForCreate?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  getWhichInputMissing(keyName: any, form) {
    switch (keyName.trim()) {
      case "name":
        this.showErrorInArr.push("Organization Name is required.")
        break;
      case "abbrev":
        this.showErrorInArr.push("Abbreviation is required.")
        break;
      case "street1":
        this.showErrorInArr.push("Street 1 is required.")
        break;
      case "city":
        this.showErrorInArr.push("City is required.")
        break;
      case "state":
        this.showErrorInArr.push("Select State.")
        break;
      case "postal_code":
        this.showErrorInArr.push("Postal Code is required.")
        break;
      case "country_code":
        this.showErrorInArr.push("Select Country.")
        break;
      case "phone":
        this.showErrorInArr.push("Phone number is required.")
        break;
      case "email":
        this.showErrorInArr.push("Email Address is required.")
        break;
      case "primary_first_name":
      case "secondary_first_name":
        this.showErrorInArr.push("First Name is required.")
        break;
      case "primary_last_name":
      case "secondary_last_name":
        this.showErrorInArr.push("Last Name is required.")
        break;
      case "primary_admin_email":
      case "secondary_admin_email":
        this.showErrorInArr.push("Email address is required.")
        break;
      case "sports":
        this.showErrorInArr.push("Select Sport.")
        break;

      case "governing_body_info":
        let length: any = 0
        Object.keys(this.governingBodyArr.controls).forEach(key => {
          Object.keys(this.governingBodyArr.controls[key].controls).forEach(keyValue => {
            if (this.governingBodyArr.controls[key].controls[keyValue].status === "INVALID" && length === 0) {
              length += 1;
              this.getFromArrayValidationMessage(keyValue)
            };
          });
        })
        break;
      default:
        this.showErrorInArr.push("Some required field is unfilled.Kindly check!")
        break;
    }
  }
  getFromArrayValidationMessage(formArrayKeyName: any) {
    switch (formArrayKeyName.trim()) {
      case "is_national_governing_organization":
        this.showErrorInArr.push("Choose Is National Governing Body.")
        break;
      case "is_state_governing_organization":
        this.showErrorInArr.push("Choose Is State Governing Body.")
        break;
      default:
        this.showErrorInArr.push("Some governing body information is missed.")
        break;
    }
  }

  nationalDropdown(event, form, rowIndex: any) {
    if (event.organization_id) {
      this.governingBodyArr.at(rowIndex).patchValue({
        national_governing_organization_name: event.name
      })
    }
    else {
      this.governingBodyArr.at(rowIndex).patchValue({
        national_governing_organization_id: null,
        national_governing_organization_name: ''
      })
    }
  }
  stateDropdown(event, form, rowIndex) {
    if (event.organization_id) {
      this.governingBodyArr.at(rowIndex).patchValue({
        state_governing_organization_name: event.name
      })
    }
    else {
      this.governingBodyArr.at(rowIndex).patchValue({
        state_governing_organization_id: null,
        state_governing_organization_name: ''
      })
    }
  }


  async getServiceForNational(country_code, sportId) {
    this.nationalGoverning = true;
    let getNationalGoverningDropdownRequest: any = {
      "country": country_code,
      "sport_id": sportId
    }
    let getNationalGoverningDropdownResponse: any = await this.dropDownService.getAllNationalGoverningBody(getNationalGoverningDropdownRequest);
    try {
      if (getNationalGoverningDropdownResponse.status) {
        if (getNationalGoverningDropdownResponse.data && getNationalGoverningDropdownResponse.data.length !== 0) {
          getNationalGoverningDropdownResponse.data.splice(0, 0, { organization_id: '', name: 'Select national governing body organization' });
          this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
            if (eachGoverningBody.sport_id === sportId) {
              this.governingBodyArr.at(index).patchValue({
                lov_for_national: getNationalGoverningDropdownResponse.data
              })
            }
          });
          this.nationalGoverning = false;
        } else {
          this.isNationalDropdownEmpty(sportId);
        }
      } else {
        this.isNationalDropdownEmpty(sportId);
      }
    } catch (error) {
      console.log(error);
      this.isNationalDropdownEmpty(sportId);
    }
  }
  isNationalDropdownEmpty(sportId: any) {
    this.nationalOrgInfo = [];
    this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
      if (eachGoverningBody.sport_id === sportId) {
        this.governingBodyArr.at(index).patchValue({
          lov_for_national: '',
          national_governing_organization_id: null,
          national_governing_organization_name: ''
        })
      }
    });
    this.nationalGoverning = false;
  }

  async getServiceForState(state, country_code, sportId) {
    this.stateGoverning = true;
    let getStateGoverningDropdownRequest: any = {
      "state": state, "country": country_code, "sport_id": sportId
    }
    let getStateGoverningDropdownResponse: any = await this.dropDownService.getAllStateGoverningBody(getStateGoverningDropdownRequest);
    console.log(getStateGoverningDropdownResponse);

    try {
      if (getStateGoverningDropdownResponse.status) {
        if (getStateGoverningDropdownResponse.data && getStateGoverningDropdownResponse.data.length !== 0) {
          getStateGoverningDropdownResponse.data.splice(0, 0, { organization_id: '', name: 'Select state governing body organization' });
          this.stateGoverning = false;
          this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
            if (eachGoverningBody.sport_id === sportId) {
              this.governingBodyArr.at(index).patchValue({
                lov_for_state: getStateGoverningDropdownResponse.data
              })
            }
          });
        } else {
          this.isStateDropdownEmpty(sportId)
        }
      } else {
        this.isStateDropdownEmpty(sportId)
      }
    } catch (error) {
      console.log(error);
      this.isStateDropdownEmpty(sportId)
    }
  }
  isStateDropdownEmpty(sportId: any) {
    this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
      if (eachGoverningBody.sport_id === sportId) {
        this.governingBodyArr.at(index).patchValue({
          lov_for_state: '',
          state_governing_organization_id: null,
          state_governing_organization_name: ''
        })
      }
    });
    this.stateGoverning = false;
  }


  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.deafulltImagePlaceholder = false;
      this.imageUpload = false;
      if (this.extensionValidation(event.target.files[0])) {
        this.imageType = false
        if (this.maxsizeValidation(event.target.files[0])) {
          this.imageSize = false;
          const reader = new FileReader();
          reader.onload = (e: any) => this.imgSrc = e.target.result;
          reader.readAsDataURL(event.target.files[0]);
          this.selectedImage = event.target.files[0];
          this.fileExist = true;
          let storageRef = firebase.storage().ref();
          let uploadTask = storageRef.child(`${this.basePath}/${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${this.uid}_${new Date().getTime()}`).put(this.selectedImage);

          uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
              // upload in progress
              this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            },
            (error) => {
              // upload failed
              console.log(error)
            },
            () => {
              // upload success
              uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                if (downloadURL) {
                  localStorage.setItem('uploadedImg', downloadURL);
                  // this.uploadedimg = downloadURL;
                } else {
                  localStorage.setItem('uploadedImg', downloadURL)
                }
              });
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
      this.deafulltImagePlaceholder = true;
      this.imgSrc = this.imgSrc;
      if (this.imgSrc === this.imgCompare) {
        this.selectedImage = null;
        this.fileExist = false;
      }
      else {
        this.selectedImage = this.selectedImage;
        this.fileExist = true;
      }

      // console.log(this.selectedImage)
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

  closeError() {
    this.errors = '';
  }
  goBack() {
    this.change.emit({ action: "organizationgrid" })
  }

}
