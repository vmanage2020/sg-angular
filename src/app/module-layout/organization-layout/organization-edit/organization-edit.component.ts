import { Component, OnInit, Output, EventEmitter, Injector, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbDateParserFormatter, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
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
import { apiURL, Constant } from '../../../core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { OrganizationCrudService } from '../organization-crud.service';
import { async } from 'rxjs/internal/scheduler/async';
import { UserService } from '../../user-layout/user-service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  providers: [AngularFireStorage, UploadService, AngularFireDatabase]
})
export class OrganizationEditComponent implements OnInit {
  @Output() change = new EventEmitter();
  @ViewChild('fileUploader', { static: false }) fileUploader: ElementRef;
  fileExist: boolean = false; 
  orgId: any;
  errors: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  showErrorInArr: any = [];
  isSaveUp: any = false;
  isSaveDown: any = false;
  isSaveUpEnable:any=false;
  orgUpdateForm: FormGroup;
  dialCode = "+1";
  sportsInfo: any;
  submitted = false;
  nationalGoverningDropdown = false
  stateGoverningDropdown = false
  sports: any;
  default = false
  nationalList = false;
  stateList = false;
  stateSelect: any;
  countryCodeSelect: any = [];
  stateOrgInfo: any;
  nationalOrgInfo: any;
  stateNull = false;
  countryNull = false;  
  imgSrc = "../../../../assets/image_placeholder.jpg"
  sportIdValid = false
  stateGoverningState = false;
  nationalGoverningState = false
  uid: any;
  custAdmin = false;
  organization_id: any;
  orgInfo: any = [];
  admin = false
  state: any[] = [];
  country: any[] = []
  suffixList: any = [
    { name: 'Sr' },
    { name: 'Jr' },
    { name: 'II' },
    { name: 'III' },
    { name: 'IV' },
    { name: 'V' }
  ]
  selectEntries: any = [
    { value: '10' },
    { value: '25' },
    { value: '50' },
    { value: '100' }
  ]
  contactModalConfigs: any = {};
  page = 1;
  pageSize = 10;
  selectedPageSize: number = 10;
  allRoles: any;
  term: any;
  noOfCol: any = [
    { name: 'name', allCol: "All Columns", value: "Name" },
    { name: 'email_address', allCol: "All Columns", value: 'Email Address' },
    { name: 'mobile_phone', allCol: "All Columns", value: 'Mobile Phone' }
  ];
  SelectedColumns: any = null;
  eachCol: any[] = [];
  showColumns: any;
  totalRecords = 0;
  role_id: any = "all";
  initialValue = "All Users";
  selectedRole: any = this.initialValue;
  userInfo: any[] = [];
  startIndex = 1;
  endIndex = 10;
  action: any;
  isNational = false
  ProfileUrl = null;
  isImageAval: boolean = false
  config: any = UPLOADCONFIG[0];
  imageSize = false;
  imageType = false;
  progress: any;
  url: string;
  uploadedimg: any;
  selectedImage: any = null;
  imgCompare = "../../../../assets/image_placeholder.jpg"
  imageUpload = false
  imgSize: any;
  currentUpload: Upload;
  basePath: string = '/uploads';
  injectedData: any;
  data: any;
  stateEdit: boolean = false;
  countryEdit: boolean = false;
  sport: boolean = false;
  sportsOffered: boolean = false;
  stateGoverning: boolean = false;
  nationalGoverning: boolean = false;
  websiteValidation = new RegExp(Constant.websiteValidation);
  primaryContactList: any = [];
  primaryContactListed: boolean = false;
  secondaryContactListed: boolean = false;
  secondaryContactList: any = [];
  productDetViewInitiatorIdentity: string = this.dataServices.randomCodeGenerator();
  choosenUser: any = null;
  deafulltImagePlaceholder: boolean = true;
  contactChangeUpdate: any = false;
  editorOrgId: any;
  // For user grid pagination
  nextEnabled = false;
  prevEnabled = false;
  sortedKey: any = Constant.sortingKey;
  sortedValue: any = Constant.sortingValue;
  searchKey: any = Constant.searchFilterKey;
  searchFilter: any = Constant.searchFilterKey;
  searchTerm: any = '';
  pager: any = {};
  //Save first document in snapshot of items received
  firstInResponse: any = [];

  forPaginationFirstResponse: any = [];
  //Save last document in snapshot of items received
  lastInResponse: any = [];
  forPaginationLastResponse: any = [];

  //Keep the array of first document of previous pages
  prev_strt_at: any = [];

  //Maintain the count of clicks on Next Prev button
  pagination_clicked_count = 0;

