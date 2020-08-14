import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import * as moment from 'moment'
import { LevelService } from '../level-service';
import { Constant } from 'src/app/core/services/config';
import { Logoinfo } from '../../logoinfo.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-level-view',
  templateUrl: './level-view.component.html',
  styleUrls: ['./level-view.component.scss']
})
export class LevelViewComponent implements OnInit {

  @Output() change = new EventEmitter();
  sports_id: any;
  season_id: any;
  uid: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  levelInfo: any;
  data: any;
  injectedData: any;
  isNationalBody:boolean=false;
  constructor(public levelService: LevelService, private injector: Injector, private sharedService: SharedService, private dataServices: DataService, public cookieService: CookieService, public router: Router, private activatedRoute: ActivatedRoute) {
    this.uid = this.cookieService.getCookie('uid')
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {        
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (this.data == "levelRouter") {
          this.change.emit({ action: "levelgrid", data: null });
        }
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('level');
    this.injectedData = this.injector.get('injectData')
    if (this.uid && localStorage.getItem('org_id')) {
      this.getlevelById(this.uid, this.injectedData.data.sport_id, this.injectedData.data.level_id, localStorage.getItem('org_id'))
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
  async getlevelById(uid, sportId: any, levelId: any, orgId: any) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sport_id': sportId, 'level_id': levelId
    };
    let getLevelByIdResponse: any = await this.levelService.getLevelById(getSeasonByIdRequest);    
    try {
      if (getLevelByIdResponse.status) {
        this.levelInfo = getLevelByIdResponse.data;      
        this.afterLoading(loaderToGetUserInfo);
      } else {
        this.levelInfo=[];
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
    this.change.emit({ action: "editlevel", data: this.injectedData.data })
  }
  goBack() {
    this.change.emit({ action: "levelgrid", data: this.injectedData.data })
  }

}
