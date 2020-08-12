import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayermetadataComponent } from './playermetadata/playermetadata.component';
import { PlayermetaCreateComponent } from './playermeta-create/playermeta-create.component';

const routes: Routes = [
  {
    path: '',
    component: PlayermetadataComponent
  },
  {
    path: 'create',
    component: PlayermetaCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlayermetadataRoutingModule { }
