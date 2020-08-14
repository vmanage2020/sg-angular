import { Component, OnInit, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { CookieService } from 'src/app/core/services/cookie.service';
import { Constant } from 'src/app/core/services/config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  unAuthorizedActive: boolean = false;
  role: any;
  loggedUserInfo: any;
  sysAdmin: boolean = false;
  warningInfo: boolean = false;
  welcomeScreen:boolean=false;
  constructor(public router: Router, public cookieService: CookieService, private firebaseAuth: AngularFireAuth, private eref: ElementRef, private sharedService: SharedService, private authService: AuthenticationService) {
    sharedService.missionAnnounced$.subscribe(data => {
     
    })
  }

  ngOnInit() {
    this.sharedService.announceMission('welcome');
    this.loggedUserInfo = this.authService.isAuthenticatedUser();
    if (this.loggedUserInfo) {
      if (this.loggedUserInfo.role == 'sys-admin') {
        this.sysAdmin = false;

        // this.custAdmin = false;
      } else if (this.loggedUserInfo.role == 'admin') {
        this.sysAdmin = false;

        // this.custAdmin = true;
      } else {
        this.sysAdmin = true;
       
      }
    }

    if (this.cookieService.getCookie('isAlreadyLoggedIn') === "true") {
      this.warningInfo = true;
    } else {
      this.warningInfo = false;
    }
    this.sharedService.announceMission('updateOrganizationList');
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/account/login']);
  }

  ngAfterViewInit() { }
}
