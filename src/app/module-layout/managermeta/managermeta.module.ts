import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ManagermetaRoutingModule } from './managermeta-routing.module';
import { ManagermetaComponent } from './managermeta/managermeta.component';

import { ManagermetaCreateComponent } from './managermeta-create/managermeta-create.component';
import { ManagermetaViewComponent } from './managermeta-view/managermeta-view.component';
import { ManagermetaEditComponent } from './managermeta-edit/managermeta-edit.component';
import { ManagermetaGridComponent } from './managermeta-grid/managermeta-grid.component';


import { DataTablesModule } from 'angular-datatables';


@NgModule({
  declarations: [ManagermetaComponent, ManagermetaCreateComponent, ManagermetaViewComponent, ManagermetaEditComponent, ManagermetaGridComponent],
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgSelectModule,
    ManagermetaRoutingModule,
    DataTablesModule
  ],
  entryComponents: [ManagermetaComponent, ManagermetaCreateComponent, ManagermetaViewComponent, ManagermetaEditComponent, ManagermetaGridComponent]
})
export class ManagermetaModule { }
