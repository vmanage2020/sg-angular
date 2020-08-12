import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PositionSkillCreateComponent } from './position-skill-create/position-skill-create.component';
import { PositionSkillGridComponent } from './position-skill-grid/position-skill-grid.component';
import { PositionSkillEditComponent } from './position-skill-edit/position-skill-edit.component';

const routes: Routes = [
  {
    path: '',
    component: PositionSkillGridComponent
  },
  {
    path: 'grid',
    component: PositionSkillGridComponent
  },
  {
    path: 'create',
    component: PositionSkillCreateComponent
  },
  {
    path: 'edit/:sid/:psid',
    component:PositionSkillEditComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionSkillLayoutRoutingModule { }
