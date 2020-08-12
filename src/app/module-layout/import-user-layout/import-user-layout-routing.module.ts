import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImportUserGridComponent } from './import-user-grid/import-user-grid.component';
import { ImportUserCreateComponent } from './import-user-create/import-user-create.component';

import { ImportUserMainLayoutComponent } from './import-user-main-layout/import-user-main-layout.component';

import { ImportUserListComponent } from './import-user-list/import-user-list.component';
import { ImportUserListCreateComponent } from './import-user-list-create/import-user-list-create.component';
import { ImportUserListViewComponent } from './import-user-list-view/import-user-list-view.component';
import { ImportUserListEditComponent } from './import-user-list-edit/import-user-list-edit.component';
import { ImportUserListUserComponent } from './import-user-list-user/import-user-list-user.component';

const routes: Routes = [
  {
    path: '',
    component: ImportUserMainLayoutComponent
  },
  {
    path: 'grid',
    component: ImportUserGridComponent
  },
  {
    path: 'create',
    component: ImportUserCreateComponent
  },
  {
    path: 'list',
    component: ImportUserListComponent
  },
  {
    path: 'createlist',
    component: ImportUserListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: ImportUserListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: ImportUserListEditComponent
  },
  {
    path: 'userlist/:resourceId',
    component: ImportUserListUserComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportUserLayoutRoutingModule { }
