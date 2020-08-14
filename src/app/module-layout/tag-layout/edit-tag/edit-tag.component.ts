import { Component, OnInit, EventEmitter, Output, Injector } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { apiURL, Constant } from 'src/app/core/services/config';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { NgiNotificationService } from 'ngi-notification';
import { TagCrudService } from '../tag-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-edit-tag',
  templateUrl: './edit-tag.component.html',
  styleUrls: ['./edit-tag.component.scss']
})
export class EditTagComponent implements OnInit {

  @Output() change = new EventEmitter();
  submitted = false;
  getValuesToDisplay: any = {};
  error = '';
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  saves: boolean = false;
  UpdateTagForm: FormGroup;
  sportSelect: boolean = false;
  data: any;
  orgId: any;
  deleteTag: any;
  SportsList: any;
  isSaveUp: boolean = false;
  disableByDefault: boolean = true;
  injectedata: any;
  constructor(private dropDownService: DropdownService, private tagService: TagCrudService, private notification: NgiNotificationService, public injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
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
    this.getValuesToDisplay.userAction = "edit";
    this.displayLoader = false;
    this.sharedService.announceMission('tag');
    this.orgId = localStorage.getItem('org_id');
    this.UpdateTagForm = this.formBuilder.group({
      auth_id: [''],
      organization_id: [''],
      organization_name: [''],
      organization_abbreviation: [''],
      sport_name: [''],
      sport_id: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });
    this.injectedata = this.injector.get('injectData');
    if (this.injectedata.data) {
      console.log(this.injectedata.data)
      this.getSportsByOrganization(this.orgId);
      this.UpdateTagForm.patchValue({
        name: this.injectedata.data.tag_name,
        sport_id: this.injectedata.data.sport_id,
        organization_name: this.injectedata.data.organization_name,
        organization_abbreviation: this.injectedata.data.organization_abbreviation,
        sport_name: this.injectedata.data.sport_name,
        auth_id: this.uid,
        organization_id: this.orgId,
      })
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
  get f() { return this.UpdateTagForm.controls; }

  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.disableByDefault = false;
      this.UpdateTagForm.patchValue({
        sport_name: event.name
      })
    }
  }
  tagName() {
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
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
  }

  async onSubmit(form) {
    this.submitted = true;
    this.closeError();
    if (form.invalid) {
      return;
    }
    this.displayLoader = true;
    this.loading = true;
    let loaderWhileUpdating = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    form.value.tag_id = this.injectedata.data.tag_id
    form.value.tag_name = form.value.name
    let updateTagResponse: any = await this.tagService.updateTag(form.value);
    try {
      if (updateTagResponse) {
        if (updateTagResponse.status) {
          await this.getCannedResponseInfoList(this.injector.get('injectData'));
          this.afterSavingAction(loaderWhileUpdating);
          this.change.emit({ action: "taggrid", data: this.getValuesToDisplay})
          this.notification.isNotification(true, "Tags", "Tag updated successfully.", "check-square");
        } else {
          this.submitted = false;
          this.afterSavingAction(loaderWhileUpdating);
          this.error = updateTagResponse.error
        }
      } else {
        this.submitted = false;
        this.afterSavingAction(loaderWhileUpdating);
        this.error = updateTagResponse.error
      }
    } catch (error) {
      this.submitted = false;
      this.afterSavingAction(loaderWhileUpdating);
      this.error = error.message
    }
  }
  async getCannedResponseInfoList(injectedData: any) {
    try {      
      this.getValuesToDisplay.getInjectedDataFromgrid = injectedData.data;
      this.getValuesToDisplay.requestData = injectedData.data.requestPayloadGrid;
      let getAllTagResponse = await this.tagService.getTagsForGrid(injectedData.data.requestPayloadGrid);
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
  afterSavingAction(loaderWhileUpdating?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    this.loading = false;
    clearInterval(loaderWhileUpdating);
    this.displayLoader = false;
    // Reintialsing the loader if success fails
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }
  closeError() {
    this.error = '';
  }
  goBack() {
    this.change.emit({ action: "taggrid", data: this.injectedata.data })
  }

}
