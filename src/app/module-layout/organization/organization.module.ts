import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationComponent } from './organization/organization.component';
import { OrganizationCreateComponent } from './organization-create/organization-create.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { OrganizationViewComponent } from './organization-view/organization-view.component';
//import { OrganizationGridComponent } from './organization-grid/organization-grid.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';

import { NgiDatatableModule } from '../../../../projects/ngi-datatable/src/public-api';



@NgModule({
  declarations: [OrganizationCreateComponent, OrganizationEditComponent, OrganizationComponent,OrganizationViewComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,NgiDatatableModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,NgbAlertModule,
    NgxMaskModule.forRoot(),
    NgbModalModule
 ],
 entryComponents:[OrganizationComponent, OrganizationCreateComponent, OrganizationEditComponent,OrganizationViewComponent]
})
export class OrganizationLayoutModule { }
