import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SportsCreateComponent } from './sports-create/sports-create.component';
import { SportsEditComponent } from './sports-edit/sports-edit.component';

import { SportsGridComponent } from './sports-grid/sports-grid.component';
import { SportLayoutComponent } from './sport-layout/sport-layout.component';

import { SportsViewComponent } from './sports-view/sports-view.component';

const routes: Routes = [
  {
    path: '',
    component: SportLayoutComponent
  },
  {
    path: 'grid',
    component: SportsGridComponent
  },
  {
    path: 'create',
    component: SportsCreateComponent
  },
  {
    path: 'edit/:sid',
    component:SportsEditComponent
  },
  {
    path: 'view',
    component: SportsViewComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SportsLayoutRoutingModule { }
