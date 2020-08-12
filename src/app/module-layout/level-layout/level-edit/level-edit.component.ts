import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { NgbDateParserFormatter, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
declare var $: any;
import * as moment from 'moment';
import { Location } from "@angular/common";
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { LevelService } from '../level-service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

@Component({
  selector: 'app-level-edit',
  templateUrl: './level-edit.component.html',
  styleUrls: ['./level-edit.component.scss']
})
export class LevelEditComponent implements OnInit {
  getValuesToDisplay: any = {};
  @Output() change = new EventEmitter();
  updateLevelForm: FormGroup;
  submitted = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  error: any = '';
  isNationalBody: boolean = false;
  saves = false;
  levelInfo: any;
  injectedData: any;
  SportsList: any = [];
  levelList: any = [];
  sportSelect: boolean = false;
  levelSelect: boolean = false;
  isNationalExist: any;
  isLevelhasDropDown: boolean = false;
  isSaveUp: boolean = false;
  constructor(private dropDownService: DropdownService, public levelService: LevelService, private notification: NgiNotificationService, private injector: Injector, private location: Location, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "levelRouter") {
          this.change.emit({ action: "levelgrid", data: null });
        }
      }
    })
  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "edit";
    this.injectedData = this.injector.get('injectData');
    this.getSportsByOrganization(this.injectedData.data.organization_id);
    this.updateLevelForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      sport_id: [null, [Validators.required]],
      sport_name: [''],
      level_name: [null, [Validators.required]],
      abbreviation: ['', [Validators.required]],
      level_id: [''],
      description: ['']
    });
    if (this.uid && localStorage.getItem('org_id')) {
      this.getlevelById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.level_id, this.injectedData.data.organization_id)
    }
  }
  get f() { return this.updateLevelForm.controls; }
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

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  async getlevelById(uid, sportId: any, levelId: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'level_id': levelId
    };
    let getLevelByIdResponse: any = await this.levelService.getLevelById(getSeasonByIdRequest);
    try {
      if (getLevelByIdResponse.status) {
        this.levelInfo = getLevelByIdResponse.data;
        this.updateLevelForm.patchValue({
          level_id: this.levelInfo.level_id,
          organization_id: this.levelInfo.organization_id,
          sport_id: this.levelInfo.sport_id,
          sport_name: this.levelInfo.sport_name,
          level_name: this.levelInfo.level_name,
          abbreviation: this.levelInfo.abbreviation,
          description: this.levelInfo.description
        })
        this.afterLoading(loaderToGetUserInfo);
      } else {
        this.afterLoading(loaderToGetUserInfo);
      }
    } catch (error) {
      console.log(error);
      this.afterLoading(loaderToGetUserInfo);
      this.error = error.message;
    }
  }
  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }

  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
  }
  async onSubmit(form) {
    try {
      this.submitted = true;
      if (form.invalid) {
        return;
      }
      this.updateLevelForm.patchValue({
        auth_uid: this.uid
      })
      this.displayLoader = true;
      this.loading = true;
      let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
      let updateLevelRes: any = await this.levelService.updateLevel(form.value);
      try {
        if (updateLevelRes) {
          if (updateLevelRes.status) {
            await this.getCannedResponseInfoList(this.injector.get('injectData'));
            this.afterSavingData(loaderWhileUpdate);
            this.change.emit({ action: "levelgrid", data: this.getValuesToDisplay })
            this.notification.isNotification(true, "Levels", updateLevelRes.message, "check-square");
          } else {
            this.submitted = false;
            this.afterSavingData(loaderWhileUpdate);
            this.reInitialise();
            this.error = updateLevelRes.message;
          }
        } else {
          this.submitted = false;
          this.afterSavingData(loaderWhileUpdate);
          this.reInitialise();
          this.error = 'Unhandled Error';
        }
      } catch (error) {
        this.submitted = false;
        this.afterSavingData(loaderWhileUpdate);
        this.reInitialise();
        this.error = error.message;
      }
    } catch (error) {
      console.log(error);
      this.error = error.message;
    }
  }
  async getCannedResponseInfoList(injectedData: any) {
    try {
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;

      let getAllCannedResponseResponse = await this.levelService.getLevels(injectedData.data.requestPayloadGrid);
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
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  closeError() {
    this.error = '';
  }



  goBack() {
    this.change.emit({ action: "levelgrid", data: this.injectedData.data })
  }

}
