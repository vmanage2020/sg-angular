import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SkillcategoriesCreateComponent } from './skillcategories-create/skillcategories-create.component';
import { SkillcategoriesEditComponent } from './skillcategories-edit/skillcategories-edit.component';

import { SkillcategoriesGridComponent } from './skillcategories-grid/skillcategories-grid.component';

const routes: Routes = [
  {
    path: '',
    component: SkillcategoriesGridComponent
  },
  {
    path: 'grid',
    component: SkillcategoriesGridComponent
  },
  {
    path: 'create',
    component: SkillcategoriesCreateComponent
  },
  {
    path: 'edit/:sid/:skid',
    component:SkillcategoriesEditComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillcategoriesLayoutRoutingModule { }
