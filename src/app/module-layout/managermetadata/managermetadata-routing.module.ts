import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagermetadataComponent } from './managermetadata/managermetadata.component';

const routes: Routes = [  {
  path: '',
  component: ManagermetadataComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagermetadataRoutingModule { }
