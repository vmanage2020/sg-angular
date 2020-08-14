import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachmetadataRoutingModule } from './coachmetadata-routing.module';
import { CoahmetadataComponent } from './coahmetadata/coahmetadata.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { CoachmetadataGridComponent } from './coachmetadata-grid/coachmetadata-grid.component';
import { CoachcustomfieldCreateComponent } from './coachcustomfield-create/coachcustomfield-create.component';
import { CoachcustomfieldEditComponent } from './coachcustomfield-edit/coachcustomfield-edit.component';
import { CoachcustomfieldViewComponent } from './coachcustomfield-view/coachcustomfield-view.component';

@NgModule({
  declarations: [CoahmetadataComponent, CoachmetadataGridComponent, CoachcustomfieldCreateComponent, CoachcustomfieldEditComponent, CoachcustomfieldViewComponent],
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgSelectModule,
    CoachmetadataRoutingModule
  ],
  entryComponents:[CoahmetadataComponent, CoachmetadataGridComponent, CoachcustomfieldCreateComponent, CoachcustomfieldEditComponent, CoachcustomfieldViewComponent]
})
export class CoachmetadataModule { }
