import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { SportsCrudService } from '../sports-crud.service';
@Component({
  selector: 'app-sports-create',
  templateUrl: './sports-create.component.html',
  styleUrls: ['./sports-create.component.scss']
})
export class SportsCreateComponent implements OnInit {
  @Output() change = new EventEmitter();

  loading = false;
  uid: any;
  error: any;
  message: any;
  saves: any;
  data: any;
  constructor(private sportService: SportsCrudService, private notification: NgiNotificationService, private dataServices: DataService, public router: Router, public cookieService: CookieService, private sharedService: SharedService) {

    sharedService.missionAnnounced$.subscribe((data) => {
      if (data) {
        this.data = data;
        if (this.data.action === "organizationFilter") {
          if (this.data.data !== Constant.organization_id) {
            this.router.navigate(['']);
          }
        } else if (data == "sportRouter") {
          this.change.emit({ action: "sportgrid" })
        }
      }
    })
  }

  createSportsForm: any = {
    sport_id: '',
    name: null,
  }

  ngOnInit() {
    this.sharedService.announceMission('sport');
    this.uid = this.cookieService.getCookie('uid');
  }

  async createSports(form) {
    this.closeToast();
    this.loading = true;
    // form.value['uid'] = this.uid;
    let obj = {
      sport : form.value.name,
      created_uid : this.uid,
      created_datetime : new Date(),
      updated_uid : this.uid,
      updated_datetime : new Date()
    }
    this.dataServices.postData(apiURL.CREATE_SPORT,obj,localStorage.getItem('token')).subscribe(createSportResponse => {

    try {
      if (createSportResponse) {
        if (createSportResponse.status) {
          if (this.saves) {
            this.change.emit({ action: "sportgrid" });
            this.loading = false;
            this.notification.isNotification(true, "Sports", createSportResponse.message, "check-square");
          }
          else {
            form.reset();
            this.loading = false;
            this.notification.isNotification(true, "Sports", createSportResponse.message, "check-square");
          }
        } else {
          this.loading = false
          this.error = true;
          this.message = createSportResponse.message;
        }
      } else {
        this.loading = false;
        this.error = true;
        this.message = createSportResponse.message;
      }
    } catch (error) {
      console.log(error);
      this.loading = false;
      this.error = true;
      this.message = error;
    }
  });
  }
  saveNew() {
    this.saves = false;
  }
  save() {
    this.saves = true;
  }
  goBack() {
    this.change.emit({ action: "sportgrid" });
  }
  closeToast() {
    this.error = false;
  }
}
