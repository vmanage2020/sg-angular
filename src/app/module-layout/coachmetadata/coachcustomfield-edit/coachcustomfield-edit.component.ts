import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { NgbDateParserFormatter, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
declare var $: any;
import { Location } from "@angular/common";
import { Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
import { CoachCustomFieldService } from '../coachmetadata-services';

@Component({
  selector: 'app-coachcustomfield-edit',
  templateUrl: './coachcustomfield-edit.component.html',
  styleUrls: ['./coachcustomfield-edit.component.scss']
})
export class CoachcustomfieldEditComponent implements OnInit {

  getValuesToDisplay: any = {};
  @Output() change = new EventEmitter();
  updatecoachfieldForm: FormGroup;
  submitted = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  orgId:any;
  error: any = '';
  isNationalBody: boolean = false;
  saves = false;
  coachfieldInfo: any;
  injectedData: any;
  SportsList: any = [];
  coachfieldList: any = [];
  sportSelect: boolean = false;
  coachfieldSelect: boolean = false;
  iscoachfieldhasDropDown: boolean = false;
  isSaveUp: boolean = false;

  FieldList: any = [
    { name: 'Drop Down' },
    { name: 'Check box' },
    { name: 'Radio button' },
    { name: 'Text Field' }
  ]
  constructor(private dropDownService: DropdownService, public CoachCustomFieldService: CoachCustomFieldService, 
    private notification: NgiNotificationService, private injector: Injector, private location: Location, 
    public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, 
    private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
      this.uid = this.cookieService.getCookie('uid');
      sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "coachcustomRouter") {
          this.change.emit({ action: "coachcustomfield", data: null });
        }
      }
    })
     }

  ngOnInit() {
    
    this.getValuesToDisplay.userAction = "edit";
    this.injectedData = this.injector.get('injectData');
    this.orgId = this.injectedData.data.organization_id;
    if (this.injectedData.data.organization_id === Constant.organization_id) {
      this.getAllSports(this.uid);
    }
    else {
      this.getSportsByOrganization(this.injectedData.data.organization_id);
    }
    this.updatecoachfieldForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      sport_id: [null, [Validators.required]],
      sport: [''],
      field_id: [null, [Validators.required]],
      field_name: [null, [Validators.required]],
      field_type: [null, [Validators.required]],
      is_editable: ['true', [Validators.required]],
      is_deletable: ['true', [Validators.required]],
      is_required: ['true', [Validators.required]],
      singlevalue: [''],
      value: this.formBuilder.array([])
    });
    if (this.uid && localStorage.getItem('org_id')) {
      this.getcoachfieldById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.field_id, this.injectedData.data.organization_id)
    }
  }
  
  get f() { return this.updatecoachfieldForm.controls; }
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
  
  async getAllSports(uid) {
    this.sportSelect = true;
    this.SportsList = [];
    try {
      let allSportResponse: any = await this.dropDownService.getAllSportsmetaGeneral({ 'uid': uid });
      if (allSportResponse.status) {
        if (allSportResponse.data) {
          this.SportsList = allSportResponse.data;
        }
        this.sportSelect = false;
      }
      else {
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

  async getcoachfieldById(uid, sportId: any, fieldId: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'field_id': fieldId
    };
    let getcoachfieldByIdResponse: any = await this.CoachCustomFieldService.getCoachfieldById(getSeasonByIdRequest);
    try {
      if (getcoachfieldByIdResponse.status) {

        let singlevalue: any = "";
        this.coachfieldInfo = getcoachfieldByIdResponse.data;
        if (this.coachfieldInfo.value.length === 1 && this.coachfieldInfo.value === "Text Field")
        {
          singlevalue = this.coachfieldInfo.value[0];
        }
        else{
          this.coachfieldInfo.value.forEach(element => {
            this.fieldvalueBodyArr.push(this.getFieldvalueInfowithvalue(element));
          });

        }
        this.updatecoachfieldForm.patchValue({
          field_id: this.coachfieldInfo.field_id,
          organization_id: this.coachfieldInfo.organization_id,
          sport_id: this.coachfieldInfo.sport_id,
          sport: this.coachfieldInfo.sport,
          field_name: this.coachfieldInfo.field_name,
          field_type: this.coachfieldInfo.field_type,
          is_editable: this.coachfieldInfo.is_editable,
          is_deletable: this.coachfieldInfo.is_deletable,
          is_required: this.coachfieldInfo.is_required,
          singlevalue: singlevalue,
          value: this.coachfieldInfo.value
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

  getFieldvalueInfowithvalue(value: any) {
    return this.formBuilder.group({
      optionvalue: [value, [Validators.required]],
    })
  }
  
  getFieldvalueInfo() {
    return this.formBuilder.group({
      optionvalue: ['', [Validators.required]],
    })
  }
  
  is_requiredvalue(event: any)
  {
    try {
    if (event.target.value === "true")
    {
      this.updatecoachfieldForm.patchValue({
        is_required: "true"
      })
    }
    else{
      this.updatecoachfieldForm.patchValue({
        is_required: "false"
      })
    }
  }
  catch (error) {
    console.log(error)
  }
  }
  
  is_editablevalue(event: any)
  {
    if (event.target.value === "true")
    {
      this.updatecoachfieldForm.patchValue({
        is_editable: "true"
      })
    }
    else{
      this.updatecoachfieldForm.patchValue({
        is_editable: "false"
      })
    }
  }
  
  is_deletablevalue(event: any)
  {
    if (event.target.value === "true")
    {
      this.updatecoachfieldForm.patchValue({
        is_deletable: "true"
      })
    }
    else{
      this.updatecoachfieldForm.patchValue({
        is_deletable: "false"
      })
    }
  }

  get fieldvalueBodyArr() {
    return this.updatecoachfieldForm.get('value') as FormArray;
  }

  addnewfield()
  {
   
    this.fieldvalueBodyArr.push(this.getFieldvalueInfo());
  }
  
  removefield(i: number)
  {
    
    this.fieldvalueBodyArr.removeAt(i);
  }
  
  onfieldtypeChange(event: any) {
    if (event.name === "Select Field Type") {
      this.updatecoachfieldForm.patchValue({
        field_type: null
      })
    }
    if (event.name === "Drop Down" || event.name === "Check box" || event.name === "Radio button")
    {
      if (this.fieldvalueBodyArr.length === 0)
      {
        this.fieldvalueBodyArr.push(this.getFieldvalueInfo());
      }
    }
    
  }
  
  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
  }
  
  closeError() {
    this.error = '';
  }
  
  async onSubmit(form) {
    try {
      this.submitted = true;
      if (form.invalid) {
        console.log(form.controls.value.invalid)
        if (form.value.field_type == "Text Field" && form.controls.value.invalid)
        {
          this.finalsubmit(form)
        }
        return;
      }
      else
      {
        
        this.finalsubmit(form)
      }
    } catch (error) {
      console.log(error);
      this.error = error.message;
    }
  }

  async finalsubmit(form)
  {

    this.updatecoachfieldForm.patchValue({
      auth_uid: this.uid
    })
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateLevelRes: any = await this.CoachCustomFieldService.updateCoachfield(form.value);
    try {
      if (updateLevelRes) {
        if (updateLevelRes.status) {
          await this.getcoachmetaInfoList(this.injector.get('injectData'));
          this.afterSavingData(loaderWhileUpdate);
          this.change.emit({ action: "coachcustomfield", data: this.getValuesToDisplay })
          this.notification.isNotification(true, "Coach Custom Field", updateLevelRes.message, "check-square");
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

  async getcoachmetaInfoList(injectedData: any) {
    try {
      
      
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;

      let getAllcoachmetadata = await this.CoachCustomFieldService.getCoachCustomFielddata(injectedData.data.requestPayloadGrid);
      if (getAllcoachmetadata) {
        if (getAllcoachmetadata.status) {
          if (getAllcoachmetadata.data.length !== 0 && typeof (getAllcoachmetadata.data) !== "string") {
            getAllcoachmetadata.data.forEach(element => {
              let valuesdata = "";
              if ( typeof (element.value) !== "string")
              {
                element.value.forEach(value => {
                  if (valuesdata === "")
                  {
                    valuesdata = valuesdata + value;
                  }
                  else
                  {
                    valuesdata = valuesdata + ", " + value;
                  }
                })
                element['value'] = valuesdata;
              }
              if (element.is_editable === "true"){
                element['is_editable'] = "Yes";
              }
              else{
                element['is_editable'] = "No";
              }
              if (element.is_required === "true"){
                element['is_required'] = "Yes";
              }
              else{
                element['is_required'] = "No";
              }
              if (element.is_deletable === "true"){
                element['is_deletable'] = "Yes";
              }
              else{
                element['is_deletable'] = "No";
              }
      
            });
            this.getValuesToDisplay.totalRecords = getAllcoachmetadata.totalRecords;
            this.getValuesToDisplay.userInfo = getAllcoachmetadata.data;
            this.getValuesToDisplay.snapshot = getAllcoachmetadata.snapshot.docs;
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

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.updatecoachfieldForm.patchValue({
        sport: event.name,
      })
    }
  }
  
  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  
  goBack() {
    this.change.emit({ action: "coachcustomfield", data: this.injectedData.data })
  }
  

}
