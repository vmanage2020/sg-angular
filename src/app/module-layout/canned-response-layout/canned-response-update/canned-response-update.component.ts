import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { CannedResponseCrudService } from '../canned-response-crud.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-canned-response-update',
  templateUrl: './canned-response-update.component.html',
  styleUrls: ['./canned-response-update.component.scss']
})
export class CannedResponseUpdateComponent implements OnInit {
  @Output() change = new EventEmitter();
  getValuesToDisplay: any = {};
  submitted = false;
  error = '';
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  saves: boolean = false;
  updateCannedResponseForm: FormGroup;
  data: any;
  orgId: any;
  SportsList: any;
  injectData: any;
  cannedResponseId: any;
  sportSelect: boolean = false;
  quill: any;
  isSaveUp: boolean = false;
  constructor(private cannedResponseService: CannedResponseCrudService, private titlecasePipe: TitleCasePipe,private notification: NgiNotificationService, private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    this.injectData = this.injector.get('injectData');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);

        } else if (data == "cannedResponseRouter") {
          if (this.injectData) {
            this.change.emit({ action: "cannedResponseGrid", data: this.injectData.data })
          }
        }
      }
    })
  }

  ngOnInit() {
    // this.cannedResponseId = this.injectData.data['']; // Id of Canned Response
    this.getValuesToDisplay.userAction = "edit";
    this.displayLoader = false;
    this.sharedService.announceMission('cannedResponse');
    this.updateCannedResponseForm = this.formBuilder.group({
      auth_id: [''],
      organization_id: [''],
      cannedResponseTitle_id: [''],
      sport_id: ['', [Validators.required]],
      sports_name: ['', [Validators.required]],
      cannedResponseTitle: ['', [Validators.required]],
      cannedResponseDesc: ['', [Validators.required]],

    });
    this.orgId = localStorage.getItem('org_id');
    if (this.orgId) {
      this.getSportsByOrganization(this.orgId);

    }
    this.updateCannedResponseForm.patchValue({
      auth_id: this.uid,
      organization_id: this.orgId,
      cannedResponseTitle_id: this.injectData.data.cannedResponseTitle_id,
      cannedResponseTitle: this.injectData.data.cannedResponseTitle,
      cannedResponseDesc: this.injectData.data.cannedResponseDesc,
      sport_id: this.injectData.data.sport_id,
      sports_name: this.injectData.data.sport_name
    })
  }

  get f() {
    return this.updateCannedResponseForm.controls;
  }

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
  }

  async onSubmit(form) {
    this.closeError();
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    this.displayLoader = true;
    this.loading = true;    
    let loaderWhileUpdating = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateCannedResponseRes: any = await this.cannedResponseService.updateCannedResponse(form.value);
    try {
      if (updateCannedResponseRes) {
        if (updateCannedResponseRes.status) {
          await this.getCannedResponseInfoList(this.injector.get('injectData'));
          this.afterSavingAction(loaderWhileUpdating);
          this.change.emit({ action: "cannedResponseGrid", data: this.getValuesToDisplay })
          this.notification.isNotification(true, "Canned Responses", updateCannedResponseRes.message, "check-square");                
        } else {
          this.submitted = false;
          this.afterSavingAction(loaderWhileUpdating); 
          this.error = updateCannedResponseRes.message;
        }
      } else {
        this.submitted = false;        
        this.error = 'Unhandled Error';
        this.afterSavingAction(loaderWhileUpdating); 
      }
    } catch (error) {
      this.submitted = false;      
      this.error = error.message;
      this.afterSavingAction(loaderWhileUpdating); 
    }
  }
  async getCannedResponseInfoList(injectedData: any) {
    try {      
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;
      let getAllCannedResponseResponse = await this.cannedResponseService.getCannedResponseForGrid(injectedData.data.requestPayloadGrid);
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
  afterSavingAction(loaderWhileUpdating?:any){
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.loading = false;
    clearInterval(loaderWhileUpdating);
    this.displayLoader = false;  
    // Reintialsing the loader if success fails
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
  }

  getSportsByOrganization(orgId) {
    this.sportSelect = true;
    this.dataService.postData(apiURL.GET_SPORTS_BY_ORGANIZATION, { 'auth_uid': this.uid, 'organization_id': orgId }, localStorage.getItem('token')).toPromise().then(res => {
      try {
        if (res.status) {
          this.sportSelect = false;
          this.SportsList = res.data;
        } else {
          this.SportsList = [];
          this.sportSelect = false;
        }
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })
  }

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
  }

  goBack() {
    this.change.emit({ action: "cannedResponseGrid", data: this.injectData.data })
  }

  closeError() {
    this.error = '';
  }
}
