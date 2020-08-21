import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
// const admin = require('firebase-admin');

import { RestApiService } from '../../shared/rest-api.services';
import { get } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PositionCrudService {
  adminref: any = firebase.firestore();
  
  uid: any;
  orgId: any;

  public _cannedresponses = new BehaviorSubject<any[]>([]);
  public dataStore:{ cannedresponses: any } = { cannedresponses: [] };
  readonly connections = this._cannedresponses.asObservable();

  public _country = new BehaviorSubject<any[]>([]);
  public countrydataStore:{ country: any } = { country: [] };
  readonly connections1 = this._country.asObservable();

  constructor(private titlecasePipe: TitleCasePipe, private restApiService: RestApiService ) {  
    //this.cannedresponsesList('cannedresponse');
    //this.getCountryCodeListAPI('countries');
   }


   private handleError(error: HttpErrorResponse) {
    const message = get(error, 'message') || 'Something bad happened; please try again later.';
    return throwError(message);
  }
  
  cannedresponsesList( url ){
    this.restApiService.lists(url).subscribe((data: any) => {
      console.log('---data----', data)
      this.dataStore.cannedresponses = data;
      this._cannedresponses.next(Object.assign({}, this.dataStore).cannedresponses);
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




  async createPosition(positionObject: any) {
    try {
      if (!positionObject.sport_id) {
        return { 'status': false, 'message': 'Sport is required.' }
      } else if (!positionObject.name) {
        return { 'status': false, 'message': 'Position Name is required.' }
      } else if (!positionObject.abbreviation) {
        return { 'status': false, 'message': 'Abbreviation is required.' }
      } else if (!positionObject.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else {
        let uniquePositionName: any = positionObject.name.toLowerCase();
        uniquePositionName = uniquePositionName.split(' ').join('_');
        const created = new Date();
        const sortOrder: number = 0;
        const positionObj = {
          'position_id': '',
          'sport_id': positionObject.sport_id,
          'sport_name': positionObject.sport_name,
          'name': positionObject.name,
          'position_name': positionObject.name,
          'abbreviation': positionObject.abbreviation,
          'sort_order': Number(sortOrder),
          'parent_position_id': positionObject.parent_position_id || '',
          'parent_position_name': positionObject.parent_position_name || '',
          'parent_position_abbreviation': positionObject.parent_position_abbreviation || '',
          'created_uid': positionObject.uid,
          'created_datetime': created,
          'updated_uid': "",
          'updated_datetime': created
        }
        let positionExist: any = await this.adminref.collection('/positions').where('sport_id', '==', positionObject.sport_id)
          .where('position_name', 'in', [positionObject.name, positionObject.name.toLowerCase(), positionObject.name.toUpperCase()]).get();
        if (positionExist.size) {
          return { 'status': false, 'message': 'Position already exists.' }
        } else { // if not create new sport document

          // await this.adminref.collection('/sports').doc(positionObject.sport_id).collection('/positions').doc(uniquePositionName).set(positionObj, { merge: true });
          const postioncreate = await this.adminref.collection('/positions').add(positionObj);
          await postioncreate.set({ position_id: postioncreate.id }, { merge: true });
          return { 'status': true, 'message': 'Position created successfully.' }
        }
      }
    } catch (error) {
      return { 'status': true, 'message': error.message }
    }
  }


  async getPositionById(getPositionByIdObj: any) {
    try {
      if (!getPositionByIdObj.sport_id) {
        return { 'status': false, 'message': 'Sport Id is required.' }
      } else if (!getPositionByIdObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else if (!getPositionByIdObj.position_id) {
        return { 'status': false, 'message': 'Position Id is required.' }
      } else {
        let positionInfo: any = await this.adminref.collection('/positions').doc(getPositionByIdObj.position_id).get()
        if (positionInfo.exists) {
          return { 'status': true, 'message': 'Get Position detail', 'data': positionInfo.data() }
        } else {
          return { 'status': false, 'message': 'Record not available.' }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': true, 'message': error.message }
    }
  }

  async updatePosition(updatePositionObj: any) {
    try {
      if (!updatePositionObj.sport_id) {
        return { 'status': false, 'message': 'Sport Id is required.' }
      } else if (!updatePositionObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else if (!updatePositionObj.position_id) {
        return { 'status': false, 'message': 'Position Id is required.' }
      } else if (!updatePositionObj.name) {
        return { 'status': false, 'message': 'Position Name is required.' }
      } else if (!updatePositionObj.abbreviation) {
        return { 'status': false, 'message': 'Abbrevation is required.' }
      } else {
        const updated = new Date();
        const positionObj: any = {
          'position_id':updatePositionObj.position_id,
          'name': updatePositionObj.name,
          "sport_name": updatePositionObj.sport_name,
          'sport_id': updatePositionObj.sport_id,
          'position_name': updatePositionObj.name,
          'abbreviation': updatePositionObj.abbreviation,
          'parent_position_id': updatePositionObj.parent_position_id,
          'parent_position_name': updatePositionObj.parent_position_name,
          'parent_position_abbreviation': updatePositionObj.parent_position_abbreviation,
          'updated_datetime': updated,
          'updated_uid': updatePositionObj.uid
        }
        //Check if Sport already Exist
        let positionExist: any = await this.adminref.collection('/positions').doc(updatePositionObj.position_id).get();
        if (positionExist.exists) {
          let positionExists: any = await this.adminref.collection('/positions').where('sport_id', '==', updatePositionObj.sport_id)
            .where('position_name', 'in', [updatePositionObj.name, updatePositionObj.name.toLowerCase(), updatePositionObj.name.toUpperCase()]).get();
          if (positionExists.docs.length > 0) {
            positionExists = positionExists.docs.map((doc: any) => doc.id);
            if (!positionExists.includes(updatePositionObj.position_id)) {
              return {
                "status": false,
                "error": "Position already exist."
              }
            } else {
              await positionExist.ref.update(positionObj);
              await this.generateKeywords(positionObj, updatePositionObj.position_id);
              return { 'status': true, 'message': 'Position updated successfully.' }
            }
          } else {
            await positionExist.ref.update(positionObj);
            await this.generateKeywords(positionObj, updatePositionObj.position_id);
            return { 'status': true, 'message': 'Position updated successfully.' }
          }

        } else {
          return { 'status': false, 'message': 'Cannot Update.' }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }
  async getPositionListForGrid(getPositionListForGridObj: any) {
    try {
      const startFrom = (getPositionListForGridObj.page_no - 1) * getPositionListForGridObj.item_per_page;
      if (!getPositionListForGridObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else if (!getPositionListForGridObj.page_no) {
        return { 'status': false, 'message': 'Position Id is required.' }
      } else {
        let getPositions: any;

        if (!getPositionListForGridObj.sport_id) {
          getPositions = await this.adminref.collection('positions');
        } else {
          // let getSportInfo: any = await this.adminref.collection('/sports').doc(getPositionListForGridObj.sport_id).get();
          // if (getSportInfo.exists) {
          getPositions = await this.adminref.collection('positions').where('sport_id', '==', getPositionListForGridObj.sport_id);
          // return { 'status': true, 'message': "Positions list", 'data': resultObj }
          //} 
          // else {
          //   return { 'status': false, 'message': "Sport doesn't exist." }
          // }
        }
        if (getPositionListForGridObj.searchKey && getPositionListForGridObj.searchVal) {
          getPositions = await getPositions.where(getPositionListForGridObj.searchKey, 'array-contains', getPositionListForGridObj.searchVal)
        }
        let totalRecords: any;
        totalRecords = await getPositions.get();
        if (getPositionListForGridObj.isNextReq) {
          getPositions = await getPositions.orderBy(getPositionListForGridObj.sortingKey, getPositionListForGridObj.sortingValue)
            .startAfter(getPositionListForGridObj.nextStartAt).limit(getPositionListForGridObj.item_per_page).get();
        } else if (getPositionListForGridObj.isPrevReq) {
          getPositions = await getPositions.orderBy(getPositionListForGridObj.sortingKey, getPositionListForGridObj.sortingValue)
            .startAt(getPositionListForGridObj.prevStartAt).limit(getPositionListForGridObj.item_per_page).get();
        } else {
          getPositions = await getPositions.orderBy(getPositionListForGridObj.sortingKey, getPositionListForGridObj.sortingValue)
            .limit(getPositionListForGridObj.item_per_page).get();
        }

        if (getPositions.size) {
          let userCollectionRefData = await getPositions.docs.map((doc: any) => doc.data());
          
          return {
            status: true,
            data: userCollectionRefData,
            snapshot: getPositions,
            totalRecords: totalRecords.size || 0
          }
        } else {
          return {
            status: false,
            data: []
          }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': true, 'message': error.message }
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

  async generateKeywords(userData: any, positionId: any) {
    try {
      const keywordForPositionName = this.createKeywords(`${userData.name}`);
      const keywordForAbbre = this.createKeywords(`${userData.abbreviation}`);
      const keywordForSportName = this.createKeywords(`${userData.sport_name}`);
      const keywordForParentPosiiton = this.createKeywords(`${userData.parent_position_name}`);
      const keywords = [
        ...new Set([
          '',
          ...keywordForPositionName,
          ...keywordForSportName,
          ...keywordForAbbre,
          ...keywordForParentPosiiton,
        ])
      ];
      await this.adminref.collection('/positions').doc(userData.position_id).set({
        keywords: keywords}, { merge: true });
      return true;
    } catch (err) {
      console.log(err);

      return true
    }
  }
}
