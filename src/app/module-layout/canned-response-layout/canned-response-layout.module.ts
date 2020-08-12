import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CannedResponseLayoutRoutingModule } from './canned-response-layout-routing.module';
import { CannedResponseLayoutComponent } from './canned-response-layout/canned-response-layout.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxMaskModule } from 'ngx-mask';
import { CannedResponseGridComponent } from './canned-response-grid/canned-response-grid.component';
import { CannedResponseCreateComponent } from './canned-response-create/canned-response-create.component';
import { CannedResponseUpdateComponent } from './canned-response-update/canned-response-update.component';
import { CannedResponseViewComponent } from './canned-response-view/canned-response-view.component';
import { NgxEditorModule } from 'ngx-editor';
import { CannedResponseListComponent } from './canned-response-list/canned-response-list.component';
import { CannedResponseListCreateComponent } from './canned-response-list-create/canned-response-list-create.component';
import { CannedResponseListEditComponent } from './canned-response-list-edit/canned-response-list-edit.component';
import { CannedResponseListViewComponent } from './canned-response-list-view/canned-response-list-view.component';


import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [CannedResponseLayoutComponent, CannedResponseGridComponent, CannedResponseCreateComponent, CannedResponseUpdateComponent, CannedResponseViewComponent, CannedResponseListComponent, CannedResponseListCreateComponent, CannedResponseListEditComponent, CannedResponseListViewComponent],
  imports: [
    CommonModule,
    CannedResponseLayoutRoutingModule,
    UIModule,
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
    NgbAlertModule,NgxEditorModule,
    DataTablesModule
  ],
  entryComponents:[CannedResponseGridComponent, CannedResponseCreateComponent, CannedResponseUpdateComponent, CannedResponseViewComponent]
})
export class CannedResponseLayoutModule { }
