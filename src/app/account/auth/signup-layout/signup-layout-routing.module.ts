import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SignupChildComponent } from './signup-child/signup-child.component';
import { TermsConditionComponent } from './terms-condition/terms-condition.component';
import { ConfirmComponent } from '../confirm/confirm.component';
import { RegisterationFailedComponent } from './registeration-failed/registeration-failed.component';

const routes: Routes = [
// {
//   path:'sign-up',
//   component:SignupComponent,
 
// },
    // {
    //   path:'signup-child',
    //   component:SignupChildComponent
    // },
    // {
    //   path:'terms-condition',
    //   component:TermsConditionComponent
    // },
    {
      path:'confirm-signup',
      component:ConfirmComponent

    },   {
      path:'registrationfailed',
      component:RegisterationFailedComponent

    }


  




];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupLayoutRoutingModule { }
