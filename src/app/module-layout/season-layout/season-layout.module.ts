import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeasonLayoutRoutingModule } from './season-layout-routing.module';
import { SeasonCreateComponent } from './season-create/season-create.component';
import { SeasonEditComponent } from './season-edit/season-edit.component';
import { SeasonViewComponent } from './season-view/season-view.component';
import { SeasonGridComponent } from './season-grid/season-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { SeasonLayoutComponent } from './season-layout/season-layout.component';
import { SeasonListComponent } from './season-list/season-list.component';
import { SeasonListCreateComponent } from './season-list-create/season-list-create.component';
import { SeasonListViewComponent } from './season-list-view/season-list-view.component';
import { SeasonListEditComponent } from './season-list-edit/season-list-edit.component';

import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [SeasonCreateComponent, SeasonEditComponent, SeasonViewComponent, SeasonGridComponent, SeasonLayoutComponent, SeasonListComponent, SeasonListCreateComponent, SeasonListViewComponent, SeasonListEditComponent],
  imports: [
    CommonModule,
    SeasonLayoutRoutingModule,
    UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,NgbAlertModule,
    DataTablesModule
  ],
  entryComponents:[
    SeasonCreateComponent, SeasonEditComponent, SeasonViewComponent, SeasonGridComponent
  ]
})
export class SeasonLayoutModule { }
