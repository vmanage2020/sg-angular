import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError } from "rxjs";
import { CookieService } from './cookie.service';
import { retry, catchError, tap, map } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private subject = new Subject<any>();
  constructor(private http: HttpClient, private cookieService: CookieService,private authService: AuthenticationService,private router: Router,) {
  }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Authorization: this.cookieService.getCookie('token')
    })
  };


  public currentUser() { //: User {           
    return this.cookieService.getCookie('currentUser');
  }

  public getToken() {
    return this.cookieService.getCookie('token');
  }

  postData(url, data, token): Observable<any> {

    return this.http.post(url, data, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'idtoken': token }), observe: 'response' }).pipe(
      map((data) => {
        
        if(data.status == 200) {
          // console.log('OK');          
          // console.log(data);
          return data.body;          
        } else {
          console.log('Other Status');          
          console.log(data);          
        }
      }, (error) => {        
        console.log('Error');        
        console.log('Logged Out');
        console.log(error);  
        this.authService.logout();
        this.router.navigate(['/account/login']);
      }),
    )
  }

  


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.log('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,      
      console.log(`Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  // addSmartphone(url,data,token): Observable<any> {
  //   return this.http.post<any>(url, data, httpOptions)
  //     .pipe(
  //       catchError(this.handleError('addSmartphone', smartphone))
  //     );
  // }

  getData(url, token): Observable<any> {
    return this.http.get(url, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'idtoken': token }), observe: 'response' }).pipe(
      map((data) => {
        
        if(data.status == 200) {
          // console.log('OK');          
          // console.log(data);
          return data.body;          
        } else {
          console.log('Other Status');          
          console.log(data);          
        }
      }, (error) => {        
        // console.log('Error');        
        // console.log('Logged Out');
        console.log(error);  
        this.authService.logout();
        this.router.navigate(['/account/login']);
      }),
    )
  }

  getUserDetail(url, uid): Observable<any> {
    // return this.http.post(url, JSON.stringify(data));  
    return this.http.get(url, { headers: new HttpHeaders({'UID': uid })});
  }
  // getUserDetail(url, data): Observable<any> {
  //   // return this.http.post(url, JSON.stringify(data));  
  //   return this.http.post(url, data);
  // }
  randomCodeGenerator(): string {
    return Math.floor(Math.random() * 100) + 2 + "" + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5));
  }
}
