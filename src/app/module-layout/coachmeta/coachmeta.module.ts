import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { CoachmetaRoutingModule } from './coachmeta-routing.module';
import { CoachmetaComponent } from './coachmeta/coachmeta.component';

import { CoachmetaCreateComponent } from './coachmeta-create/coachmeta-create.component';
import { CoachmetaViewComponent } from './coachmeta-view/coachmeta-view.component';
import { CoachmetaEditComponent } from './coachmeta-edit/coachmeta-edit.component';
import { CoachmetaGridComponent } from './coachmeta-grid/coachmeta-grid.component';


import { DataTablesModule } from 'angular-datatables';


@NgModule({
  declarations: [CoachmetaComponent, CoachmetaCreateComponent, CoachmetaViewComponent, CoachmetaEditComponent, CoachmetaGridComponent],
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgSelectModule,
    CoachmetaRoutingModule,
    DataTablesModule
  ],
  entryComponents: [CoachmetaComponent, CoachmetaCreateComponent, CoachmetaViewComponent, CoachmetaEditComponent, CoachmetaGridComponent]
})
export class CoachmetaModule { }
