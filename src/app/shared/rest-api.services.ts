import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { get } from 'lodash';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';

import { BehaviorSubject } from 'rxjs';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  	constructor(private http: HttpClient) { }

	public _list   = new BehaviorSubject<any[]>([]);
	public dataStore: {} = {};
	readonly tasks  = this._list.asObservable();

    //baseAPIUrl = 'http://13.229.116.53:3000/';
    baseAPIUrl     = environment.api;

	// Http Options
  	httpOptions = {
		/* headers: new HttpHeaders({
				'Content-Type': 'application/json',
		}) */
	}

	lists(apiPath: string, isStore?: boolean, listKey?: string): Observable<any> {
		return this.http.get<any>( this.baseAPIUrl+apiPath, this.httpOptions)
			.pipe(
				map(response => {
                    //console.log('----response---', response)
					/* if( isStore ) {
						if( !listKey ) {
							listKey = 'list';
							this.dataStore['list'] = [];
						} else {
							this.dataStore[listKey] = [];
						}
						this.dataStore[listKey] = response;
					this._list.next(Object.assign({}, this.dataStore)['list']);
                    } */
                    
					return response;
				}),
				catchError(this.handleError)
			)
	}

	create(apiPath: string, formData: any, httpOptions?: any) {
		/*
		* apiPath represents path of the API
		*/

		if( httpOptions ) {
			this.httpOptions = httpOptions;
		}
		return this.http.post<any>(this.baseAPIUrl+apiPath, formData, this.httpOptions)
			.pipe(
				map(response => response),
				catchError(this.handleError)
			);
	}

	update(apiPath: string, formData: any) {//this.baseAPIUrl +
		return this.http.put<any>(this.baseAPIUrl+apiPath, formData) 
		  .pipe(
			map(response => response),
			catchError(this.handleError)
		  );
    }

    // HttpClient API delete() method => Delete
  remove(apiPath: string ){
    return this.http.delete<any>(this.baseAPIUrl+apiPath, this.httpOptions)
    .pipe(
      map(response => response),
      catchError(this.handleError)
    )
  }

	private handleError(error: HttpErrorResponse) {
		const message = get(error, 'message') || 'Something bad happened; please try again later.';
		return throwError(message);
	}

}