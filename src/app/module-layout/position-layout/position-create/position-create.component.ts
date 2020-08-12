import { Component, OnInit, Injector, EventEmitter, Output } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { PositionCrudService } from '../position-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-position-create',
  templateUrl: './position-create.component.html',
  styleUrls: ['./position-create.component.scss']
})
export class PositionCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  getValuesToDisplay: any = {};
  sportId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  sportsInfo: any;
  error = false
  message: any;
  sportIdValid = false;
  submitted = false;
  valueSport: any;
  positionInfo: any;
  saves: boolean = false;
  uid: any;
  sportSelect: boolean = false;
  data: any;
  injectedData: any;
  sportName: any;
  parentPositionSelect: boolean = false;
  createPositionsForm: FormGroup;
  isSaveUp: boolean = false;
  constructor(private dropDownService: DropdownService, private positionService: PositionCrudService, private injector: Injector, private notification: NgiNotificationService, private sharedService: SharedService, private formBuilder: FormBuilder, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "positionRouter") {
          if (this.injectedData) {
            this.change.emit({ action: "positiongrid", data: this.injectedData.data })
          }
        }
      }
    })
  }



  ngOnInit() {
    this.getValuesToDisplay.userAction = "create";
    this.displayLoader = false;
    this.sharedService.announceMission('position');
    this.injectedData = this.injector.get('injectData');
    this.createPositionsForm = this.formBuilder.group({
      sport_id: [null, [Validators.required]],
      sport_name: [''],
      name: ['', [Validators.required]],
      abbreviation: ['', [Validators.required]],
      parent_position_id: [null],
      parent_position_name: [null],
      parent_position_abbreviation: [null]
    })
    this.getAllSports(this.uid);
    if (this.injectedData.action === "createposition") {
      if (this.injectedData.data.sport_id) {
        this.createPositionsForm.patchValue({
          sport_id: this.injectedData.data.sport_id,
          sport_name: this.injectedData.data.sport_name
        })
        this.sportName = this.injectedData.data.sport_name
        this.getPositionDropdown(this.injectedData.data.sport_id, this.uid)
      }
    }
  }
  get f() { return this.createPositionsForm.controls; }
  async getAllSports(uid) {
    this.sportSelect = true;
    try {
      let allSportResponse: any = await this.dropDownService.getAllSports({ 'uid': uid });
      if (allSportResponse.status) {
        this.sportsInfo = allSportResponse.data;
        if (this.sportsInfo.length === 1) {
          if (!this.createPositionsForm.controls.sport_id.value) {
            this.createPositionsForm.patchValue({
              sport_id: this.sportsInfo[0].sport_id,
              sport_name: this.sportsInfo[0].name
            })
            this.getPositionDropdown(this.sportsInfo[0].sport_id, this.uid)
          }
        }
        this.sportSelect = false;
      } else {
        this.sportsInfo = [];
        this.sportSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.sportsInfo = [];
      this.sportSelect = false;
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
  OnSportChange(event) {
    if (event.sport_id) {
      this.sportName = event.name
      this.positionInfo = [];
      this.createPositionsForm.patchValue({
        parent_position_id: null,
        parent_position_name: '',
        parent_position_abbreviation: '',
        sport_name: event.name
      })
      this.getPositionDropdown(event.sport_id, this.uid)
    }
  }
  onParentPosChange(event, form) {
    if (event.position_id) {
      this.createPositionsForm.patchValue({
        parent_position_id: event.position_id,
        parent_position_name: event.name,
        parent_position_abbreviation: event.abbreviation
      })
    }
    else {
      this.createPositionsForm.patchValue({
        parent_position_id: null,
        parent_position_name: '',
        parent_position_abbreviation: '',
      })
    }

  }


  async getPositionDropdown(sid, uid) {
    this.parentPositionSelect = true;
    let getParentPositionDropdownRequest: any = {
      'sport_id': sid, 'uid': uid
    }
    let getParentPositionDropdownResponse: any = await this.dropDownService.getParentPositionList(getParentPositionDropdownRequest);
    try {
      if (getParentPositionDropdownResponse.status) {
        if (getParentPositionDropdownResponse.data && getParentPositionDropdownResponse.data.length !== 0) {

          getParentPositionDropdownResponse.data.splice(0, 0, { position_id: '', name: 'Select parent position' });
          this.positionInfo = getParentPositionDropdownResponse.data;
          this.parentPositionSelect = false;
        } else {
          this.positionInfo = [];
          this.parentPositionSelect = false;
        }

      } else {
        this.positionInfo = [];
        this.parentPositionSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.positionInfo = [];
      this.parentPositionSelect = false;
    }
  }
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }
  async createPositions(form) {
    this.submitted = true;
    this.closeToast();
    if (form.invalid) {
      return;
    }
    try {
      if (form.value.sport_id) {
        form.value['uid'] = this.uid;
        this.displayLoader = true;
        this.loading = true;
        let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
        let createPositionResponse: any = await this.positionService.createPosition(form.value);
        if (createPositionResponse.status) {
          if (this.saves) {
            await this.getCannedResponseInfoList(this.injectedData.data, form.value);
            if (this.sportsInfo.length === 1) {
              this.change.emit({ action: "positiongrid", data: this.getValuesToDisplay  });
            } else {
              this.getValuesToDisplay.sport_id=form.value.sport_id;
              this.getValuesToDisplay.sport_name = this.sportName;
              this.change.emit({ action: "positiongrid", data: this.getValuesToDisplay  });
            }
            this.afterSavingData(loaderForCreate);
            this.notification.isNotification(true, "Positions", createPositionResponse.message, "check-square");
          }
          else {
            form.reset();
            this.sportsInfo = [];
            this.positionInfo = [];
            this.getAllSports(this.uid)
            this.submitted = false;
            this.afterSavingData(loaderForCreate);
            this.reInitialise();
            this.notification.isNotification(true, "Positions", createPositionResponse.message, "check-square");
          }
        } else {
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.submitted = false;
          this.sportsInfo = [];
          this.positionInfo = [];
          this.getAllSports(this.uid)
          this.error = true;
          this.message = createPositionResponse.message;

        }

      }
    } catch (error) {
      console.log(error);
      this.afterSavingData();
      this.reInitialise();
      this.submitted = false;
      this.sportsInfo = [];
      this.positionInfo = [];
      this.getAllSports(this.uid)
      this.error = true;
      this.message = error.message
    }
  }
  async getCannedResponseInfoList(injectedData: any, formValue: any) {
    try {
      this.getValuesToDisplay.requestData = injectedData;
      injectedData.sport_id = formValue.sport_id;
      let getAllCannedResponseResponse = await this.positionService.getPositionListForGrid(injectedData);
      if (getAllCannedResponseResponse) {
        if (getAllCannedResponseResponse.status) {
          if (getAllCannedResponseResponse.data.length !== 0 && typeof (getAllCannedResponseResponse.data) !== "string") {
            getAllCannedResponseResponse.data.forEach(element => {
              element.sport = element.sport_name
              element.position_name = element.name
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
  closeToast() {
    this.error = false;
  }

  goBack() {
    // this.router.navigate(['/positions'], { queryParams: { sport_id: this.createPositionsForm.value.sport_id  } });
    this.change.emit({ action: "positiongrid", data: this.injectedData.data });
  }

}
