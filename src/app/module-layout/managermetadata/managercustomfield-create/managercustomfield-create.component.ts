import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { Constant } from 'src/app/core/services/config';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { NgiNotificationService } from 'ngi-notification';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
import { ManagerCustomFieldService } from '../managercustom-services';

@Component({
  selector: 'app-managercustomfield-create',
  templateUrl: './managercustomfield-create.component.html',
  styleUrls: ['./managercustomfield-create.component.scss']
})
export class ManagercustomfieldCreateComponent implements OnInit {

  private _prevSelected: any;
  getValuesToDisplay: any = {};
  @Output() change = new EventEmitter();
  submitted = false;
  error = '';
  isSaveUp: boolean = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  saves: boolean = false;
  createmanagerfieldForm: FormGroup;
  sportSelect: boolean = false;
  data: any;
  orgId: any;
  roleId: any;
  isNationalExist: any;
  sysAdminWithId: boolean = false;
  SportsList: any;
  managerfieldList: any;
  ismanagerfieldSelected: boolean = false;
  managerfieldSelect: boolean = false;
  ismanagerfieldhasDropDown: boolean = false;
  injectedData: any;
  isNationalBody: boolean = false;
  FieldList: any = [
    { name: 'Drop Down' },
    { name: 'Check box' },
    { name: 'Radio button' },
    { name: 'Text Field' }
  ]
  constructor(private dropDownService: DropdownService, private notification: NgiNotificationService, private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder,
    private route: ActivatedRoute, private router: Router, public dataService: DataService, 
    public ManagerCustomFieldService: ManagerCustomFieldService) {
      
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      sharedService.missionAnnounced$.subscribe((data: any) => {
        if (data) {
          if (data.action === "organizationFilter") {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          } else if (data == "managercustomRouter") {
            if (this.injectedData) {
              this.change.emit({ action: "managercustomfield", data: this.injectedData.data })
            }
          }
        }
      })
     }

  ngOnInit() {
    
    this.getValuesToDisplay.userAction = "create";
    this.displayLoader = false;
    this.injectedData = this.injector.get('injectData');
    this.sharedService.announceMission('managermetadata');
    this.createmanagerfieldForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      sport_id: [null, [Validators.required]],
      sport_name: [''],
      field_name: [null, [Validators.required]],
      field_type: [null, [Validators.required]],
      is_editable: ['true', [Validators.required]],
      is_deletable: ['true', [Validators.required]],
      is_required: ['true', [Validators.required]],
      singlevalue: [''],
      value: this.formBuilder.array([])
    });
    
    if (this.orgId === Constant.organization_id) {
      this.getAllSports(this.uid);
    }
    else {
      this.getSportsByOrganization(this.orgId);
    }
    if (this.injectedData) {
      if (this.injectedData.data) {
        if (this.injectedData.data.sport_id) {
          this.createmanagerfieldForm.patchValue({
            sport_id: this.injectedData.data.sport_id,
            sport_name: this.injectedData.data.sport_name
          })
        }
      }
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
        if (this.SportsList.length === 1) {
          if (!this.createmanagerfieldForm.controls.sport_id.value) {
            this.createmanagerfieldForm.patchValue({
              sport_id: this.SportsList[0].sport_id,
              sport_name: this.SportsList[0].name,
            })
          }
        }
        this.sportSelect = false;
      } else {
        this.SportsList =[];
        this.sportSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.SportsList = [];
      this.sportSelect = false;
    }
  }
  
  get fieldvalueBodyArr() {
    return this.createmanagerfieldForm.get('value') as FormArray;
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
      this.createmanagerfieldForm.patchValue({
        is_required: "true"
      })
    }
    else{
      this.createmanagerfieldForm.patchValue({
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
      this.createmanagerfieldForm.patchValue({
        is_editable: "true"
      })
    }
    else{
      this.createmanagerfieldForm.patchValue({
        is_editable: "false"
      })
    }
  }
  
  is_deletablevalue(event: any)
  {
    if (event.target.value === "true")
    {
      this.createmanagerfieldForm.patchValue({
        is_deletable: "true"
      })
    }
    else{
      this.createmanagerfieldForm.patchValue({
        is_deletable: "false"
      })
    }
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
      this.createmanagerfieldForm.patchValue({
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
    else if (event.name === "Text Field"){
      this.fieldvalueBodyArr.clear()
    }
    
  }
  
  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.createmanagerfieldForm.patchValue({
        sport_name: event.name,
      })
    }
  }
  
  get f() { return this.createmanagerfieldForm.controls; }

  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  closeError() {
    this.error = '';
  }

  goBack() {
    this.change.emit({ action: "managercustomfield", data: this.injectedData.data })
  }
  
 
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating });
  }

  async onSubmit(form) {
    try {
      this.closeError();
      this.submitted = true;
      if (form.invalid) {
        return;
      }
      form.value.organization_id = this.orgId;
      this.displayLoader = true;
      this.loading = true;
      let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
      let createManagerRes = await this.ManagerCustomFieldService.CreateManagerCustomField(form.value);
      if (createManagerRes.status) {
        if (this.saves) {
          await this.getmanagerfieldInfoList(this.injectedData.data, form.value);
          if (this.SportsList.length === 1) {
            this.change.emit({ action: "managercustomfield", data: this.getValuesToDisplay })
          } else {
            this.getValuesToDisplay.sport_id = form.value.sport_id;
            this.getValuesToDisplay.sport_name = form.value.sport_name;
            this.change.emit({ action: "managercustomfield", data: this.getValuesToDisplay })
          }
          this.afterSavingData(loaderForCreate);
          this.notification.isNotification(true, "Manager Custom Field", createManagerRes.data, "check-square");
        }
        else {
          form.reset();
          this.submitted = false;
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.SportsList = [];
          
          if (this.orgId === Constant.organization_id) {
            this.getAllSports(this.uid);
          }
          else {
            this.getSportsByOrganization(this.orgId);
          }
          this.createmanagerfieldForm = this.formBuilder.group({
            auth_uid: [''],
            organization_id: [''],
            sport_id: [null, [Validators.required]],
            sport_name: [''],
            field_name: [null, [Validators.required]],
            field_type: [null, [Validators.required]],
            is_editable: ['true', [Validators.required]],
            is_deletable: ['true', [Validators.required]],
            is_required: ['true', [Validators.required]],
            singlevalue: [''],
            value: this.formBuilder.array([])
          });
          this.notification.isNotification(true, "Manager Custom Field", createManagerRes.data, "check-square");
        }
      }
      else {
        this.submitted = false;
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
        this.error = createManagerRes.error
      }
    } catch (error) {
      console.log(error);
      this.submitted = false;
      this.afterSavingData();
      this.reInitialise();
      this.error = error.message
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
  
  afterSavingData(loaderForCreate?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    if (loaderForCreate) {
      clearInterval(loaderForCreate);
    }
    this.loading = false;
    this.displayLoader = false;
  }
  
  async getmanagerfieldInfoList(injectedData: any,formValue:any) {
    try {
      this.getValuesToDisplay.requestData = injectedData;
      injectedData.sport_id=formValue.sport_id;
      let getAllmanagermetadata = await this.ManagerCustomFieldService.getManagerCustomFielddata(injectedData);
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

}
