import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { Constant } from 'src/app/core/services/config';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';
import { PlayerMetadataService } from '../playermetadata-service';
@Component({
  selector: 'app-playerfield-view',
  templateUrl: './playerfield-view.component.html',
  styleUrls: ['./playerfield-view.component.scss']
})
export class PlayerfieldViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  sports_id: any;
  season_id: any;
  uid: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  playermetaInfo: any;
  data: any;
  injectedData: any;

  constructor(public PlayerMetadataService: PlayerMetadataService, private injector: Injector, private sharedService: SharedService, private dataServices: DataService, public cookieService: CookieService, public router: Router, private activatedRoute: ActivatedRoute) {
    this.uid = this.cookieService.getCookie('uid')
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {        
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (this.data == "playermetaRouter") {
          this.change.emit({ action: "playermetadata", data: null });
        }
      }
    })
   }

  ngOnInit() {
    this.sharedService.announceMission('playermeta');
    this.injectedData = this.injector.get('injectData')
    if (this.uid && localStorage.getItem('org_id')) {
      this.getplayerfieldById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.field_id, localStorage.getItem('org_id'))
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
  async getplayerfieldById(uid, sportId: any, fieldid: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'field_id': fieldid
    };
    let getplayerByIdResponse: any = await this.PlayerMetadataService.getplayerfieldById(getSeasonByIdRequest);    
    try {
      if (getplayerByIdResponse.status) {
        
        this.playermetaInfo = getplayerByIdResponse.data;
          let valuesdata = "";

          if ( typeof (this.playermetaInfo.value) !== "string")
          {
            this.playermetaInfo.value.forEach(value => {
              if (valuesdata === "")
              {
                valuesdata = valuesdata + value;
              }
              else
              {
                valuesdata = valuesdata + ", " + value;
              }
            })
            this.playermetaInfo['value'] = valuesdata;
          }
          if (this.playermetaInfo.is_editable === "true"){
            this.playermetaInfo['is_editable'] = "Yes";
          }
          else{
            this.playermetaInfo['is_editable'] = "No";
          }
          if (this.playermetaInfo.is_required === "true"){
            this.playermetaInfo['is_required'] = "Yes";
          }
          else{
            this.playermetaInfo['is_required'] = "No";
          }
          if (this.playermetaInfo.is_deletable === "true"){
            this.playermetaInfo['is_deletable'] = "Yes";
          }
          else{
            this.playermetaInfo['is_deletable'] = "No";
          }
  
        // this.playermetaInfo = getplayerByIdResponse.data;      
        this.afterLoading(loaderToGetUserInfo);
      } else {
        this.playermetaInfo=[];
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
    this.change.emit({ action: "editplayerfield", data: this.injectedData.data })
  }
  goBack() {
    this.change.emit({ action: "playermetadata", data: this.injectedData.data })
  }

}
