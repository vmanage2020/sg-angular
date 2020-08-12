import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'objectHeaders'
})
export class NgiObjectHeadersPipe implements PipeTransform {
    transform(value: any, numofLetters: number = 3, showColumninfo: any): any {

        const headers: any = [];


        // this pipe library only fixed temporary fixes, we need to improve this library for dynamic header designs

        if (value != undefined) {
            showColumninfo.forEach(element => {
                if (numofLetters === undefined) {
                    headers.push(element.toUpperCase())

                } else {

                    let splitName = element.split('_');
                    // console.log(splitName.length);
                    
                    if (splitName.length === 1) {
                        headers.push(element.substring(0, numofLetters).toUpperCase() + element.substring(numofLetters, element.length));

                    }else{
                        let lastCap = '';
                        let thirdCap = '';
                        let forthCap = '';
                        let fifthCap = '';
                        let sixthCap = '';

                        let prefixCap = splitName[0].substring(0, numofLetters).toUpperCase() + splitName[0].substring(numofLetters, splitName[0].length);
                        let suffixCap = splitName[1].substring(0, numofLetters).toUpperCase() + splitName[1].substring(numofLetters, splitName[1].length);

                        if(splitName[2]) {
                            lastCap = splitName[2].substring(0, numofLetters).toUpperCase() + splitName[2].substring(numofLetters, splitName[2].length);
                        }
                        if(splitName[3]){
                            thirdCap = splitName[3].substring(0, numofLetters).toUpperCase() + splitName[3].substring(numofLetters, splitName[3].length);
                        }
                        if(splitName[4]){
                            forthCap = splitName[4].substring(0, numofLetters).toUpperCase() + splitName[4].substring(numofLetters, splitName[4].length);
                        }
                        if(splitName[5]){
                            fifthCap = splitName[5].substring(0, numofLetters).toUpperCase() + splitName[5].substring(numofLetters, splitName[5].length);
                        }
                        if(splitName[6]){
                            sixthCap = splitName[6].substring(0, numofLetters).toUpperCase() + splitName[6].substring(numofLetters, splitName[6].length);
                        }
                        headers.push(prefixCap + ' ' + suffixCap+' '+lastCap+' '+thirdCap+' '+forthCap+' '+fifthCap+' '+sixthCap);
                    }

           

                    //    headers.push(element.substring(0, numofLetters).toUpperCase() + element.substring(numofLetters, element.length));
                }

            });

            return headers;

        }
        else {
            return value;
        }

    }


}

