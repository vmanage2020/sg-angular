import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotPasswordLayoutRoutingModule } from './forgot-password-layout-routing.module';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password.component';

@NgModule({
  declarations: [PasswordresetComponent, OtpVerificationComponent, ConfirmPasswordComponent],
  imports: [
    CommonModule,
    ForgotPasswordLayoutRoutingModule,UIModule,
    NgbAlertModule,FormsModule,ReactiveFormsModule
  ]
})
export class ForgotPasswordLayoutModule { }
