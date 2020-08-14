import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';

const routes: Routes = [
  {
    path: '',
    component: ConfirmPasswordComponent
  },
  {
    path: 'reset-password',
    component: PasswordresetComponent
  },
  {
    path: 'otp',
    component: OtpVerificationComponent
  },
  {
    path: 'confirm',
    component: ConfirmPasswordComponent
  }
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForgotPasswordLayoutRoutingModule { }
