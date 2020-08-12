import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { PositionCrudService } from '../position-crud.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-position-edit',
  templateUrl: './position-edit.component.html',
  styleUrls: ['./position-edit.component.scss']
})
export class PositionEditComponent implements OnInit {
  @Output() change = new EventEmitter();
  getValuesToDisplay: any = {};
  sportId: any;
  positionId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  error: any;
  message: any;
  uid: any;
  sportsInfo: any;
  sportName: any;
  positionInfo: any = [];
  position: any[] = [];
  submitted = false;
  sportIdValid = false;
  updatePositionsForm: FormGroup
  data: any;
  injectedData: any;
  sportSelect: boolean = false;
  parentPositionSelect: boolean = false;
  isSaveUp: boolean = false;
  constructor(private positionService: PositionCrudService, private dropDownService: DropdownService, private injector: Injector, private notification: NgiNotificationService, private formBuilder: FormBuilder, private sharedService: SharedService, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          if (data.data !== Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          }
        } else if (data == "positionRouter") {
          if (this.injectedData) {
            this.change.emit({ action: "positiongrid", data: this.injectedData.data })
          }
        }
      }
    })
  }



  ngOnInit() {
    this.getValuesToDisplay.userAction = "edit";
    this.getAllSports(this.uid);
    this.sharedService.announceMission('position');
    this.injectedData = this.injector.get('injectData');
    this.updatePositionsForm = this.formBuilder.group({
      sport_id: [null, [Validators.required]],
      sport_name: [''],
      name: ['', [Validators.required]],
      position_id: [''],
      abbreviation: ['', [Validators.required]],
      parent_position_id: [null],
      parent_position_name: [null],
      parent_position_abbreviation: [null]
    })
    if (this.injectedData.action === "editposition") {
      this.getPositionById(this.injectedData.data.sport_id, this.injectedData.data.position_id, this.uid);
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
  async getPositionById(id, pid, uid) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    try {
      let getPositionByIdRequestObj: any = {
        'sport_id': id,
        'position_id': pid,
        'uid': uid
      }

      let getPositionByIdRequest: any = await this.positionService.getPositionById(getPositionByIdRequestObj);
      if (getPositionByIdRequest.status) {
        this.updatePositionsForm.patchValue({
          sport_name: getPositionByIdRequest.data.sport_name,
          sport_id: getPositionByIdRequest.data.sport_id,
          name: getPositionByIdRequest.data.name,
          position_id: getPositionByIdRequest.data.position_id,
          abbreviation: getPositionByIdRequest.data.abbreviation,
          parent_position_id: getPositionByIdRequest.data.parent_position_id,
          parent_position_name: getPositionByIdRequest.data.parent_position_name,
          parent_position_abbreviation: getPositionByIdRequest.data.parent_position_abbreviation
        })
        if (!getPositionByIdRequest.data.parent_position_id) {
          this.updatePositionsForm.patchValue({
            parent_position_id: null
          })
        }
        if (getPositionByIdRequest.data.sport_id) {
          setTimeout(() => {
            if (this.sportsInfo) {
              this.sportsInfo.forEach(element => {
                if (element.sport_id === getPositionByIdRequest.data.sport_id) {
                  this.sportName = element.name
                }
              });
            }
          }, 320);
          this.getPositionDropdown(getPositionByIdRequest.data.sport_id, this.uid)
        }
        this.afterLoading(loaderToGetUserInfo);
      } else {
        this.afterLoading(loaderToGetUserInfo);
        this.error = getPositionByIdRequest.message;
      }
    } catch (error) {
      console.log(error);
      this.afterLoading(loaderToGetUserInfo);
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

  async getAllSports(uid) {
    this.sportSelect = true;
    try {
      let allSportResponse: any = await this.dropDownService.getAllSports({ 'uid': uid });
      if (allSportResponse.status) {
        this.sportsInfo = allSportResponse.data;
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
  OnSportChange(event) {
    this.position = [];
    this.positionInfo = [];
    // console.log(event)
    this.updatePositionsForm.patchValue({
      parent_position_id: null,
      parent_position_name: '',
      parent_position_abbreviation: '',

    })
    this.getPositionDropdown(event.sport_id, this.uid)
  }
  onParentPosChange(event, form) {
    if (event.position_id) {
      this.updatePositionsForm.patchValue({
        parent_position_id: event.position_id,
        parent_position_name: event.name,
        parent_position_abbreviation: event.abbreviation
      })
      this.position = []
    }
    else {
      this.updatePositionsForm.patchValue({
        parent_position_id: null,
        parent_position_name: '',
        parent_position_abbreviation: '',
      })
      this.position = [];
    }
  }
  get f() { return this.updatePositionsForm.controls; }
  async getPositionDropdown(sid, uid) {
    this.parentPositionSelect = true;
    let getParentPositionDropdownRequest: any = {
      'sport_id': sid, 'uid': uid
    }
    let getParentPositionDropdownResponse: any = await this.dropDownService.getParentPositionList(getParentPositionDropdownRequest);
    try {
      if (getParentPositionDropdownResponse.status) {
        if (getParentPositionDropdownResponse.data) {

          if (getParentPositionDropdownResponse.data.length != 0) {
            // getParentPositionDropdownResponse.data.splice(0, 0, { position_id: '', name: '' });
            getParentPositionDropdownResponse.data.forEach(element => {
              // if (!(element.parent_position_id)) {
              if (element.name != this.updatePositionsForm.controls['name'].value) {
                this.position.push(element)
              }
              // }
            });
            if (this.position && this.position.length !== 0) {

              this.positionInfo = this.position
              this.parentPositionSelect = false;
              this.positionInfo.splice(0, 0, { position_id: '', name: 'Select parent position' });
            } else {
              this.positionInfo = [];
              this.parentPositionSelect = false;
            }

          }
          else {
            this.positionInfo = [];
            this.parentPositionSelect = false;
          }
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

  async updatePositions(form) {
    form.value['uid'] = this.uid;
    this.closeToast();
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updatePositionResponse: any = await this.positionService.updatePosition(form.value);
    try {
      if (updatePositionResponse.status) {
        await this.getCannedResponseInfoList(this.injector.get('injectData'));
        if (this.injectedData.data.viewBy === "edit") {
          this.change.emit({ action: "positiongrid", data: this.getValuesToDisplay })
        }
        this.afterSavingData(loaderWhileUpdate);
        this.notification.isNotification(true, "Positions", updatePositionResponse.message, "check-square");
      } else {
        this.afterSavingData(loaderWhileUpdate);
        this.reInitialise();
        this.error = updatePositionResponse.message;
      }
    } catch (error) {
      console.log(error);
      this.error = error.message;
      this.afterSavingData(loaderWhileUpdate);
      this.reInitialise();
    }
  }
  async getCannedResponseInfoList(injectedData: any) {
    try {
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;
      let getAllCannedResponseResponse = await this.positionService.getPositionListForGrid(injectedData.data.requestPayloadGrid);
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
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }

  goBack() {
    if (this.injectedData.data.viewBy === "edit") {
      this.change.emit({ action: "positiongrid", data: this.injectedData.data })
    }
  }
  closeToast() {
    this.error = '';
  }

}
