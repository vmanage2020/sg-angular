import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoahmetadataComponent } from './coahmetadata/coahmetadata.component';

const routes: Routes = [
  {
  path: '',
  component: CoahmetadataComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoachmetadataRoutingModule { }
