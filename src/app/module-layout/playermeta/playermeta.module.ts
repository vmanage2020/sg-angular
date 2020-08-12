import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayermetaRoutingModule } from './playermeta-routing.module';
import { PlayermetaComponent } from './playermeta/playermeta.component';
import { PlayermetaGridComponent } from './playermeta-grid/playermeta-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { PlayermetaCreateComponent } from './playermeta-create/playermeta-create.component';
import { PlayermetaViewComponent } from './playermeta-view/playermeta-view.component';
import { PlayermetaEditComponent } from './playermeta-edit/playermeta-edit.component';

import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [PlayermetaComponent, PlayermetaGridComponent, PlayermetaCreateComponent, PlayermetaViewComponent, PlayermetaEditComponent],
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgSelectModule,
    PlayermetaRoutingModule,
    DataTablesModule
  ],
  entryComponents:[PlayermetaComponent, PlayermetaGridComponent, PlayermetaCreateComponent, PlayermetaViewComponent, PlayermetaEditComponent]
})
export class PlayermetaModule {
  
 }
