import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from '../components/profile/profile.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { Role } from '../core/guards/roleInfo';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./dashboard-layout/dashboard-layout.module').then(m => m.DashboardLayoutModule), canActivate: [AuthGuard] },
  { path: 'organization', loadChildren: () => import('./organization-layout/organization-layout.module').then(m => m.OrganizationLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] } },
  {
    path: 'users', loadChildren: () => import('./user-layout/user-layout.module').then(m => m.UserLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'sports', loadChildren: () => import('./sports-layout/sports-layout.module').then(m => m.SportsLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'sportspoc', loadChildren: () => import('./sports-poc-layout/sports-layout.module').then(m => m.SportsLayoutPOCModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'positions', loadChildren: () => import('./position-layout/position-layout.module').then(m => m.PositionLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'skillcategories', loadChildren: () => import('./skillcategories-layout/skillcategories-layout.module').then(m => m.SkillcategoriesLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'skill', loadChildren: () => import('./skills-layout/skills-layout.module').then(m => m.SkillsLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'positionskill', loadChildren: () => import('./position-skill-layout/position-skill-layout.module').then(m => m.PositionSkillLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'useruploads', loadChildren: () => import('./import-user-layout/import-user-layout.module').then(m => m.ImportUserLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'season', canActivateChild: [RoleGuard], loadChildren: () => import('./season-layout/season-layout.module').then(m => m.SeasonLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'tags', canActivateChild: [RoleGuard], loadChildren: () => import('./tag-layout/tag-layout.module').then(m => m.TagLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'cannedresponse', canActivateChild: [RoleGuard], loadChildren: () => import('./canned-response-layout/canned-response-layout.module').then(m => m.CannedResponseLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'teams', loadChildren: () => import('./teams-layout/teams-layout.module').then(m => m.TeamsLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'level', canActivateChild: [RoleGuard], loadChildren: () => import('./level-layout/level-layout.module').then(m => m.LevelLayoutModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'playercustomfield', loadChildren: () => import('./playermetadata/playermetadata.module').then(m => m.PlayermetadataModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'coachcustomfield', loadChildren: () => import('./coachmetadata/coachmetadata.module').then(m => m.CoachmetadataModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'managercustomfield', loadChildren: () => import('./managermetadata/managermetadata.module').then(m => m.ManagermetadataModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'playermeta', loadChildren: () => import('./playermeta/playermeta.module').then(m => m.PlayermetaModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'organizations', loadChildren: () => import('./organizations/organizations.module').then(m => m.OrganizationsModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'managermeta', loadChildren: () => import('./managermeta/managermeta.module').then(m => m.ManagermetaModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
  {
    path: 'coachmeta', loadChildren: () => import('./coachmeta/coachmeta.module').then(m => m.CoachmetaModule), canActivate: [AuthGuard, RoleGuard], data: { role: [Role.admin, Role.sysAdmin] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleLayoutRoutingModule { }
