import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent implements OnInit {

  resetForm: FormGroup;
  submitted = false;
  error = '';
  errors=false;
  success = '';
  loading = false;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,private authenticationService: AuthenticationService, private router: Router) { }

  ngOnInit() {

    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.success = '';
    this.submitted = true;
     this.errors=false;
   
    if (this.resetForm.invalid) {
      this.resetForm.value
      return;
    }

    this.loading = true;
    this.authenticationService.forgotpassword(this.f.email.value).then(data =>{
    
      // console.log(data);
      this.resetForm.value
      setTimeout(() => {
        this.loading = false;
        this.success = 'We have sent you an email containing a link to reset your password';
      }, 1000);
      },
      error => {
        this.errors=true;
        this.error = error;
        this.loading = false;
      });

}
}
