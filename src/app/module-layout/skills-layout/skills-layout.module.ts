import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillsLayoutRoutingModule } from './skills-layout-routing.module';
import { SkillCreateComponent } from './skill-create/skill-create.component';
import { SkillEditComponent } from './skill-edit/skill-edit.component';
import { SkillGridComponent } from './skill-grid/skill-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';




@NgModule({
  declarations: [SkillCreateComponent, SkillEditComponent,SkillGridComponent],
  imports: [
    CommonModule,
    SkillsLayoutRoutingModule,
    UIModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,NgbAlertModule,Ng2SearchPipeModule,
    NgbAlertModule
  ]
})
export class SkillsLayoutModule { }
