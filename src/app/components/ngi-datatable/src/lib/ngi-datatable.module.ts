import { NgModule } from '@angular/core';
import { NgiDatatableComponent } from './ngi-datatable.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgiObjectReportdataPipe } from './ngi-object-items.pipe';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  
  ],
  declarations: [NgiDatatableComponent,NgiObjectReportdataPipe],
  exports: [NgiDatatableComponent]
})
export class NgiDatatableModule { }
