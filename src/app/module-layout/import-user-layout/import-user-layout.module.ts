import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ImportUserLayoutRoutingModule } from './import-user-layout-routing.module';
import { ImportUserCreateComponent } from './import-user-create/import-user-create.component';

import { ImportUserGridComponent } from './import-user-grid/import-user-grid.component';
import { ImportUserMainLayoutComponent } from './import-user-main-layout/import-user-main-layout.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxMaskModule } from 'ngx-mask';
import { SuccessUserImportRecordComponent } from './success-user-import-record/success-user-import-record.component';
import { ErrorUserImportRecordComponent } from './error-user-import-record/error-user-import-record.component';
import { UpdateUserImportRecordComponent } from './update-user-import-record/update-user-import-record.component';
import { ImportUserViewComponent } from './import-user-view/import-user-view.component';
import { ImportUserListComponent } from './import-user-list/import-user-list.component';
import { ImportUserListCreateComponent } from './import-user-list-create/import-user-list-create.component';
import { ImportUserListViewComponent } from './import-user-list-view/import-user-list-view.component';
import { ImportUserListEditComponent } from './import-user-list-edit/import-user-list-edit.component';
//import { KeysPipe } from '../import-user-layout/keys.pipe';

import { DataTablesModule } from 'angular-datatables';
import { ImportUserListUserComponent } from './import-user-list-user/import-user-list-user.component';

@NgModule({
  declarations: [ImportUserCreateComponent, ImportUserGridComponent, ImportUserMainLayoutComponent, SuccessUserImportRecordComponent, ErrorUserImportRecordComponent, UpdateUserImportRecordComponent, ImportUserViewComponent, ImportUserListComponent, ImportUserListCreateComponent, ImportUserListViewComponent, ImportUserListEditComponent, ImportUserListUserComponent],
  imports: [  
    CommonModule,
    ImportUserLayoutRoutingModule,
    UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    NgbProgressbarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,
    NgxMaskModule.forRoot(),NgbAlertModule,
    DataTablesModule
  ],
  providers: [DatePipe],
  entryComponents:[ImportUserViewComponent,ImportUserCreateComponent, UpdateUserImportRecordComponent,ImportUserGridComponent, ImportUserMainLayoutComponent, SuccessUserImportRecordComponent, ErrorUserImportRecordComponent]
})
export class ImportUserLayoutModule { }
