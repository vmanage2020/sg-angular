import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ManagermetadataRoutingModule } from './managermetadata-routing.module';
import { ManagermetadataComponent } from './managermetadata/managermetadata.component';
import { ManagercustomfieldCreateComponent } from './managercustomfield-create/managercustomfield-create.component';
import { ManagercustomfieldViewComponent } from './managercustomfield-view/managercustomfield-view.component';
import { ManagercustomfieldEditComponent } from './managercustomfield-edit/managercustomfield-edit.component';
import { ManagercustomfieldGridComponent } from './managercustomfield-grid/managercustomfield-grid.component';

@NgModule({
  declarations: [ManagermetadataComponent, ManagercustomfieldCreateComponent, ManagercustomfieldViewComponent, ManagercustomfieldEditComponent, ManagercustomfieldGridComponent],
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgSelectModule,
    ManagermetadataRoutingModule
  ],
  entryComponents:[ManagermetadataComponent, ManagercustomfieldCreateComponent, ManagercustomfieldViewComponent, ManagercustomfieldEditComponent, ManagercustomfieldGridComponent]
})
export class ManagermetadataModule { }
