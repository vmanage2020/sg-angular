import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PositionLayoutRoutingModule } from './position-layout-routing.module';
import { PositionCreateComponent } from './position-create/position-create.component';
import { PositionEditComponent } from './position-edit/position-edit.component';

import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { PositionGridComponent } from './position-grid/position-grid.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PositionLayoutComponent } from './position-layout/position-layout.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PositionListComponent } from './position-list/position-list.component';
import { PositionListCreateComponent } from './position-list-create/position-list-create.component';
import { PositionListViewComponent } from './position-list-view/position-list-view.component';
import { PositionListEditComponent } from './position-list-edit/position-list-edit.component';


import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [PositionCreateComponent, PositionEditComponent,PositionGridComponent, PositionLayoutComponent, PositionListComponent, PositionListCreateComponent, PositionListViewComponent, PositionListEditComponent],
  imports: [
    CommonModule,
    PositionLayoutRoutingModule,UIModule,
    HttpClientModule,
    FormsModule,SharedModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,NgbAlertModule,Ng2SearchPipeModule,
    DataTablesModule,
  ]
})
export class PositionLayoutModule { }
