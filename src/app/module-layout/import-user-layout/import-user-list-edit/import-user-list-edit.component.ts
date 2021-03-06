import { Component, OnInit, EventEmitter, Output, Injector } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { DataService } from 'src/app/core/services/data.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { SharedService } from 'src/app/shared/shared.service';
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import * as moment from 'moment';
import { RESOURCE_CACHE_PROVIDER } from '@angular/platform-browser-dynamic';

import { RestApiService } from '../../../shared/rest-api.services';

  @Component({
    selector: 'app-import-user-list-edit',
    templateUrl: './import-user-list-edit.component.html',
    styleUrls: ['./import-user-list-edit.component.scss']
  })
  export class ImportUserListEditComponent implements OnInit {
  
    resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    importID = this.route.snapshot.paramMap.get('resourceId'); 

    viewUserListType: any;
  
    db: any = firebase.firestore();
    value: any = [];
    getAllplayerlist: any = [];
    getAllPlayerlistData: any = [];
  
    data: any;     
    uid: any;
    orgId: any;

    getUserData: any = [];
  
    gender: any = [
      { name: 'Male' },
      { name: 'Female' }
    ];
    levelList: any = [];
    levelListsArr: any = [];
    stateList: any; 
    countryCodeList: any = [
      { name: 'United State', country_code:'US' },
      { name: 'Canada', country_code:'CA' }
    ];
    
  loading = true;
  displayLoader: any = true;

  submitted = false;
  createImportUserForm: FormGroup;

  
  getAllLevel:any=[];
  getAllLevelData:any=[];
  getImportData:any=[];
  ImportLogID:any;

  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    public cookieService: CookieService, 
    private notification: NgiNotificationService,
    public dataService: DataService,
    private restApiService: RestApiService,
    private dropDownService: DropdownService) { 
    
  }

  async getAllStateList() { 
    let getAllStateResponse: any = await this.dropDownService.getAllStates();
    try {
      if (getAllStateResponse.status) {
        this.stateList = getAllStateResponse.data; 
      }
      else {
        this.stateList = []; 
      }
    } catch (error) {
      console.log(error);
      this.stateList = []; 
    }
  }
  
    
  createForm() {
    this.createImportUserForm = this.formBuilder.group({
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
    });

    /*
    this.createImportUserForm = this.formBuilder.group({
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
    */
  }

    ngOnInit() {
      this.ImportLogID = localStorage.getItem('resourceID');
      this.loading = true;
      this.displayLoader = true;
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getAllStateList();
      this.levelListdata()
      this.getUserList();  
      this.createForm();
      
    }
  
    async levelListdata()
    {
      this.restApiService.lists('levelsbyorg/'+this.orgId).subscribe( leveldata => {
        this.levelList = leveldata
        
        leveldata.forEach( le => {
          this.levelListsArr.push(le.level_name)
        })
        
      }, err =>{
        console.log('---error for fetching data----')
      })
    }

    async getUserList(){


      this.restApiService.lists('importuserdatabyid/'+this.resourceID).subscribe( importdata => {
        console.log('----importdata----', importdata)
        this.getUserData = importdata;

        if (typeof (this.getUserData.player_dob) !== "string") {
          this.getUserData.player_dob = moment(this.getUserData.player_dob).format('MM-DD-YYYY').toString();
        } else {
          this.getUserData.player_dob = moment(this.getUserData.player_dob).format('MM-DD-YYYY').toString();
        }

        this.loading = false;
        this.displayLoader = false; 

      }, err =>{
        console.log('---error for fetching data----')
      })
      console.log('-----testttt----', this.ImportLogID); 
      console.log(this.resourceID);return false
      
      this.getAllLevel = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').where("imported_file_id", '==', this.ImportLogID).get();  
      this.getAllLevelData = await this.getAllLevel.docs.map((doc: any) => doc.data());
      this.getImportData = this.getAllLevelData[0];
      console.log(this.getImportData);

      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').doc(this.ImportLogID).collection('/imported_users_data').where('id', '==', this.resourceID).get();

      this.getAllPlayerlistData = await this.getAllplayerlist.docs.map((doc: any) => doc.data());
   
      this.getUserData = this.getAllPlayerlistData[0];
      this.getUserData.athlete_1_dob_value = this.getUserData.athlete_1_dob.toDate();

      if (typeof (this.getUserData.athlete_1_dob) !== "string") {
        this.getUserData.athlete_1_dob_value = moment(this.getUserData.athlete_1_dob.toDate()).format('MM-DD-YYYY').toString();
      } else {
        this.getUserData.athlete_1_dob_value = moment(this.getUserData.athlete_1_dob.toDate()).format('MM-DD-YYYY').toString();
      }
      console.log(this.getUserData.athlete_1_dob_value);
      console.log(this.getUserData);

      //this.createForm();
      this.loading = false;
      this.displayLoader = false; 

    }

    
   
  get f() { return this.createImportUserForm.controls; }

  formdata:any={};
  async onSubmit(form) {
    
    console.log("this.viewUserListType", this.viewUserListType);
    this.submitted = true;
    console.log(form.value);
    
    //this.levelList

    var levelValid = false;
    if(this.levelListsArr.indexOf(form.value.level_of_play) != -1)
    { 
      levelValid = true;
    }

    let dob = Date.parse(form.value.player_DOB); 
   
    if( form.value.player_first_name != '' && form.value.player_last_name !=''
    && dob !== NaN && levelValid == true && form.value.guardian1_email_address !=''
    ){
      console.log('-----valid data----')
            this.formdata = {
            
              player_first_name               : form.value.player_first_name,
              player_middle_name              : form.value.player_initial,
              player_last_name                : form.value.player_last_name,
              player_dob                      : form.value.player_DOB,
              player_gender                   : form.value.player_gender,
              player_level                    : form.value.level_of_play,
              //player_email                    : form.value.,
              //player_address1                 : form.value.address,
              //player_address2                 : form.value.,
              player_city                     : form.value.city,
              player_state                    : form.value.state,
              player_postalcode               : form.value.postal_code,
              player_country                  : form.value.country,
              guard_1_firstname               : form.value.guardian1_first_name,
              guard_1_lastname                : form.value.guardian1_last_name,
              //guard_1_phone                   : form.value.,
              guard_1_email                   : form.value.guardian1_email_address,
              guard_2_firstname               : form.value.guardian2_first_name,
              guard_2_lastname                : form.value.guardian2_last_name,
              //guard_2_phone                   : form.value.,
              guard_2_email                   : form.value.guardian2_email_address,
              error_description               : [],
              error_for_status                : [],
              processed_flag                  : 'N',
              //level_id                        : ''
          }
          
          this.restApiService.update('importuserdata/'+this.resourceID,this.formdata).subscribe( updated => {
            console.log('---updated----', updated)

                    const userObj = {
                      user_id: '',
                      first_name: form.value.player_first_name || "",
                      middle_initial: form.value.player_initial || '',
                      last_name: form.value.player_last_name || "",
                      suffix:  '',
                      gender: form.value.player_gender,
                      date_of_birth: form.value.player_DOB || "",
                      email_address: this.getUserData.player_email || "",
                      mobile_phone:  "",
                      parent_user_id: [],
                      city: form.value.city || "",
                      country_code: form.value.country || "",
                      country: "",
                      postal_code: form.value.postal_code || "",
                      state:  "",
                      state_code: form.value.state || "",
                      street1: this.getUserData.player_address1 || "",
                      street2: this.getUserData.player_address2 || "",
                      organization_id: this.orgId || "",
                      organization_name:  "",
                      organization_abbrev:  "",
                      created_datetime: new Date() || "",
                      created_uid: this.uid || "",
                      is_invited: false,
                      is_signup_completed: false,
                      profile_image: '',
                      roles: ['player'],
                      organizations: [this.orgId]
                  }
                  this.restApiService.create('users',userObj).subscribe( usercreated => {
                    this.notification.isNotification(true, "Import Users", 'Successfully updated', "check-square");
                    this.router.navigate(['/useruploads/userlist/'+this.resourceID]);
                  }, e => {
                    this.submitted = false;
                    this.reInitialise();
                    this.notification.isNotification(true, "Created Users Error", 'Invalid Data', "check-square");
                    this.router.navigate(['/useruploads/userlist/'+this.resourceID]);
                  })
            
          })
          console.log('---formdata----', this.formdata)
    }else{

      this.submitted = false;
      this.reInitialise();
      this.notification.isNotification(true, "Import Users Error", 'Invalid Data', "check-square");
      this.router.navigate(['/useruploads/userlist/'+this.resourceID]);
    }

    
    return false;


    form.controls.processed_flag.patchValue("N");
    form.controls.player_dob.patchValue( new Date(form.value.player_DOB));
    form.controls.error_description.patchValue([]);
    form.controls.error_for_status.patchValue([]);
    form.controls.level_id.patchValue("nftTeZMmH7ALCX7Nl7yO");
    //form.controls.id.patchValue(this.importID);
    
    console.log(form.value);
    
    this.formdata.imported_file_id = this.getImportData.imported_file_id;
    this.formdata.imported_log_data_id = this.importID;
    this.formdata.intelimObj = form.value;
    this.formdata.organization_id = this.orgId;
    this.formdata.user_id = this.getImportData.imported_user_id;
    
    /*
    this.formdata.intelimObj.processed_flag = "N";
    this.formdata.intelimObj.player_DOB = new Date(form.value.player_DOB);
    this.formdata.intelimObj.error_description = [];
    */

    console.log(this.formdata); 
    
    
    if (form.invalid) {
      console.log("form.value.console.error");
      console.log(form.value.console.error);
      return
    }
    /*
    form.controls.intelimObj['controls'].processed_flag.patchValue("N");
    form.value.intelimObj.player_DOB = new Date(form.vNalue.intelimObj.player_DOB);
    form.value.intelimObj.error_description = [];
    */
    this.displayLoader = true;
    this.loading = true;
    
    
    this.dataService.postData(apiURL.UPDATE_ERROR_RECORD, this.formdata, localStorage.getItem('token')).subscribe(res => {
      
        console.log(res);

        if (res.status) {
          this.notification.isNotification(true, "Import Users", res.message, "check-square");
          console.log("FIRST VIMAL");
          this.router.navigate(['/useruploads/userlist/'+this.ImportLogID]);
 
        }
        else {
          this.submitted = false;
          this.reInitialise();
          this.notification.isNotification(true, "Import Users Error", res.message, "check-square");
          console.log("SECOND VIMAL");
          this.router.navigate(['/useruploads/userlist/'+this.ImportLogID]);
          
        }

      /*
        try {
        
        if (res.status) {
          this.injectedData.data.viewBy = "Error";
          //this.afterSavingData(loaderWhileUpdate);          
          //this.change.emit({ action: "errorUserImport", data: this.injectedData.data })
          this.notification.isNotification(true, "Import Users", res.message, "check-square");
          console.log("FIRST VIMAL");
        }
        else {
          this.submitted = false;
          //this.afterSavingData(loaderWhileUpdate);
          this.reInitialise();
          //this.error = res.message;
          console.log("SECOND VIMAL");
        }
      } catch (error) {
        console.log(error);
        //this.afterSavingData(loaderWhileUpdate);
        this.reInitialise();
        console.log("ERROR VIMAL");
      }
      */
    })


  }

  afterSavingData(loaderForCreate?: any) {
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    
  }
  goBack() {
    this.injectedData.data.viewBy = "Error";
  }
  
    listUser(){
      this.router.navigate(['/useruploads/list']);
    }
  
    addUser(){
      this.router.navigate(['/useruploads/createlist']);
    }
    
    viewUser(resourceId: string){
      this.router.navigate(['/useruploads/viewlist/'+resourceId]);
    }
    
    editUser(resourceId: string){
      this.router.navigate(['/useruploads/editlist/'+resourceId]);
    }
  
    refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/useruploads/list']);
    }
   
    injectedData: any;
    
    editUserRecord(data) {
     this.router.navigate(['/useruploads/editlist/'+data]);
    }
  
  }
  
  