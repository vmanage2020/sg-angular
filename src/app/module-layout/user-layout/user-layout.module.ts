import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserLayoutRoutingModule } from './user-layout-routing.module';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserViewComponent } from './user-view/user-view.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule, NgbPaginationModule, NgbDatepicker, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { UserGridComponent } from './user-grid/user-grid.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { UserListComponent } from './user-list/user-list.component';

import { DataTablesModule } from 'angular-datatables';
import { UserListCreateComponent } from './user-list-create/user-list-create.component';
import { UserListViewComponent } from './user-list-view/user-list-view.component';
import { UserListEditComponent } from './user-list-edit/user-list-edit.component';


@NgModule({
  declarations: [UserCreateComponent, UserEditComponent, UserViewComponent,UserGridComponent, UserLayoutComponent, UserListComponent, UserListCreateComponent, UserListViewComponent, UserListEditComponent],
  imports: [
    CommonModule,
    UserLayoutRoutingModule, 
    ReactiveFormsModule,
     UIModule,
     SharedModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,
    FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,NgbAlertModule,
    NgxMaskModule.forRoot(),
    DataTablesModule,
  ],entryComponents:[
    UserCreateComponent, UserEditComponent, UserViewComponent,UserGridComponent
  ]
})
export class UserLayoutModule { }
