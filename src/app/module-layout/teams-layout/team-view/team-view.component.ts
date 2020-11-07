import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DbService } from 'src/app/core/services/db.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

import { RestApiService } from '../../../shared/rest-api.services';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss']
})
export class TeamViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  userId: any;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  uid: any;
  orgId: any;
  userInfo: any;
  injectedData: any;
  data: any;
  teamInfoById: any;
  teamInfo: any = {};
  memberInfo: any[] = []

  coachInfo: any[] = []
  managerInfo: any[] = []
  teamList: any[] = [];

  posByIndividual: any;
  constructor(private injector: Injector, 
    private restApiService: RestApiService,
    private sharedService: SharedService,
    private dataServices: DataService,
    public router: Router, 
    private activatedRoute: ActivatedRoute, 
    public cookieService: CookieService) {
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        console.log('---data---', data)
        /* if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "teamRouter") {
          this.change.emit({ action: "teamgrid", data: null })
        } */
      }
    })
  }

  ngOnInit() {
    this.injectedData = this.injector.get('injectData')
    console.log('---injectedData---', this.injectedData)
    this.getTeam();
    this.orgId = localStorage.getItem('org_id')
    if (this.injectedData.data) {
      console.log(this.injectedData.data)
      this.teamInfo = this.injectedData.data.team;
      if( this.injectedData.data.member.length>0)
      {
        this.memberInfo.push({Player: this.injectedData.data.member[0].player});
        this.coachInfo.push({Coach: this.injectedData.data.member[0].coach})
        this.managerInfo.push({Manager: this.injectedData.data.member[0].manager})
          
      }
      
      /* this.teamInfo = {
        "auth_uid": this.uid,
        "organization_id": this.orgId,
        "sport_id": this.injectedData.data.sport_id,
        "season_id": this.injectedData.data.season_id,
        "level_id": this.injectedData.data.level_id,
        "level_name": this.injectedData.data.level,
        "team_id": this.injectedData.data.team_id,
        "teamName": this.injectedData.data.team_name,
        "sportName": this.injectedData.data.sport_name,
        "seasonTitle": this.injectedData.data.season_lable,
      } */
     // console.log(typeof (this.teamInfo));

      //this.getTeamInfoById(this.teamInfo)
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
 /*  async getTeamInfoById(teamInfo: any) {
    this.loading = true;
    let loaderToGetInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getTeamInfoIndividual: any = await this.db.getTeamByUid(teamInfo);    
    try {
      if (getTeamInfoIndividual) {
        if (getTeamInfoIndividual.status) {
          getTeamInfoIndividual.data.sport = getTeamInfoIndividual.data.sport.replace('_', ' ')
          getTeamInfoIndividual.data.Players.forEach((Player, i) => {
            this.posByIndividual = []
            Player.positions.forEach(pos => {
              this.posByIndividual.push(pos.position_name)
            });
            Player['positionIndividual'] = this.posByIndividual.join(', ');
            if (Player.middle_initial) {

            } else {
              Player.middle_initial = '';
            }
          });
          this.teamInfoById = getTeamInfoIndividual.data
          if (getTeamInfoIndividual.data.Players.length) {
            this.increaseHeight("Player", "label-player");
          }
          if (getTeamInfoIndividual.data.Players.length) {
            this.increaseHeight("Player", "label-player");
          }
          if (getTeamInfoIndividual.data.Coaches.length) {
            this.increaseHeight("Coach", "label-coach");
          }
          if (getTeamInfoIndividual.data.Managers.length) {
            this.increaseHeight("Manager", "label-manager");
          }          
          this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
        } else {
          this.teamInfoById = [];
          this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
        }
      } else {
        this.teamInfoById = [];
        this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
      }
    } catch (error) {
      console.log(error);
      this.teamInfoById = [];
      this.afterLoadingIndividualTeamInfo(loaderToGetInfo)

    } 
  } */
  afterLoadingIndividualTeamInfo(loaderToGetInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetInfo);
    this.loading = false;
    this.displayLoader = false;
  }

  increaseHeight(id, classHeight) {
    setTimeout(() => {
      var elmnt = document.getElementById(id);
      console.log(elmnt.clientHeight);
      document.getElementById(classHeight).style.height = elmnt.clientHeight + "px";
    }, 5);

  }
  navigateView() {
    this.injectedData.data.viewBy = "view";
    console.log(this.injectedData.data)
    this.change.emit({ action: "editteam", data: this.injectedData.data })
  }

  getTeam()
  {
    this.restApiService.lists('teams').subscribe( res =>{
      this.teamList = res;
    }, e=>{
      console.log('----API error for team list----', e)
    })
  }

  goBack() {
    this.change.emit({ action: "teamgrid", data: this.teamList })
  }
}
