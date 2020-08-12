import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from './ui/ui.module';
import { NgiObjectHeadersPipe } from '../components/ngi-datatable/src/lib/ngi-object-header.pipe';
import { SharedService } from './shared.service';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { NgbAlertModule, NgbPaginationModule, NgbTypeaheadModule, NgbDatepickerModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { NgxMaskModule } from 'ngx-mask';
import {NgiNotificationModule } from 'ngi-notification';

@NgModule({
  declarations: [NgiObjectHeadersPipe],
  imports: [
    CommonModule,
    NgiNotificationModule,
    UIModule,
    AngularFireStorageModule,NgbPaginationModule,
    NgbTypeaheadModule,NgSelectModule,NgbDatepickerModule,FileUploadModule,NgbDropdownModule,
    Ng2SearchPipeModule,NgbAlertModule,
    NgxMaskModule.forRoot(),
  ],
  exports: [NgiObjectHeadersPipe, AngularFireStorageModule,NgiNotificationModule],  
  entryComponents:[]
})
export class SharedModule { }
