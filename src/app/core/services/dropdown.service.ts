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
export class DropdownService {

  adminref: any = firebase.firestore();
  constructor(private titlecasePipe: TitleCasePipe, ) { }



  // css applied common for all notification with error message

  getNotificationForError() {
    var arr = Array.from(document.getElementsByClassName('ngi-notification-wrapper') as HTMLCollectionOf<HTMLElement>);
    for (let i = 0; i < arr.length; i++) {
      arr[i].style.setProperty("background", "#f1556c", "important");
      arr[i].style.setProperty("color", "white", "important");
    }
  }

  //Get All Sports irrespective to organization
  async getAllSportsGeneral(obj: any) {
    try {
      if (!obj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      }
      else if (!obj.country_code) {
        return { 'status': false, 'message': 'Country code is required.' }
      } else {
        let sportList: any = await this.adminref.collection('/sports').where('country_code', '==', obj.country_code).where('sport_id', '>', '').get();
        return { 'status': true, 'message': 'Get Sports Information List', 'data': sportList.docs.map(doc => doc.data()) }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }
  
  //Get All Sports irrespective to organization for Meta data
  async getAllSportsmetaGeneral(obj: any) {
    try {
      if (!obj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else {
        let sportList: any = await this.adminref.collection('/sports').where('sport_id', '>', '').get();
        return { 'status': true, 'message': 'Get Sports Information List', 'data': sportList.docs.map(doc => doc.data()) }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }
  async getAllSports(uid: any) {
    try {
      if (!uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      }
      else {
        let sportList: any = await this.adminref.collection('/sports').where('sport_id', '>', '').get();
        return { 'status': true, 'message': 'Get Sports Information List', 'data': sportList.docs.map(doc => doc.data()) }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //Get All organizations
  async getOrganizationList() {
    try {
      let organizationList: any = [];
      let orgInfo: any = await this.adminref.collection('/organization').get();
      if (orgInfo.size) {
        organizationList = await orgInfo.docs.map((doc: any) => doc.data());
        return { 'status': true, 'message': 'Organization List info', 'data': organizationList }
      }
      else {
        return { 'status': false, 'message': 'Organization List info', 'data': [] }
      }

    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async getOrganizationDetailsById(orgId: any) {
    try {
      let organizationDetails: any = [];
      let orgInfo: any = await this.adminref.collection('/organization').where('organization_id', "==", orgId).get();
      if (orgInfo.size) {
        organizationDetails = await orgInfo.docs.map((doc: any) => doc.data());
        return { 'status': true, 'message': 'Organization List info', 'data': organizationDetails }
      }
      else {
        return { 'status': true, 'message': 'Organization List info', 'data': [] }
      }

    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //Get All States
  async getAllStates() {
    try {
      let statesListInfo: any = [];

      let stateInfo: any = await this.adminref.collection('/states').get(); //where('condition', '==', 'true')
      if (stateInfo.size) {
        statesListInfo = await stateInfo.docs.map((doc: any) => doc.data());
        return { 'status': true, 'message': 'States List info', 'data': statesListInfo }
      }
      else {
        return { 'status': true, 'message': 'States List info', 'data': [] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //Get All Country
  async getAllCountry() {
    try {
      let countriesList: any = [];
      let countryInfo: any = await this.adminref.collection('/countries').get(); //where('condition', '==', 'true')
      if (countryInfo.size) {
        countriesList = await countryInfo.docs.map((doc: any) => doc.data());
        return { 'status': true, 'message': 'Country List info', 'data': countriesList }
      }
      else {
        return { 'status': true, 'message': 'Country List info', 'data': [] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  // Get season dropdown
  async getSeasondropdownForGrid() {
    try {
      let seasonList: any = [];
      let seasonInfo: any = await this.adminref.collection('/seasonDropdownInGrid').get(); //where('condition', '==', 'true')
      if (seasonInfo.size) {
        seasonList = await seasonInfo.docs.map((doc: any) => doc.data());
        return { 'status': true, 'message': 'Season List info', 'data': seasonList }
      }
      else {
        return { 'status': true, 'message': 'Season List info', 'data': [] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //Get State Governing body organization
  async getAllStateGoverningBody(stateGoverningObj: any) {
    try {
      if (!stateGoverningObj.state) {
        return { 'status': false, 'message': 'State is required.' }
      } else if (!stateGoverningObj.country) {
        return { 'status': false, 'message': 'Country is required.' }
      } else {
        let queryStr = "true_" + stateGoverningObj.state + "_" + stateGoverningObj.sport_id;
        let usersInfo: any = await this.adminref.collection('/organization').where('governing_key_array_fields', "array-contains", queryStr).get();
        return { 'status': true, 'message': 'State Goverment List info', 'data': usersInfo.size ? await usersInfo.docs.map((doc: any) => doc.data()) : [] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //Get National Governing body organization
  async getAllNationalGoverningBody(nationalGoverningObj: any) {
    try {
      if (!nationalGoverningObj.country) {
        return { 'status': false, 'message': 'Country is required.' }
      } else if (!nationalGoverningObj.sport_id) {
        return { 'status': false, 'message': 'Sport name is required.' }
      } else {
        let queryStr = "true_" + nationalGoverningObj.country + "_" + nationalGoverningObj.sport_id;
        let usersInfo: any = await this.adminref.collection('/organization').where('governing_key_array_fields', "array-contains", queryStr).get();
        return { 'status': true, 'message': 'National Goverment List info', 'data': usersInfo.size ? await usersInfo.docs.map((doc: any) => doc.data()) : [] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  // Get Sports By Organization
  async getSportsByOrganization(sportInfoForOrganizationObj: any) {
    try {

      const getSportsList = await this.adminref.collection('/organization').doc(sportInfoForOrganizationObj.organization_id).get();
      //.collection('/sports').where("isDeleted", "==", false).where("organization_id", "==", sportInfoForOrganizationObj.organization_id).orderBy('name').get();

      if (getSportsList.exists) {
        let sports_id = getSportsList.data().sports
        const getsportsarray = await this.adminref.collection('/sports').where("sport_id", "in", sports_id).get()
        if (getsportsarray.docs.length) {
          return {
            "status": true,
            "data": getsportsarray.docs.map((doc: any) => doc.data())
          }
        }
        else {
          return {
            "status": false,
            "error": "Sports not available"
          }
        }
      } else {
        return {
          "status": false,
          "error": "Organization not available"
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //  Get PositionList for parent list dropdown
  async getParentPositionList(positionObj: any) {
    try {
      if (!positionObj.uid) {
        return { 'status': false, 'message': 'Uid is required.' }
      } else if (!positionObj.sport_id) {
        return { 'status': false, 'message': 'Sport Id is required.' }
      } else {
        let positionReference: any = await this.adminref.collection('/positions').where('sport_id', '==', positionObj.sport_id).get();
        if (positionReference.size) {
          return { 'status': true, 'message': 'Position List Informations', 'data': positionReference.docs.map(doc => doc.data()) }
        } else {
          return { 'status': true, 'message': 'Position List Informations', 'data': [] }
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  // Get Level Dropdown
  async getLevelDropdown(levelDropdownObj: any) {
    try {
      let saveLevel: any = await this.getLevel(levelDropdownObj, this.adminref);
      if (saveLevel.data) {
        return { 'status': true, 'message': saveLevel.data }
      } else {
        return { 'status': false, 'message': saveLevel.error }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  // Set Season By organization and sport
  async getSeasonDropdown(seasondropdownObj: any) {
    try {
      const currentDate = new Date();
      const getSeasonList = await this.adminref.collection('/seasons').where('season_end_date', '>=', currentDate).where("organization_id", "==", seasondropdownObj.organization_id).where("sports_id", "==", seasondropdownObj.sport_id).get();
      if (getSeasonList.docs.length) {
        // sorting by name
        return {
          "status": true,
          "data": getSeasonList.docs.map((doc: any) => doc.data())
        }
      } else {
        return {
          "status": false,
          "message": "Seasons not available."
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  // Set Position By organization and sport
  async getPositionDropdown(positiondropdownObj: any) {
    try {
      const getPositionList = await this.adminref.collection('/positions').where("sport_id", "==", positiondropdownObj.sport_id).get();

      if (getPositionList.docs.length) {
        return {
          "status": true,
          "data": getPositionList.docs.map((doc: any) => doc.data())
        }
      } else {
        return {
          "status": false,
          "error": "Positions not available"
        }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  //Get All roles

  async getRoles() {
    try {
      const rolesListInfo: any = [];
      let roleInfo: any = await this.adminref.collection('/roles').get();
      if (roleInfo.size) {
        return { 'status': true, 'message': 'Roles List info', 'data': await roleInfo.docs.map((doc: any) => doc.data()) }
      } else {
        return { 'status': false, 'message': 'Roles List info', 'data': [] }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }



  // common function call for level
  async getLevel(levelObj: any, adminref: any) {
    try {

      // paginattion

      // data fetching
      let role = levelObj.role_id.toLowerCase();
      if (role === 'admin' || role === 'sys-admin') {
        let getAllLevelWithLimit = await adminref.collection('/levels').where("organization_id", "==", levelObj.organization_id)
          .where("is_deleted", "==", false).where("sport_id", "==", levelObj.sport_id).get();
        return { "status": true, "data": getAllLevelWithLimit.size ? await getAllLevelWithLimit.docs.map((doc: any) => doc.data()) : [] };
      } else {
        return { "status": false, "error": "Access denied for this request" }
      }

    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

}
