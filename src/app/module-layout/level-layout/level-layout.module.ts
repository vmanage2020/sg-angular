import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LevelLayoutRoutingModule } from './level-layout-routing.module';
import { LevelCreateComponent } from './level-create/level-create.component';
import { LevelGridComponent } from './level-grid/level-grid.component';
import { LevelLayoutComponent } from './level-layout/level-layout.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreloadAllModules } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { NgxMaskModule } from 'ngx-mask';
import { LevelEditComponent } from './level-edit/level-edit.component';
import { LevelViewComponent } from './level-view/level-view.component';
import { LevelListComponent } from './level-list/level-list.component';
import { LevelListCreateComponent } from './level-list-create/level-list-create.component';
import { LevelListEditComponent } from './level-list-edit/level-list-edit.component';
import { LevelListViewComponent } from './level-list-view/level-list-view.component';

import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [LevelCreateComponent, LevelGridComponent, LevelLayoutComponent, LevelEditComponent, LevelViewComponent, LevelListComponent, LevelListCreateComponent, LevelListEditComponent, LevelListViewComponent],
  imports: [
    CommonModule,
    LevelLayoutRoutingModule,UIModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,NgbAlertModule,
    NgxMaskModule.forRoot(),
    DataTablesModule,
  ],
  entryComponents:[LevelCreateComponent, LevelGridComponent, LevelEditComponent, LevelViewComponent]
})
export class LevelLayoutModule { }
