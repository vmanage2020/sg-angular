import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGridComponent } from './user-grid/user-grid.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserViewComponent } from './user-view/user-view.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';

import { UserListComponent } from './user-list/user-list.component';
import { UserListCreateComponent } from './user-list-create/user-list-create.component';
import { UserListViewComponent } from './user-list-view/user-list-view.component';
import { UserListEditComponent } from './user-list-edit/user-list-edit.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent
  },
  {
    path: 'grid',
    component: UserGridComponent
  },
  {
    path: 'create',
    component: UserCreateComponent
  },
  {
    path: 'edit/:id',
    component:UserEditComponent
  },
  {
    path: 'view/:id',
    component: UserViewComponent
  },
  {
    path: 'list',
    component: UserListComponent
  },
  {
    path: 'createlist',
    component: UserListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: UserListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: UserListEditComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserLayoutRoutingModule { }
