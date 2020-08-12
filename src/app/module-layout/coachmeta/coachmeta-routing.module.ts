import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoachmetaComponent } from './coachmeta/coachmeta.component';

import { CoachmetaCreateComponent } from './coachmeta-create/coachmeta-create.component';
import { CoachmetaViewComponent } from './coachmeta-view/coachmeta-view.component';
import { CoachmetaEditComponent } from './coachmeta-edit/coachmeta-edit.component';
import { CoachmetaGridComponent } from './coachmeta-grid/coachmeta-grid.component';


const routes: Routes = [
  {
    path: '',
    component: CoachmetaComponent
  },
  {
    path: 'create',
    component: CoachmetaCreateComponent
  },
  {
    path: 'view/:resourceId',
    component: CoachmetaViewComponent
  },
  {
    path: 'edit/:resourceId',
    component: CoachmetaEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoachmetaRoutingModule { }
