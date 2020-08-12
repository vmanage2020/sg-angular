import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbAlertModule, NgbDatepickerModule, NgbModule, NgbCalendar, NgbAccordionModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { UIModule } from '../../shared/ui/ui.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup-layout/signup/signup.component';
import { AuthRoutingModule } from './auth-routing';
import { ConfirmComponent } from './confirm/confirm.component';
import { PasswordresetComponent } from './forgot-password-layout/passwordreset/passwordreset.component';
import { SignupChildComponent } from './signup-layout/signup-child/signup-child.component';
import { TermsConditionComponent } from './signup-layout/terms-condition/terms-condition.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { SignupLayoutModule } from './signup-layout/signup-layout.module';
import { ForgotPasswordLayoutModule } from './forgot-password-layout/forgot-password-layout.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { NgxMaskModule } from 'ngx-mask';
import { ArchwizardModule } from 'angular-archwizard';
import { ParentConsentFormComponent } from './signup-layout/parent-consent-form/parent-consent-form.component';

@NgModule({
  declarations: [SignupComponent,LoginComponent, GetStartedComponent,SignupChildComponent,TermsConditionComponent,ParentConsentFormComponent],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    NgbAccordionModule,
    NgbModule,
    ReactiveFormsModule,
    NgbAlertModule,
    SignupLayoutModule,NgxMaskModule.forRoot(),
    UIModule,
    AuthRoutingModule,FormsModule,ForgotPasswordLayoutModule,NgSelectModule,ArchwizardModule,NgbModalModule
  ]
})
export class AuthModule { }
