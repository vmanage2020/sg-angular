import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayermetaComponent } from './playermeta/playermeta.component';
import { PlayermetaCreateComponent } from './playermeta-create/playermeta-create.component';
import { PlayermetaViewComponent } from './playermeta-view/playermeta-view.component';
import { PlayermetaEditComponent } from './playermeta-edit/playermeta-edit.component';

const routes: Routes = [
  {
    path: '',
    component: PlayermetaComponent
  },
  {
    path: 'create',
    component: PlayermetaCreateComponent
  },
  {
    path: 'view/:resourceId',
    component: PlayermetaViewComponent
  },
  {
    path: 'edit/:resourceId',
    component: PlayermetaEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlayermetaRoutingModule { }
