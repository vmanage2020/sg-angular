import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  ActivatedRoute,
  CanActivateChild
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';
import { CookieService } from '../services/cookie.service';
import { Constant } from '../services/config';
import { NgiNotificationService } from 'ngi-notification';
import { SharedService } from 'src/app/shared/shared.service';


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  returnUrl: any;
  constructor(private notification: NgiNotificationService, private sharedService: SharedService, private route: ActivatedRoute, private auth: AuthenticationService, private router: Router, private cookieService: CookieService) { }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.auth.isAuthenticated(next.data)) {
      return true;
    }
    this.router.navigate([this.returnUrl]);
    return false
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let loggedInUser = localStorage.getItem('org_id');
    if (loggedInUser !== Constant.organization_id) {
      return true;
    } else {
      this.sharedService.announceMission('welcome');
      this.router.navigate(['/welcome']);
      this.notification.isNotification(true, "Unauthorized", "You do not have access to view", "info-circle");
      return false;
    }
  }
}
