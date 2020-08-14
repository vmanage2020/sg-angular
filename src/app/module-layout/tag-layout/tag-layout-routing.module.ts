import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagLayoutComponent } from './tag-layout/tag-layout.component';
import { CreateTagComponent } from './create-tag/create-tag.component';
import { EditTagComponent } from './edit-tag/edit-tag.component';
import { TagGridComponent } from './tag-grid/tag-grid.component';
import { ViewTagComponent } from './view-tag/view-tag.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

import { TagListComponent } from './tag-list/tag-list.component';
import { TagListCreateComponent } from './tag-list-create/tag-list-create.component';
import { TagListEditComponent } from './tag-list-edit/tag-list-edit.component';
import { TagListViewComponent } from './tag-list-view/tag-list-view.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [ RoleGuard ],
    component: TagLayoutComponent
  },
  {
    path: 'create',
    component: CreateTagComponent
  },
  {
    path: 'edit',
    component: EditTagComponent
  },
  {
    path: 'grid',
    component: TagGridComponent
  },
  {
    path: 'view',
    component: ViewTagComponent
  },
  {
    path: 'list',
    component: TagListComponent
  },
  {
    path: 'createlist',
    component: TagListCreateComponent
  },
  {
    path: 'viewlist/:resourceId',
    component: TagListViewComponent
  },
  {
    path: 'editlist/:resourceId',
    component: TagListEditComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagLayoutRoutingModule { }
