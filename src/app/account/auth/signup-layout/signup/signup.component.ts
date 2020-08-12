import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';

import * as moment from 'moment';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MustMatch } from 'src/app/validator';
import { DatePipe } from '@angular/common';
declare var $: any;
import { apiURL, Constant } from '../../../../core/services/config'
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from 'src/app/module-layout/logoinfo.interface';
declare var jQuery: any;
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {

  @Input('userInfo') userInfo: any = {};  
  dialCode: any = '';
  childInfo: any = {};
  signupInfo: any = {};
  showuserInfo = true;
  showChildInfo = false;
  showTermsCondition = false;
  urlstr: any;
  mail: any;
  confirmPwd: boolean = false;
  signupForm: FormGroup;
  childObj: any = [];
  stateSelect: any;
  countryCodeSelect: any;
  submitted = false;
  error = '';  
  formattedDate: any;
  isTextFieldType: boolean;
  isTextFieldType2: boolean;
  ageIsValid = false;
  country: boolean = false;
  countryNull: boolean = false;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  suffixList: any = [
    { name: 'Select suffix' },
    { name: 'Sr' },
    { name: 'Jr' },
    { name: 'II' },
    { name: 'III' },
    { name: 'IV' },
    { name: 'V' }
  ];
  constructor(public authService: AuthenticationService, public datePipe: DatePipe, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) { }

  ngOnInit() {
    this.getCountryCodeList();
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.regexp)]],
      first_name: ['', [Validators.required]],
      middle_initial: [''],
      last_name: ['', [Validators.required]],
      suffix: [null],
      mobile_phone: [null, [Validators.pattern("^[0-9]+$"), Validators.maxLength(10), Validators.minLength(10)]],
      street2: [''],
      street1: [''],
      country_code: [null],
      city: [''],
      state: [null],
      postal_code: [''],
      gender: [null],
      date_of_birth: [null, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\()_\.{}\+=`|:;<>\"'\/,?\\-\\[\\]\\\\\*]).{6,50})")]],
      confirm_password: ['', [Validators.required]]
    }, {
      validator: MustMatch('password', 'confirm_password')
    });

    if (this.userInfo.date_of_birth) {
      this.userInfo.date_of_birth = moment(this.userInfo.date_of_birth).format('MM-DD-YYYY').toString();
    }

    this.signupForm.patchValue({
      email: this.userInfo.email_address,
      first_name: this.userInfo.first_name,
      middle_initial: this.userInfo.middle_initial,
      last_name: this.userInfo.last_name,
      suffix: this.userInfo.suffix,
      mobile_phone: this.userInfo.mobile_number,
      street2: this.userInfo.street2,
      street1: this.userInfo.street1,     
      city: this.userInfo.city,
      state: this.userInfo.state,
      postal_code: this.userInfo.postal_code,
      gender: this.userInfo.gender,
      date_of_birth: this.userInfo.date_of_birth
    })
    if (this.userInfo) {
      if (!this.userInfo.suffix) {
        this.signupForm.patchValue({
          suffix: null
        })
      }
      if (!this.userInfo.country_code) {
        this.signupForm.patchValue({
          country_code: 'US'
        })
        this.dialCode = "+1"
      } else {
        this.dialCode = "+1"
      }
      if (this.userInfo.date_of_birth) {
        $('#datetime-datepicker').flatpickr({
          defaultDate: this.userInfo.date_of_birth
        });
      }

    }

    this.childInfo = this.userInfo;
  }
  get f() { return this.signupForm.controls; }
  onSuffixChange(event: any) {
    if (event.name === "Select suffix") {
      this.signupForm.patchValue({
        suffix: null
      })
    }
  }
  // Nishanthi changes
  

  getCountryCodeList() {
    this.country = true;
    this.authService.getData(apiURL.GET_COUNTRY_LIST).toPromise().then(res => {
      try {
        if (res.status) {
          if (res.data && res.data.length !== 0) {
            res.data.splice(0, 0, { name: 'Select country', country_code: null });
            this.countryCodeSelect = res.data;
            this.country = false;
            if (this.userInfo) {
              if (this.userInfo.country_code) {
                this.countryCodeSelect.forEach(element => {
                  if (this.userInfo.country_code === element.country_code) {
                    this.signupForm.patchValue({
                      country_code: element.country_code
                    })
                    this.dialCode = element.dial_code;
                  } else if (this.userInfo.country_code === element.name) {
                    this.signupForm.patchValue({
                      country_code: element.country_code
                    })
                    this.dialCode = element.dial_code;
                  }
                });
              }
            }
          } else {
            this.countryCodeSelect = [];
            this.country = false;
          }
        } else {
          this.countryCodeSelect = [];
          this.country = false;
        }

      } catch (error) {
        console.log(error)
      }
    }).catch(error => {
      console.log(error);
    })
  //   this.country = true;
  //   this.authService.getData(apiURL.GET_COUNTRY_LIST).toPromise().then(res => {
  //     try {
  //       if (res.status) {
  //         if (res.data && res.data.length !== 0) {
  //           res.data.splice(0, 0, { name: 'Select country', country_code: null });
  //           this.countryCodeSelect = res.data;
  //           this.country = false;
  //           if (this.userInfo) {
  //             if (this.userInfo.address.country_code) {
  //               this.countryCodeSelect.forEach(element => {
  //                 if (this.userInfo.address.country_code === element.country_code) {
  //                   this.signupForm.patchValue({
  //                     country_code: element.country_code
  //                   })
  //                   this.dialCode = element.dial_code;
  //                 } else if (this.userInfo.address.country_code === element.name) {
  //                   this.signupForm.patchValue({
  //                     country_code: element.country_code
  //                   })
  //                   this.dialCode = element.dial_code;
  //                 }
  //               });
  //             }
  //           }
  //         } else {
  //           this.countryCodeSelect = [];
  //           this.country = false;
  //         }
  //       } else {
  //         this.countryCodeSelect = [];
  //         this.country = false;
  //       }

  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }).catch(error => {
  //     console.log(error);
  //   })
  }
  // 
  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
    $('#datetime-datepicker').flatpickr({
      enableTime: false,
      dateFormat: "m-d-Y",
      maxDate: "today",
    });
  }
  onNationalChange(event) {
    if (event.name !=="Select country") {
      this.countryNull = false
      this.dialCode = event.dial_code;
    } else {
      this.dialCode = '';
      this.signupForm.patchValue({
        mobile_phone: '',
        country_code:null
      })
    }
  }
  ageValidation(event) {

  }
  togglePasswordFieldType() {
    this.isTextFieldType = !this.isTextFieldType;
  }
  toggleConfirmPasswordFieldType() {
    this.isTextFieldType2 = !this.isTextFieldType2;
  }
  mobileNumberInput(event, form) {
    if (event.target.value) {
      if (form.value.country_code) {
        this.countryNull = false
      }
      else {
        this.countryNull = true
        this.signupForm.patchValue({
          mobile_phone: ''
        })
      }
    }
  }

  onSubmit(form: NgForm) {
    // console.log(form)
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    let ngbDate = new Date(this.signupForm.controls['date_of_birth'].value);
    this.signupInfo = form.value;
    this.signupInfo['uid'] = this.userInfo.user_id;
    this.signupInfo['children'] = this.childObj;
    this.signupInfo['date_of_birth'] = ngbDate;
    // this.childInfo.date_of_birth=this.signupInfo.date_of_birth;

    // console.log(this.signupInfo)
    // console.log(form.value)
    if (this.userInfo.children.length != 0) {
      this.showChildInfo = true;
      this.showuserInfo = false;
    } else {
      this.showTermsCondition = true;
      this.showuserInfo = false;
    }
  }
}


