import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagLayoutRoutingModule } from './tag-layout-routing.module';
import { TagLayoutComponent } from './tag-layout/tag-layout.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxMaskModule } from 'ngx-mask';
import { CreateTagComponent } from './create-tag/create-tag.component';
import { EditTagComponent } from './edit-tag/edit-tag.component';
import { ViewTagComponent } from './view-tag/view-tag.component';
import { TagGridComponent } from './tag-grid/tag-grid.component';
import { NgiDatatableModule } from '../../../../projects/ngi-datatable/src/public-api';
import { TagListComponent } from './tag-list/tag-list.component';
import { TagListCreateComponent } from './tag-list-create/tag-list-create.component';
import { TagListEditComponent } from './tag-list-edit/tag-list-edit.component';
import { TagListViewComponent } from './tag-list-view/tag-list-view.component';


import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [TagLayoutComponent, CreateTagComponent, EditTagComponent, ViewTagComponent, TagGridComponent, TagListComponent, TagListCreateComponent, TagListEditComponent, TagListViewComponent],
  imports: [
    CommonModule,
    TagLayoutRoutingModule,
    UIModule,NgiDatatableModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgSelectModule,
    NgbDatepickerModule,
    FileUploadModule,
    NgbDropdownModule,
    Ng2SearchPipeModule,
    NgxMaskModule.forRoot(),
    NgbAlertModule,
    DataTablesModule
  ],
  entryComponents:[CreateTagComponent, EditTagComponent, ViewTagComponent, TagGridComponent]
})
export class TagLayoutModule { }
