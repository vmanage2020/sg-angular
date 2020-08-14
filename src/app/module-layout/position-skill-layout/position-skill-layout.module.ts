import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PositionSkillLayoutRoutingModule } from './position-skill-layout-routing.module';
import { PositionSkillCreateComponent } from './position-skill-create/position-skill-create.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PositionSkillEditComponent } from './position-skill-edit/position-skill-edit.component';
import { PositionSkillGridComponent } from './position-skill-grid/position-skill-grid.component';

@NgModule({
  declarations: [PositionSkillCreateComponent, PositionSkillEditComponent, PositionSkillGridComponent],
  imports: [
    CommonModule,
    PositionSkillLayoutRoutingModule,UIModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,NgbAlertModule,Ng2SearchPipeModule
  ]
})
export class PositionSkillLayoutModule { }
