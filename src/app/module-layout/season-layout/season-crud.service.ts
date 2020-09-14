import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
import * as moment from 'moment';
import { element } from 'protractor';

import { RestApiService } from '../../shared/rest-api.services';
import { get } from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class SeasonCrudService {
  
  adminref: any = firebase.firestore();
  value: any = [];

  uid: any;
  orgId: any;

  public _seasons = new BehaviorSubject<any[]>([]);
  public dataStore:{ seasons: any } = { seasons: [] };
  readonly connections = this._seasons.asObservable();

  public _sports = new BehaviorSubject<any[]>([]);
  public sportsdataStore:{ sports: any } = { sports: [] };
  readonly sportsconnections = this._sports.asObservable();

  public _country = new BehaviorSubject<any[]>([]);
  public countrydataStore:{ country: any } = { country: [] };
  readonly connections1 = this._country.asObservable();

  constructor(private titlecasePipe: TitleCasePipe, private restApiService: RestApiService) { 
    this.orgId = localStorage.getItem('org_id');
    console.log('orgId',this.orgId);
    let Metaurl= '';
    if(this.orgId=='' || this.orgId==1) {
      Metaurl='seasons';
    } else {
      Metaurl='seasonsbyorg/'+this.orgId;
    }
    console.log('Metaurl',Metaurl);
    this.seasonsList(Metaurl);
    //this.getCountryCodeListAPI('countries');

    if(this.orgId=='' || this.orgId==1) {
    Metaurl='sports';
    } else {
    Metaurl='organizationsports/'+this.orgId;
    }
    this.getSportsListAPI(Metaurl);
 }

 

private handleError(error: HttpErrorResponse) {
const message = get(error, 'message') || 'Something bad happened; please try again later.';
return throwError(message);
}

seasonsList( url ){
this.restApiService.lists(url).subscribe((data: any) => {
  //console.log('---data----', data)
  this.dataStore.seasons = data.reverse();
  this._seasons.next(Object.assign({}, this.dataStore).seasons);
  // console.log(this.dataStore);

},
  catchError(this.handleError)
);
}


getSportsListAPI(url)
{
this.restApiService.lists(url).subscribe((data: any) => {
  //console.log('---data----', data)
  this.sportsdataStore.sports = data;
  this._sports.next(Object.assign({}, this.sportsdataStore).sports);
  // console.log(this.dataStore);

},
  catchError(this.handleError)
);
}

getCountryCodeListAPI(url)
{
this.restApiService.lists(url).subscribe((data: any) => {
  //console.log('---data----', data)
  this.countrydataStore.country = data;
  this._country.next(Object.assign({}, this.countrydataStore).country);
  // console.log(this.dataStore);

},
  catchError(this.handleError)
);
}




  async createSeason(createSeasonObj: any) {
    try {
      const seasonObj = JSON.parse(JSON.stringify(createSeasonObj));
      seasonObj['created_datetime'] = new Date();
      seasonObj['created_uid'] = createSeasonObj.auth_uid;
      seasonObj['updated_datetime'] = new Date();
      seasonObj['updated_uid'] = '';

      delete seasonObj.auth_uid;

      const seasonStartDate = new Date(createSeasonObj.season_start_date);
      const seasonEndDate = new Date(createSeasonObj.season_end_date);
      seasonObj['season_start_date'] = seasonStartDate;
      seasonObj['season_end_date'] = seasonEndDate;
      seasonObj['isUsed'] = false;
      seasonObj['season'] = createSeasonObj.season_name + " | " + moment(seasonStartDate).format('MMMM DD, YYYY').toString() + " to " + moment(seasonEndDate).format('MMMM DD, YYYY').toString();
      // const getSeasonList = await this.adminref.collection('/organization').doc(createSeasonObj.organization_id).collection('/sports')
      //   .doc(createSeasonObj.sports_id).collection('/seasons').where('season_end_date', '>', seasonStartDate).get();
      let sportUsedFromOrg= await this.adminref.collection('/organization').doc(createSeasonObj.organization_id).get();     
      let governingObject:any={
        governing_body_info:''
      }     
      if(sportUsedFromOrg.exists){
       let changekeyName = sportUsedFromOrg.data().governing_body_info;
       for(let sportChange of changekeyName){
         if(sportChange.sport_id === createSeasonObj.sports_id){
          sportChange.is_used = true
         }
       }
       governingObject.governing_body_info= changekeyName;   
       await this.adminref.collection('/organization').doc(createSeasonObj.organization_id).update(governingObject);
      }
      const getSeasonList = await this.adminref.collection('/seasons').where('organization_id', '==', createSeasonObj.organization_id).where('sports_id', '==', createSeasonObj.sports_id).get();
      let getallseasonlist = await getSeasonList.docs.map((doc: any) => doc.data());
      for (let currentseasondata of getallseasonlist) {
        if (!((seasonStartDate < currentseasondata.season_start_date.toDate() || currentseasondata.season_end_date.toDate() < seasonStartDate) &&
          (seasonEndDate < currentseasondata.season_start_date.toDate() || currentseasondata.season_end_date.toDate() < seasonEndDate))) {
          return {
            "status": false,
            "error": "Season dates cannot overlap existing season."
          }
        }

        if (((seasonStartDate < currentseasondata.season_start_date.toDate() && seasonStartDate < currentseasondata.season_end_date.toDate()) &&
          (seasonEndDate > currentseasondata.season_start_date.toDate() && seasonEndDate > currentseasondata.season_end_date.toDate()))) {
          return {
            "status": false,
            "error": "Season dates cannot overlap existing season."
          }
        }
      }

      const getSeasonRef = await this.adminref.collection('/seasons');
      if (seasonStartDate.getTime() < seasonEndDate.getTime()) {
        // Insert obj into the Season collection
        const insertSeason = await getSeasonRef.add(seasonObj);
        // Mapping and merge the season_Id from the response
        const insertedObj = await insertSeason.set({ season_id: insertSeason.id }, { merge: true });
        // adminref.collection(collectionName).doc(id).set(obj, { merge: true });
        return {
          "status": true,
          "data": insertedObj,
          'message': "Season created successfully."
        };
      } else {
        return {
          "status": false,
          "error": "Season dates cannot overlap existing season."
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }
  }

  async getSeasonById(seasonObj: any) {
    try {
      const getSeasonList = await this.adminref.collection('/seasons').doc(seasonObj.season_id).get();

      if (getSeasonList.exists) {
        return {
          "status": true,
          "data": getSeasonList.data()
        }
      } else {
        return {
          "status": false,
          "data": []
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }
  }

  async updateSeason(updateSeasonObj: any) {
    try {
      let hasSeasonMapped: any = await this.adminref.collection('/seasons').doc(updateSeasonObj.season_id).get();

      if (hasSeasonMapped.exists) {
        if (hasSeasonMapped.data().isUsed)
        {
          return {
            "status": false,
            "error": "Cannot update the season. This has been tied up with teams."
          }
      } 
      else {
        const seasonObj = JSON.parse(JSON.stringify(updateSeasonObj));
        seasonObj['updated_datetime'] = new Date();
        seasonObj['updated_uid'] = updateSeasonObj.auth_uid;
        delete seasonObj.auth_uid; delete seasonObj.organization_id;
        const seasonStartDate = new Date(updateSeasonObj.season_start_date);
        const seasonEndDate = new Date(updateSeasonObj.season_end_date);
        seasonObj['season_start_date'] = seasonStartDate;
        seasonObj['season_end_date'] = seasonEndDate;
        seasonObj['season'] = updateSeasonObj.season_name + " | " + moment(seasonStartDate).format('MMMM DD, YYYY').toString() + " to " + moment(seasonEndDate).format('MMMM DD, YYYY').toString();


        const getSeasonList = await this.adminref.collection('/seasons').where('organization_id', '==', updateSeasonObj.organization_id).where('sports_id', '==', updateSeasonObj.sports_id).get();
        let getallseasonlist = await getSeasonList.docs.map((doc: any) => doc.data());
        for (let currentseasondata of getallseasonlist) {
          if (currentseasondata.season_id !== updateSeasonObj.season_id) {
            if (!((seasonStartDate < currentseasondata.season_start_date.toDate() || currentseasondata.season_end_date.toDate() < seasonStartDate) &&
              (seasonEndDate < currentseasondata.season_start_date.toDate() || currentseasondata.season_end_date.toDate() < seasonEndDate))) {
              return {
                "status": false,
                "error": "Season dates cannot overlap existing season."
              }
            }

            if (((seasonStartDate < currentseasondata.season_start_date.toDate() && seasonStartDate < currentseasondata.season_end_date.toDate()) &&
              (seasonEndDate > currentseasondata.season_start_date.toDate() && seasonEndDate > currentseasondata.season_end_date.toDate()))) {
              return {
                "status": false,
                "error": "Season dates cannot overlap existing season."
              }
            }
          }
        }
        let seasonMainUpdate: any = await this.adminref.collection('/seasons').doc(updateSeasonObj.season_id);
        if (seasonStartDate.getTime() < seasonEndDate.getTime()) {
          // Update obj into the Season collection
          await seasonMainUpdate.update(seasonObj);
          await this.generateKeywords(seasonObj);
          return {
            "status": true,
            "data": "Season updated successfully."
          }
        } else {
          return {
            "status": false,
            "error": "Season end date cannot be before season start date"
          }
        }
      }

      }
      else {
        return {
          "status": false,
          "error": "Invalid Season ID."
        }
      }
      
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }
  }

  createKeywords(name: any) {

    const arrName: any = [];
    let curName = '';
    if (name === "" || name === null || name === undefined || name === "undefined" || name === '') {
      arrName.push(null);
      arrName.push("");
    } else {
      let str = name.toLowerCase();
      let str1 = name.toLowerCase();
      str = str.split('');
      for (let letter of str) {
        curName += letter;
        arrName.push(curName);
      }

      let arrayValues = str1.split(" ");
      for (let index of arrayValues) {
        let curNameArr = '';
        index = index.split('');
        for (let lett of index) {
          curNameArr += lett;
          arrName.push(curNameArr);
        }
      }
    }
    return arrName;
  }


  // generate keywords for search
  async generateKeywords(userData: any) {
    try {

      const keywordForSportName = this.createKeywords(`${userData.sports_name}`);
      const keywordForSeasonName = this.createKeywords(`${userData.season_name}`);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      let seasonStDateString = userData.season_start_date;
      const startMonth = months[seasonStDateString.getMonth()];
      const startYear = seasonStDateString.getFullYear();
      let startDate = seasonStDateString.getDate();
      const formatedStartDate = startMonth + " " + startYear + ", " + startDate;
      const keywordForSeasonStartDate = this.createKeywords(`${formatedStartDate}`);

      let seasonEdDateString = userData.season_end_date;
      const endMonth = months[seasonEdDateString.getMonth()];
      const endYear = seasonEdDateString.getFullYear();
      let endDate = seasonEdDateString.getDate();
      const formatedendDate = endMonth + " " + endYear + ", " + endDate;
      const keywordForSeasonEndDate = this.createKeywords(`${formatedendDate}`);
      const keywords = [
        ...new Set([
          '',
          ...keywordForSeasonEndDate,
          ...keywordForSportName,
          ...keywordForSeasonStartDate,
          ...keywordForSeasonName,
        ])
      ];
      await this.adminref.collection('/seasons').doc(userData.season_id).set({
        keywords: keywords}, { merge: true });
      return true;
    } catch (err) {
      console.log(err);
      return true
    }
  }

  async getGridResponseForSeason(seasonGridResponseObj: any) {
    try {
      if (!seasonGridResponseObj.itemPerPage) { seasonGridResponseObj.itemPerPage = 10; }
      let CollectionRef: any;
      let totalRecord: any;

      if (!seasonGridResponseObj.sports_id) {
        CollectionRef = await this.adminref.collection('/seasons').where('organization_id', '==', seasonGridResponseObj.organization_id).orderBy(seasonGridResponseObj.sortingKey, seasonGridResponseObj.sortingValue);
      } else {
        CollectionRef = await this.adminref.collection('/seasons').where('organization_id', '==', seasonGridResponseObj.organization_id).where('sports_id', "==", seasonGridResponseObj.sports_id)
          .orderBy(seasonGridResponseObj.sortingKey, seasonGridResponseObj.sortingValue);
      }
      if (seasonGridResponseObj.searchKey && seasonGridResponseObj.searchVal) {
        CollectionRef = await CollectionRef.where(seasonGridResponseObj.searchKey, 'array-contains', seasonGridResponseObj.searchVal)
      }

      if (seasonGridResponseObj.isPrevReq) {
        totalRecord = await CollectionRef.get();
        CollectionRef = await CollectionRef.startAt(seasonGridResponseObj.prevStartAt).limit(seasonGridResponseObj.itemPerPage).get();
      } else if (seasonGridResponseObj.isNextReq) {
        totalRecord = await CollectionRef.get();
        CollectionRef = await CollectionRef.startAfter(seasonGridResponseObj.nextStartAt).limit(seasonGridResponseObj.itemPerPage).get();
      } else {
        totalRecord = await CollectionRef.get();
        CollectionRef = await CollectionRef.limit(seasonGridResponseObj.itemPerPage).get();

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
    } catch (error) {

      console.log(error);
      return { 'status': false, 'error': error.message }
    }
  }
}
