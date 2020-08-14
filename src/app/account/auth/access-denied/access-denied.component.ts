import { Component, OnInit } from '@angular/core';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DataService } from 'src/app/core/services/data.service';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent implements OnInit {

  constructor(public sharedService: SharedService, public cookieService: CookieService, private router: Router, private authService: AuthenticationService, public dataService: DataService ) { }

  ngOnInit() {

    // this.cookieService.deleteCookie('token');
  }
  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
  }
  logout(){
  
      this.authService.logout();
      this.router.navigate(['/account/login']);
    
  }
}
