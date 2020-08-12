import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignupLayoutRoutingModule } from './signup-layout-routing.module';
import { SignupComponent } from './signup/signup.component';

import { ConfirmComponent } from '../confirm/confirm.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgbDatepicker, NgbDatepickerModule, NgbModule, NgbAccordionModule, NgbAlertModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskModule } from 'ngx-mask';
import { ArchwizardModule } from 'angular-archwizard';
import { RegisterationFailedComponent } from './registeration-failed/registeration-failed.component';

@NgModule({
  declarations: [ConfirmComponent, RegisterationFailedComponent],
  imports: [
    CommonModule,
    SignupLayoutRoutingModule,UIModule,NgbDatepickerModule,
    NgbAccordionModule,
    NgbModule,
    ReactiveFormsModule,
    NgbAlertModule,
    FormsModule,UIModule,NgSelectModule, NgxMaskModule.forRoot(),ArchwizardModule,NgbModalModule
  ]
})
export class SignupLayoutModule { }