  //Disable next and prev buttons
  disable_next: boolean = false;
  disable_prev: boolean = false;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  constructor(private organizationService: OrganizationCrudService, private datatableservice: NgiDatatableService, private userService: UserService, private dropDownService: DropdownService, private modalConfig: NgbModalConfig, private modalService: NgbModal, private notification: NgiNotificationService, public injector: Injector, public upSvc: UploadService, private storage: AngularFireStorage, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataServices: DataService) {
    this.modalConfig.backdrop = 'static';
    this.modalConfig.keyboard = false;
    this.uid = this.cookieService.getCookie('uid');
    this.injectedData = injector.get('injectData');
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
    this.getstateInfo();
    this.getCountryCodeList();
    this.noOfCol.forEach(element => {
      this.eachCol.push(element.name)
    });
    this.SelectedColumns = this.eachCol
    this.showColumns = this.SelectedColumns
    this.sharedService.announceMission('organization');
    localStorage.setItem('uploadedUpdateImg', null);
    this.organizationFormInit();
    // Role List of Users
    this.orgUpdateForm.patchValue({
      uid: this.uid
    })
    if (this.cookieService.getCookie('admin')) {
      if (this.injectedData) {
        this.orgInfo.organization_id = this.injectedData.data;
        this.getRoleList();
        this.getOrgById(this.injectedData.data, this.uid);
        this.editorOrgId = this.injectedData.data;
        this.getUserList(this.uid, this.injectedData.data, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
      }
      this.custAdmin = true
      this.admin = false
      this.organization_id = localStorage.getItem('org_id')
      this.orgUpdateForm.controls.sports.setValidators(null);
    } else if (this.cookieService.getCookie('sysAdmin')) {
      if (localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
        if (this.injectedData) {
          this.orgInfo.organization_id = this.injectedData.data;
          this.getRoleList();
          this.getOrgById(this.injectedData.data, this.uid);
          this.editorOrgId = this.injectedData.data;
          this.getUserList(this.uid, this.injectedData.data, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
        this.custAdmin = false;
        this.admin = true;
        this.organization_id = localStorage.getItem('org_id');
        this.orgUpdateForm.controls.sports.setValidators([Validators.required]);
      }
      else {
        if (this.injectedData.data.organization_id) {
          this.orgInfo.organization_id = this.injectedData.data.organization_id;
          this.getRoleList();
          this.getOrgById(this.injectedData.data.organization_id, this.uid);
          this.editorOrgId = this.injectedData.data.organization_id;
          this.getUserList(this.uid, this.injectedData.data.organization_id, this.page, this.pageSize, this.role_id,
            this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
        }
        this.custAdmin = false
        this.admin = true
        this.organization_id = localStorage.getItem('org_id');
        this.orgUpdateForm.controls.sports.setValidators([Validators.required]);
      }

    }
    this.orgUpdateForm.controls.sports.updateValueAndValidity();
    this.getRoleList();
  }

  async organizationFormInit() {
    this.orgUpdateForm = this.formBuilder.group({
      avatar: [''],
      uid: [''],
      organization_id: [''],
      name: ['', [Validators.required]],
      abbrev: ['', [Validators.required, Validators.maxLength(6),Validators.pattern('^[a-zA-Z]*$')]],
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
      fax: ['', [Validators.pattern('^[0-9-()]*$'), Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.pattern(this.regexp)]],
      website: ['',[Validators.pattern("^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$")]],
      sports: [''],
      governing_body_info: this.formBuilder.array([this.getGoverningInfo()]),
      primary_contact: [{ value: '', disabled: true }],
      secondary_contact: [{ value: '', disabled: true }],
      primary_first_name: [''],
      primary_middle_initial: [''],
      primary_last_name: [''],
      primary_admin_email: [''],
      primary_suffix: [null],
      secondary_first_name: [''],
      secondary_middle_initial: [''],
      secondary_last_name: [''],
      secondary_admin_email: [''],
      secondary_suffix: [null],
      primary_user_id: [null],
      secondary_user_id: [null],
      old_primary_user_id: [{ value: "", disabled: true }],
      old_primary_admin_email: [{ value: "", disabled: true }],
      old_secondary_user_id: [{ value: "", disabled: true }],
      old_secondary_admin_email: [{ value: "", disabled: true }]
    });
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
  get governingBodyArr() {
    return this.orgUpdateForm.get('governing_body_info') as FormArray;
  }

  removeFile(event) {
    localStorage.setItem('uploadedUpdateImg', null);
    this.fileUploader.nativeElement.value = "";
    this.deafulltImagePlaceholder = true;
    this.ProfileUrl = null;
    let initials = this.orgUpdateForm.value.abbrev;
    document.getElementById("abbreviation").innerHTML = initials;
    if (this.orgUpdateForm.value.abbrev.length <= 2) {
      document.getElementById("abbreviation").style.fontSize = "40px";
    }
    else if (this.orgUpdateForm.value.abbrev.length <= 4) {
      document.getElementById("abbreviation").style.fontSize = "25px";
    }
    else if (this.orgUpdateForm.value.abbrev.length <= 6) {
      document.getElementById("abbreviation").style.fontSize = "20px";
    }
    else if (this.orgUpdateForm.value.abbrev.length <= 8) {
      document.getElementById("abbreviation").style.fontSize = "18px";
    }
    else if (this.orgUpdateForm.value.abbrev.length <= 10) {
      document.getElementById("abbreviation").style.fontSize = "15px";
    }
    this.fileExist = false;
    this.orgUpdateForm.patchValue({
      avatar: null
    })


  }

  get f() { return this.orgUpdateForm.controls; }
  async getAllSports(uid) {
    this.sport = true;
    try {
      if (this.orgUpdateForm.value.country_code) {
        let allSportResponse: any = await this.dropDownService.getAllSportsGeneral({ 'uid': uid, 'country_code': this.orgUpdateForm.value.country_code });
        if (allSportResponse.status) {
          this.sportsInfo = allSportResponse.data;
          if (this.governingBodyArr.value) {
            this.governingBodyArr.value.forEach(eachGoverningBodyInfo => {
              if (eachGoverningBodyInfo.is_used) {
                if (this.sportsInfo) {
                  this.sportsInfo.forEach(element => {
                    if (element.sport_id === eachGoverningBodyInfo.sport_id) {
                      element.disabled = true
                    } 
                  });
                }
              }
            });
          }
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
  async getstateInfo() {
    this.stateEdit = true;
    let getAllStateResponse: any = await this.dropDownService.getAllStates();
    try {
      if (getAllStateResponse.status) {
        this.stateSelect = getAllStateResponse.data;
        this.stateEdit = false;
      }
      else {
        this.stateSelect = [];
        this.stateEdit = false;
      }
    } catch (error) {
      console.log(error);
      this.stateSelect = [];
      this.stateEdit = false;
    }
  }
  OnSportChange(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      event.forEach((sportInfo: any) => {
        let isSportExist = this.orgUpdateForm.controls['governing_body_info'].value.filter(item => item.sport_id === sportInfo.sport_id);
        if (isSportExist.length !== 0) {

        } else {
          this.governingBodyArr.push(this.getGoverningInfo());
          this.governingBodyArr.at(this.orgUpdateForm.controls['governing_body_info'].value.length - 1).patchValue({
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
      if (this.orgUpdateForm.controls['governing_body_info'].value.length !== event.length) {
        if (this.orgUpdateForm.controls['governing_body_info'].value) {
          this.orgUpdateForm.controls['governing_body_info'].value.forEach((formValue: any, index) => {
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
  async getCountryCodeList() {
    this.countryEdit = true;
    let getAllCountryResponse: any = await this.dropDownService.getAllCountry();
    try {
      if (getAllCountryResponse.status) {
        this.countryCodeSelect = getAllCountryResponse.data;
        this.countryEdit = false;
      }
      else {
        this.countryCodeSelect = [];
        this.countryEdit = false;
      }
    } catch (error) {
      console.log(error);
      this.countryCodeSelect = [];
      this.countryEdit = false;
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
  async getOrgById(id, uid) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getOrganizationByIdRequest: any = {
      'organization_id': id, 'uid': this.uid
    }
    let getOrganizationByIdResponse: any = await this.organizationService.getOrganizationById(getOrganizationByIdRequest);
    try {
      if (getOrganizationByIdResponse.status) {
        this.orgInfo = getOrganizationByIdResponse.data;        
        if (getOrganizationByIdResponse.data.avatar && getOrganizationByIdResponse.data.avatar != "null" && getOrganizationByIdResponse.data.avatar != undefined && getOrganizationByIdResponse.data.avatar != null) {
          this.ProfileUrl = getOrganizationByIdResponse.data.avatar
          this.fileExist = true;
          this.deafulltImagePlaceholder = false;
        }
        else {
          this.fileExist = false;
          this.deafulltImagePlaceholder = true;
          let initials = getOrganizationByIdResponse.data.abbrev;
          document.getElementById("abbreviation").innerHTML = initials;
          if (getOrganizationByIdResponse.data.abbrev.length <= 2) {
            document.getElementById("abbreviation").style.fontSize = "40px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 4) {
            document.getElementById("abbreviation").style.fontSize = "25px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 6) {
            document.getElementById("abbreviation").style.fontSize = "20px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 8) {
            document.getElementById("abbreviation").style.fontSize = "18px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 10) {
            document.getElementById("abbreviation").style.fontSize = "15px";
          }
          this.ProfileUrl = null
        }
        //Country code Dial code Filtering   
        setTimeout(() => {
          if (getOrganizationByIdResponse.data) {
            if (getOrganizationByIdResponse.data.country_code) {
              this.countryCodeSelect.forEach(element => {
                if (getOrganizationByIdResponse.data.country_code === element.country_code) {
                  this.dialCode = element.dial_code;
                }
              });
              this.afterLoading(loaderToGetUserInfo);
            }
          }
        }, 320);

        /** End of Country code Filtering */
        if (this.custAdmin) {
          this.sports = getOrganizationByIdResponse.data.governing_body_info.map(sport => sport.sport_name);
          this.sports = this.sports.join(', ');
          this.orgUpdateForm.patchValue({
            sports: getOrganizationByIdResponse.data.governing_body_info.map(sport => sport.sport_id)
          })
        } else if (this.admin) {
          if (getOrganizationByIdResponse.data.sports) {
            this.sports = getOrganizationByIdResponse.data.governing_body_info.map(sport => sport.sport_id)
            this.orgUpdateForm.patchValue({
              sports: this.sports
            })
          }
        }
        let primaryFirstname: any = '';
        if (getOrganizationByIdResponse.data.primary_first_name) {
          if(getOrganizationByIdResponse.data.primary_suffix){
            primaryFirstname = getOrganizationByIdResponse.data.primary_first_name + ' ' + getOrganizationByIdResponse.data.primary_middle_initial + ' ' + getOrganizationByIdResponse.data.primary_last_name+ ' ' + getOrganizationByIdResponse.data.primary_suffix;
          }else{
            primaryFirstname = getOrganizationByIdResponse.data.primary_first_name + ' ' + getOrganizationByIdResponse.data.primary_middle_initial + ' ' + getOrganizationByIdResponse.data.primary_last_name;
          }
          
        }
        let secondaryFirstname: any = '';
        if (getOrganizationByIdResponse.data.secondary_first_name) {
          if(getOrganizationByIdResponse.data.secondary_suffix){
            secondaryFirstname = getOrganizationByIdResponse.data.secondary_first_name + ' ' + getOrganizationByIdResponse.data.secondary_middle_initial + ' ' + getOrganizationByIdResponse.data.secondary_last_name+ ' ' + getOrganizationByIdResponse.data.secondary_suffix;
          }else{
            secondaryFirstname = getOrganizationByIdResponse.data.secondary_first_name + ' ' + getOrganizationByIdResponse.data.secondary_middle_initial + ' ' + getOrganizationByIdResponse.data.secondary_last_name;
          }
          
        }

        if (!getOrganizationByIdResponse.data.secondary_first_name) {
          getOrganizationByIdResponse.data.secondary_first_name = '';
        }
        if (!getOrganizationByIdResponse.data.secondary_middle_initial) {
          getOrganizationByIdResponse.data.secondary_middle_initial = '';
        }
        if (!getOrganizationByIdResponse.data.secondary_last_name) {
          getOrganizationByIdResponse.data.secondary_last_name = '';
        }
        if (!getOrganizationByIdResponse.data.secondary_admin_email) {
          getOrganizationByIdResponse.data.secondary_admin_email = '';
        }
        if (!getOrganizationByIdResponse.data.secondary_suffix) {
          getOrganizationByIdResponse.data.secondary_suffix = '';
        }
        if (!getOrganizationByIdResponse.data.secondary_user_id) {
          getOrganizationByIdResponse.data.secondary_user_id = '';
        }

        this.orgUpdateForm.patchValue({
          organization_id: getOrganizationByIdResponse.data.organization_id,
          avatar: getOrganizationByIdResponse.data.avatar,
          name: getOrganizationByIdResponse.data.name,
          abbrev: getOrganizationByIdResponse.data.abbrev,
          phone: getOrganizationByIdResponse.data.mobile_phone,
          fax: getOrganizationByIdResponse.data.fax,
          email: getOrganizationByIdResponse.data.email_address,
          website: getOrganizationByIdResponse.data.website,
          street1: getOrganizationByIdResponse.data.street1,
          street2: getOrganizationByIdResponse.data.street2,
          city: getOrganizationByIdResponse.data.city,
          state: getOrganizationByIdResponse.data.state_code,
          state_name: getOrganizationByIdResponse.data.state,
          country_code: getOrganizationByIdResponse.data.country_code,
          country_name: getOrganizationByIdResponse.data.country,
          postal_code: getOrganizationByIdResponse.data.postal_code,
          primary_contact: primaryFirstname,
          secondary_contact: secondaryFirstname,
          primary_first_name: getOrganizationByIdResponse.data.primary_first_name,
          primary_middle_initial: getOrganizationByIdResponse.data.primary_middle_initial,
          primary_last_name: getOrganizationByIdResponse.data.primary_last_name,
          primary_admin_email: getOrganizationByIdResponse.data.primary_admin_email,
          primary_suffix: getOrganizationByIdResponse.data.primary_suffix,
          secondary_first_name: getOrganizationByIdResponse.data.secondary_first_name,
          secondary_middle_initial: getOrganizationByIdResponse.data.secondary_middle_initial,
          secondary_last_name: getOrganizationByIdResponse.data.secondary_last_name,
          secondary_admin_email: getOrganizationByIdResponse.data.secondary_admin_email,
          secondary_suffix: getOrganizationByIdResponse.data.secondary_suffix,
          primary_user_id: getOrganizationByIdResponse.data.primary_user_id,
          secondary_user_id: getOrganizationByIdResponse.data.secondary_user_id,
        })
        this.getAllSports(this.uid);
        if (getOrganizationByIdResponse.data.governing_body_info) {
          this.loadGoverningBodyInfo(getOrganizationByIdResponse.data.governing_body_info);
        }
      }else{
        this.afterLoading(loaderToGetUserInfo)
        this.errors = getOrganizationByIdResponse.message;
      }
    } catch (error) {
      console.log(error);
      this.afterLoading(loaderToGetUserInfo)
      this.errors = error.message;
    }
  }

  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }

  loadGoverningBodyInfo(governing_body_info) {
    governing_body_info.forEach((eachInfo: any, index: any) => {
      this.governingBodyArr.push(this.getGoverningInfo());
    });
    this.governingBodyArr.patchValue(governing_body_info);

    this.governingBodyArr.value.forEach((eachGoverningBodyInfo: any, index: any) => {
      this.governingBodyArr.at(index).patchValue({
        is_national_true: this.randomGenerator() + true,
        is_state_true: this.randomGenerator() + true,
        is_national_false: this.randomGenerator() + false,
        is_state_false: this.randomGenerator() + false,
      })
      if (eachGoverningBodyInfo.is_used) {
        if (this.sportsInfo) {
          this.sportsInfo.forEach(element => {
            if (element.sport_id === eachGoverningBodyInfo.sport_id) {
              element.disabled = true
            } else {
              element.disabled = false
            }
          });
        }
      }
      if (eachGoverningBodyInfo.is_national_governing_organization === "false") {
        this.governingBodyArr.at(index).patchValue({
          is_select_dropdown_for_national: true,
          is_hypen_for_national: false,
        })
      } else {
        this.governingBodyArr.at(index).patchValue({
          is_select_dropdown_for_national: false,
          is_hypen_for_national: true,
        })
      }
      if (eachGoverningBodyInfo.is_state_governing_organization === "false") {
        this.governingBodyArr.at(index).patchValue({
          is_select_dropdown_for_state: true,
          is_hypen_for_state: false,
        })

      } else {
        this.governingBodyArr.at(index).patchValue({
          is_select_dropdown_for_state: false,
          is_hypen_for_state: true,
        })
      }
      this.getServiceForNational(this.orgUpdateForm.value.country_code, eachGoverningBodyInfo.sport_id);
      this.getServiceForState(this.orgUpdateForm.value.state, this.orgUpdateForm.value.country_code, eachGoverningBodyInfo.sport_id)
    });
    console.log(this.orgUpdateForm.value);
  }
  ngAfterViewInit() {
    this.governingBodyArr.removeAt(0);
  }
  randomGenerator(): string {
    return Math.floor(Math.random() * 100) + 2 + "" + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5));
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.imageUpload = false;
      this.deafulltImagePlaceholder = false;
      if (this.extensionValidation(event.target.files[0])) {
        this.imageType = false
        if (this.maxsizeValidation(event.target.files[0])) {
          this.imageSize = false
          const reader = new FileReader();
          reader.onload = (e: any) => this.ProfileUrl = e.target.result;
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
                  localStorage.setItem('uploadedUpdateImg', downloadURL);
                } else {
                  localStorage.setItem('uploadedUpdateImg', downloadURL)
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
      this.ProfileUrl = this.ProfileUrl;
      this.deafulltImagePlaceholder = true;
      // if (this.ProfileUrl){
      //   this.fileExist=true;
      // }
      // else{
      //   this.fileExist=true;

      //   this.ProfileUrl = null;
      // }
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





  async getstateList(event: any, form, rowIndex: any) {
    try {
      if (event.target.value === "false") {
        let orgId = this.governingBodyArr.value[rowIndex].state_governing_organization_id;
        if (orgId) {
          let stateGoverningList: any = await this.organizationService.getStateGoverningDetails(orgId);
          if (stateGoverningList.status) {
            this.governingBodyArr.at(rowIndex).patchValue({
              is_select_dropdown_for_state: true,
              is_hypen_for_state: false,
              state_governing_organization_id: null,
              state_governing_organization_name: '',
            })
          } else {
            event.target.value === "true";
            this.notification.isNotification(true, "Organizations", "Cannot Change the state governing body once mapped with other organizations",
              "times-circle");
            this.dropDownService.getNotificationForError();
            event.target.value === "true";
            this.governingBodyArr.at(rowIndex).patchValue({
              is_state_governing_organization: "true"
            })
          }
        } else {
          this.governingBodyArr.at(rowIndex).patchValue({
            is_select_dropdown_for_state: true,
            is_hypen_for_state: false,
            state_governing_organization_id: null,
            state_governing_organization_name: '',
          })
        }
      }
      else {
        this.governingBodyArr.at(rowIndex).patchValue({
          is_select_dropdown_for_state: false,
          is_hypen_for_state: true,
          state_governing_organization_id: null,
          state_governing_organization_name: '',
        })
      }
      console.log(this.governingBodyArr);

    }
    catch (error) {
      console.log(error)
    }
  }
  async getnationalList(event: any, form, rowIndex: any, individualObject: any) {
    try {

      if (event.target.value === "false") {
        let orgId = this.governingBodyArr.value[rowIndex].national_governing_organization_id;
        if (orgId) {
          let nationalGoverningList: any = await this.organizationService.getNationalGoverningDetails(orgId);
          if (nationalGoverningList.status) {
            this.governingBodyArr.at(rowIndex).patchValue({
              is_select_dropdown_for_national: true,
              is_hypen_for_national: false,
              national_governing_organization_name: '',
              national_governing_organization_id: null
            })
          } else {
            this.notification.isNotification(true, "Organizations", "Cannot Change the national governing body once mapped with other organizations",
              "times-circle");
            this.dropDownService.getNotificationForError();
            event.target.value === "true";
            this.governingBodyArr.at(rowIndex).patchValue({
              is_national_governing_organization: "true"
            })
          }
        } else {
          this.governingBodyArr.at(rowIndex).patchValue({
            is_select_dropdown_for_national: true,
            is_hypen_for_national: false,
            national_governing_organization_name: '',
            national_governing_organization_id: null
          })
        }
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
      let stateCount: any = 0;
      this.isSaveInWhichPosition();
      if (this.governingBodyArr.value) {
        this.governingBodyArr.value.forEach(async (individualObject, index) => {
          let orgIdState = individualObject.state_governing_organization_id;
          if (orgIdState && individualObject.is_state_governing_organization === "true") {
            let stateGoverningList: any = await this.organizationService.getStateGoverningDetails(orgIdState);
            if (stateGoverningList.status) {

            } else {
              stateCount += 1
            }
          }
        });
      }
      if (stateCount === 0) {
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
      } else {
        this.notification.isNotification(true, "Organizations", "Cannot able to change the state.",
          "times-circle");
        this.dropDownService.getNotificationForError();
      }
    }

  }
  async onNationalChange(event, form) {
    let nationalCount: any = 0;
    let stateCount: any = 0;
    if (event.country_code) {
      this.isSaveInWhichPosition();
      form.controls.state.markAsUntouched();
      form.controls.sports.markAsUntouched();
      if (this.governingBodyArr.value) {
        this.governingBodyArr.value.forEach(async (individualObject, index) => {
          let nationalObject: any = individualObject.national_governing_organization_id;
          if (nationalObject && individualObject.is_national_governing_organization === "true") {
            let nationalGoverningList: any = await this.organizationService.getNationalGoverningDetails(nationalObject);
            if (nationalGoverningList.status) {

            } else {
              nationalCount += 1
            }
          }
          let orgIdState = individualObject.state_governing_organization_id;
          if (orgIdState && individualObject.is_state_governing_organization === "true") {
            let stateGoverningList: any = await this.organizationService.getStateGoverningDetails(orgIdState);
            if (stateGoverningList.status) {

            } else {
              stateCount += 1
            }
          }
        });
      }
      if (nationalCount === 0 && stateCount === 0) {
        this.dialCode = event.dial_code;
        form.patchValue({
          country_name: event.name,
          sports: null,
          state_name: '',
          state_code: null
        })
        this.governingBodyArr.reset();
        this.getAllSports(this.uid);
      } else {
        this.notification.isNotification(true, "Organizations", "Cannot able to change the country.",
          "times-circle");
        this.dropDownService.getNotificationForError();
      }
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
  closeError() {
    this.errors = '';
  }

  close(alert: any, alertData: any[]) {
    this.isSaveInWhichPosition();
    alertData.splice(alertData.indexOf(alert), 1);
  }
  async onSubmit(form) {
    this.closeError();    
    this.uploadedimg = localStorage.getItem('uploadedUpdateImg');
    if (this.uploadedimg != "null") {
      if (this.ProfileUrl && (this.ProfileUrl != this.uploadedimg)) {
        form.value.avatar = this.uploadedimg
      }
    }
    this.submitted = true;
    if (form.invalid) {
      let length: any = 0
      this.showErrorInArr = [];
      Object.keys(form.controls).forEach(async (key) => {
        if (form.controls[key].status === "INVALID" && length === 0) {
          length += 1;
          this.getWhichInputMissing(key, form);
        }
      });
      if(this.isSaveDown){
        setTimeout(() => {
          window.scrollTo(0,document.body.scrollHeight);
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
    form.value.email = form.value.email.toLowerCase();   
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateOrganizationResponse: any = await this.organizationService.updateOrganization(form.value);
    try {
      if (updateOrganizationResponse.status) {
        // this.sharedService.announceMission({ action: 'isOrganizationUpdated', data: form.value });
        if (this.cookieService.getCookie('admin')) {
          this.sharedService.announceMission({ action: 'isOrganizationUpdated', data: form.value });
          this.change.emit({ action: "vieworganization", data: this.injectedData.data });
          this.afterSavingData(loaderWhileUpdate); 
          this.notification.isNotification(true, "Organizations", updateOrganizationResponse.message, "check-square");
        } else if (this.cookieService.getCookie('sysAdmin')) {
          if (localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
            this.change.emit({ action: "vieworganization", data: this.injectedData.data })
          } else if(localStorage.getItem('org_id') === Constant.organization_id) {
            this.sharedService.announceMission('updateOrganizationList')
            this.change.emit({ action: "organizationgrid", data: '' })
          }
          this.afterSavingData(loaderWhileUpdate); 
          this.notification.isNotification(true, "Organizations", updateOrganizationResponse.message, "check-square");
        }        
      } else {
        this.errors = updateOrganizationResponse.message;
        this.afterSavingData(loaderWhileUpdate);
        this.reInitialise();
      }
    } catch (error) {
      console.log(error);
      this.errors = error.message;
      this.afterSavingData(loaderWhileUpdate);
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
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
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
  closeErrors(errorValue) {   
    this.isSaveInWhichPosition();
    if(this.showErrorInArr && this.showErrorInArr.length !== 0){
      if (this.showErrorInArr[0].includes(errorValue.trim())) {      
        this.showErrorInArr=[];
      }
    }       
  }
  isSaveInWhichPosition() {
    if (this.isSaveUp) {
      this.isSaveUp = false
    } else if (this.isSaveDown) {
      this.isSaveDown = false
    } 
  }
  saveDown() {
    this.isSaveDown = true;
    this.isSaveUp = false;
    this.isSaveUpEnable =false
  }
  saveUp() {
    this.isSaveUp = true;
    this.isSaveDown = false;
    this.isSaveUpEnable =true
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
          let isNtionaldropdownExist: any = getNationalGoverningDropdownResponse.data.filter(item => item.name !== this.orgUpdateForm.controls['name'].value);
          if (isNtionaldropdownExist.length !== 0) {
            isNtionaldropdownExist.splice(0, 0, { organization_id: '', name: 'Select national governing body organization' });
            this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
              if (eachGoverningBody.sport_id === sportId) {
                this.governingBodyArr.at(index).patchValue({
                  lov_for_national: isNtionaldropdownExist
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
          let isStatedropdownExist: any = getStateGoverningDropdownResponse.data.filter(item => item.name !== this.orgUpdateForm.controls['name'].value);
          if (isStatedropdownExist.length !== 0) {
            isStatedropdownExist.splice(0, 0, { organization_id: '', name: 'Select state governing body organization' });
            this.stateGoverning = false;
            this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
              if (eachGoverningBody.sport_id === sportId) {
                this.governingBodyArr.at(index).patchValue({
                  lov_for_state: isStatedropdownExist
                })
              }
            });
          } else {
            this.isStateDropdownEmpty(sportId)
          }

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
        })
      }
    });
    this.stateGoverning = false;
  }



  //Search Input (to hide icon)
  onClear(event) {
    this.term = '';
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  searchInput(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  async getUserList(uid: any, orgId: any, pageNo: any, itemPerPage: any, roleId: any, isNextReq: any, isPrevReq: any, prevStartAt: any, prevEndAt: any, nextStartAt: any) {
    try {
      this.loading = true;
      if (this.term) {
        this.searchTerm = this.term.toLowerCase();
      } else {
        this.searchTerm = ''
      }
      if (this.firstInResponse) {
        this.forPaginationFirstResponse = this.firstInResponse;
      }
      if (this.lastInResponse) {
        this.forPaginationLastResponse = this.lastInResponse;
      }
      this.userInfo = [];
      let getUserList: any = {
        'uid': uid,
        'page_no': pageNo, 'item_per_page': itemPerPage, 'organization_id': orgId, 'role_id': roleId,
        'sortingKey': this.sortedKey,
        'sortingValue': this.sortedValue,
        'isNextReq': isNextReq,
        'isPrevReq': isPrevReq,
        'prevStartAt': prevStartAt,
        'prevEndAt': prevEndAt,
        'nextStartAt': nextStartAt,
        'searchVal': this.searchTerm,
        'searchKey': this.searchKey
      }
      getUserList.isNextReq = isNextReq ? true : false;
      getUserList.isPrevReq = isPrevReq ? true : false;
      console.log("request", getUserList);

      let getUsersResponse = await this.userService.getAllUsers(getUserList);
      this.userInfo = [];
      if (getUsersResponse.status) {
        if (getUsersResponse.data && getUsersResponse.data.length !== 0) {
          this.firstInResponse = getUsersResponse.snapshot.docs[0];
          this.lastInResponse = getUsersResponse.snapshot.docs[getUsersResponse.snapshot.docs.length - 1];
          //Initialize values
          // this.prev_strt_at = [];
          if (isNextReq) {
            this.pagination_clicked_count++;
            this.push_prev_startAt(this.firstInResponse);
          }
          else if (isPrevReq) {
            //Maintaing page no.
            this.pagination_clicked_count--;

            //Pop not required value in array
            // this.pop_prev_startAt(this.firstInResponse);
          } else {
            this.pagination_clicked_count = 0;
            pageNo = 1;
            this.page = 1;
            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse);
          }
          getUsersResponse.data.forEach(element => {
            if (element !== null) {
              if (element.role === "player") {
                if (this.ageValidation(element)) {
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
              } else {
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
          });
          this.totalRecords = getUsersResponse.totalRecords;
          // if (this.contactModalConfigs) {
          //   if (this.contactModalConfigs.user_id) {
          //     this.userInfo = this.userInfo.filter(item => item.user_id !== this.contactModalConfigs.user_id);
          //     this.totalRecords=this.totalRecords - 1;
          //   }
          // }
          if (this.orgUpdateForm.get('secondary_user_id').value) {
            this.userInfo = this.userInfo.filter(item => item.user_id !== this.orgUpdateForm.get('secondary_user_id').value);
            this.totalRecords = this.totalRecords - 1
          }
          if (this.orgUpdateForm.get('primary_user_id').value) {
            this.userInfo = this.userInfo.filter(item => item.user_id !== this.orgUpdateForm.get('primary_user_id').value);
            this.totalRecords = this.totalRecords - 1
          }

          this.getPaging(pageNo);
          this.pager = await this.datatableservice.getPager(this.totalRecords, pageNo, itemPerPage);
          this.loading = false
        } else {
          this.userInfo = [];
          this.loading = false;
        }
      }
      else {
        this.userInfo = [];
        this.loading = false;
      }
    } catch (error) {
      console.log(error)
    }
  }
  ageValidation(userIfo) {
    if (userIfo.date_of_birth) {
      const bdate = new Date(userIfo.date_of_birth);
      const timeDiff = Math.abs(Date.now() - bdate.getTime());
      let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
      console.log(age)
      if (age >= 18) {
        return true
      } else {
        return false
      }
    }
  }

  onRoleChange(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.role_id = event.role_id;
    this.selectedRole = event.name
    this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  getPaging(page) {
    this.page = page;
    this.startIndex = (page - 1) * +this.pageSize + 1;
    this.endIndex = (page - 1) * +this.pageSize + +this.pageSize;

    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    if (this.endIndex === 0) {
      this.startIndex = 0;
    }

  }


  selectedPage(event) {
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.pageSize = parseInt(event.value)
    this.selectedPageSize = this.pageSize
    this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
  }

  async getRoleList() {
    try {
      let getRolesDropdownResponse: any = await this.dropDownService.getRoles();

      if (getRolesDropdownResponse.status) {
        if (getRolesDropdownResponse.data) {
          getRolesDropdownResponse.data.splice(0, 0, { name: 'All Users', role_id: 'all' });
          this.allRoles = getRolesDropdownResponse.data;
          if (this.cookieService.getCookie('admin')) {
            this.allRoles = this.allRoles.filter(order => order.role_id !== "sys-admin");
          } else if (this.cookieService.getCookie('sysAdmin')) {
            if (localStorage.getItem('org_id') !== Constant.organization_id) {
              this.allRoles = this.allRoles.filter(order => order.role_id !== "sys-admin");
            } else if (localStorage.getItem('org_id') === Constant.organization_id && this.editorOrgId !== Constant.organization_id) {
              this.allRoles = this.allRoles.filter(order => order.role_id !== "sys-admin");
            }
            else {
              this.allRoles = this.allRoles.filter(order => order.role_id === "sys-admin" || order.role_id === "all");
            }
          }
        } else {
          this.allRoles = [];
        }
      } else {
        this.allRoles = [];
      }

    } catch (error) {
      console.log(error);
    }
  }

  //Show previous set 
  async prevPage() {
    try {
      this.nextEnabled = false;
      this.prevEnabled = true;
      this.page = this.page - 1;
      this.userInfo = [];
      await this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled,
        this.prevEnabled, this.get_prev_startAt(this.page), this.firstInResponse, this.lastInResponse)
    } catch (error) {
      console.log(error);
      this.disable_prev = false;
    }
  }

  async nextPage() {
    try {
      this.nextEnabled = true;
      this.page += 1
      this.prevEnabled = false;
      this.userInfo = [];
      await this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled,
        this.prevEnabled, null, this.firstInResponse, this.lastInResponse)
    } catch (err) {
      console.log(err);

      this.disable_next = false;
    }


  }

  //Add document
  push_prev_startAt(prev_first_doc) {
    this.prev_strt_at.push(prev_first_doc);
  }

  //Remove not required document 
  pop_prev_startAt(prev_first_doc) {
    this.prev_strt_at.forEach(element => {
      if (prev_first_doc.data().id == element.data().id) {
        element = null;
      }
    });
  }

  //Return the Doc rem where previous page will startAt
  get_prev_startAt(pageNo: any) {

    // if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
    //   this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
    return this.prev_strt_at[pageNo - 1];
  }

  userContactChange(event, userId, action, content) {
    if (this.userInfo) {
      this.userInfo = this.userInfo.filter(item => item.user_id !== userId);
    }
    this.choosenUser = null;
    this.contactModalConfigs.action = action;
    this.contactModalConfigs.user_id = userId;
    if (action == "primary") {
      this.contactModalConfigs.title = "Primary Contact Details"
      this.contactModalConfigs.primary = {};
    } else if (action == "secondary") {
      this.contactModalConfigs.secondary = {};
      this.contactModalConfigs.title = "Secondary Contact Details"
    }
    this.modalService.open(content, { size: 'lg' });
  }

  onRowCheck(userInfo, action) {

    this.choosenUser = userInfo.user_id;
    if (this.choosenUser) {
      if (action) {
        this.contactModalConfigs[action] = userInfo; // Choosen User Details               
        this.contactChangeUpdate = true;
      }
    } else {
      this.contactChangeUpdate = false;
    }
  }

  updateContactDetail(action) {
    let userDetail: any = this.contactModalConfigs[action];
    console.log(this.orgUpdateForm.value);
    
    if (action == "primary") {
      if (userDetail) {

        if (this.orgUpdateForm.get('primary_user_id').value) {
          this.orgUpdateForm.get('old_primary_user_id').patchValue(this.orgUpdateForm.get('primary_user_id').value); // Old user Id
        } else {
          this.orgUpdateForm.get('old_primary_user_id').patchValue(''); // Old user Id
        }

        if (this.orgUpdateForm.get('primary_admin_email').value) {
          this.orgUpdateForm.get('old_primary_admin_email').patchValue(this.orgUpdateForm.get('primary_admin_email').value); // Old user Id
        } else {
          this.orgUpdateForm.get('old_primary_admin_email').patchValue(''); // Old user Id
        }

        this.orgUpdateForm.get('old_primary_admin_email').patchValue(this.orgUpdateForm.get('primary_admin_email').value); // Old Email 

        this.orgUpdateForm.get('primary_user_id').patchValue(userDetail.user_id);
        this.orgUpdateForm.get('primary_first_name').patchValue(userDetail.first_name);
        this.orgUpdateForm.get('primary_middle_initial').patchValue(userDetail.middle_initial);
        this.orgUpdateForm.get('primary_last_name').patchValue(userDetail.last_name);
        this.orgUpdateForm.get('primary_admin_email').patchValue(userDetail.email_address);
        this.orgUpdateForm.get('primary_suffix').patchValue(userDetail.suffix);
        let fullName: any
        if(userDetail.suffix){
           fullName = userDetail.first_name + ' ' + userDetail.middle_initial + ' ' + userDetail.last_name + ' '+ userDetail.suffix;
        }else{
           fullName = userDetail.first_name + ' ' + userDetail.middle_initial + ' ' + userDetail.last_name;
        }
        // let fullName: any = userDetail.first_name + ' ' + userDetail.middle_initial + ' ' + userDetail.last_name;
        this.orgUpdateForm.get('primary_contact').patchValue(fullName); // Display Name

        if (!this.orgUpdateForm.get('old_primary_user_id').enabled) {
          this.orgUpdateForm.get('old_primary_user_id').enable();
        }
        if (!this.orgUpdateForm.get('old_primary_admin_email').enabled) {
          this.orgUpdateForm.get('old_primary_admin_email').enable();
        }
        this.modalService.dismissAll();
        console.log(this.orgUpdateForm.value);
      }
    } else if (action == "secondary") {

      if (userDetail) {
        if (this.orgUpdateForm.get('secondary_user_id').value) {
          this.orgUpdateForm.get('old_secondary_user_id').patchValue(this.orgUpdateForm.get('secondary_user_id').value); // Old User Id  
        } else {
          this.orgUpdateForm.get('old_secondary_user_id').patchValue(''); // Old User Id 
        }

        if (this.orgUpdateForm.get('secondary_admin_email').value) {
          this.orgUpdateForm.get('old_secondary_admin_email').patchValue(this.orgUpdateForm.get('secondary_admin_email').value); // Old User Id 
        } else {
          this.orgUpdateForm.get('old_secondary_admin_email').patchValue(''); // Old User Id 
        }

        this.orgUpdateForm.get('secondary_user_id').patchValue(userDetail.user_id);
        this.orgUpdateForm.get('secondary_first_name').patchValue(userDetail.first_name);
        this.orgUpdateForm.get('secondary_middle_initial').patchValue(userDetail.middle_initial);
        this.orgUpdateForm.get('secondary_last_name').patchValue(userDetail.last_name);
        this.orgUpdateForm.get('secondary_admin_email').patchValue(userDetail.email_address);
        this.orgUpdateForm.get('secondary_suffix').patchValue(userDetail.suffix);
        let fullName: any
        if(userDetail.suffix){
           fullName = userDetail.first_name + ' ' + userDetail.middle_initial + ' ' + userDetail.last_name + ' '+userDetail.suffix;
        }else{
           fullName = userDetail.first_name + ' ' + userDetail.middle_initial + ' ' + userDetail.last_name;
        }
      
        this.orgUpdateForm.get('secondary_contact').patchValue(fullName); // Display Name

        if (!this.orgUpdateForm.get('old_secondary_user_id').enabled) {
          this.orgUpdateForm.get('old_secondary_user_id').enable();
        }
        if (!this.orgUpdateForm.get('old_secondary_admin_email').enabled) {
          this.orgUpdateForm.get('old_secondary_admin_email').enable();
        }
        this.modalService.dismissAll();
        console.log(this.orgUpdateForm.value);
      }
    }
    this.prevEnabled = false;
    this.nextEnabled = false;
    this.getUserList(this.uid, this.editorOrgId, this.page, this.pageSize, this.role_id, this.nextEnabled, this.prevEnabled, null, this.firstInResponse, this.lastInResponse)

  }

  goBack() {

    if (this.cookieService.getCookie('admin')) {
      this.change.emit({ action: "vieworganization", data: this.injectedData.data })
    } else if (this.cookieService.getCookie('sysAdmin')) {
      if (localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
        this.change.emit({ action: "vieworganization", data: this.injectedData.data })
      }
      else {
        this.change.emit({ action: "organizationgrid", data: this.injectedData.data })
      }
    }
  }

}
