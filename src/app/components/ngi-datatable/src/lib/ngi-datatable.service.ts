import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
// import * as _ from 'underscore';
import * as _ from 'underscore';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// import { NgiLoggerService } from 'ngi-logger';

@Injectable({
  providedIn: 'root'
})
export class NgiDatatableService {

  constructor(private http: HttpClient) { }

  // postData(url,body,token): Observable<any> {
  //   return this.http.post(environment.HOST+environment.PORT+url,body, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization':localStorage.getItem('token') }) }) .pipe(
  //     retry(1), // retry a failed request up to 3 times
  //     catchError(this.handleError) // then handle the error
  //   );

    
  // }
  

  // getData(url,token): Observable<any> {
  // //  if(url != undefined && environment.HOST !=undefined && environment.PORT != undefined) {  
  //   return this.http.get(environment.HOST+environment.PORT+url, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization':localStorage.getItem('token') }) }) .pipe(
  //     retry(1), // retry a failed request up to 3 times
  //     catchError(this.handleError) // then handle the error
  //   );
  //  // }
  // }

  getPager(totalItems: number, currentPage: number, pageSize: number = 10) {
  
    // calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);
     let startPage: number, endPage: number;
   /* if (totalPages <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 10 total pages so calculate start and end pages
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    } */
    if (totalPages <= 5) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 10 total pages so calculate start and end pages
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;        
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;        
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;        
      }
    }

    // calculate start and end item indexes
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    const pages = _.range(startPage, endPage + 1);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };

  } 
}

//   private handleError(error: HttpErrorResponse) {
//     if (error.error instanceof ErrorEvent) {
//       // A client-side or network error occurred. Handle it accordingly.
//       this.logger.error('An error occurred:', error.error.message);
//     } else {
//       // The backend returned an unsuccessful response code.
//       // The response body may contain clues as to what went wrong,
//       // console.log(error);
      
//       this.logger.error(
//         `Backend returned code ${error.status}, ` +
//         `body was: ${error.error}`);
//     }
//     // return an observable with a user-facing error message
    
//     return throwError(
//       'Something bad happened; please try again later.');
//   };

//    postRest(url: string, body: any, token?: string): Observable<any> {
    
//     if(url != undefined && environment.HOST !=undefined && environment.PORT != undefined) {  
//         return this.http.post<any>(environment.HOST+environment.PORT+url, JSON.stringify(body), {
//           headers: new HttpHeaders({
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Authorization': token                     
//           })
//         });
//       }
//   }

//   getRest(url: string, token?: string): Observable<any> {
    
//     if(url != undefined && environment.HOST !=undefined && environment.PORT != undefined) {     
//     return this.http.get(environment.HOST+environment.PORT+url, {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization':token        
//       })
     
//     });
//   }
//   }
// }
