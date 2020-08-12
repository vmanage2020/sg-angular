import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { SportsCrudService } from '../sports-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
import * as moment from 'moment';
@Component({
  selector: 'app-sports-create',
  templateUrl: './sports-create.component.html',
  styleUrls: ['./sports-create.component.scss']
})
export class SportsCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  getValuesToDisplay: any = {};
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  error: any;
  message: any;
  saves: any;
  isSaveUp: any = false;
  data: any;
  country: boolean = false;
  countryCodeSelect: any = [];
  countryName: any;
  injectedData: any;
  constructor(private dropDownService: DropdownService, private sportService: SportsCrudService,private injector: Injector, private notification: NgiNotificationService, private dataServices: DataService, public router: Router, public cookieService: CookieService, private sharedService: SharedService) {

    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "sportRouter") {
          this.change.emit({ action: "sportgrid" })
        }
      }
    })
  }

  createSportsForm: any = {
    sport_id: '',
    name: null,
    country_code: null,
    country: ''
  }

  ngOnInit() {
    this.injectedData = this.injector.get('injectData');
    this.getValuesToDisplay.userAction = "create";
    this.displayLoader = false;
    this.getCountryCodeList();
    this.sharedService.announceMission('sport');
    this.uid = this.cookieService.getCookie('uid');
  }
  async getCountryCodeList() {
    // console.log("getcountrylist")
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
      this.countryName = event.name;
    }
  }

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }

  async createSports(form) {
    this.closeToast();
    this.displayLoader = true;
    this.loading = true;
    let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
    form.value['uid'] = this.uid;
    form.value['country'] = this.countryName;
    let createSportResponse: any = await this.sportService.createSport(form.value);

    try {
      if (createSportResponse) {
        if (createSportResponse.status) {
          if (this.saves) {
            await this.getCannedResponseInfoList(this.injectedData.data);
            this.change.emit({ action: "sportgrid",data: this.getValuesToDisplay });
            this.afterSavingData(loaderForCreate);
            this.notification.isNotification(true, "Sports", createSportResponse.message, "check-square");
          }
          else {
            form.resetForm();
            this.afterSavingData(loaderForCreate);
            this.reInitialise();
            this.notification.isNotification(true, "Sports", createSportResponse.message, "check-square");
          }
        } else {
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.error = true;
          this.message = createSportResponse.message;
        }
      } else {
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
        this.error = true;
        this.message = createSportResponse.message;
      }
    } catch (error) {
      console.log(error);
      this.afterSavingData(loaderForCreate);
      this.reInitialise();
      this.error = true;
      this.message = error;
    }
  }
  async getCannedResponseInfoList(injectedData: any) {
    try {
      this.getValuesToDisplay.requestData = injectedData;
      
      let getAllCannedResponseResponse:any = await this.sportService.getSportsListForGrid(injectedData);
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
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
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

  goBack() {
    this.change.emit({ action: "sportgrid" });
  }
  closeToast() {
    this.error = false;
  }
}
