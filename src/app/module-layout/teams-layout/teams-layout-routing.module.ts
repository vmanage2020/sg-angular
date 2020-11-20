import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamGridComponent } from './team-grid/team-grid.component';
import { TeamCreateComponent } from './team-create/team-create.component';
import { TeamEditComponent } from './team-edit/team-edit.component';
import { TeamViewComponent } from './team-view/team-view.component';
import { TeamLayoutComponent } from './team-layout/team-layout.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamListCreateComponent } from './team-list-create/team-list-create.component';
import { TeamListViewComponent } from './team-list-view/team-list-view.component';
import { TeamListEditComponent } from './team-list-edit/team-list-edit.component';


const routes: Routes = [
  {
    path: '',
    component: TeamLayoutComponent
  },
  {
    path: 'grid',
    component: TeamGridComponent
  },
  {
    path: 'create',
    component: TeamCreateComponent
  },
  {
    path: 'edit',
    component:TeamEditComponent
  },
  {
    path: 'view',
    component: TeamViewComponent
  },
  {
    path: 'list',
    component: TeamListComponent
  },
  {
    path: 'listview/:resourceId',
    component: TeamListViewComponent
  },
  {
    path: 'listedit/:resourceId',
    component: TeamListEditComponent
  },
  {
    path: 'listcreate',
    component: TeamListCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamsLayoutRoutingModule { }
