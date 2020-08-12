import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationsCreateComponent } from './organizations-create/organizations-create.component';
import { OrganizationsEditComponent } from './organizations-edit/organizations-edit.component';
import { OrganizationsViewComponent } from './organizations-view/organizations-view.component';
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

import { DataTablesModule } from 'angular-datatables';
import { OrganizationsInfoComponent } from './organizations-info/organizations-info.component';

@NgModule({
  declarations: [OrganizationsCreateComponent, OrganizationsEditComponent, OrganizationsComponent,OrganizationsViewComponent, OrganizationsInfoComponent],
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,NgiDatatableModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,NgbAlertModule,
    NgxMaskModule.forRoot(),
    NgbModalModule,
    DataTablesModule
 ],
 entryComponents:[OrganizationsComponent, OrganizationsCreateComponent, OrganizationsEditComponent,OrganizationsViewComponent]
})
export class OrganizationsModule { }
