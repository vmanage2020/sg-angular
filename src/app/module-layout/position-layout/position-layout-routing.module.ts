import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PositionGridComponent } from './position-grid/position-grid.component';
import { PositionCreateComponent } from './position-create/position-create.component';
import { PositionEditComponent } from './position-edit/position-edit.component';
import { PositionLayoutComponent } from './position-layout/position-layout.component';

import { PositionListComponent } from './position-list/position-list.component';
import { PositionListCreateComponent } from './position-list-create/position-list-create.component';
import { PositionListViewComponent } from './position-list-view/position-list-view.component';
import { PositionListEditComponent } from './position-list-edit/position-list-edit.component';


const routes: Routes = [
  {
    path: '',
    component: PositionLayoutComponent
  },
  {
    path: 'grid',
    component: PositionGridComponent
  },
  {
    path: 'create',
    component: PositionCreateComponent
  },
  {
    path: 'edit/:sid/:pid',
    component:PositionEditComponent
  },
  {
    path: 'list',
    component: PositionListComponent
  },
  {
    path: 'createlist',
    component: PositionListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: PositionListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: PositionListEditComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionLayoutRoutingModule { }
