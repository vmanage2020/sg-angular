import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import * as _ from 'underscore';
import * as firebase from 'firebase';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NgiDatatableService {
  adminref: any = firebase.firestore();
  constructor(private http: HttpClient) { }

  getPager(totalItems: number, currentPage: number = 1, pageSize: number) {
   
    // calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);
    let startPage: number, endPage: number;
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

  private handleError(error: HttpErrorResponse) {
    return throwError(
      'Something bad happened; please try again later.');
  };

  postRest(url: string, body: any, token?: string): Observable<any> {

    if (url != undefined && environment.HOST != undefined) {
      return this.http.post<any>(environment.HOST + url, JSON.stringify(body), {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': token
        })
      });
    }
  }

  getRest(url: string, token?: string): Observable<any> {

    if (url != undefined && environment.HOST != undefined) {
      return this.http.get(environment.HOST + url, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': token
        })

      });
    }
  }


  async getOrganizationGridResponse(getOrganizationObj: any,dataTableType:any) {
    try {
      const pageNo = getOrganizationObj.pageNo;
      let itemPerPage = getOrganizationObj.itemPerPage;
      // const searchKey = request.body.search;
      const uid = getOrganizationObj.uid;
      let totalRecord: any;
      const startFrom = (pageNo - 1) * itemPerPage;

      if (!itemPerPage) { itemPerPage = 10; }
      if (!pageNo) {
        return { 'status': false, 'message': 'Page No is required' }
      } else if (!uid) {
        return { 'status': false, 'message': 'Uid is required' }
      } else {
        if(dataTableType === "organization"){
          let CollectionRef: any = await this.adminref.collection('/organization').orderBy(getOrganizationObj.sortingKey, getOrganizationObj.sortingValue);
          if (getOrganizationObj.searchKey && getOrganizationObj.searchVal) {
            getOrganizationObj.searchVal = getOrganizationObj.searchVal.toLowerCase();
            CollectionRef = await CollectionRef.where(getOrganizationObj.searchKey, 'array-contains', getOrganizationObj.searchVal)
          }
          if (getOrganizationObj.isPrevReq) {
            totalRecord = await CollectionRef.get();
            CollectionRef = await CollectionRef.startAt(getOrganizationObj.prevStartAt).limit(getOrganizationObj.itemPerPage).get();
          } else if (getOrganizationObj.isNextReq) {
            totalRecord = await CollectionRef.get();
            CollectionRef = await CollectionRef.startAfter(getOrganizationObj.nextStartAt).limit(getOrganizationObj.itemPerPage).get();
          } else {
            totalRecord = await CollectionRef.get();
            CollectionRef = await CollectionRef.limit(getOrganizationObj.itemPerPage).get();
          }
  
          if (CollectionRef.size) {
            let CollectionRefData = await CollectionRef.docs.map((doc: any) => doc.data());
            return {
              status: true,
              data: CollectionRefData,
              snapshot: CollectionRef,
              totalRecords: totalRecord.size || 0
            }
          } else {
            return {
              status: false,
              data: []
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }

  }
}
