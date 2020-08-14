import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { apiURL, Constant } from 'src/app/core/services/config';
import { Validators, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { LevelService } from '../level-service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

@Component({
  selector: 'app-level-create',
  templateUrl: './level-create.component.html',
  styleUrls: ['./level-create.component.scss']
})
export class LevelCreateComponent implements OnInit {
  getValuesToDisplay: any = {};
  @Output() change = new EventEmitter();
  submitted = false;
  error = '';
  isSaveUp: boolean = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  saves: boolean = false;
  createLevelForm: FormGroup;
  sportSelect: boolean = false;
  data: any;
  orgId: any;
  roleId: any;
  isNationalExist: any;
  sysAdminWithId: boolean = false;
  SportsList: any;
  levelList: any;
  isLevelSelected: boolean = false;
  levelSelect: boolean = false;
  isLevelhasDropDown: boolean = false;
  injectedData: any;
  isNationalBody: boolean = false;
  constructor(private dropDownService: DropdownService, private notification: NgiNotificationService, private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder,
    private route: ActivatedRoute, private router: Router, public dataService: DataService, public levelService: LevelService) {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "levelRouter") {
          if (this.injectedData) {
            this.change.emit({ action: "levelgrid", data: this.injectedData.data })
          }
        }
      }
    })

  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "create";
    this.displayLoader = false;
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('level');
    this.createLevelForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      sport_id: [null, [Validators.required]],
      sport_name: [''],
      level_name: [null, [Validators.required]],
      abbreviation: ['', [Validators.required]],
      description: ['']
    });
    this.getSportsByOrganization(this.orgId);
    if (this.injectedData) {
      if (this.injectedData.data) {
        if (this.injectedData.data.sport_id) {
          this.createLevelForm.patchValue({
            sport_id: this.injectedData.data.sport_id,
            sport_name: this.injectedData.data.sport_name
          })
        }
      }
    }
  }

  async getSportsByOrganization(orgId: any) {
    this.SportsList = [];
    this.sportSelect = true;
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        this.SportsList = getSportsByOrganizationResponse.data;
        if (this.SportsList.length === 1) {
          if (!this.createLevelForm.controls.sport_id.value) {
            this.createLevelForm.patchValue({
              sport_id: this.SportsList[0].sport_id,
              sport_name: this.SportsList[0].name,
            })
          }
        }
        this.sportSelect = false;
      } else {
        this.SportsList = [];
        this.sportSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.SportsList = [];
      this.sportSelect = false;
    }
  }
  get f() { return this.createLevelForm.controls; }

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.createLevelForm.patchValue({
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
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }
  async onSubmit(form) {
    try {
      this.closeError();
      this.submitted = true;
      if (form.invalid) {
        return;
      }
      form.value.organization_id = this.orgId;
      this.displayLoader = true;
      this.loading = true;
      let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
      let createLevelRes = await this.levelService.createLevel(form.value);
      if (createLevelRes.status) {
        if (this.saves) {
          await this.getCannedResponseInfoList(this.injectedData.data,form.value);
          if (this.SportsList.length === 1) {
            this.change.emit({ action: "levelgrid", data: this.getValuesToDisplay })
          } else {
            this.getValuesToDisplay.sport_id = form.value.sport_id;
            this.getValuesToDisplay.sport_name = form.value.sport_name;
            this.change.emit({ action: "levelgrid", data: this.getValuesToDisplay })
          }
          this.afterSavingData(loaderForCreate);
          this.notification.isNotification(true, "Levels", createLevelRes.data, "check-square");
        }
        else {
          form.reset();
          this.submitted = false;
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.SportsList = [];
          this.levelList = [];
          this.getSportsByOrganization(this.orgId);
          this.notification.isNotification(true, "Levels", createLevelRes.data, "check-square");
        }
      }
      else {
        this.submitted = false;
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
        this.error = createLevelRes.error
      }
    } catch (error) {
      console.log(error);
      this.submitted = false;
      this.afterSavingData();
      this.reInitialise();
      this.error = error.message
    }
  }
  async getCannedResponseInfoList(injectedData: any,formValue:any) {
    try {
      this.getValuesToDisplay.requestData = injectedData;
      injectedData.sport_id=formValue.sport_id;
      let getAllCannedResponseResponse = await this.levelService.getLevels(injectedData);
      if (getAllCannedResponseResponse) {
        if (getAllCannedResponseResponse.status) {
          if (getAllCannedResponseResponse.data.length !== 0 && typeof (getAllCannedResponseResponse.data) !== "string") {
            getAllCannedResponseResponse.data.forEach(element => {
              element['sport'] = element.sport_name;
              if (element.alternate_level_name) {
                element.level_name = element.alternate_level_name
              }
              if (element.alternate_abbreviation) {
                element.abbreviation = element.alternate_abbreviation
              }
            });
            this.getValuesToDisplay.totalRecords = getAllCannedResponseResponse.totalRecords;
            this.getValuesToDisplay.userInfo = getAllCannedResponseResponse.data;
            this.getValuesToDisplay.snapshot = getAllCannedResponseResponse.snapshot.docs;
          }
          else {
            this.getValuesToDisplay.totalRecords = 0;
            this.getValuesToDisplay.userInfo = [];
          }
        } else {
          this.getValuesToDisplay.totalRecords = 0;
          this.getValuesToDisplay.userInfo = [];
        }
      } else {
        this.getValuesToDisplay.totalRecords = 0;
        this.getValuesToDisplay.userInfo = [];
      }
    } catch (error) {
      this.getValuesToDisplay.totalRecords = 0;
      this.getValuesToDisplay.userInfo = [];
      console.log(error)
    }
  }
  afterSavingData(loaderForCreate?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    if (loaderForCreate) {
      clearInterval(loaderForCreate);
    }
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
    this.change.emit({ action: "levelgrid", data: this.injectedData.data })
  }


}
