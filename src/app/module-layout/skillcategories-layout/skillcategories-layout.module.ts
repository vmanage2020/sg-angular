import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillcategoriesLayoutRoutingModule } from './skillcategories-layout-routing.module';
import { SkillcategoriesCreateComponent } from './skillcategories-create/skillcategories-create.component';
import { SkillcategoriesEditComponent } from './skillcategories-edit/skillcategories-edit.component';

import { SkillcategoriesGridComponent } from './skillcategories-grid/skillcategories-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';



@NgModule({
  declarations: [SkillcategoriesCreateComponent, SkillcategoriesEditComponent,SkillcategoriesGridComponent],
  imports: [
    CommonModule,
    SkillcategoriesLayoutRoutingModule,
    UIModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,NgbAlertModule,
    Ng2SearchPipeModule,NgbAlertModule

  ]
})
export class SkillcategoriesLayoutModule { }
