import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  isCondensed = false;
  setIntervalId: any;
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.setIntervalId = setInterval(() => this.getIdToken(), 60000);
  }

  getIdToken() {    
    this.authService.getCurrentUser().then(response => {
      if(response) {
        // console.log(response);
        // localStorage.setItem('token', null);
        // this.authService.logout();        
        localStorage.setItem('token', response);
      }else{

      }      
    }).catch(error => {
      // console.log(error);
      // localStorage.setItem('token', null);
      // this.authService.logout();
    })
  }

  ngOnDestroy() {
    if (this.setIntervalId) {
      clearInterval(this.setIntervalId);
    }
  }

  isMobile() {
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  }

  ngAfterViewInit() {
    document.body.classList.remove('authentication-bg');
    document.body.classList.remove('authentication-bg-pattern');

    if (!this.isMobile()) {
      document.body.classList.add('sidebar-enable');
    }
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    document.body.classList.toggle('sidebar-enable');
    if (!this.isMobile()) {
      document.body.classList.toggle('enlarged');
      this.isCondensed = !this.isCondensed;
    }
  }
}
