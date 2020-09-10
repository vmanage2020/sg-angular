import { Component, OnInit, EventEmitter, Output, Injector } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { AngularFireStorage } from '@angular/fire/storage';
import { SharedService } from 'src/app/shared/shared.service';
import { NgiNotificationService } from 'ngi-notification';

import { ImportLogService } from '../importLog-service'
import { RestApiService } from '../../../shared/rest-api.services';

@Component({
  selector: 'app-import-user-list-create',
  templateUrl: './import-user-list-create.component.html',
  styleUrls: ['./import-user-list-create.component.scss']
})
export class ImportUserListCreateComponent implements OnInit {
  @Output() change = new EventEmitter();

  db: any = firebase.firestore();
  value: any = [];

  userName: any;
  userData: any;
  userFullName: any;
  injectedData: any;

  getSports: any = [];
  getSportsData: any = [];
  getSportsArray: any = [];

  
  getSeasons: any = [];
  getSeasonsData: any = [];
  getSeasonsArray: any = [];

  getTemplate: any = [];
  getTemplateArray: any = [{id:'1',name: "Standard User Import Template"},{id:'2',name: "SportsEngine User Import Template"}];

  getCannedResponse: any = [];
  getCannedResponseData: any = [];
  getCannedResponseArray: any = [];


  country: any = [];
  countryCodeSelect: any = [];
  
  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  uid: any;
  orgId: any;
  orgName: any;
  orgAbbrev: any;

  loading = true;
  displayLoader: any = true;

  submitted = false;
  createcannedresponseForm: FormGroup;

  
  fileValid: boolean = false;
  fileType: boolean = false;
  fileSize: boolean = false;
  selectedImage: any;
  basePath: string = '/tmp';
  metadata: any;
  progress = 0;

