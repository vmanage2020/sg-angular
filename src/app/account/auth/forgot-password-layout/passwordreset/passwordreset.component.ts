import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/auth.service';
import { Constant } from 'src/app/core/services/config';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})
export class PasswordresetComponent implements OnInit, AfterViewInit {

  resetForm: FormGroup;
  submitted = false;
  error = '';
  errors=false;
  success = false;
  loading = false;
  emailValidation=Constant.email_validation;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,private authenticationService: AuthenticationService, private router: Router) { }

  ngOnInit() {

    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(this.emailValidation)]],
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
    this.success = false;
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
        this.success = true
      }, 1000);
      },
      error => {
        if (error.code.includes("user-not-found")){
          this.error = 'Error: There is no user record corresponding to this email. Please try again.';
          this.errors=true;
          this.loading = false;
        }else{
          this.errors=true;
          this.error = error;
          this.loading = false;
        }
    
      });

   
  }




}
