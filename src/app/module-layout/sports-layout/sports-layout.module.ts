import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SportsLayoutRoutingModule } from './sports-layout-routing.module';
import { SportsCreateComponent } from './sports-create/sports-create.component';
import { SportsEditComponent } from './sports-edit/sports-edit.component';

import { SportsGridComponent } from './sports-grid/sports-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbToastModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/shared/shared.module';
import { SportLayoutComponent } from './sport-layout/sport-layout.component';
import { SportsListComponent } from './sports-list/sports-list.component';
import { SportsListCreateComponent } from './sports-list-create/sports-list-create.component';
import { SportsListViewComponent } from './sports-list-view/sports-list-view.component';
import { SportsListEditComponent } from './sports-list-edit/sports-list-edit.component';

import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [SportsCreateComponent, SportsEditComponent,SportsGridComponent, SportLayoutComponent, SportsListComponent, SportsListCreateComponent, SportsListViewComponent, SportsListEditComponent],
  imports: [
    CommonModule,
    SportsLayoutRoutingModule,UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,Ng2SearchPipeModule,
    NgbToastModule,NgbAlertModule,
    DataTablesModule
  ]
})
export class SportsLayoutModule { }
