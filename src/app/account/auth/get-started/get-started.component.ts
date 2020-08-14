import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from '../../../core/services/config';
import { NgiNotificationService } from 'ngi-notification';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from 'src/app/module-layout/logoinfo.interface';
@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent implements OnInit {

  uid: any;
  urlstr: any;
  mail: any
  error = false;
  message: any
  submitted = false;
  returnUrl: string;
  havingData = true
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  isLandingPage: any = true;
  getStartedForm = new FormGroup({
    email_address: new FormControl('')
  });
  showSignup = false;
  getStarted = true;

  userInfo: any = {};

  getUserDetailURL: any = 'https://us-central1-sports-gravy-app.cloudfunctions.net/getUserDetails';

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService, private notification: NgiNotificationService) {
    this.route.queryParams.subscribe(params => {
      this.uid = params['uid'];
    });
  }
  ngOnInit() {
    this.displayLoader = true;
    if (this.uid) {
      this.getUserInfo(this.uid);
    }
    else {
      this.error = true
      this.message = "Invalid Link"
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    // document.body.classList.add('authentication-bg');
    // document.body.classList.add('authentication-bg-pattern');
  }
  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
  }


  getUserInfo(uid) {
    let userObj: any = {
      'uid': uid
    }
    this.displayLoader = true;
    this.loading = true;
    let loader = setInterval(this.timerFunction, 100, this.loaderInfo);
    this.dataService.getUserDetail(apiURL.GET_USER_DETAILS_FROM_URL,uid ).toPromise().then((response) => {
      console.log(response);
      try {
        if (response['Status']) {
          this.userInfo = response['Data'];
          this.getStartedForm.patchValue({
            email_address: response['Data'].email_address
          })
          this.afterSavingData(loader);
          this.havingData = false;
        }
        else {
          if (response['Message'].includes('Signedup already')) {
            this.notification.isNotification(true, "User Registeration", response['Message'], "info-circle");
            this.router.navigate(['/account/login']);
          } else {
            this.error = true;
            this.message = response['Message']
            this.loading = false;
            this.havingData = true;
          }
          this.afterSavingData(loader);
          this.reInitialise();
        }
      } catch (error) {
        this.afterSavingData(loader);
        this.reInitialise();
        console.log(error)
      }
    }).catch(error => {
      console.log(error)
      this.notification.isNotification(true, "User Registeration", "Invalid Request", "info-circle");
      this.router.navigate(['/account/login']);
    })
  }

  // getUserInfo(uid) {
  //   let userObj: any = {
  //     'uid': uid
  //   }
  //   this.displayLoader = true;
  //   this.loading = true;
  //   let loader = setInterval(this.timerFunction, 100, this.loaderInfo);
  //   this.dataService.getUserDetail(apiURL.GET_USER_DETAILS_FROM_URL, { 'uid': uid }).toPromise().then((response) => {
  //     console.log(response);
  //     try {
  //       if (response['status']) {
  //         this.userInfo = response['data'];
  //         this.getStartedForm.patchValue({
  //           email_address: response['data'].email_address
  //         })
  //         this.afterSavingData(loader);
  //         this.havingData = false;
  //       }
  //       else {
  //         if (response['message'].includes('Signedup already')) {
  //           this.notification.isNotification(true, "User Registeration", response['message'], "info-circle");
  //           this.router.navigate(['/account/login']);
  //         } else {
  //           this.error = true;
  //           this.message = response['message']
  //           this.loading = false;
  //           this.havingData = true;
  //         }
  //         this.afterSavingData(loader);
  //         this.reInitialise();
  //       }
  //     } catch (error) {
  //       this.afterSavingData(loader);
  //       this.reInitialise();
  //       console.log(error)
  //     }
  //   }).catch(error => {
  //     console.log(error)
  //   })
  // }
  afterSavingData(loaderForCreate?: any) {   
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Done" });
    clearInterval(loaderForCreate);
    this.loading = false;
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
    this.displayLoader = false;
  }
  reInitialise() {
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  closeError() {
    this.error = false
  }

  navigateToSignup() {
    this.submitted = true;
    this.loading = true;
    if (this.userInfo.is_signup_completed === true) {
      this.router.navigate(['/account/login'])
    }
    else {
      this.showSignup = true;
      this.getStarted = false;
    }

  }
}

