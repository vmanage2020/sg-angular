import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { Constant } from 'src/app/core/services/config';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';
import { CoachCustomFieldService } from '../coachmetadata-services';

@Component({
  selector: 'app-coachcustomfield-view',
  templateUrl: './coachcustomfield-view.component.html',
  styleUrls: ['./coachcustomfield-view.component.scss']
})
export class CoachcustomfieldViewComponent implements OnInit {

  @Output() change = new EventEmitter();
  sports_id: any;
  season_id: any;
  uid: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  coachFieldInfo: any;
  data: any;
  injectedData: any;

  constructor(public CoachCustomFieldService: CoachCustomFieldService, private injector: Injector, 
    private sharedService: SharedService, private dataServices: DataService, public cookieService: CookieService, 
    public router: Router, private activatedRoute: ActivatedRoute) { 
    this.uid = this.cookieService.getCookie('uid')
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {        
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (this.data == "coachcustomRouter") {
          this.change.emit({ action: "coachcustomfield", data: null });
        }
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('coachcustomfield');
    this.injectedData = this.injector.get('injectData')
    if (this.uid && localStorage.getItem('org_id')) {
      this.getcoachfieldById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.field_id, localStorage.getItem('org_id'))
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

  async getcoachfieldById(uid, sportId: any, fieldid: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'field_id': fieldid
    };
    let getcoachByIdResponse: any = await this.CoachCustomFieldService.getCoachfieldById(getSeasonByIdRequest);    
    try {
      if (getcoachByIdResponse.status) {
        
        this.coachFieldInfo = getcoachByIdResponse.data;
          let valuesdata = "";

          if ( typeof (this.coachFieldInfo.value) !== "string")
          {
            this.coachFieldInfo.value.forEach(value => {
              if (valuesdata === "")
              {
                valuesdata = valuesdata + value;
              }
              else
              {
                valuesdata = valuesdata + ", " + value;
              }
            })
            this.coachFieldInfo['value'] = valuesdata;
          }
          if (this.coachFieldInfo.is_editable === "true"){
            this.coachFieldInfo['is_editable'] = "Yes";
          }
          else{
            this.coachFieldInfo['is_editable'] = "No";
          }
          if (this.coachFieldInfo.is_required === "true"){
            this.coachFieldInfo['is_required'] = "Yes";
          }
          else{
            this.coachFieldInfo['is_required'] = "No";
          }
          if (this.coachFieldInfo.is_deletable === "true"){
            this.coachFieldInfo['is_deletable'] = "Yes";
          }
          else{
            this.coachFieldInfo['is_deletable'] = "No";
          }
     
        this.afterLoading(loaderToGetUserInfo);
      } else {
        this.coachFieldInfo=[];
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
    this.change.emit({ action: "editcoachfield", data: this.injectedData.data })
  }
  goBack() {
    this.change.emit({ action: "coachcustomfield", data: this.injectedData.data })
  }

}
