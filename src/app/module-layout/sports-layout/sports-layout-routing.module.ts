import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SportsCreateComponent } from './sports-create/sports-create.component';
import { SportsEditComponent } from './sports-edit/sports-edit.component';

import { SportsGridComponent } from './sports-grid/sports-grid.component';
import { SportLayoutComponent } from './sport-layout/sport-layout.component';

import { SportsListComponent } from './sports-list/sports-list.component';
import { SportsListCreateComponent } from './sports-list-create/sports-list-create.component';
import { SportsListViewComponent } from './sports-list-view/sports-list-view.component';
import { SportsListEditComponent } from './sports-list-edit/sports-list-edit.component';

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
    path: 'list',
    component: SportsListComponent
  },
  {
    path: 'createlist',
    component: SportsListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: SportsListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: SportsListEditComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SportsLayoutRoutingModule { }
