import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CannedResponseLayoutComponent } from './canned-response-layout/canned-response-layout.component';
import { CannedResponseCreateComponent } from './canned-response-create/canned-response-create.component';
import { CannedResponseGridComponent } from './canned-response-grid/canned-response-grid.component';
import { CannedResponseUpdateComponent } from './canned-response-update/canned-response-update.component';
import { CannedResponseViewComponent } from './canned-response-view/canned-response-view.component';

import { CannedResponseListComponent } from './canned-response-list/canned-response-list.component';
import { CannedResponseListCreateComponent } from './canned-response-list-create/canned-response-list-create.component';
import { CannedResponseListEditComponent } from './canned-response-list-edit/canned-response-list-edit.component';
import { CannedResponseListViewComponent } from './canned-response-list-view/canned-response-list-view.component';

const routes: Routes = [
  {
    path: '',
    component: CannedResponseLayoutComponent
  },
  {
    path: 'create',
    component: CannedResponseCreateComponent
  },
  {
    path: 'grid',
    component: CannedResponseGridComponent
  },
  {
    path: 'update',
    component: CannedResponseUpdateComponent
  },
  {
    path: 'view',
    component: CannedResponseViewComponent
  },
  {
    path: 'list',
    component: CannedResponseListComponent
  },
  {
    path: 'createlist',
    component: CannedResponseListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: CannedResponseListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: CannedResponseListEditComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CannedResponseLayoutRoutingModule { }