  constructor( private sharedService: SharedService, 
    private injector: Injector,
     private router: Router,
      private formBuilder: FormBuilder,
      public cookieService: CookieService, 
      private importLogService: ImportLogService,
      private restApiService: RestApiService,
      private notification: NgiNotificationService) { 
    
    this.userName = this.cookieService.getCookie('userName');
    this.userData = this.cookieService.getCookie('user');
    this.userData = JSON.parse(this.userData);
    this.userData.first_name = this.userData.first_name || "";
    this.userData.middle_initial = this.userData.middle_initial || "";
    this.userData.last_name = this.userData.last_name || "";
    this.userData.suffix = this.userData.suffix || "";
    this.userData.email_address = this.userData.email_address || "";

    this.userFullName = this.userData.first_name + " " + this.userData.middle_initial + " " + this.userData.last_name + " " + this.userData.suffix;
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data === "userImportRouter") {
          this.change.emit({ action: "userImport" })
        }
      }
    })
    this.orgId = localStorage.getItem('org_id');
    
  }
  
  

  ngOnInit() {

    
    //this.loading = false;
    //this.displayLoader = false;

    //this.injectedData = this.injector.get('injectData')
    localStorage.setItem('uploadedFile', null)
    this.sharedService.announceMission('userImport');
    
    this.createcannedresponseForm = this.formBuilder.group({
      auth_id: [''],
      file_id: [''],
      sports_name: [''],
      imported_by: [''],
      organization_id: [''],
      season_name: [''],
      sports_id: [null, [Validators.required]],
      season_id: [null, [Validators.required]],
      imported_file_url: [''],
      imported_file_name: ['', [Validators.required]],
      total_records: [''],
      imported_file_template: [null, [Validators.required]],
      season_end_date: [''],
      season_start_date: [''],
      status: ['']
    });

    /*
    if (this.injectedData.data) {
      this.orgId = this.injectedData.data.organization_id;
      this.createcannedresponseForm.patchValue({
        auth_id: this.uid,
        sports_name: this.injectedData.data.sports_name,
        organization_id: this.injectedData.data.organization_id,
        season_name: this.injectedData.data.season_name,
        sports_id: this.injectedData.data.sports_id,
        season_id: this.injectedData.data.season_id,
        season_end_date: this.injectedData.data.season_end_date,
        season_start_date: this.injectedData.data.season_start_date,
        imported_file_template: this.injectedData.data.imported_file_template
      })     
    } else {
      this.orgId = localStorage.getItem('org_id')
    }
    */

    
    //this.createForm(); 
    this.getAllSports();
    this.getAllSeasons();
    this.loading = false;
    this.displayLoader = false;
  }

  
  createForm() {

    this.createcannedresponseForm = this.formBuilder.group({
      auth_id: [''],
      file_id: [''],
      sports_name: [''],
      imported_by: [''],
      organization_id: [''],
      season_name: [''],
      sports_id: [null, [Validators.required]],
      season_id: [null, [Validators.required]],
      imported_file_url: [''],
      imported_file_name: ['', [Validators.required]],
      total_records: [''],
      imported_file_template: [null, [Validators.required]],
      season_end_date: [''],
      season_start_date: [''],
      status: ['']
    }); 

  }

  async getAllSports(){    
    
    if(this.importLogService.sportsdataStore.sports.length > 0)
    {
      this.getSportsArray = this.importLogService.sportsdataStore.sports;
    }else{
      setTimeout(() => {
          this.getAllSports();
      }, 1000);
    }
    //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
    /* this.getSports = await this.db.collection('/organization').doc(this.orgId).collection('/sports').orderBy('sport_id').get();
    this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
    this.getSportsArray = this.getSportsData; 
    console.log(this.getSportsArray); */

  }

  
  async getAllSeasons(){    
    
    //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
    //this.getSeasons = await this.db.collection('/organization').doc(this.orgId).collection('/seasons').orderBy('season_id').get();
    console.log('----orgId----', this.orgId)
    this.restApiService.lists('seasonsbyorg/'+ this.orgId).subscribe( seasons => {
      this.getSeasonsArray = seasons
    }, error => {
      console.log('---error API response----')
    })
    /* this.getSeasons = await this.db.collection('seasons').where('organization_id', '==', this.orgId).get();
    this.getSeasonsData = await this.getSeasons.docs.map((doc: any) => doc.data());
    this.getSeasonsArray = this.getSeasonsData; 
    console.log(this.getSeasonsArray); */

  }

  async getSeasonsBySport(sid:any){    
    
    //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
    //this.getSeasons = await this.db.collection('/organization').doc(this.orgId).collection('/seasons').orderBy('season_id').get();
    this.restApiService.lists('seasonsbysports/'+ sid).subscribe( seasons => {
      this.getSeasonsArray = seasons
    }, error => {
      console.log('---error API response----')
    })
    /* this.getSeasons = await this.db.collection('seasons').where('organization_id', '==', this.orgId).where('sports_id', '==', sid).get();
    this.getSeasonsData = await this.getSeasons.docs.map((doc: any) => doc.data());
    this.getSeasonsArray = this.getSeasonsData; 
    console.log(this.getSeasonsArray); */

  }

   
  get f() { return this.createcannedresponseForm.controls; }

  async onSubmit(form) {
    if (localStorage.getItem('uploadedFile') && localStorage.getItem('uploadedFile') !== 'null') {
      this.createcannedresponseForm.patchValue({
        imported_file_url: localStorage.getItem('uploadedFile')
      })
    }

    
  
    try {
      this.submitted = true;
      if (form.invalid) {
        return;
      }
      
      console.log(form.value);

    this.displayLoader = true;
    this.loading = true;
   
    

    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.orgName = localStorage.getItem('org_name');
    this.orgAbbrev = localStorage.getItem('org_abbrev');


    let form_value_sports_name = localStorage.getItem('SelectedSportName');
    let form_value_season_name = localStorage.getItem('SelectedSeasonName');
    let form_value_season_start_date = localStorage.getItem('SelectedSeasonStartDate');
    let form_value_season_end_date = localStorage.getItem('SelectedSeasonEndDate');
    

    
    this.createcannedresponseForm.patchValue({
      auth_id: this.uid,
      organization_id: this.orgId,
      imported_by: this.userFullName,
      imported_user_email_id: this.userData.email_address || ""
    })
           
    form.value.status = [];
    form.value.imported_datetime = new Date();

    const userRegisterationDataObj: any = {
      // "": '',
      "file_id": form.value.file_id,
      "imported_user_id": form.value.auth_id,
      "imported_by": form.value.imported_by,
      "imported_datetime": form.value.imported_datetime,
      "imported_file_url": form.value.imported_file_url,
      "imported_file_name": form.value.imported_file_name,
      "imported_file_template": form.value.imported_file_template,
      "organization_id": form.value.organization_id,
      "sports_id": form.value.sports_id,
      "sports_name": form_value_sports_name,
      "season_id": form.value.season_id,
      "season_name": form_value_season_name,
      "status": form.value.status || [],
      "season_start_date": new Date(form_value_season_start_date),
      "season_end_date": new Date(form_value_season_end_date),
      "total_records": form.value.total_records || 0,
      "processed_records": 0,
      "error_records": 0,
      "erroDes": [],
      "processed_Flag": 'N',
      "total_records_found": 0,
      "total_players_found": 0,
      "total_guardains_found": 0,
      "player_records_created": 0,
      "guardian_records_created": 0,
      "player_duplicate_records_found": 0,
      "guardian_duplicate_records_found": 0
  }
  let dt = new Date();
  console.log("userRegisterationDataObj.season_end_date");
  console.log(userRegisterationDataObj.season_end_date);

  userRegisterationDataObj.season_end_date = new Date(userRegisterationDataObj.season_end_date);
  console.log(userRegisterationDataObj.season_end_date);
  if (userRegisterationDataObj.season_end_date >= dt) {
      userRegisterationDataObj.isActive = true;
  } else {
      userRegisterationDataObj.isActive = false;
  }
  
  //console.log('------userRegisterationDataObj-----',userRegisterationDataObj); 
  //return false;

  /*
  const organizationRef = await this.db.collection('/organization').doc(userRegisterationDataObj.organization_id).get();
            if (organizationRef.exists) {
                if (userRegisterationDataObj.imported_file_id) {
                    await organizationRef.ref.collection('/import_users_log').doc(userRegisterationDataObj.imported_file_id).delete();
                    let importedUserSnapshot = await organizationRef.ref.collection('/import_users_log').add(userRegisterationDataObj);
                    await importedUserSnapshot.set({ imported_file_id: importedUserSnapshot.id }, { merge: true })
                    //return { status: true, message: "File Imported Successfully", data: importedUserSnapshot };
                } else {
                    let importedUserSnapshot = await organizationRef.ref.collection('/import_users_log').add(userRegisterationDataObj);
                    await importedUserSnapshot.set({ imported_file_id: importedUserSnapshot.id }, { merge: true })
                    //return { status: true, message: "File Imported Successfully", data: importedUserSnapshot };
                }
                console.log("importedUserSnapshot"); 
            } else {
              console.log(userRegisterationDataObj); 
            }
    */
 /*  let importedUserSnapshot = await this.db.collection('/organization').doc(userRegisterationDataObj.organization_id).collection('/import_users_log').add(userRegisterationDataObj);
  await importedUserSnapshot.set({ imported_file_id: importedUserSnapshot.id }, { merge: true })

    

      
      this.router.navigate(['/useruploads/list']);

      this.notification.isNotification(true, "Import User Data", "Import Users has been added successfully.", "check-square"); */



      this.restApiService.create('importuserlogs',userRegisterationDataObj).subscribe( importusers => {

        this.importLogService.dataStore.userlogs.push(importusers);
        
        this.router.navigate(['/useruploads/list']);

        this.notification.isNotification(true, "Import User Data", "Import Users has been added successfully.", "check-square");

      },error =>{
        console.log('-----Create API error response----')
      })

      
    } catch (error) {
      
      console.log(error);
       
    }
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

  async deleteUser(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Level Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          await this.db.collection('levels').doc(resourceId).delete();
          this.notification.isNotification(true, "Level Data", "Level Data has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Level Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/level/list']);
}

/*
async getSportsByOrg(orgId) {
  this.sportSelect = true;
  let getSportsByOrganizationRequest: any = {
    'auth_uid': this.uid, 'organization_id': orgId
  }
  let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
  try {
    if (getSportsByOrganizationResponse.status) {
      this.SportsList = getSportsByOrganizationResponse.data;
      if (this.SportsList.length === 1) {
        if (!this.createUserImportForm.controls.sports_id.value) {
          this.createUserImportForm.patchValue({
            sports_id: this.SportsList[0].sport_id,
            sports_name: this.SportsList[0].name
          })
          this.getSeasonBySport(this.SportsList[0].sport_id)
        }
      }
      this.sportSelect = false
    } else {
      this.SportsList = []
      this.sportSelect = false;
    }
  } catch (error) {
    console.log(error);
    this.SportsList = [];
    this.sportSelect = false;

  }
}
selectedSeason(event, form) {
  console.log(event)
  if (event.type === "focus") {
    if (this.orgId) {
      if (form.value.sports_id) {
        this.sportValid = false
      }
      else {
        this.sportValid = true
      }
    }
    else {
      this.sharedService.announceMission('selectOrganization');
    }
  }
  if (event.season_id) {
    this.seasonValid = false
    this.createUserImportForm.patchValue({
      season_end_date: event.season_end_date.toDate(),
      season_start_date: event.season_start_date.toDate(),
      season_name: event.season_name
    })
  }
}

selectedSport(event, form) {
  // console.log(event)
  if (event.type === "focus") {
    if (!this.orgId) {
      this.sharedService.announceMission('selectOrganization');
    }
  }
  if (event.sport_id) {
    this.sportValid = false
    this.sportId = event.sport_id
    this.createUserImportForm.patchValue({
      season_id: null,
      season_end_date: '',
      season_start_date: '',
      season_name: '',
      sports_name: event.name
    })
    this.getSeasonBySport(event.sport_id)
  }
}
async getSeasonBySport(sportId) {
  this.seasonSelect = true;
  this.seasonList = [];
  let seasonDropdownRequest: any = {
    'auth_uid': this.uid, 'organization_id': this.orgId, 'sport_id': sportId
  };
  let seasonDropdownResponse: any = await this.dropDownService.getSeasonDropdown(seasonDropdownRequest);
  try {
    if (seasonDropdownResponse.status) {
      this.seasonList = seasonDropdownResponse.data;
      this.seasonSelect = false;
    }
    else {
      this.seasonList = []
      this.seasonSelect = false;
    }
  } catch (error) {
    console.log(error);
    this.seasonList = [];
    this.seasonSelect = false;
  }
}
*/


selectedSport(event, form) {
   console.log('---event-----',event);
   if( event != undefined && this.getSportsArray.length>0)
   {
    for(let sports of this.getSportsArray){
      if(event.sport_id==sports.sport_id)
        {
          localStorage.setItem('SelectedSportName', sports.name);
          form.value.sports_name = sports.name;
        }      
      }
      this.getSeasonsBySport(event.sport_id)
   }
   
    
}

selectedSeason(event, form) {
  console.log('---season event-----',event);
  for(let seasons of this.getSeasonsArray){
    if(event.season_id==seasons.season_id)
      {
        localStorage.setItem('SelectedSeasonName', seasons.season_name);
        localStorage.setItem('SelectedSeasonStartDate', seasons.season_start_date || "0000-00-00");
        localStorage.setItem('SelectedSeasonEndDate', seasons.season_end_date || "0000-00-00");
        form.value.season_name = seasons.name;
        form.value.season_start_date = seasons.season_start_date;
        form.value.season_end_date = seasons.season_end_date;
      }      
  }
}

showPreview(event: any) {
  if (event.target.files && event.target.files[0]) {
    if (this.extensionValidation(event.target.files[0])) {
      this.fileType = false
      if (this.maxsizeValidation(event.target.files[0])) {
        this.fileSize = false
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        this.selectedImage = event.target.files[0];
        let fileName = this.uid + "_" + new Date().getTime() + "_" + this.selectedImage.name;
        this.createcannedresponseForm['controls'].file_id.patchValue(fileName);
        let storageRef = firebase.storage().ref();
        this.createcannedresponseForm['controls'].imported_file_name.patchValue(event.target.files[0].name);

        let uploadTask = storageRef.child(fileName).put(this.selectedImage, this.metadata);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
            this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log(this.progress,"progress");
          },
          (error) => {
            // upload failed
            console.log(error)
          },
          () => {
            // upload success
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              if (downloadURL) {
                localStorage.setItem('uploadedFile', downloadURL);
                // this.uploadedimg = downloadURL;
                console.log(downloadURL);

              } else {
                localStorage.setItem('uploadedFile', downloadURL)
              }
            });
          }
        );
      } else {
        // console.log("exceeded the max size")
        this.fileSize = true
      }
    }
    else {
      // console.log("type is not match")
      this.fileType = true
    }
  }
  else {
    this.selectedImage = this.selectedImage;
    this.fileType = false;
    this.fileSize = false;
  }
}
extensionValidation(file: any): boolean { // extension validation
  // console.log('type', file);
  // console.log(this.config.isAllowFileFormats);
  let re = /(?:\.([^.]+))?$/;
  let ext = re.exec(file.name)[1];

  try {
    let isAllowed: any;
    isAllowed = Constant.allowed_file_format.find(val => { return val === ext })
    let fileType = Constant.allowed_file_format.filter(val => val === ext)
    console.log(fileType)
    if (fileType[0] === Constant.allowed_file_format[0]) {
      this.metadata = {
        contentType: 'text/csv',
      }
    } else if (fileType[0] === Constant.allowed_file_format[1]) {
      this.metadata = {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    }
    else if (fileType[0] === Constant.allowed_file_format[2]) {
      this.metadata = {
        contentType: 'application/vnd.ms-excel',
      }
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
    return (size < Constant.file_size);
  } catch (error) {
    return false;
  }
}
selectFile() {
  this.fileValid = false;
}
 
}





