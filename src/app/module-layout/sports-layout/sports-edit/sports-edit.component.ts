import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { SportsCrudService } from '../sports-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-sports-edit',
  templateUrl: './sports-edit.component.html',
  styleUrls: ['./sports-edit.component.scss']
})
export class SportsEditComponent implements OnInit {
  @Output() change = new EventEmitter();
  getValuesToDisplay: any = {};
  sportId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  isSaveUp: any = false;
  error: any;
  data: any;
  message: any;
  injectedData: any;
  country: boolean = false;
  countryCodeSelect: any = [];
  countryName: any;
  disableByDefault: boolean = true;
  constructor(private dropDownService: DropdownService, private injector: Injector, private sportService: SportsCrudService, private notification: NgiNotificationService, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService, private sharedService: SharedService) {
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "sportRouter") {
          if (this.injectedData) {
            this.change.emit({ action: "sportgrid", data: this.injectedData.data })
          }
        }
      }
    })
  }

  updateSportsForm: any = {
    sport_id: '',
    name: null,
    country_code: null,
    country: ''
  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "edit";
    this.getCountryCodeList();
    this.sharedService.announceMission('sport');
    this.injectedData = this.injector.get('injectData');
    this.uid = this.cookieService.getCookie('uid');
    if (this.injectedData) {
      if (this.injectedData.data) {
        this.sportId = this.injectedData.data.sport_id;
        this.getSportsById(this.injectedData.data.sport_id, this.uid);
      }
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

  onNationalChange(event: any) {
    if (event) {
      this.disableByDefault = false;
      this.countryName = event.name;
    }
  }
  onsportNameChange() {
    this.disableByDefault = false;
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
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  async getSportsById(id, uid) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let resObjectForSportById: any = {
      'sport_id': id,
      'uid': uid
    }
    let getSportById: any = await this.sportService.getSportById(resObjectForSportById);
    try {
      if (getSportById) {
        if (getSportById.status) {
          this.updateSportsForm = getSportById.data;
          this.countryName = this.updateSportsForm.country;
          this.afterLoading(loaderToGetUserInfo);
        } else {
          this.updateSportsForm = [];
          this.afterLoading(loaderToGetUserInfo)
        }
      } else {
        this.afterLoading(loaderToGetUserInfo)
      }
    } catch (error) {
      console.log(error);
      this.afterLoading(loaderToGetUserInfo)
    }
  }

  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }

  async updateSports(form) {
    this.closeToast();
    form.value.sport_id = this.sportId;
    form.value.created_datetime = this.updateSportsForm.created_datetime;
    form.value['uid'] = this.uid;
    form.value['country'] = this.countryName;
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateSport: any = await this.sportService.updateSport(form.value);
    try {
      if (updateSport) {
        if (updateSport.status) {
          await this.getCannedResponseInfoList(this.injector.get('injectData'));
          this.change.emit({ action: "sportgrid",  data: this.getValuesToDisplay })
          this.afterSavingData(loaderWhileUpdate);          
          this.notification.isNotification(true, "Sports", updateSport.message, "check-square");
        } else {
          this.afterSavingData(loaderWhileUpdate);
          this.reInitialise();
          this.error = true;
          this.message = updateSport.message
        }
      } else {
        this.afterSavingData(loaderWhileUpdate);
          this.reInitialise();
        this.error = true;
        this.message = "Unhandled error."
      }
    } catch (error) {
      console.log(error);
      this.afterSavingData(loaderWhileUpdate);
          this.reInitialise();
      this.error = true;
      this.message = error.message
    }
  }
  async getCannedResponseInfoList(injectedData: any) {
    try {
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;
      let getAllCannedResponseResponse:any = await this.sportService.getSportsListForGrid(injectedData.data.requestPayloadGrid);
      if (getAllCannedResponseResponse) {
        if (getAllCannedResponseResponse.status) {
          if (getAllCannedResponseResponse.data.data && getAllCannedResponseResponse.data.data.length !== 0 && typeof (getAllCannedResponseResponse.data.data) !== "string") {
            getAllCannedResponseResponse.data.data.forEach(element => {
              element['created_date'] = moment(element.created_datetime.toDate()).format('MMMM DD, YYYY').toString();
              element['sport'] = element.name;
            });
            this.getValuesToDisplay.totalRecords = getAllCannedResponseResponse.data.total_items;
            this.getValuesToDisplay.userInfo = getAllCannedResponseResponse.data.data;
            this.getValuesToDisplay.snapshot = getAllCannedResponseResponse.data.snapshot.docs;
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
  closeToast() {
    this.error = false;
  }
  goBack() {
    this.change.emit({ action: "sportgrid", data: this.injectedData.data })
  }

}