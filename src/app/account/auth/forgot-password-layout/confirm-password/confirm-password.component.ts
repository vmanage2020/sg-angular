import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { MustMatch } from 'src/app/validator';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgiNotificationService } from 'ngi-notification';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.scss']
})
export class ConfirmPasswordComponent implements OnInit {

  resetForm: FormGroup;
  submitted = false;
  error = '';
  errors = false;
  success = true;
  loading = false;
  afterSuccess = false;
  isTextFieldType: boolean;
  isTextFieldType2: boolean;
  mode: any;
  custerror = false
  code: any;
  constructor(private firebaseAuth: AngularFireAuth,private notification: NgiNotificationService, private formBuilder: FormBuilder, private authenticationService: AuthenticationService, private router: Router, private route: ActivatedRoute, ) {
    this.mode = this.route.snapshot.queryParams['mode'];
    this.code = this.route.snapshot.queryParams['oobCode'];
  }

  ngOnInit() {

    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern("((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\()_\.{}\+=`|:;<>\"'\/,?\\-\\[\\]\\\\\*]).{6,50})")]],
      confirm_password: ['', [Validators.required]]
    }, {
        validator: MustMatch('password', 'confirm_password')
      });
    if (this.code) {
      this.verifyCode(this.code)
      this.custerror = false
      this.success = true;
    }
    else {
      this.custerror = true
      this.success = false;
    }

  }

  verifyCode(code) {
    this.loading = true
    this.authenticationService.verifyCode(code).then(data => {
      if (data) {
      this.loading = false
      }
    },
      error => {
        if(error.code === "auth/invalid-action-code"){
          // this.error = "The action code is invalid.";
          this.router.navigate(['/account/auth/reset-password']);
          this.notification.isNotification(true, "Reset Password", "The action code is invalid.", "info-circle");
        }else{
          this.error = error;
          this.success = false;
          this.afterSuccess = false
          this.loading = false;
        }
     });

  }
  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
  }

  togglePasswordFieldType() {
    this.isTextFieldType = !this.isTextFieldType;
  }
  toggleConfirmPasswordFieldType() {
    this.isTextFieldType2 = !this.isTextFieldType2;
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {

    this.submitted = true;
    if (this.resetForm.invalid) {
      this.resetForm.value
      return;
    }
    this.loading = true;
    this.authenticationService.confirmPassword(this.code, this.f.password.value).then(() => {
      this.success = false;
      this.afterSuccess = true;
      this.loading = false
    })

      .catch(err => {
        this.success = true;
        this.afterSuccess = false;
        this.loading = false
        this.error = err
      });
  }

}
