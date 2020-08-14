import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, loginGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layouts/layout.component';
import { RoleGuard } from './core/guards/role.guard';
import { AccessDeniedComponent } from './account/auth/access-denied/access-denied.component';

import{Role} from '../app/core/guards/roleInfo'
const routes: Routes = [
  { path: 'account',  loadChildren: () => import('./account/account.module').then(m => m.AccountModule), canActivate:[loginGuard] },
  { path: '',  component: LayoutComponent, loadChildren: () => import('./module-layout/module-layout.module').then(m => m.ModuleLayoutModule) ,canActivate: [AuthGuard]},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'top'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
