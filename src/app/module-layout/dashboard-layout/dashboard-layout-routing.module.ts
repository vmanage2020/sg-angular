import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { Role } from 'src/app/core/guards/roleInfo';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'welcome',
    component: DashboardComponent
  },
  {
    path: 'dashboard',
    component: WelcomeComponent,
    canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardLayoutRoutingModule { }
