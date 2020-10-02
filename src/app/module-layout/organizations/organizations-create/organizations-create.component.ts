import { Component, OnInit, ElementRef } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { apiURL, Constant } from '../../../core/services/config';

import { NgiNotificationService } from 'ngi-notification';

import { OrganizationsService } from './../organizations.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { NGXLogger } from 'ngx-logger';


@Component({
  selector: 'app-organizations-create',
  templateUrl: './organizations-create.component.html',
  styleUrls: ['./organizations-create.component.scss'],
  providers: [NGXLogger]
})
export class OrganizationsCreateComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllSportmeta: any = [];
  getAllSportmetaData: any = [];
  getAllCountrymetaData: any = [];
  getAllTypemeta: any = [];
  getAllStates: any = [];
  getAllTypemetaData: any = [];

  public governingBodyInfo: FormArray;
  
  
  getSelectedSportmeta: any = [];
  getSelectedSportmetaData: any = [];

  getAllTypemetaDataArray: any = [
    { name: 'Drop Down' },
    { name: 'Check box' },
    { name: 'Radio button' },
    { name: 'Text Field' }
  ]

  getUserSuffixDataArray: any = [
    {id: 'Sr',name: 'Sr'},
    {id: 'Jr',name: 'Jr'},
    {id: 'II',name: 'II'},
    {id: 'III',name: 'III'},
    {id: 'IV',name: 'IV'},
    {id: 'V',name: 'V'}
  ]

  data: any;
  selectedCountryCode: any;
  selectedSports: any[]   = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  isSaveUp: any = false;
  isSaveUpEnable: boolean = false;
  isSaveDown: any = false;
  stateGoverning: boolean = false;

  is_required_form_value = "false";
  is_editable_form_value = "false";
  is_deletable_form_value = "false";
  
  uid: any;
  orgId: any;
  
  loading = true;
  displayLoader: any = true;
  is_required_value = false;
  is_editable_value = false;
  is_deletable_value = false;

  selectedOrganizationId: any = '';

  submitted = false;
  createorganizationForm: FormGroup;

  websiteValidation = new RegExp(Constant.websiteValidation);
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  dialCode = null;

  constructor(private router: Router, 
    private formBuilder: FormBuilder,
    public cookieService: CookieService,
    private notification: NgiNotificationService, 
    private restApiService: RestApiService,
    private el: ElementRef,
    private organizationsService: OrganizationsService,
    private logger: NGXLogger) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createorganizationForm = this.formBuilder.group({
      uid: [''],
      name: ['', [Validators.required]],
      abbrev: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(6), Validators.pattern('^[a-zA-Z]*$')]],
      street1: ['', [Validators.required]],
      street2: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      state: [null, [Validators.required]],
      state_name: [''],
      postal_code: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern('^[0-9]*$')]],
      country_code: [null, [Validators.required]],
      country_name: [''],
      phonedialcode : [],
      faxdialcode : [],
      phone: ['', Validators.compose([
        Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)
      ])],
      fax: ['', [Validators.pattern('^[0-9-()]*$'), Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.pattern(this.regexp)]],
      website: ['', [Validators.pattern("^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$")]],
      sports: ['', [Validators.required]],
      avatar: [null],
      
      governing_body_info: this.formBuilder.array([this.getGoverningInfo()]),

      primary_first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      primary_middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3)]],
      primary_last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      primary_admin_email: ['', [Validators.required, Validators.pattern(this.regexp)]],
      primary_suffix: [null],
      /*
      secondary_first_name: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      secondary_middle_initial: ['', [Validators.pattern('^[a-zA-Z ]*$'), Validators.maxLength(3)]],
      secondary_last_name: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      secondary_admin_email: ['', [Validators.pattern(this.regexp)]],
      secondary_suffix: [null],
      */
      secondary_first_name: [''],
      secondary_middle_initial: [''],
      secondary_last_name: [''],
      secondary_admin_email: [''],
      secondary_suffix: [null],
      
    });

    //this.governingBodyInfo = this.createorganizationForm.get('governing_body_info') as FormArray;
  }
  

  ngOnInit() {
    this.getState(); 
    
    this.getCountries();  
    this.getTypes();  
    this.is_required_value = false;
    this.is_editable_value = false;
    this.is_deletable_value = false;
    this.loading = false;
    this.displayLoader = false;

    console.log( '---- this.selectedCountryCode----', this.selectedCountryCode)

    let Orgval = this.organizationsService.selectedOrgId.getValue()
    if (Orgval != '') {
      this.selectedOrgId(Orgval)
      this.organizationsService.selectedOrgId.next('')
    }

  }

  selectedOrgId( id )
  {
    console.log('----edit org id----', id)
    this.selectedOrganizationId = id;
    this.restApiService.lists('organization/'+id).subscribe( orgs => {
      console.log('----orgs----', orgs)
        this.getSports( orgs.country_code );

        this.createorganizationForm.patchValue({
          name: orgs.name,
          abbrev: orgs.abbrev[0],
          street1: orgs.street1,
          street2: orgs.street2[0],
          city: orgs.city,
          state: orgs.state_code,
          postal_code: orgs.postal_code,
          country_code: orgs.country_code,
          phone: orgs.mobile_phone,
          fax: orgs.fax,
          email: orgs.email_address,
          website: orgs.website,
          phonedialcode : orgs.dial_code,
          faxdialcode : orgs.dial_code,
          sports: orgs.sports,
          governing_body_info: orgs.governing_body_info,
          primary_first_name: orgs.primary_first_name,
          primary_middle_initial: orgs.primary_middle_initial,
          primary_last_name: orgs.primary_last_name,
          primary_admin_email: orgs.primary_admin_email,
          primary_suffix: orgs.primary_suffix,
          secondary_first_name: orgs.secondary_first_name,
          secondary_middle_initial: orgs.secondary_middle_initial,
          secondary_last_name: orgs.secondary_last_name,
          secondary_suffix : orgs.secondary_suffix,
          secondary_admin_email: orgs.secondary_admin_email
        })

        if(orgs.governing_body_info.length>0)
        {
          console.log('---orgs.governing_body_info----', orgs.governing_body_info)
          //this.governingBodyArr.push(this.getGoverningInfo());
          setTimeout(() => {
          
                    var i=0;
                    orgs.governing_body_info.forEach( gov => {
                      
                      //this.createorganizationForm.controls.governingBodyArr['controls'][i].patchValue({
                        this.governingBodyArr.at(i).patchValue({
                        sport_name          : gov.sport_name,
                        sport_id            : gov.sport_id,
                        is_national_governing_organization : gov.is_national_governing_organization,
                        is_state_governing_organization : gov.is_state_governing_organization, 
                        is_national_true    : ((gov.is_national_governing_organization == true) ? true : false),
                        is_state_true       : ((gov.is_state_governing_organization == true) ? true : false),
                        is_national_false   : ((gov.is_national_governing_organization == false) ? false : true),
                        is_state_false      : ((gov.is_state_governing_organization == false) ? false : true),
                        is_select_dropdown_for_national : ((gov.is_national_governing_organization == "true") ? false : true),
                        is_select_dropdown_for_state : ((gov.is_state_governing_organization == "true") ? false : true),

                      })
                      
                      i++
                      
                  })

          }, 1000);
          
          console.log('governingBodyArr',this.governingBodyArr);

         this.getServiceForNational(orgs.country_code, orgs.sport_id);
          this.getServiceForState(orgs.state_code, orgs.country_code, orgs.sport_id)

        }

    }, err =>{
      console.log('---error for fetching data----')
    })
  }


  showErrorInArr: any = [];

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

  OnSportChange(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        console.log('----markas touched----')
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      //this.isSaveInWhichPosition();
      console.log('---event----', event)
      console.log( '--governing_body_info value ---',this.createorganizationForm.controls['governing_body_info'].value )
       event.forEach((sportInfo: any) => {
        let isSportExist = this.createorganizationForm.controls['governing_body_info'].value.filter(item => item.sport_id === sportInfo.sport_id);
        if (isSportExist.length !== 0) {

        } else {
          this.governingBodyArr.push(this.getGoverningInfo());
          this.governingBodyArr.at(this.createorganizationForm.controls['governing_body_info'].value.length - 1).patchValue({
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
     if (this.createorganizationForm.controls['governing_body_info'].value.length !== event.length) {
        if (this.createorganizationForm.controls['governing_body_info'].value) {
          this.createorganizationForm.controls['governing_body_info'].value.forEach((formValue: any, index) => {
            let removeGoverningBody = event.filter(eachSport => eachSport.sport_id === formValue.sport_id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.governingBodyArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {

      console.log('----else sports----')
      this.governingBodyArr.removeAt(0);
      form.patchValue({
        sports: ''
      })
    }

  }


  sportsofferselectedbyState(event: any)
  {
    console.log('---state value----', event.state_code)
    var country_code = this.createorganizationForm.value.country_code
    var sports = this.createorganizationForm.value.sports
    console.log('---sports----', sports,'-----country_code----', country_code)
    if( sports.length>0 && country_code !='' && event.state_code !='')
    {
      sports.forEach( sport => {
        this.getServiceForState(event.state_code, country_code, sport)
      })      
    }
  }

   get governingBodyArr() {
    return this.createorganizationForm.get('governing_body_info') as FormArray;
  }

  /*OnSportChange(event: any, form) {
    //return false;
    if (event.type === "focus") {
      if (!form.value.country_code) {
        console.log('----markas touched----')
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      //this.isSaveInWhichPosition();
      console.log('---event----', event)
      console.log( '--governing_body_info value ---',this.createorganizationForm.controls['governing_body_info'].value )
       event.forEach((sportInfo: any) => {
        let isSportExist = this.createorganizationForm.controls['governing_body_info'].value.filter(item => item.sport_id === sportInfo.sport_id);
        if (isSportExist.length !== 0) {

        } else {
          this.governingBodyArr.push(this.getGoverningInfo());
          this.governingBodyArr.at(this.createorganizationForm.controls['governing_body_info'].value.length - 1).patchValue({
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
     if (this.createorganizationForm.controls['governing_body_info'].value.length !== event.length) {
        if (this.createorganizationForm.controls['governing_body_info'].value) {
          this.createorganizationForm.controls['governing_body_info'].value.forEach((formValue: any, index) => {
            let removeGoverningBody = event.filter(eachSport => eachSport.sport_id === formValue.sport_id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.governingBodyArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {

      console.log('----else sports----')
      this.governingBodyArr.removeAt(0);
      form.patchValue({
        sports: ''
      })
    }
  } */

  OnSportChangebyCountry(event: any, form)
  {

  }

  
  async getServiceForNational(country_code, sportId) {
    //this.nationalGoverning = true;
    let getNationalGoverningDropdownRequest: any = {
      "country": country_code,
      "sport_id": sportId
    }

    this.restApiService.lists('organizationnationalgoverningbyid/'+country_code+'/'+sportId).subscribe( orgs => {
      console.log('----orgs----', orgs)
      if( orgs.length >0)
      {
        orgs.splice(0, 0, { organization_id: '', name: 'Select national governing body organization' });
        this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
          if (eachGoverningBody.sport_id === sportId) {
            this.governingBodyArr.at(index).patchValue({
              lov_for_national: orgs
            })
          }
        });
      }else{
        this.isNationalDropdownEmpty(sportId);
      }

    }, error => {
      console.log('---error API response------')
    })
    console.log('---getNationalGoverningDropdownRequest---', getNationalGoverningDropdownRequest)
    
   /*  let getNationalGoverningDropdownResponse: any = await this.dropDownService.getAllNationalGoverningBody(getNationalGoverningDropdownRequest);
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
          //this.nationalGoverning = false;
        } else {
          this.isNationalDropdownEmpty(sportId);
        }
      } else {
        this.isNationalDropdownEmpty(sportId);1200 - 1ak
      this.isNationalDropdownEmpty(sportId);
    } */
   
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
    console.log('getnationalList');
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

  closeErrors(errorValue) {
    this.isSaveInWhichPosition();
    if (this.showErrorInArr && this.showErrorInArr.length !== 0) {
      if (this.showErrorInArr[0].includes(errorValue.trim())) {
        this.showErrorInArr = [];
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

  isNationalDropdownEmpty(sportId: any) {
    //this.nationalOrgInfo = [];
    this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
      if (eachGoverningBody.sport_id === sportId) {
        this.governingBodyArr.at(index).patchValue({
          lov_for_national: '',
          national_governing_organization_id: null,
          national_governing_organization_name: ''
        })
      }
    });
    //this.nationalGoverning = false;
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
  

  async getServiceForState(state, country_code, sportId) {
    //this.stateGoverning = true;
    let getStateGoverningDropdownRequest: any = {
      "state": state, "country": country_code, "sport_id": sportId
    }

    this.restApiService.lists('organizationstategoverningbyid/'+country_code+'/'+state+'/'+sportId).subscribe( orgs => {
      console.log('----orgs----', orgs)
      if( orgs.length >0)
      {
        orgs.splice(0, 0, { organization_id: '', name: 'Select state governing body organization' });
        this.stateGoverning = false;
          this.governingBodyArr.value.forEach((eachGoverningBody, index) => {
            if (eachGoverningBody.sport_id === sportId) {
              this.governingBodyArr.at(index).patchValue({
                lov_for_state: orgs
              })
            }
          });
      }else{
        this.isStateDropdownEmpty(sportId);
      }

    }, error => {
      console.log('---error API response------')
    })

    /*
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
    */
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
    //this.stateGoverning = false;
  }

  async getState()
  {
    if(this.organizationsService.statedataStore.state.length > 0)
    {
      console.log('---state----', this.organizationsService.statedataStore.state )
      this.getAllStates = this.organizationsService.statedataStore.state
    }else{
      setTimeout(() => { this.getState() 
      }, 1000);
    }
  }

  async getCountries()
  {
    if(this.organizationsService.countrydataStore.country.length > 0)
    {
      console.log( this.organizationsService.countrydataStore.country )
      this.getAllCountrymetaData = this.organizationsService.countrydataStore.country
    }else{
      setTimeout(() => { this.getCountries() 
      }, 1000);
    }
  }

  selectedCountry(event: any)
  {
    this.dialCode = null;
    if( event != undefined && event.country_code != '')
    {
      this.selectedCountryCode = event.country_code;
      this.selectedSports = [];
      this.getSports(this.selectedCountryCode); 
      this.dialCode = '+1';
      this.createorganizationForm.patchValue({
        phonedialcode: '+1',
        faxdialcode: '+1'
      })
    }
    
  }

  async getSports( country ){

    this.restApiService.lists('sportsbycountry/'+country).subscribe( sports => {
      console.log( '--- sports----', sports)
      this.getAllSportmetaData = sports;
    })
    /* if( this.organizationsService.dataStore.sports.length > 0)
    {
      this.getAllSportmetaData = this.organizationsService.dataStore.sports
    }else{
      setTimeout(() => { this.getSports() 
      }, 1000);
    } */
    
    
    //this.restApiService.lists
    /*this.getAllSportmeta = await this.db.collection('sports').orderBy('sport').get();
    this.getAllSportmetaData = await this.getAllSportmeta.docs.map((doc: any) => doc.data());*/
  }

  async getTypes(){
    this.getAllTypemetaData = this.getAllTypemetaDataArray;
  }


  get f() { return this.createorganizationForm.controls; }

  async onSubmit(form) {
    console.log("form submit");
    console.log('----form----', form)
    console.log('---this.selectedOrganizationId----', this.selectedOrganizationId)
    //return false;
    
    if( this.selectedOrganizationId == '')
    {
              try {
                this.submitted = true;
                if (form.invalid) {
                  console.log("form submit invalid");
                  console.log(form);

                  const invalidControl = this.el.nativeElement.querySelector('.ng-invalid');
                  if (invalidControl) {
                    console.log('----invalidControl----', invalidControl)
                    invalidControl.focus();
                  }

                  return;
                }

                
                
              this.displayLoader = true;
              this.loading = true;
              console.log("form submit valid");  
              console.log(form);
            
              this.uid = this.cookieService.getCookie('uid');
              this.orgId = localStorage.getItem('org_id');
            
              let createOrgObj = form.value;

              var countryname = '';
              for(let country of this.getAllCountrymetaData){
                if(form.value.country_code==country.country_code)
                {
                  countryname = country.name;
                }      
              }

              var statename = '';
              for(let state of this.getAllStates){
                if(form.value.state==state.state_code)
                {
                  statename = state.name;
                }      
              }


              const organizationObj: any = {
                organization_id                 : '',
                name                            : createOrgObj.name || "",
                abbrev                          : createOrgObj.abbrev || "",
                mobile_phone                    : createOrgObj.phone || "",
                phone                           : createOrgObj.phone || "",
                avatar                          : createOrgObj.avatar || '',
                fax                             : createOrgObj.fax || "",
                email_address                   : createOrgObj.email || "",
                website                         : createOrgObj.website || "",
                state_code                      : createOrgObj.state || "",
                state                           : statename || "",
                country_code                    : createOrgObj.country_code || "",
                country                         : countryname || "",
                street1                         : createOrgObj.street1 || "",
                street2                         : createOrgObj.street2 || "",
                city                            : createOrgObj.city || "",
                postal_code                     : createOrgObj.postal_code || "",
                dial_code                       : createOrgObj.phonedialcode || "",
                created_datetime                : new Date(),
                created_uid                     : this.uid,
                governing_body_info             : createOrgObj.governing_body_info || "",
                sports                          : createOrgObj.sports || "",
                governing_key_array_fields      : '',
                primary_first_name              : createOrgObj.primary_first_name || "",
                primary_middle_initial          : createOrgObj.primary_middle_initial || "",
                primary_last_name               : createOrgObj.primary_last_name || "",
                primary_suffix                  : createOrgObj.primary_suffix || "",
                primary_admin_email             : createOrgObj.primary_admin_email || "",
                primary_user_id                 : this.uid || "",
                secondary_first_name            : createOrgObj.secondary_first_name || "",
                secondary_middle_initial        : createOrgObj.secondary_middle_initial || "",
                secondary_last_name             : createOrgObj.secondary_last_name || "",
                secondary_suffix                : createOrgObj.secondary_suffix || "",
                secondary_admin_email           : createOrgObj.secondary_admin_email || "",
                secondary_user_id               : this.uid || ""
              }


              console.log('---- create organizationObj----', organizationObj)
              //return false;

              this.logger.debug('Manager Meta Delete API Start Here====>', new Date().toUTCString());      

              this.restApiService.create('organization',organizationObj).subscribe(resorg => {
                
                        
                this.logger.debug('Manager Meta Delete API End Here====>', new Date().toUTCString());          
                console.log(resorg.organization_id);

                this.organizationsService.orgdataStore.org = [];
                let Metaurl= '';

                Metaurl='organization';
                this.organizationsService.organizationsList(Metaurl);
                //this.managerCrudService.dataStore.managers.push(data);
                //this.managerCrudService.dataStore.managers = [data].concat(this.managerCrudService.dataStore.managers);
                //this.managerCrudService._managers.next(Object.assign({}, this.managerCrudService.dataStore).managers);


                //console.log('---resorg-----', resorg)
                //this.organizationsService.orgdataStore.org.push(resorg)
                
                //this.router.navigate(['/organizations']); 
                this.router.navigate(['/organizations/view/'+resorg.organization_id]);
                this.notification.isNotification(true, "Organization Data", "Organization has been added successfully.", "check-square");

              });
          } catch (error) {
              
            console.log(error);
            
          }
    }else{
      console.log('---edit process----')

      try {
        this.submitted = true;
        if (form.invalid) {
          console.log("form submit invalid");
          console.log(form);

          const invalidControl = this.el.nativeElement.querySelector('.ng-invalid');
          if (invalidControl) {
            console.log('----invalidControl----', invalidControl)
            invalidControl.focus();
          }

          return;
        }

        this.displayLoader = true;
              this.loading = true;
              console.log("form submit valid");  
              console.log(form);
            
              this.uid = this.cookieService.getCookie('uid');
              this.orgId = localStorage.getItem('org_id');
            
              let createOrgObj = form.value;

              var countryname = '';
              for(let country of this.getAllCountrymetaData){
                if(form.value.country_code==country.country_code)
                {
                  countryname = country.name;
                }      
              }

              var statename = '';
              for(let state of this.getAllStates){
                if(form.value.state==state.state_code)
                {
                  statename = state.name;
                }      
              }


              const organizationObj: any = {
                organization_id                 : this.selectedOrganizationId || "",
                name                            : createOrgObj.name || "",
                abbrev                          : createOrgObj.abbrev || "",
                mobile_phone                    : createOrgObj.phone || "",
                phone                           : createOrgObj.phone || "",
                avatar                          : createOrgObj.avatar || '',
                fax                             : createOrgObj.fax || "",
                email_address                   : createOrgObj.email || "",
                website                         : createOrgObj.website || "",
                state_code                      : createOrgObj.state || "",
                state                           : statename || "",
                country_code                    : createOrgObj.country_code || "",
                country                         : countryname || "",
                street1                         : createOrgObj.street1 || "",
                street2                         : createOrgObj.street2 || "",
                city                            : createOrgObj.city || "",
                postal_code                     : createOrgObj.postal_code || "",
                updated_datetime                : new Date(),
                updated_uid                     : this.uid,
                governing_body_info             : createOrgObj.governing_body_info || "",
                sports                          : createOrgObj.sports || "",
                governing_key_array_fields      : '',
                primary_first_name              : createOrgObj.primary_first_name || "",
                primary_middle_initial          : createOrgObj.primary_middle_initial || "",
                primary_last_name               : createOrgObj.primary_last_name || "",
                primary_suffix                  : createOrgObj.primary_suffix || "",
                primary_admin_email             : createOrgObj.primary_admin_email || "",
                primary_user_id                 : this.uid || "",
                secondary_first_name            : createOrgObj.secondary_first_name || "",
                secondary_middle_initial        : createOrgObj.secondary_middle_initial || "",
                secondary_last_name             : createOrgObj.secondary_last_name || "",
                secondary_suffix                : createOrgObj.secondary_suffix || "",
                secondary_admin_email           : createOrgObj.secondary_admin_email || "",
                secondary_user_id               : this.uid || ""
              }


              console.log('----update organizationObj----', organizationObj)
              //return false;

              this.restApiService.update('organization/'+this.selectedOrganizationId,organizationObj).subscribe(resorg => {

                this.organizationsService.orgdataStore.org = [];
                let Metaurl= '';
                
                Metaurl='organization';
                this.organizationsService.organizationsList(Metaurl);

                //this.router.navigate(['/organizations']);
                this.router.navigate(['/organizations/view/'+this.selectedOrganizationId]);
                this.notification.isNotification(true, "Organization Data", "Organization has been updated successfully.", "check-square");

              },error => {
                console.log('---error API response----')
              })

      }catch (error) {
              
        console.log(error);
        
      }
    }
    
    /* let createObjOrg: any = [];
    createObjOrg = await this.db.collection('organization').add(organizationObj);
      await createObjOrg.set({ organization_id: createObjOrg.id }, { merge: true });
      this.router.navigate(['/organizations']); */



    return false;

    
     /*  this.getSelectedSportmeta = await this.db.collection('sports').doc(form.value.sport_id).get();
    if (this.getSelectedSportmeta.exists) {
      this.getSelectedSportmetaData = this.getSelectedSportmeta.data();
    } else {
      this.getSelectedSportmetaData = [];
    } 

      if(form.value.is_required == true) { this.is_required_form_value = 'true'; } else { this.is_required_form_value = 'false'; }
      if(form.value.is_editable == true) { this.is_editable_form_value = 'true'; } else { this.is_editable_form_value = 'false'; }
      if(form.value.is_deletable == true) { this.is_deletable_form_value = 'true'; } else { this.is_deletable_form_value = 'false'; }

      let insertObj = {
        "organization_id": this.orgId || "",
        "sport_id": form.value.sport_id,
        "sport": this.getSelectedSportmetaData.name,
        "field_name": form.value.field_name,
        "field_type": form.value.field_type,
        "value": this.value,
        "is_deletable": this.is_deletable_form_value,
        "is_editable": this.is_editable_form_value,
        "is_required": this.is_required_form_value,
        "created_datetime": new Date(),
        "created_uid": this.uid,
        "updated_datetime": new Date(),
        "updated_uid": "",
        "is_active": false,
        "is_deleted": false,
    }

      let createObjRoot = await this.db.collection('playermetadata').add(insertObj);
      await createObjRoot.set({ field_id: createObjRoot.id }, { merge: true });
      this.router.navigate(['/playermeta']); */

    /* } catch (error) {
      
      console.log(error);
       
    } */
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

