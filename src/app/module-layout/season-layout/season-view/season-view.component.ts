import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import * as moment from 'moment';
import { apiURL, Constant } from 'src/app/core/services/config';
import { SeasonCrudService } from '../season-crud.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

@Component({
  selector: 'app-season-view',
  templateUrl: './season-view.component.html',
  styleUrls: ['./season-view.component.scss']
})
export class SeasonViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  sports_id: any;
  season_id: any;
  uid: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  seasonInfo: any;
  data: any;
  injectedData: any;
  constructor(private seasonService: SeasonCrudService, private injector: Injector, private sharedService: SharedService, private dataServices: DataService, public cookieService: CookieService, public router: Router, private activatedRoute: ActivatedRoute) {
    this.uid = this.cookieService.getCookie('uid')
    sharedService.missionAnnounced$.subscribe((data:any) => {
      if (data) {        
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "seasonRouter") {
          this.change.emit({ action: "seasongrid", data: null });
        }
      }
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('season');
    this.injectedData = this.injector.get('injectData')
    if (this.uid && localStorage.getItem('org_id')) {
      this.getSeasonById(this.uid, this.injectedData.data.sports_id, this.injectedData.data.season_id, localStorage.getItem('org_id'))
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
  async getSeasonById(uid, sportsId, seasonId, orgId) {
    this.loading = true;
    let loaderToGetUserInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getSeasonByIdRequest: any = {
      'auth_uid': uid, 'organization_id': orgId, 'sports_id': sportsId, 'season_id': seasonId
    };
    let getSeasonByIdResponse: any = await this.seasonService.getSeasonById(getSeasonByIdRequest);
    console.log(getSeasonByIdResponse);
    try {
      if (getSeasonByIdResponse.status) {
        this.seasonInfo = getSeasonByIdResponse.data;
        this.seasonInfo.season_start_date = moment(this.seasonInfo.season_start_date.toDate()).format('MMMM DD, YYYY').toString();
        this.seasonInfo.season_end_date = moment(this.seasonInfo.season_end_date.toDate()).format('MMMM DD, YYYY').toString();
        this.seasonInfo['sports_name'] = this.injectedData.data.sports_name;
        this.afterLoading(loaderToGetUserInfo);
      } else {
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
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  navigateView() {
    this.injectedData.data.viewBy = "view";
    console.log(this.injectedData.data)
    this.change.emit({ action: "editseason", data: this.injectedData.data })
  }
  goBack() {
    this.change.emit({ action: "seasongrid", data: this.injectedData.data })
  }
}
