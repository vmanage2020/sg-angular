import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardLayoutRoutingModule } from './dashboard-layout-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  declarations: [DashboardComponent, WelcomeComponent],
  imports: [
    CommonModule,
    DashboardLayoutRoutingModule,UIModule,NgbAlertModule
  ]
})
export class DashboardLayoutModule { }
