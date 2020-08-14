import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayermetadataRoutingModule } from './playermetadata-routing.module';
import { PlayermetadataComponent } from './playermetadata/playermetadata.component';
import { PlayermetaGridComponent } from './playermeta-grid/playermeta-grid.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { PlayermetaCreateComponent } from './playermeta-create/playermeta-create.component';
import { PlayerfieldViewComponent } from './playerfield-view/playerfield-view.component';
import { PlayerfieldEditComponent } from './playerfield-edit/playerfield-edit.component';

@NgModule({
  declarations: [PlayermetadataComponent, PlayermetaGridComponent, PlayermetaCreateComponent, PlayerfieldViewComponent, PlayerfieldEditComponent],
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbAlertModule,
    NgSelectModule,
    PlayermetadataRoutingModule
  ],
  entryComponents:[PlayermetadataComponent, PlayermetaGridComponent, PlayermetaCreateComponent, PlayerfieldViewComponent, PlayerfieldEditComponent]
})
export class PlayermetadataModule {
  
 }
