import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { SportsCrudService } from '../sports-crud.service';
@Component({
  selector: 'app-sports-view',
  templateUrl: './sports-view.component.html',
  styleUrls: ['./sports-view.component.scss']
})
export class SportsViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  sportId: any;
  loading = false;
  uid: any;
  error: any;
  data: any;
  message: any;
  injectedData: any;
  constructor(private injector: Injector, private sportService: SportsCrudService, private notification: NgiNotificationService, private dataServices: DataService, public router: Router, private activatedRoute: ActivatedRoute, public cookieService: CookieService, private sharedService: SharedService) {
    sharedService.missionAnnounced$.subscribe((data) => {
      if (data) {
        this.data = data;
        if (this.data.action === "organizationFilter") {
          if (this.data.data !== Constant.organization_id) {
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
          }

        } else if (data == "sportRouter") {
          if (this.injectedData) {
            this.change.emit({ action: "sportgrid", data: this.injectedData.data })
          }
        }
      }
    })
  }

  updateSportsForm: any = {
    sport_id: '',
    name: null,
  }

  ngOnInit() {
    this.sharedService.announceMission('sport');
    this.injectedData = this.injector.get('injectData');

    this.uid = this.cookieService.getCookie('uid');
    if (this.injectedData) {
      if (this.injectedData.data) {
        this.sportId = this.injectedData.data._id;
        this.getSportsById(this.injectedData.data._id, this.uid);
      }
    }
  }

  async getSportsById(id, uid) {
    this.loading = true;
    let resObjectForSportById: any = {
      'sport_id': id,
      'uid': uid
    }

    let getSportById: any = await this.sportService.getSportById(resObjectForSportById);

    try {
      if (getSportById) {
        if (getSportById.status) {
          this.updateSportsForm = getSportById.data;
          this.loading = false;
        } else {
          this.updateSportsForm = [];
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    } catch (error) {
      console.log(error);
      this.loading = false;
    }
  }

  async updateSports(form) {
    this.closeToast();
    form.value.sport_id = this.sportId;
    form.value.created_datetime = this.updateSportsForm.created_datetime;
    form.value['uid'] = this.uid;
    this.loading = true;

    let updateSport: any = await this.sportService.updateSport(form.value);
    try {
      if (updateSport) {
        if (updateSport.status) {
          this.change.emit({ action: "sportgrid", data: this.injectedData.data })
          this.loading = false;
          this.notification.isNotification(true, "Sports", updateSport.message, "check-square");
        } else {
          this.loading = false
          this.error = true;
          this.message = updateSport.message
        }
      } else {
        this.loading = false
        this.error = true;
        this.message = "Unhandled error."
      }
    } catch (error) {
      console.log(error);
      this.loading = false
      this.error = true;
      this.message = error.message
    }
  }
  closeToast() {
    this.error = false;
  }
  goBack() {
    this.change.emit({ action: "sportgrid", data: this.injectedData.data })
  }

}