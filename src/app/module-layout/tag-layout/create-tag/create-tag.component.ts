import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { TagCrudService } from '../tag-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-create-tag',
  templateUrl: './create-tag.component.html',
  styleUrls: ['./create-tag.component.scss']
})
export class CreateTagComponent implements OnInit {
  @Output() change = new EventEmitter();
  // Input for loading grid  
  getValuesToDisplay: any = {};
  submitted = false;
  error = '';
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  saves: boolean = false;
  createTagForm: FormGroup;
  sportSelect: boolean = false;
  data: any;
  orgId: any;
  SportsList: any;
  injectedData: any;
  sportName: any;
  isSaveUp: any = false;
  constructor(private dropDownService: DropdownService, private tagService: TagCrudService, private injector: Injector, private notification: NgiNotificationService, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);

        } else if (data === "tagsRouter") {
          this.change.emit({ action: "taggrid", data: null })
        }
      }
    })
  }

  ngOnInit() {
    this.getValuesToDisplay.userAction = "create";
    this.displayLoader = false;
    this.sharedService.announceMission('tag');
    this.injectedData = this.injector.get('injectData');
    this.createTagForm = this.formBuilder.group({
      auth_id: [''],
      organization_id: [''],
      organization_name: [''],
      organization_abbreviation: [''],
      sport_name: [''],
      sports_id: [null, [Validators.required]],
      name: ['', [Validators.required]],
    });
    this.orgId = localStorage.getItem('org_id');
    if (this.orgId) {
      this.getSportsByOrganization(this.orgId)
    }
    if (this.injectedData.action === "createtag") {
      if (this.injectedData.data) {
        this.createTagForm.patchValue({
          sports_id: this.injectedData.data.selectedSport,
          sport_name: this.injectedData.data.selectedSportName
        })
        this.sportName = this.injectedData.data.selectedSportName
      }
    }
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
          if (!this.createTagForm.controls.sports_id.value) {
            this.createTagForm.patchValue({
              sports_id: this.SportsList[0].sport_id,
              sport_name: this.SportsList[0].name,
            })
          }
        }
        this.sportSelect = false
      } else {
        this.SportsList = []
        this.sportSelect = false
      }
    } catch (error) {
      console.log(error);
      this.SportsList = [];
      this.sportSelect = false;
    }
  }
  get f() { return this.createTagForm.controls; }

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.createTagForm.patchValue({
        sport_name: event.name,
      })
      this.sportName = event.name
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
    this.createTagForm.patchValue({
      organization_id: this.orgId,
      organization_name: localStorage.getItem('org_name'),
      organization_abbreviation: localStorage.getItem('org_abbrev'),
      auth_id: this.uid
    })
    this.displayLoader = true;
    this.loading = true;
    let loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo, "create");
    let createTagResponse: any = await this.tagService.createTag(form.value);
    try {
      if (createTagResponse) {
        if (createTagResponse.status) {
          if (this.saves) {
            await this.getCannedResponseInfoList(this.injectedData.data,form.value);
            if (this.SportsList.length === 1) {
              this.change.emit({ action: "taggrid", data: this.getValuesToDisplay })
            } else {
              this.getValuesToDisplay.selectedSport = form.value.sports_id
              this.getValuesToDisplay.selectedSportName = this.sportName
              this.change.emit({ action: "taggrid", data: this.getValuesToDisplay })
            }
            this.afterSavingData(loaderForCreate);
            this.notification.isNotification(true, "Tags", createTagResponse.message, "check-square");
          }
          else {
            form.reset();
            this.getSportsByOrganization(this.orgId)            
            this.afterSavingData(loaderForCreate);
            this.reInitialise();
            this.notification.isNotification(true, "Tags", createTagResponse.message, "check-square");
          }
        } else {          
          this.afterSavingData(loaderForCreate);
          this.reInitialise();
          this.error = createTagResponse.message;
        }
      } else {       
        this.afterSavingData(loaderForCreate);
        this.reInitialise();
        this.error = 'Unhandled Error.';
      }
    } catch (error) {
      console.log(error);    
      this.afterSavingData(loaderForCreate);
      this.reInitialise();
      this.error = error.message;
    }
  }
  async getCannedResponseInfoList(injectedData: any,formValue:any) {
    try {      
      this.getValuesToDisplay.requestData = injectedData;
      injectedData.sport_id=formValue.sports_id;
      let getAllTagResponse = await this.tagService.getTagsForGrid(injectedData);
      if (getAllTagResponse) {
        if (getAllTagResponse.status) {
          if (getAllTagResponse.data.data.length !== 0 && typeof (getAllTagResponse.data.data) !== "string") {
            getAllTagResponse.data.data.forEach(element => {
              // element.tag_name = element.tag_name;
              element.sport = element.sport_name;

            });                       
            this.getValuesToDisplay.totalRecords = getAllTagResponse.data.totalRecords;
            this.getValuesToDisplay.userInfo = getAllTagResponse.data.data;
            this.getValuesToDisplay.snapshot = getAllTagResponse.data.snapshot.docs;
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
    this.submitted = false;
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderForCreate);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  closeError() {
    this.error = '';
  }
  goBack() {
    this.change.emit({ action: "taggrid", data: this.injectedData.data })
  }
}

