import { Component, OnInit, EventEmitter, Output, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase';
import { ImportLogService } from '../importLog-service'
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-import-user-create',
  templateUrl: './import-user-create.component.html',
  styleUrls: ['./import-user-create.component.scss']
})
export class ImportUserCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  orgId: any;
  sportId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  submitted = false;
  error = '';
  isSaveUp: boolean = false;
  uid: any;
  sportValid: boolean = false;
  data: any;
  sportSelect: boolean = true;
  SportsList: any;
  seasonSelect: any;
  seasonList: any;
  seasonValid: boolean = false;
  fileValid: boolean = false;
  fileType: boolean = false;
  fileSize: boolean = false;
  selectedImage: any;
  basePath: string = '/tmp';
  metadata: any;
  progress = 0;
  fileList: any = [
    { name: "Standard User Import Template" },
    { name: "SportsEngine User Import Template" }
  ];
  userName: any;
  userData: any;
  userFullName: any;
  injectedData: any;
  createUserImportForm: FormGroup;
  constructor(private dropDownService: DropdownService, private injector: Injector, private notification: NgiNotificationService, private importService: ImportLogService, private storage: AngularFireStorage, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.userName = this.cookieService.getCookie('userName');
    this.userData = this.cookieService.getCookie('user');
    this.userData = JSON.parse(this.userData);
    // this.userData = this.userData.user;
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
  }

  ngOnInit() {
    this.displayLoader = false;
    this.injectedData = this.injector.get('injectData')
    localStorage.setItem('uploadedFile', null)
    this.sharedService.announceMission('userImport');
    this.createUserImportForm = this.formBuilder.group({
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
    if (this.injectedData.data) {
      this.orgId = this.injectedData.data.organization_id;
      if (this.injectedData.data.organization_id) {
        this.getSportsByOrg(this.injectedData.data.organization_id);
      }
      if (this.injectedData.data.sports_id) {
        this.getSeasonBySport(this.injectedData.data.sports_id)
      }
      this.createUserImportForm.patchValue({
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
    }
    else {
      this.orgId = localStorage.getItem('org_id')
      if (this.orgId) {
        this.getSportsByOrg(this.orgId)
      }
    }


  }
  get f() { return this.createUserImportForm.controls; }

  // getRefTemplate(event) {

  //   this.storage.ref('/sampleUserImportTemplate/UserImportTemplate.xlsx').getDownloadURL().toPromise().then(response => {
  //     console.log(response);
  //   }).catch(error => {
  //     console.log(error);
  //   })
  // }

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
          this.createUserImportForm['controls'].file_id.patchValue(fileName);
          let storageRef = firebase.storage().ref();
          this.createUserImportForm['controls'].imported_file_name.patchValue(event.target.files[0].name);

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
  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
  }
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }
  async onSubmit(form) {
    if (localStorage.getItem('uploadedFile') && localStorage.getItem('uploadedFile') !== 'null') {
      this.createUserImportForm.patchValue({
        imported_file_url: localStorage.getItem('uploadedFile')
      })
    }

    this.submitted = true;
    if (form.invalid) {
      if (!form.value.sports_id) {
        this.sportValid = true;
      }
      if (!form.value.season_id) {
        this.seasonValid = true;
      }
      if (!form.value.imported_file_template) {
        this.fileValid = true
      }
      return;
    }
    this.createUserImportForm.patchValue({
      auth_id: this.uid,
      organization_id: this.orgId,
      imported_by: this.userFullName,
      imported_user_email_id: this.userData.email_address || ""
    })
    form.value.status = [];
    if (this.injectedData.data && this.injectedData.data.imported_file_id) {
      form.value.imported_file_id = this.injectedData.data.imported_file_id || "";
      form.value.imported_datetime = this.injectedData.data.imported_datetime ? this.injectedData.data.imported_datetime.toDate() : new Date()
    } else {
      form.value.imported_datetime = new Date();
    }

    this.displayLoader = true;
    this.loading = true;
    let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");

    try {
      let res = await this.importService.uploadRegistrationFile(form.value);
      console.log(res);
      if (res.status) {
        this.afterSavingData(loaderForCreate);
        this.change.emit({ action: "userImport" })
      }
      else {
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
        form.reset();
        this.progress = 0;
        this.error = res.message;
      }
    } catch (error) {
      console.log(error);
      this.afterSavingData(loaderForCreate);
      this.reInitialise();
      this.progress = 0;
      this.error = error.message;
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
  closeError() {
    this.error = '';
  }

  goBack() {
    this.change.emit({ action: "userImport" })
  }
}
