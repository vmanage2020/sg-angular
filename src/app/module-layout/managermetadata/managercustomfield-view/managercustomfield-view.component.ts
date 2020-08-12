import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { Constant } from 'src/app/core/services/config';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';
import { ManagerCustomFieldService } from '../managercustom-services';

@Component({
  selector: 'app-managercustomfield-view',
  templateUrl: './managercustomfield-view.component.html',
  styleUrls: ['./managercustomfield-view.component.scss']
})
export class ManagercustomfieldViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  sports_id: any;
  season_id: any;
  uid: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  managerFieldInfo: any;
  data: any;
  injectedData: any;
  constructor(public ManagerCustomFieldService: ManagerCustomFieldService, private injector: Injector, 
    private sharedService: SharedService, private dataServices: DataService, public cookieService: CookieService, 
    public router: Router, private activatedRoute: ActivatedRoute) {
      
    this.uid = this.cookieService.getCookie('uid')
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {        
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (this.data == "managercustomRouter") {
          this.change.emit({ action: "managercustomfield", data: null });
        }
      }
    })
     }

  ngOnInit() {
  
    this.sharedService.announceMission('managermetadata');
    this.injectedData = this.injector.get('injectData')
    if (this.uid && localStorage.getItem('org_id')) {
      this.getmanagerfieldById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.field_id, localStorage.getItem('org_id'))
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

  async getmanagerfieldById(uid, sportId: any, fieldid: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'field_id': fieldid
    };
    let getmanagerByIdResponse: any = await this.ManagerCustomFieldService.getManagerfieldById(getSeasonByIdRequest);    
    try {
      if (getmanagerByIdResponse.status) {
        
        this.managerFieldInfo = getmanagerByIdResponse.data;
          let valuesdata = "";

          if ( typeof (this.managerFieldInfo.value) !== "string")
          {
            this.managerFieldInfo.value.forEach(value => {
              if (valuesdata === "")
              {
                valuesdata = valuesdata + value;
              }
              else
              {
                valuesdata = valuesdata + ", " + value;
              }
            })
            this.managerFieldInfo['value'] = valuesdata;
          }
          if (this.managerFieldInfo.is_editable === "true"){
            this.managerFieldInfo['is_editable'] = "Yes";
          }
          else{
            this.managerFieldInfo['is_editable'] = "No";
          }
          if (this.managerFieldInfo.is_required === "true"){
            this.managerFieldInfo['is_required'] = "Yes";
          }
          else{
            this.managerFieldInfo['is_required'] = "No";
          }
          if (this.managerFieldInfo.is_deletable === "true"){
            this.managerFieldInfo['is_deletable'] = "Yes";
          }
          else{
            this.managerFieldInfo['is_deletable'] = "No";
          }
     
        this.afterLoading(loaderToGetUserInfo);
      } else {
        this.managerFieldInfo=[];
        this.afterLoading(loaderToGetUserInfo);
      }
    } catch (error) {
      console.log(error);
      this.afterLoading(loaderToGetUserInfo);
    }
  }

  afterLoading(loaderToGetUserInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetUserInfo);
    this.loading = false;
    this.displayLoader = false;   
  }
  
  navigateView() {
    this.injectedData.data.viewBy = "view";
    this.change.emit({ action: "editmanagerfield", data: this.injectedData.data })
  }
  goBack() {
    this.change.emit({ action: "managercustomfield", data: this.injectedData.data })
  }

}
