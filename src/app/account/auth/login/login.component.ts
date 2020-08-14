import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from '../../../core//services/cookie.service';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { DataService } from 'src/app/core/services/data.service';
import { apiURL, Constant } from '../../../core/services/config';
import { SharedService } from 'src/app/shared/shared.service';
import { UserService } from 'src/app/module-layout/user-layout/user-service';
import { DropdownService } from 'src/app/core/services/dropdown.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  error = '';
  loading = false;
  userData: any;
  orgCount: number = 1;
  sysCount: number = 1;
  role: any[] = [];
  filteredRole: any = [];
  orgInfo: any;
  errMessage: any = '';
  // noUserRecord=false
  constructor(private dropDownService: DropdownService,private userService: UserService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService,
    private authenticationService: AuthenticationService, private cookieService: CookieService, public sharedService: SharedService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // reset login status
    this.authenticationService.logout();

    this.returnUrl = '/';
  }

  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * On submit form
   */
  async onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.authenticationService.login(this.f.email.value, this.f.password.value).then(async (data) => {
      if (data) {
        this.cookieService.setCookie('currentUser', JSON.stringify(data), 1);
        this.cookieService.setCookie('token', JSON.stringify(data.user['ma']), 1);
        localStorage.setItem('token', data.user['ma']);
        this.cookieService.setCookie('uid', data.user.uid, 1);
        let response:any =  await this.userService.getUserById({ 'uid': data.user.uid });
        try {
          if (response.status) {
            this.sharedService.announceMission('logged in');
            this.router.navigate([this.returnUrl]); // If user data available redirect
            this.cookieService.setCookie('roleList', JSON.stringify(response.data.roles_by_seasons), 1);
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            localStorage.setItem('roleList', JSON.stringify(response.data.roles_by_seasons));
            this.cookieService.setCookie('userName', response.data.first_name, 1);
            this.cookieService.setCookie('user', JSON.stringify(response.data), 1);

            response.data.roles_by_seasons.forEach(element => {
              if (element.role) {
                if (element.role.toLowerCase() === Constant.admin && this.orgCount === 1) {
                  this.orgCount += 1
                  this.cookieService.setCookie('admin', element.role, 1);
                  this.setValue(element)
                }
                if (element.role.toLowerCase() === Constant.admin) {
                  this.filteredRole.push(element);
                  localStorage.setItem('filteredRole', JSON.stringify(this.filteredRole))
                }
                if (element.role.toLowerCase() === Constant.sysAdmin) {
                  this.cookieService.setCookie('sysAdmin', element.role, 1);
                  // this.getOrganizationList();
                  if (element.organization_id === Constant.organization_id) {
                    this.setValue(element);
                  }
                }
              }
            });

          }
          else {
            this.errMessage = "User does not exist.";
            this.loading = false;
          }
        } catch (error) {
          this.errMessage = error.message;
          this.loading = false;
        }
      }
    },
      error => {
        this.error = error;
        this.loading = false;
      });

  }
  getOrganizationList() {
    this.dataService.getData(apiURL.GET_ORGANIZATION_LIST, localStorage.getItem('token')).toPromise().then(res => {
      try {
        console.log(res.data)
        this.orgInfo = res.data;
        this.cookieService.setCookie('orgDropDown', JSON.stringify(this.orgInfo), 1);
      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })
  }
  async setValue(orgInfo:any) {
    localStorage.setItem('org_id', orgInfo.organization_id);
    localStorage.setItem('org_name', orgInfo.organization_name);
    localStorage.setItem('org_abbrev', orgInfo.organization_abbrev);
    let organizationDetails:any=await this.dropDownService.getOrganizationDetailsById(orgInfo.organization_id);
    if(organizationDetails.status){
      this.cookieService.setCookie('organizationDetails', JSON.stringify(organizationDetails.data), 1)
    }
  }
}

