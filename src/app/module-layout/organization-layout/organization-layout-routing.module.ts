import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationCreateComponent } from './organization-create/organization-create.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { OrganizationViewComponent } from './organization-view/organization-view.component';
import { OrganizationGridComponent } from './organization-grid/organization-grid.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

import{Role} from '../../core/guards/roleInfo'
import { OrganizationLayoutComponent } from './organization-layout/organization-layout.component';
const routes: Routes = [
  {
    path: '',
    component: OrganizationLayoutComponent,
    // canActivate: [RoleGuard],
    // data:{ role:[Role.sysAdmin]}
  },
  {
    path: 'grid',
    component: OrganizationGridComponent,
    canActivate: [RoleGuard],
    data:{ role:[Role.sysAdmin]}
  },
  {
    path: 'create',
    component: OrganizationCreateComponent,
    canActivate: [RoleGuard],
    data:{ role:[Role.sysAdmin]}
  },
  {
    path: 'edit/:id',
    component:OrganizationEditComponent
  },
  {
    path: 'view/:id',
    component: OrganizationViewComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationLayoutRoutingModule { }
