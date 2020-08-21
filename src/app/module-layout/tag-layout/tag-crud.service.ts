import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
// const admin = require('firebase-admin');
import { CommonCrudService } from '../../../app/core/services/common-crud.service'

import { RestApiService } from '../../shared/rest-api.services';
import { get } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TagCrudService {
  adminref: any = firebase.firestore();

  uid: any;
  orgId: any;

  public _tags = new BehaviorSubject<any[]>([]);
  public dataStore:{ tags: any } = { tags: [] };
  readonly connections = this._tags.asObservable();

  public _country = new BehaviorSubject<any[]>([]);
  public countrydataStore:{ country: any } = { country: [] };
  readonly connections1 = this._country.asObservable();

  constructor(private titlecasePipe: TitleCasePipe, private commonService: CommonCrudService, private restApiService: RestApiService) {
    
  //this.uid = this.cookieService.getCookie('uid');
  this.orgId = localStorage.getItem('org_id');
  if(this.orgId=='') {
    this.tagsList('tags');
  } else {
    this.tagsList('tagsbyorg/'+this.orgId+'');
  }
    
    this.getCountryCodeListAPI('countries');
   }

  private handleError(error: HttpErrorResponse) {
    const message = get(error, 'message') || 'Something bad happened; please try again later.';
    return throwError(message);
  }
  
  tagsList( url ){
    this.restApiService.lists(url).subscribe((data: any) => {
      console.log('---data----', data)
      this.dataStore.tags = data;
      this._tags.next(Object.assign({}, this.dataStore).tags);
      // console.log(this.dataStore);

    },
      catchError(this.handleError)
    );
  }

  getCountryCodeListAPI(url)
  {
    this.restApiService.lists(url).subscribe((data: any) => {
      console.log('---data----', data)
      this.countrydataStore.country = data;
      this._country.next(Object.assign({}, this.countrydataStore).country);
      // console.log(this.dataStore);

    },
      catchError(this.handleError)
    );
  }


  async createTag(createTagObj: any) {
    try {
      const collectionName = "Tags";
      const createdTagData: any = await this.commonService.createTemplateHandler(createTagObj, this.adminref, collectionName);
      if (createdTagData.data) {
        return { 'status': true, 'message': createdTagData["data"] }
      } else {
        return { 'status': false, 'message': createdTagData["error"] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async deleteTag(deleteTagObj: any) {
    try {
      let collectionName = "Tags"
      const updateData: any = await this.commonService.deleteTemp(deleteTagObj, this.adminref, collectionName);
      if (updateData.data) {
        return { 'status': true, 'message': updateData.data }

      } else {
        return { 'status': false, 'message': updateData.error }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async updateTag(updateTagObj: any) {
    try {
      let isTagExist: any = await this.adminref.collection('/Tags').doc(updateTagObj.tag_id).get();
      if (isTagExist.exists) {
        if (isTagExist.data().count > 0) {
          return { "status": false, "error": "Tag is tied with team, Can't able update" };
        }
        else {
          let getTagList: any = await this.adminref.collection('/Tags').where('tag_name', '==', updateTagObj.tag_name)
            .where('organization_id', '==', updateTagObj.organization_id).where('is_deleted', '==', false).
            where('sport_id', '==', updateTagObj.sport_id).get();
          if (getTagList.size) {
            return {
              "status": false,
              "error": "Tag Name already exist."
            }
          } else {
            delete updateTagObj.name
            let deleteDoc = await isTagExist.ref.set(updateTagObj, { merge: true });
            await this.generateKeywordsForLevel(updateTagObj);
            return { "status": true, "data": "Tag update successfully." };
          }
        }
      } else {
        return { "status": false, "error": "Update failed.Invalid Tag ID" };
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }
  }

  async  generateKeywordsForLevel(userData: any) {
    try {
      const keywordForTagName = this.createKeywords(`${userData.tag_name}`);
      const keywordForSportName = this.createKeywords(`${userData.sport_name}`);
      const keywords = [
        ...new Set([
          '',
          ...keywordForTagName,
          ...keywordForSportName,
        ])
      ];
      await this.adminref.collection('/Tags').doc(userData.tag_id).set({
        keywords: keywords}, { merge: true });
      return true;


    } catch (err) {
      console.log(err);
      return true;
    }
  }
  createKeywords(name: any) {
    const arrName: any = [];
    let curName = '';
    if (name === "" || name === null || name === undefined || name === "undefined" || name === '') {
      arrName.push(null);
      arrName.push("");
    } else {
      const str = name.toLowerCase();
      str.split('').forEach((letter: any) => {
        curName += letter;
        arrName.push(curName);
      });
      let arrayValues = str.split(" ");
      for (let index of arrayValues) {
        let curNameArr = '';
        index.split('').forEach((letter: any) => {
          curNameArr += letter;
          arrName.push(curNameArr);
        });
      }
    }

    return arrName;
  }

  async getTagsForGrid(getTagListObj: any) {
    try {
      const userData: any = await this.commonService.getDataForGrid(getTagListObj, this.adminref);
      if (userData.data) {
        return { 'status': true, 'message': "list", 'data': userData }
      } else {
        return { 'status': false, 'message': userData.error, 'error': userData.error }
      }
    } catch (error) {

    }

  }
}
