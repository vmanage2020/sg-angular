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
import { ManagerCustomFieldService } from '../managercustom-services';

@Component({
  selector: 'app-managercustomfield-edit',
  templateUrl: './managercustomfield-edit.component.html',
  styleUrls: ['./managercustomfield-edit.component.scss']
})
export class ManagercustomfieldEditComponent implements OnInit {

  getValuesToDisplay: any = {};
  @Output() change = new EventEmitter();
  updatemanagerfieldForm: FormGroup;
  submitted = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  orgId:any;
  error: any = '';
  isNationalBody: boolean = false;
  saves = false;
  managerfieldInfo: any;
  injectedData: any;
  SportsList: any = [];
  managerfieldList: any = [];
  sportSelect: boolean = false;
  managerfieldSelect: boolean = false;
  ismanagerfieldhasDropDown: boolean = false;
  isSaveUp: boolean = false;

  FieldList: any = [
    { name: 'Drop Down' },
    { name: 'Check box' },
    { name: 'Radio button' },
    { name: 'Text Field' }
  ]
  constructor(private dropDownService: DropdownService, public ManagerCustomFieldService: ManagerCustomFieldService, 
    private notification: NgiNotificationService, private injector: Injector, private location: Location, 
    public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, 
    private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
      this.uid = this.cookieService.getCookie('uid');
      sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "managercustomRouter") {
          this.change.emit({ action: "managercustomfield", data: null });
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
    this.updatemanagerfieldForm = this.formBuilder.group({
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
      this.getmanagerfieldById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.field_id, this.injectedData.data.organization_id)
    }
  }

  
  get f() { return this.updatemanagerfieldForm.controls; }
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

  async getmanagerfieldById(uid, sportId: any, fieldId: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'field_id': fieldId
    };
    let getmanagerfieldByIdResponse: any = await this.ManagerCustomFieldService.getManagerfieldById(getSeasonByIdRequest);
    try {
      if (getmanagerfieldByIdResponse.status) {

        let singlevalue: any = "";
        this.managerfieldInfo = getmanagerfieldByIdResponse.data;
        if (this.managerfieldInfo.value.length === 1 && this.managerfieldInfo.value === "Text Field")
        {
          singlevalue = this.managerfieldInfo.value[0];
        }
        else{
          this.managerfieldInfo.value.forEach(element => {
            this.fieldvalueBodyArr.push(this.getFieldvalueInfowithvalue(element));
          });

        }
        this.updatemanagerfieldForm.patchValue({
          field_id: this.managerfieldInfo.field_id,
          organization_id: this.managerfieldInfo.organization_id,
          sport_id: this.managerfieldInfo.sport_id,
          sport: this.managerfieldInfo.sport,
          field_name: this.managerfieldInfo.field_name,
          field_type: this.managerfieldInfo.field_type,
          is_editable: this.managerfieldInfo.is_editable,
          is_deletable: this.managerfieldInfo.is_deletable,
          is_required: this.managerfieldInfo.is_required,
          singlevalue: singlevalue,
          value: this.managerfieldInfo.value
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
      this.updatemanagerfieldForm.patchValue({
        is_required: "true"
      })
    }
    else{
      this.updatemanagerfieldForm.patchValue({
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
      this.updatemanagerfieldForm.patchValue({
        is_editable: "true"
      })
    }
    else{
      this.updatemanagerfieldForm.patchValue({
        is_editable: "false"
      })
    }
  }
  
  is_deletablevalue(event: any)
  {
    if (event.target.value === "true")
    {
      this.updatemanagerfieldForm.patchValue({
        is_deletable: "true"
      })
    }
    else{
      this.updatemanagerfieldForm.patchValue({
        is_deletable: "false"
      })
    }
  }

  get fieldvalueBodyArr() {
    return this.updatemanagerfieldForm.get('value') as FormArray;
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
      this.updatemanagerfieldForm.patchValue({
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

    this.updatemanagerfieldForm.patchValue({
      auth_uid: this.uid
    })
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateLevelRes: any = await this.ManagerCustomFieldService.updateManagerfield(form.value);
    try {
      if (updateLevelRes) {
        if (updateLevelRes.status) {
          await this.getmanagermetaInfoList(this.injector.get('injectData'));
          this.afterSavingData(loaderWhileUpdate);
          this.change.emit({ action: "managercustomfield", data: this.getValuesToDisplay })
          this.notification.isNotification(true, "Manager Custom Field", updateLevelRes.message, "check-square");
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

  async getmanagermetaInfoList(injectedData: any) {
    try {
      
      
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;

      let getAllmanagermetadata = await this.ManagerCustomFieldService.getManagerCustomFielddata(injectedData.data.requestPayloadGrid);
      if (getAllmanagermetadata) {
        if (getAllmanagermetadata.status) {
          if (getAllmanagermetadata.data.length !== 0 && typeof (getAllmanagermetadata.data) !== "string") {
            getAllmanagermetadata.data.forEach(element => {
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
            this.getValuesToDisplay.totalRecords = getAllmanagermetadata.totalRecords;
            this.getValuesToDisplay.userInfo = getAllmanagermetadata.data;
            this.getValuesToDisplay.snapshot = getAllmanagermetadata.snapshot.docs;
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
      this.updatemanagerfieldForm.patchValue({
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
    this.change.emit({ action: "managercustomfield", data: this.injectedData.data })
  }
  
}
