import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationsCreateComponent } from './organizations-create/organizations-create.component';
import { OrganizationsEditComponent } from './organizations-edit/organizations-edit.component';
import { OrganizationsViewComponent } from './organizations-view/organizations-view.component';
import { OrganizationsInfoComponent } from './organizations-info/organizations-info.component';

import { RoleGuard } from 'src/app/core/guards/role.guard';

import{Role} from '../../core/guards/roleInfo'

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    // canActivate: [RoleGuard],
    // data:{ role:[Role.sysAdmin]}
  },
  {
    path: 'create',
    component: OrganizationsCreateComponent,
    canActivate: [RoleGuard],
    data:{ role:[Role.sysAdmin]}
  },
  {
    path: 'edit/:resourceId',
    component:OrganizationsEditComponent
  },
  {
    path: 'view/:resourceId',
    component: OrganizationsViewComponent
  },
  {
    path: 'info',
    component: OrganizationsInfoComponent
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationsRoutingModule { }
