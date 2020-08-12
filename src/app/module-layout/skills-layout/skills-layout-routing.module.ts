import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SkillCreateComponent } from './skill-create/skill-create.component';
import { SkillEditComponent } from './skill-edit/skill-edit.component';
import { SkillGridComponent } from './skill-grid/skill-grid.component';

const routes: Routes = [
  {
    path: '',
    component: SkillGridComponent
  },
  {
    path: 'grid',
    component: SkillGridComponent
  },
  {
    path: 'create',
    component: SkillCreateComponent
  },
  {
    path: 'edit/:id/:skid/:sid',
    component:SkillEditComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillsLayoutRoutingModule { }
