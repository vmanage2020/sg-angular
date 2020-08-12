import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
declare var $: any;
import { Location } from "@angular/common";
import * as moment from 'moment';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { SeasonCrudService } from '../season-crud.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-season-create',
  templateUrl: './season-create.component.html',
  styleUrls: ['./season-create.component.scss']
})
export class SeasonCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  createSeasonForm: FormGroup;
  sportIdValid = false;
  sportsInfo: any;
  submitted = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  error = false;
  errors = '';
  isSaveUp:any=false;
  endDate: any = '';
  startDate: any;
  disableSubmit = false;
  saves = false;
  orgId: any;
  data: any;
  sportName: any;
  sportSelect: any;
  isBorderReq: boolean = false;
  injectedData: any;
  constructor(private seasonService: SeasonCrudService, private dropDownService: DropdownService, private notification: NgiNotificationService, private injector: Injector, private location: Location, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {       
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "seasonRouter") {
          this.change.emit({ action: "seasongrid", data: null });
        }
      }
    })
  }

  ngOnInit() {
    this.displayLoader = false;
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('season');
    this.orgId = localStorage.getItem('org_id')
    this.createSeasonForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      organization_name: [''],
      organization_abbreviation: [''],
      sports_id: [null, [Validators.required]],
      season_name: ['', [Validators.required]],
      sports_name: [''],
      season_start_date: [null, [Validators.required]],
      season_end_date: [null, [Validators.required]]
    });    
    if (this.injectedData.data) {
      if(this.injectedData.data.sport_id){
        this.createSeasonForm.patchValue({
          sports_id: this.injectedData.data.sport_id,
          sports_name: this.injectedData.data.sport_name
        })
        this.sportName = this.injectedData.data.sport_name
      }
  }
    if (this.uid) {
      if (this.orgId) {
        this.getSportsByOrg(this.orgId)
      }
    }
  }

  async getSportsByOrg(orgId) {
    this.sportSelect = true;
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        this.sportsInfo = getSportsByOrganizationResponse.data;
        if (this.sportsInfo.length === 1) {
          if (!this.createSeasonForm.controls.sports_id.value) {
            this.createSeasonForm.patchValue({
              sports_id: this.sportsInfo[0].sport_id,
              sports_name: this.sportsInfo[0].name
            })
            this.sportName = this.sportsInfo[0].name
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

  get f() { return this.createSeasonForm.controls; }

  OnSportChange(event) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }    
    if (event.sport_id) {
      this.createSeasonForm.patchValue({
        sports_name: event.name
      })
      this.sportName = event.name
    }   
  }

  compareDate1(event) {   
    if (event.target.value) {
      this.startDate = event.target.value
      $('#datepicker').flatpickr({
        enableTime: false,
        dateFormat: "m-d-Y",
        minDate: event.target.value
      });    
      this.isBorderReq = false;
      if (this.endDate) {
        if (new Date(this.endDate) < new Date(event.target.value)) {
          console.log(this.endDate);
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
  saveNew(value:any) {
    if(value === "up"){
      this.isSaveUp = true;
    }else{
      this.isSaveUp = false;
    }
    this.saves = false;
  }
  save(value:any) {
    if(value === "up"){
      this.isSaveUp = true;
    }else{
      this.isSaveUp = false;
    }
    this.saves = true;
  }
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }
  async onSubmit(form) {
    this.submitted = true;
    this.closeError();
    if (form.invalid) {
      return;
    }
    if (localStorage.getItem('org_id')) {
      this.disableSubmit = false;
    }
    else {
      this.disableSubmit = true;
      this.sharedService.announceMission('selectOrganization')
      return
    }
    form.patchValue({
      auth_uid: this.uid,
      organization_id: localStorage.getItem('org_id'),
      organization_name: localStorage.getItem('org_name'),
      organization_abbreviation: localStorage.getItem('org_abbrev'),
    })
    form.value.season_start_date = new Date(form.controls['season_start_date'].value);
    form.value.season_end_date = new Date(form.controls['season_end_date'].value);
    this.displayLoader = true;
    this.loading = true;
    let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
    try {
      let createSeasonResponse: any = await this.seasonService.createSeason(form.value);
      if (createSeasonResponse.status) {
        if (this.saves) {
          if(this.sportsInfo.length === 1){
            this.change.emit({ action: "seasongrid", data: this.injectedData.data });
          }else{
            form.value.sportName = this.sportName
            this.change.emit({ action: "seasongrid", data: form.value });
          }         
          this.afterSavingData(loaderForCreate);
          this.notification.isNotification(true, "Seasons", createSeasonResponse.message, "check-square");
        }
        else {
          this.startDate = '';
          this.endDate = '';
          form.reset();          
          this.sportsInfo=[];
          this.submitted = false;
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.getSportsByOrg(this.orgId);
          this.notification.isNotification(true, "Seasons", createSeasonResponse.message, "check-square");
        }
      }
      else {
        if (createSeasonResponse.error.includes('Dates')) {
          this.isBorderReq = true;
        }
        form.patchValue({
          season_start_date: moment(form.controls['season_start_date'].value).format('MM-DD-YYYY').toString(),
          season_end_date: moment(form.controls['season_end_date'].value).format('MM-DD-YYYY').toString(),
        })
        this.submitted = false;
        this.afterSavingData(loaderForCreate);
            this.reInitialise();
        this.errors = createSeasonResponse.error;
      }
    } catch (error) {
      console.log(error);
      form.patchValue({
        season_start_date: moment(form.controls['season_start_date'].value).format('MM-DD-YYYY').toString(),
        season_end_date: moment(form.controls['season_end_date'].value).format('MM-DD-YYYY').toString(),
      })
      this.submitted = false;
      this.afterSavingData(loaderForCreate);
            this.reInitialise();
      this.errors = error.message;
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
    this.errors = '';
  }
  goBack() {
    this.change.emit({ action: "seasongrid", data: this.injectedData.data }); 
  }
}
