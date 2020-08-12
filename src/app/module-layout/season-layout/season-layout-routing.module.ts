import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SeasonGridComponent } from './season-grid/season-grid.component';
import { SeasonCreateComponent } from './season-create/season-create.component';
import { SeasonEditComponent } from './season-edit/season-edit.component';
import { SeasonViewComponent } from './season-view/season-view.component';
import { SeasonLayoutComponent } from './season-layout/season-layout.component';

import { SeasonListComponent } from './season-list/season-list.component';
import { SeasonListCreateComponent } from './season-list-create/season-list-create.component';
import { SeasonListViewComponent } from './season-list-view/season-list-view.component';
import { SeasonListEditComponent } from './season-list-edit/season-list-edit.component';


const routes: Routes = [
  {
    path: '',
    component: SeasonLayoutComponent
  },
  {
    path: 'grid',
    component: SeasonGridComponent
  },
  {
    path: 'create',
    component: SeasonCreateComponent
  },
  {
    path: 'edit/:sid/:id',
    component:SeasonEditComponent
  },
  {
    path: 'view/:sid/:id',
    component: SeasonViewComponent
  },
  {
    path: 'list',
    component: SeasonListComponent
  },
  {
    path: 'createlist',
    component: SeasonListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: SeasonListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: SeasonListEditComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeasonLayoutRoutingModule { }
