import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from '../../../core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { OrganizationCrudService } from '../organization-crud.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

@Component({
  selector: 'app-organization-view',
  templateUrl: './organization-view.component.html',
  styleUrls: ['./organization-view.component.scss']
})
export class OrganizationViewComponent implements OnInit {

  @Output() change = new EventEmitter();
  orgId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  imgSrc = "../../../../assets/image_placeholder.jpg"
  organizationInformations: any = {};
  custAdmin = false
  admin = false
  organization_id: any;
  sports: any;
  dialCodePhone = "+1";
  dialCodeFax = "+1";
  ProfileUrl = null;
  injectedData: any;
  error = '';
  data: any;
  uid: any;
  deafulltImagePlaceholder: boolean = true;
  adminWithId: boolean = false;
  productDetViewInitiatorIdentity: string = this.dataServices.randomCodeGenerator();
  countryCodeSelect: any = [];
  primaryContactName: any;
  secondaryContactName: any;
  constructor(private organizationService: OrganizationCrudService, private dropDownService: DropdownService, private notification: NgiNotificationService, public injector: Injector, private sharedService: SharedService, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService) {
    this.getCountryCodeList();
    this.uid = this.cookieService.getCookie('uid');
    this.injectedData = injector.get('injectData')
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data === "organizationRouter") {
          this.change.emit({ action: "organizationgrid" })
        }
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('organization');
    if (this.cookieService.getCookie('admin')) {
      this.custAdmin = true;
      this.admin = false;
      if (this.injectedData) {
        if (this.injectedData.data) {
          this.organization_id = this.injectedData.data
          this.getOrganizationById(this.injectedData.data);
        } else {
          this.organization_id = this.injectedData
          this.getOrganizationById(this.injectedData);
        }
      }
    } else if (this.cookieService.getCookie('sysAdmin')) {
      this.custAdmin = false;
      this.admin = true;
      if (localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
        this.adminWithId = false;
        if (this.injectedData) {
          if (this.injectedData.data) {
            this.organization_id = this.injectedData.data
            this.getOrganizationById(this.injectedData.data)
          } else {
            this.organization_id = this.injectedData.data
            this.getOrganizationById(this.injectedData)
          }
        }
      }
      else {
        this.adminWithId = true;
        this.organization_id = this.injectedData.data.organization_id
        this.getOrganizationById(this.injectedData.data.organization_id);
      }
    }
  }
  closeError() {
    this.error = ''
  }
  async getCountryCodeList() {

    let getAllCountryResponse: any = await this.dropDownService.getAllCountry();
    try {
      if (getAllCountryResponse.status) {
        this.countryCodeSelect = getAllCountryResponse.data;
      }
      else {
        this.countryCodeSelect = [];
      }
    } catch (error) {
      console.log(error);
      this.countryCodeSelect = [];
    }

  }
  ngAfterViewInit() {
  }
  
  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }

  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  async getOrganizationById(id) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getOrganizationByIdRequest: any = {
      'organization_id': id, 'uid': this.uid
    }
    let getOrganizationByIdResponse: any = await this.organizationService.getOrganizationById(getOrganizationByIdRequest);
    try {
      if (getOrganizationByIdResponse.status) {
        this.organizationInformations = getOrganizationByIdResponse.data;
        if (getOrganizationByIdResponse.data.primary_first_name) {
          if(getOrganizationByIdResponse.data.primary_suffix){
            this.primaryContactName = getOrganizationByIdResponse.data.primary_first_name + ' ' + getOrganizationByIdResponse.data.primary_middle_initial + ' ' + getOrganizationByIdResponse.data.primary_last_name +' '+getOrganizationByIdResponse.data.primary_suffix;
          }else{
            this.primaryContactName = getOrganizationByIdResponse.data.primary_first_name + ' ' + getOrganizationByIdResponse.data.primary_middle_initial + ' ' + getOrganizationByIdResponse.data.primary_last_name;
          }
         
        } else {
          this.primaryContactName = "-";
        }

        if (getOrganizationByIdResponse.data.secondary_first_name) {
          if(getOrganizationByIdResponse.data.secondary_suffix){
            this.secondaryContactName = getOrganizationByIdResponse.data.secondary_first_name + ' ' + getOrganizationByIdResponse.data.secondary_middle_initial + ' ' + getOrganizationByIdResponse.data.secondary_last_name  +' '+getOrganizationByIdResponse.data.secondary_suffix;
          }else{
            this.secondaryContactName = getOrganizationByIdResponse.data.secondary_first_name + ' ' + getOrganizationByIdResponse.data.secondary_middle_initial + ' ' + getOrganizationByIdResponse.data.secondary_last_name ;
          }
          
        } else {
          this.secondaryContactName = "-";
        }
        if (getOrganizationByIdResponse.data.avatar && getOrganizationByIdResponse.data.avatar != "null" && getOrganizationByIdResponse.data.avatar != undefined && getOrganizationByIdResponse.data.avatar != null) {
          this.ProfileUrl = getOrganizationByIdResponse.data.avatar;
          this.deafulltImagePlaceholder = false;
        }
        else {
          let initials = getOrganizationByIdResponse.data.abbrev;
          this.deafulltImagePlaceholder = true;
          document.getElementById("abbreviation").innerHTML = initials;
          if (getOrganizationByIdResponse.data.abbrev.length <= 2) {
            document.getElementById("abbreviation").style.fontSize = "40px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 4) {
            document.getElementById("abbreviation").style.fontSize = "25px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 6) {
            document.getElementById("abbreviation").style.fontSize = "20px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 8) {
            document.getElementById("abbreviation").style.fontSize = "18px";
          }
          else if (getOrganizationByIdResponse.data.abbrev.length <= 10) {
            document.getElementById("abbreviation").style.fontSize = "15px";
          }
          this.ProfileUrl = null
        }
        if (getOrganizationByIdResponse.data.mobile_phone) {
          setTimeout(() => {
            if (getOrganizationByIdResponse.data) {
              if (getOrganizationByIdResponse.data.country_code) {
                this.countryCodeSelect.forEach(element => {
                  if (getOrganizationByIdResponse.data.country_code === element.country_code) {
                    this.dialCodePhone = element.dial_code;
                  }
                });
              }
            }
          }, 320);
        }
        else {
          this.dialCodePhone = ''
        }
        if (getOrganizationByIdResponse.data.fax) {
          setTimeout(() => {
            if (getOrganizationByIdResponse.data) {
              if (getOrganizationByIdResponse.data.country_code) {
                this.countryCodeSelect.forEach(element => {
                  if (getOrganizationByIdResponse.data.country_code === element.country_code) {
                    this.dialCodeFax = element.dial_code;
                  }
                });
              }
            }
          }, 320);
        }
        else {
          this.dialCodeFax = ''
        }
        this.sports = getOrganizationByIdResponse.data.governing_body_info.map(governingBody => governingBody.sport_name);
        this.sports = this.sports.join(', ');
        this.afterLoading(loaderToGetUserInfo);
      }
      else {
        this.afterLoading(loaderToGetUserInfo)
        this.error = getOrganizationByIdResponse.message;
      }
    } catch (error) {
      console.log(error);
      this.afterLoading(loaderToGetUserInfo)
      this.error = error.message;
    }
  }
  navigateView() {
    this.sharedService.announceMission('view');
    if (this.cookieService.getCookie('sysAdmin')) {
      if (localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
        if (this.injectedData.data) {
          this.change.emit({ action: "editorganization", data: this.injectedData.data })
        } else {
          this.change.emit({ action: "editorganization", data: this.injectedData })
        }
      } else {
        this.injectedData.data.organization_id = this.organization_id;
        this.injectedData.data.subView = "View"
        this.change.emit({ action: "editorganization", data: this.injectedData.data })
      }

    } else if (this.cookieService.getCookie('admin')) {
      if (this.injectedData.data) {
        this.change.emit({ action: "editorganization", data: this.injectedData.data })
      } else {
        this.change.emit({ action: "editorganization", data: this.injectedData })
      }

    }

  }
  goBack() {
    this.change.emit({ action: "organizationgrid", data: this.injectedData.data })
  }
}
