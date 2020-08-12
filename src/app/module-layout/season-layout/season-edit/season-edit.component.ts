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
import { SeasonCrudService } from '../season-crud.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

@Component({
  selector: 'app-season-edit',
  templateUrl: './season-edit.component.html',
  styleUrls: ['./season-edit.component.scss']
})
export class SeasonEditComponent implements OnInit {
  @Output() change = new EventEmitter();
  updateSeasonForm: FormGroup;
  sportIdValid = false;
  sportsInfo: any;
  submitted = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  error = false;
  isSaveUp: any = false;
  endDate: any = '';
  startDate: any;
  disableSubmit = false;
  isBorderReq: boolean = false;
  saves = false;
  sports_id: any;
  season_id: any;
  seasonInfo: any;
  serviceError = false;

  err: any
  action: any;
  data: any;
  injectedData: any;
  constructor(private seasonService: SeasonCrudService, private notification: NgiNotificationService, private injector: Injector, private location: Location, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe(data => {

      if (data) {
        this.data = data;
        if (this.data.action === "organizationFilter") {
          if (this.data.data.organization_id === Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          } else {
            this.change.emit({ action: "seasongrid" })
          }
        } else if (this.data == "seasonRouter") {
          this.change.emit({ action: "seasongrid", data: null });
        }
      }

    })
  }

  ngOnInit() {
    this.injectedData = this.injector.get('injectData')
    this.updateSeasonForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      organization_name: [''],
      organization_abbreviation: [''],
      sports_id: [null],
      sports_name: [''],
      season_id: [''],
      season_name: ['', [Validators.required]],
      season_start_date: [null, [Validators.required]],
      season_end_date: [null, [Validators.required]]
    });
    if (this.uid && localStorage.getItem('org_id')) {
      this.getSeasonById(this.uid, this.injectedData.data.sports_id, this.injectedData.data.season_id, localStorage.getItem('org_id'))
    }
  }

  ngAfterViewInit() {

    $('#datetime-datepicker').flatpickr({
      enableTime: false,
      dateFormat: "m-d-Y",
    });
    $('#datepicker').flatpickr({
      enableTime: false,
      dateFormat: "m-d-Y",
    });
  }
  get f() { return this.updateSeasonForm.controls; }
  OnSportChange() {
    this.sportIdValid = false
  }
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  async getSeasonById(uid, sportsId, seasonId, orgId) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sports_id': sportsId, 'season_id': seasonId
    };
    let getSeasonByIdResponse: any = await this.seasonService.getSeasonById(getSeasonByIdRequest);
    try {
      if (getSeasonByIdResponse.status) {
        this.seasonInfo = getSeasonByIdResponse.data;
        if (getSeasonByIdResponse.data.season_start_date) {
          this.seasonInfo.season_start_date = this.seasonInfo.season_start_date.toDate();
          this.seasonInfo.season_start_date = moment(getSeasonByIdResponse.data.season_start_date).format('MM-DD-YYYY').toString();
        }
        if (getSeasonByIdResponse.data.season_end_date) {
          this.seasonInfo.season_end_date = moment(getSeasonByIdResponse.data.season_end_date.toDate()).format('MM-DD-YYYY').toString();
        }
        this.updateSeasonForm.patchValue({
          sports_id: this.seasonInfo.sports_id,
          organization_id: this.seasonInfo.organization_id,
          organization_name: this.seasonInfo.organization_name,
          organization_abbreviation: this.seasonInfo.organization_abbreviation,
          sports_name: this.injectedData.data.sports_name,
          season_start_date: this.seasonInfo.season_start_date,
          season_end_date: this.seasonInfo.season_end_date,
          season_name: this.seasonInfo.season_name,
          season_id: this.injectedData.data.season_id
        })
        this.afterLoading(loaderToGetUserInfo);
        this.startDate = this.seasonInfo.season_start_date;
        this.endDate = this.seasonInfo.season_end_date;
        $('#datetime-datepicker').flatpickr({
          dateFormat: "m-d-Y",
          defaultDate: this.startDate
        });
        $('#datepicker').flatpickr({
          dateFormat: "m-d-Y",
          defaultDate: this.endDate
        });
      }
      else {
        this.afterLoading(loaderToGetUserInfo);
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
  compareDate1(event) {

    if (event.target.value) {
      this.startDate = event.target.value
      $('#datepicker').flatpickr({
        enableTime: false,
        dateFormat: "m-d-Y",
        minDate: event.target.value,
      });
      // console.log(this.endDate)
      this.isBorderReq = false;
      if (this.endDate) {
        if (new Date(this.endDate) < new Date(event.target.value)) {
          this.error = true;
          this.disableSubmit = true
        }
        else {
          this.error = false
          this.disableSubmit = false

        }
      }
    }
  }
  compareDate2(event) {
    console.log(event.target.value)
    if (event.target.value) {
      this.endDate = event.target.value
      if (this.startDate) {
        if (new Date(event.target.value) < new Date(this.startDate)) {
          this.error = true;
          this.disableSubmit = true
        }
        else {
          this.error = false
          this.disableSubmit = false
        }
      }

    }
  }
  closeError() {
    this.err = '';
  }
  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
  }

  async onSubmit(form) {

    this.submitted = true;
    this.closeError();
    if (form.invalid) {
      return;
    }
    form.patchValue({
      auth_uid: this.uid,
    })
    form.value.season_start_date = new Date(form.controls['season_start_date'].value)
    form.value.season_end_date = new Date(form.controls['season_end_date'].value)
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateSeasonResponse: any = await this.seasonService.updateSeason(form.value);
    try {
      if (updateSeasonResponse.status) {
        this.change.emit({ action: "seasongrid", data: this.injectedData.data });
        this.afterSavingData(loaderWhileUpdate);
        this.notification.isNotification(true, "Seasons", updateSeasonResponse.data, "check-square");    
      } else {
        if (updateSeasonResponse.error.includes('Dates')) {
          this.isBorderReq = true;
        }
        this.err = updateSeasonResponse.error;
        form.patchValue({
          season_start_date: moment(form.controls['season_start_date'].value).format('MM-DD-YYYY').toString(),
          season_end_date: moment(form.controls['season_end_date'].value).format('MM-DD-YYYY').toString(),
        })
        this.afterSavingData(loaderWhileUpdate);
        this.reInitialise();
      }
    } catch (error) {
      console.log(error);
      this.err = error.message;
      form.patchValue({
        season_start_date: moment(form.controls['season_start_date'].value).format('MM-DD-YYYY').toString(),
        season_end_date: moment(form.controls['season_end_date'].value).format('MM-DD-YYYY').toString(),
      })
      this.afterSavingData(loaderWhileUpdate);
      this.reInitialise();
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
    this.change.emit({ action: "seasongrid", data: this.injectedData.data })    
  }
}