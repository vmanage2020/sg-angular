import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
declare var $: any;
declare var jQuery: any;
import { CannedResponseCrudService } from '../canned-response-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-canned-response-create',
  templateUrl: './canned-response-create.component.html',
  styleUrls: ['./canned-response-create.component.scss']
})
export class CannedResponseCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  // Input for loading grid
  cannedResponseRecordInfo: any = [];
  getValuesToDisplay: any = {};
  submitted = false;
  error = '';
  isSaveUp: boolean = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  saves: boolean = false;
  sportSelect: boolean = false;
  createCannedResponseForm: FormGroup;
  data: any;
  orgId: any;
  SportsList: any;
  quill: any;
  injectedData: any;
  sportName: any;
  constructor(private dropDownService: DropdownService, private titlecasePipe: TitleCasePipe, private cannedResponseService: CannedResponseCrudService, private injector: Injector, private notification: NgiNotificationService, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "cannedResponseRouter") {
          if (this.injectedData) {
            this.change.emit({ action: "cannedResponseGrid", data: this.injectedData.data })
          }
        }
      }
    })
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "create";
    this.displayLoader = false;
    this.sharedService.announceMission('cannedResponse');
    this.injectedData = this.injector.get('injectData');
    this.orgId = localStorage.getItem('org_id');
    this.createCannedResponseForm = this.formBuilder.group({
      auth_id: [''],
      organization_id: [''],
      organization_name: [''],
      organization_abbreviation: [''],
      sport_name: [''],
      sports_id: [null, [Validators.required]],
      name: ['', [Validators.required]],
      cannedResponseDesc: [null, [Validators.required]]
    });
    if (this.injectedData.action === "cannedResponseCreate") {
      if (this.injectedData.data) {
        if (this.injectedData.data.selectedSport) {
          this.createCannedResponseForm.patchValue({
            sports_id: this.injectedData.data.selectedSport,
            sport_name: this.injectedData.data.selectedSportName
          })
          this.sportName = this.injectedData.data.selectedSportName
        }
      }

    }
    if (this.orgId) {
      this.getSportsByOrganization(this.orgId);
    }
  }

  get f() {
    return this.createCannedResponseForm.controls;
  }

  async getSportsByOrganization(orgId) {
    this.sportSelect = true;
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        this.SportsList = getSportsByOrganizationResponse.data;
        if (this.SportsList.length === 1) {
          if (!this.createCannedResponseForm.controls.sports_id.value) {
            this.createCannedResponseForm.patchValue({
              sports_id: this.SportsList[0].sport_id,
              sport_name: this.SportsList[0].name,
            })
            this.sportName = this.SportsList[0].name;
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

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.createCannedResponseForm.patchValue({
        sport_name: event.name,
      })
      this.sportName = event.name
    }
  }

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }

  async onSubmit(form) {
    this.closeError();
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    this.createCannedResponseForm.patchValue({
      auth_id: this.uid,
      organization_id: this.orgId,
      organization_name: localStorage.getItem('org_name'),
      organization_abbreviation: localStorage.getItem('org_abbrev'),
    })
    this.displayLoader = true;
    this.loading = true;
    let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
    let createCannedResponseRes: any = await this.cannedResponseService.createCannedResponse(form.value);
    try {
      if (createCannedResponseRes) {
        if (createCannedResponseRes.status) {
          if (this.saves) {
            await this.getCannedResponseInfoList(this.injectedData.data,form.value);
            if (this.SportsList.length === 1) {
              this.change.emit({ action: "cannedResponseGrid", data: this.getValuesToDisplay })
            } else {
              this.getValuesToDisplay.selectedSport = form.value.sports_id;
              this.getValuesToDisplay.selectedSportName = this.sportName;
              this.change.emit({ action: "cannedResponseGrid", data: this.getValuesToDisplay })
            }
            this.afterSavingData(loaderForCreate);
            this.notification.isNotification(true, "Canned Responses", createCannedResponseRes.message, "check-square");
          }
          else {
            form.reset();
            this.SportsList = [];
            this.getSportsByOrganization(this.orgId);
            this.submitted = false;
            this.afterSavingData(loaderForCreate);
            this.reInitialise();
            this.notification.isNotification(true, "Canned Responses", createCannedResponseRes.message, "check-square");
          }
        } else {
          this.submitted = false;
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.error = createCannedResponseRes.message;
        }
      } else {
        this.submitted = false;
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
        this.error = "Unhandled Error."
      }
    } catch (error) {
      console.log();
      this.submitted = false;
      this.afterSavingData(loaderForCreate);
      this.reInitialise();
      this.error = error.message;
    }
  }
  afterSavingData(loaderForCreate?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Done" });
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  async getCannedResponseInfoList(injectedData: any,formValue:any) {
    try {
      this.cannedResponseRecordInfo = [];
      this.getValuesToDisplay.requestData = injectedData;
      injectedData.sport_id=formValue.sports_id;
      let getAllCannedResponseResponse = await this.cannedResponseService.getCannedResponseForGrid(injectedData);
      if (getAllCannedResponseResponse) {
        if (getAllCannedResponseResponse.status) {
          if (getAllCannedResponseResponse.data.data.length !== 0 && typeof (getAllCannedResponseResponse.data.data) !== "string") {
            getAllCannedResponseResponse.data.data.forEach(element => {
              element.sport = element.sport_name;
              element.sport = this.titlecasePipe.transform(element.sport)
            });
            this.getValuesToDisplay.totalRecords = getAllCannedResponseResponse.data.totalRecords;
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
  goBack() {
    this.change.emit({ action: "cannedResponseGrid", data: this.injectedData.data })
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
  closeError() {
    this.error = '';
  }
}
