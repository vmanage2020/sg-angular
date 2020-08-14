import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagermetaComponent } from './managermeta/managermeta.component';

import { ManagermetaCreateComponent } from './managermeta-create/managermeta-create.component';
import { ManagermetaViewComponent } from './managermeta-view/managermeta-view.component';
import { ManagermetaEditComponent } from './managermeta-edit/managermeta-edit.component';
import { ManagermetaGridComponent } from './managermeta-grid/managermeta-grid.component';


const routes: Routes = [
  {
    path: '',
    component: ManagermetaComponent
  },
  {
    path: 'create',
    component: ManagermetaCreateComponent
  },
  {
    path: 'view/:resourceId',
    component: ManagermetaViewComponent
  },
  {
    path: 'edit/:resourceId',
    component: ManagermetaEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagermetaRoutingModule { }
