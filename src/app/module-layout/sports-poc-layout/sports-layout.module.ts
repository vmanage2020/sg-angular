import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SportsLayoutRoutingModule } from './sports-layout-routing.module';
import { SportsCreateComponent } from './sports-create/sports-create.component';
import { SportsEditComponent } from './sports-edit/sports-edit.component';
import { SportsViewComponent } from './sports-view/sports-view.component'
import { SportsGridComponent } from './sports-grid/sports-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbToastModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/shared/shared.module';
import { SportLayoutComponent } from './sport-layout/sport-layout.component';

@NgModule({
  declarations: [SportsCreateComponent, SportsEditComponent,SportsGridComponent, SportLayoutComponent,SportsViewComponent],
  imports: [
    CommonModule,
    SportsLayoutRoutingModule,UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,Ng2SearchPipeModule,
    NgbToastModule,NgbAlertModule
  ]
})
export class SportsLayoutPOCModule { }
