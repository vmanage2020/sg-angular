import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';

import { PasswordresetComponent } from './forgot-password-layout/passwordreset/passwordreset.component';

import { GetStartedComponent } from './get-started/get-started.component';
import { loginGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [


 { path: '',  component: GetStartedComponent, loadChildren: () => import('./signup-layout/signup-layout.module').then(m => m.SignupLayoutModule), canActivate:[loginGuard]},
 {
        path: 'login',
        component: LoginComponent
 },
 { path: 'forgotpwd',  loadChildren: () => import('./forgot-password-layout/forgot-password-layout.module').then(m => m.ForgotPasswordLayoutModule) , canActivate:[loginGuard]},

   
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
