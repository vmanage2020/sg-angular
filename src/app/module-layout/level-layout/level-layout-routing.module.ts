import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LevelLayoutComponent } from './level-layout/level-layout.component';
import { LevelGridComponent } from './level-grid/level-grid.component';
import { LevelCreateComponent } from './level-create/level-create.component';


import { LevelListComponent } from './level-list/level-list.component';
import { LevelListCreateComponent } from './level-list-create/level-list-create.component';
import { LevelListViewComponent } from './level-list-view/level-list-view.component';
import { LevelListEditComponent } from './level-list-edit/level-list-edit.component';

const routes: Routes = [
  {
    path: '',
    component: LevelLayoutComponent
  },
  {
    path: 'grid',
    component: LevelGridComponent
  },
  {
    path: 'create',
    component: LevelCreateComponent
  },
  {
    path: 'list',
    component: LevelListComponent
  },
  {
    path: 'createlist',
    component: LevelListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: LevelListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: LevelListEditComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LevelLayoutRoutingModule { }
