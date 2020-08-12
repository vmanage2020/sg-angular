import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
// const admin = require('firebase-admin');
@Injectable({
  providedIn: 'root'
})
export class SportsCrudService {
  adminref: any = firebase.firestore();
  constructor(private titlecasePipe: TitleCasePipe, ) { }


  /*Create Sport*/
  async createSport(createSportObj: any) {

    try {
      if (!createSportObj.name) {
        return { 'status': false, 'message': 'Name is required.' }
      } else if (!createSportObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else {
        let uniqueSportName: any = createSportObj.name.toLowerCase();
        let sportName: any = createSportObj.name.toLowerCase();
        uniqueSportName = uniqueSportName.split(' ').join('_');
        const created = new Date().toISOString();;
        const sportObj = {
          'sport_id': '',
          'name': this.titlecasePipe.transform(sportName),
          'sport': this.titlecasePipe.transform(sportName),
          'created_date': created,
          'created_uid': createSportObj.uid,
          'created_datetime': created,
          'updated_uid': '',
          'updated_datetime': '',
          'country_code': createSportObj.country_code,
          'country': createSportObj.country,
          'isUsed': false
        }
        //Check if Sport already Exist

        let sportAlreadyExist = await this.adminref.collection('/sports').where('sport', 'in', [sportObj.name, sportObj.name.toLowerCase(), sportObj.name.toUpperCase()]).get();
        if (sportAlreadyExist.size) {
          return { 'status': false, 'message': 'Sport is already exist.' }
        } else {
          //Create Sport

          let createSport: any = await this.adminref.collection('/sports').add(sportObj);          
          createSport.set({sport_id: createSport.id}, { merge: true })
          return { 'status': true, 'message': 'Sport created successfully.' }          
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async getSportById(getSportObj: any) {

    try {
      if (!getSportObj.sport_id) {
        return { 'status': false, 'message': 'Sport Id is required.' }
      } else if (!getSportObj.uid) {
        return { 'status': false, 'message': 'Sport Id is required.' }
      } else {
        let sportRecordById: any = await this.adminref.collection('/sports').doc(getSportObj.sport_id).get();
        if (sportRecordById.exists) {
          console.log(sportRecordById.data());
          return { 'status': true, 'message': 'Sports Details', 'data': sportRecordById.data() }
        } else {
          return { 'status': false, 'message': 'Record not available' }
        }
      }

    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async updateSport(updateSportObj: any) {
    try {
      if (!updateSportObj.sport_id) {
        return { 'status': false, 'message': 'Sport Id is required.' }
      } else if (!updateSportObj.name) {
        return { 'status': false, 'message': 'Sport Name is required.' }
      } else if (!updateSportObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else {

        let sportName = updateSportObj.name.toLowerCase();
        sportName = this.titlecasePipe.transform(sportName);
        const updated = new Date();
        let updateSport: any = await this.adminref.collection('/sports').doc(updateSportObj.sport_id).get();
        if (updateSport.exists) {
          if (updateSport.data().isUsed)
          {
            return { 'status': false, 'message': "Can't able to update. Sports is mapped with another Organization." }
          }
          else
          {
            let sportAlreadyExist = await this.adminref.collection('/sports').where('sport', 'in', [sportName, sportName.toLowerCase(), sportName.toUpperCase()]).get();
            if (sportAlreadyExist.size) {
              return { 'status': false, 'message': 'Sport is already exist.' }
            }else{
              await updateSport.ref.update({ name: sportName, sport: sportName, updated_datetime: updated, updated_uid: updateSportObj.uid, 
                country_code: updateSportObj.country_code,
                country: updateSportObj.country,  });
              let obj = {
                name: sportName, sport: sportName, created_datetime: updateSportObj.created_datetime,country: updateSportObj.country
              }
              await this.generateKeywords(obj, updateSport);
              return { 'status': true, 'message': 'Sport Updated Successfully.' }
            }           
          }         
        } else {
          return { 'status': false, 'message': 'Record not available.' }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
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

  // generate keywords for search
  async generateKeywords(userData: any, snapshot: any) {
    try {
      const keywordForSportName = this.createKeywords(`${userData.name}`);
      let dateString = userData.created_datetime.toDate();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      console.log(dateString.getMonth());
      const month = months[dateString.getMonth()];
      const year = dateString.getFullYear();
      // dt = new Date(dt);
      let date = dateString.getDate();
      console.log(date);
      console.log(month);
      console.log(year);
      const formatedDate = month + " " + date + ", " + year;
      console.log(formatedDate);
      const keywordForDate = this.createKeywords(`${date}`);
      const keywordForYear = this.createKeywords(`${year}`);
      const keywordForMonth = this.createKeywords(`${month}`);
      const keywordForCountry = this.createKeywords(`${userData.country}`);
      const keywords = [
        ...new Set([
          '',
          formatedDate,
          ...keywordForSportName,
          ...keywordForDate,
          ...keywordForYear,
          ...keywordForMonth,
          ...keywordForCountry
        ])
      ];

      const keywordForDateTime = [
        ...new Set([
          '',
          formatedDate,
          ...keywordForDate,
          ...keywordForYear,
          ...keywordForMonth,
        ])
      ];
      await snapshot.ref.set({ keywords: keywords}, { merge: true });
      return true;
    } catch (err) {
      console.log(err);

      return true
    }
  }
  async getSportsListForGrid(sportslistObj: any) {
    try {
      let sportData: any;
      if (!sportslistObj.item_per_page) { sportslistObj.item_per_page = 10; }
      if (!sportslistObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else {
        if (sportslistObj.searchKey && sportslistObj.searchVal) {
          sportData = await this.adminref.collection('/sports').where(sportslistObj.searchKey, 'array-contains', sportslistObj.searchVal)
            .orderBy(sportslistObj.sortingKey, sportslistObj.sortingValue);
        } else {
          sportData = await this.adminref.collection('/sports').orderBy(sportslistObj.sortingKey, sportslistObj.sortingValue);
        }
        let totalRecords: any;
        totalRecords = await sportData.get();
        console.log(totalRecords);

        // let sportData: any = await this.adminref.collection('/sports').orderBy('created_datetime', 'desc').get();
        if (sportslistObj.isNextReq) {
          sportData = await sportData.startAfter(sportslistObj.nextStartAt).limit(sportslistObj.item_per_page).get();
        } else if (sportslistObj.isPrevReq) {
          sportData = await sportData.startAt(sportslistObj.prevStartAt).limit(sportslistObj.item_per_page).get();
        } else {
          sportData = await sportData.limit(sportslistObj.item_per_page).get();
        }
        if (sportData.size) {
          let sportDataRefData = await sportData.docs.map((doc: any) => doc.data());

          let allSportsObj: any = {
            "item_per_page": sportslistObj.item_per_page,
            "total_items": totalRecords.size,
            "data": sportDataRefData,
            'snapshot': sportData,
          }
          return { 'status': true, 'message': 'Sports List Informations', 'data': allSportsObj }
        }
        else {
          let allSportsObj: any = {
            "item_per_page": sportslistObj.item_per_page,
            "total_items": 0,
            "data": []
          }
          return { 'status': true, 'message': 'Sports List Informations', 'data': allSportsObj }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }
}
