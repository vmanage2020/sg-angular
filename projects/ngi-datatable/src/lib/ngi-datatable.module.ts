import { NgModule } from '@angular/core';
import { NgiDatatableComponent } from './ngi-datatable.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { UIModule } from '../../../../src/app/shared/ui/ui.module';
@NgModule({
  declarations: [NgiDatatableComponent],
  imports: [CommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,UIModule
  ],
  exports: [NgiDatatableComponent]
})
export class NgiDatatableModule { }
