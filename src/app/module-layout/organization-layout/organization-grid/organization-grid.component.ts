import { Component, OnInit, ViewChildren, QueryList, ElementRef, Output, EventEmitter, Injector } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdvancedService } from '../../../dataTable/advanced.service';
import { AdvancedSortableDirective } from '../../../dataTable/advanced-sortable.directive';
import { DataService } from 'src/app/core/services/data.service';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DataTableService } from 'src/app/dataTable/data-table.service';
import { UploadService } from 'src/app/core/services/upload.service';
import { Constant } from '../../../core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { OrganizationCrudService } from '../organization-crud.service';
import { NgiDatatableService } from 'src/app/components/ngi-datatable/src/public_api';
import { AppConfig } from 'src/app/app.config';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({

  selector: 'app-organization-grid',
  templateUrl: './organization-grid.component.html',
  styleUrls: ['./organization-grid.component.scss'],
})

export class OrganizationGridComponent implements OnInit {
  getUserListInfo: any = {};
  isEnabled: any = false;
  @Output() change = new EventEmitter();
  dataTableForGrid = AppConfig.settings.organizationData;
  injectedData: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  loaderForCreate: any;
  displayLoader: any = true;
  constructor(public injector: Injector, private organizationService: OrganizationCrudService, private datatableservice: NgiDatatableService, public cookieService: CookieService, private sharedService: SharedService, public router: Router) {
    this.injectedData = injector.get('injectData');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          if (data.data.organization_id !== Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          }
        }
      }
    })
  }

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
  }
  ngOnInit() {
    this.loading = true;
    this.loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo);
    this.dataTableForGrid.params = {
      "uid": this.cookieService.getCookie('uid')
    }
    if (this.injectedData.action === "organizationgrid") {
      if (this.injectedData.data) {
        if (this.injectedData.data.userAction === "create" && this.injectedData.data.userAction) {
          this.dataTableForGrid.isDataAlreadyLoaded = "create";
          this.dataTableForGrid.Data = this.injectedData.data;
          this.displayLoader = false;
          this.isEnabled = true;
        } else if (this.injectedData.data.userAction === "edit" && this.injectedData.data.userAction) {
          this.dataTableForGrid.isDataAlreadyLoaded = "edit";
          this.dataTableForGrid.Data = this.injectedData.data;
          this.displayLoader = false;
          this.isEnabled = true;
        } else {
          this.dataTableForGrid.isDataAlreadyLoaded = "none";          
          this.dataTableForGrid.Data = this.injectedData.data;
          this.isEnabled = true;
        }
      } else {
        this.dataTableForGrid.isDataAlreadyLoaded = "notexist";
        this.isEnabled = true;
      }
    } else {
      this.dataTableForGrid.isDataAlreadyLoaded = "notexist";
      this.isEnabled = true;
    }
  }

  reInitialise(event) {
    if (event === "hide data") {
      this.displayLoader = true;
      this.loading = true;
      this.loaderForCreate = setInterval(this.timerFunction, 100, this.loaderInfo);
    } else if (event === "data Loaded") {
      this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
      clearInterval(this.loaderForCreate);
      this.loading = false;
      this.displayLoader = false;
      this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
    }
  }
  addOrganization() {
    this.getUserListInfo.isNextReq = false;
    this.getUserListInfo.isPrevReq = false;
    this.getUserListInfo.page_no = 1;
    this.getUserListInfo.item_per_page = 10;
    this.getUserListInfo.searchVal = '';
    this.change.emit({ action: "createorganization", data: this.getUserListInfo })
  }
  editOrganization(event: any) {
    this.change.emit({ action: "editorganization", data: event })
  }
  viewOrganization(event: any) {
    this.change.emit({ action: "vieworganization", data: event })
  }

  valueForAddOrganization(event: any) {
    console.log(event);
    if (event.utiliseFor === "add Organization") {
      this.getUserListInfo = event.gridRequestInput
    }
  }
}


