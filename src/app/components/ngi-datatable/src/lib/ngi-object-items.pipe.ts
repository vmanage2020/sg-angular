import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectItemdata'
})
export class NgiObjectReportdataPipe implements PipeTransform {

  transform(value: any, showColumninfo:any): any {
   
    const reportdata: any = [];
    const ObjKey: any = [];
    Object.keys(value[0]).forEach(element => {
      ObjKey.push(element);
    });
    return ObjKey;
  }

}