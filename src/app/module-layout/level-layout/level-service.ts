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
export class LevelService {
  adminref: any = firebase.firestore();
  
  uid: any;
  orgId: any;

  public _levels = new BehaviorSubject<any[]>([]);
  public dataStore:{ levels: any } = { levels: [] };
  readonly connections = this._levels.asObservable();

  public _sports = new BehaviorSubject<any[]>([]);
  public sportsdataStore:{ sports: any } = { sports: [] };
  readonly sportsconnections = this._sports.asObservable();

  public _country = new BehaviorSubject<any[]>([]);
  public countrydataStore:{ country: any } = { country: [] };
  readonly connections1 = this._country.asObservable();

    constructor(private titlecasePipe: TitleCasePipe, private restApiService: RestApiService ) { 
        this.orgId = localStorage.getItem('org_id');
        console.log('orgId',this.orgId);
        let Metaurl= '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='levels';
        } else {
        Metaurl='levelsbyorg/'+this.orgId;
        }
        console.log('Metaurl',Metaurl);
        this.levelsList(Metaurl);
        //this.getCountryCodeListAPI('countries');
        this.getSportsListAPI('sports');
    }

    
   private handleError(error: HttpErrorResponse) {
    const message = get(error, 'message') || 'Something bad happened; please try again later.';
    return throwError(message);
  }
  
  levelsList( url ){
    this.restApiService.lists(url).subscribe((data: any) => {
      //console.log('---data----', data)
      this.dataStore.levels = data;
      this._levels.next(Object.assign({}, this.dataStore).levels);
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




 
    async getLevels(queryObjs: any) {
        try {
            // Validating payload using joi
            const validateSchema = queryObjs;
            const pageNo = validateSchema.page_no;
            let itemPerPage = validateSchema.item_per_page;
            // const startFrom = (pageNo - 1) * itemPerPage;
            if (!itemPerPage) { itemPerPage = 10; }
            let getAllLevels: any;
            let totalLevels: any;
            // data fetching                      
            if (validateSchema.sport_id) {
                getAllLevels = await this.adminref.collection('/levels').where('organization_id', '==', validateSchema.organization_id).where('sport_id', '==', validateSchema.sport_id)
                    .where('is_deleted', '==', false);
            } else {
                getAllLevels = await this.adminref.collection('/levels').where('organization_id', '==', validateSchema.organization_id).where('is_deleted', '==', false);
            }

            if (validateSchema.searchKey && validateSchema.searchVal) {
                getAllLevels = await getAllLevels.where(validateSchema.searchKey, 'array-contains', validateSchema.searchVal.toLowerCase());
            }
            totalLevels = getAllLevels;
            if (validateSchema.isPrevReq) {

                getAllLevels = await getAllLevels.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).startAt(validateSchema.prevStartAt).limit(validateSchema.item_per_page).get();
            } else if (validateSchema.isNextReq) {
                getAllLevels = await getAllLevels.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).startAfter(validateSchema.nextStartAt).limit(validateSchema.item_per_page).get();
            } else {
                getAllLevels = await getAllLevels.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).limit(validateSchema.item_per_page).get();
            }
            totalLevels = await totalLevels.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).get();
            if (getAllLevels.size) {
                let getAllLevelData = await getAllLevels.docs.map((doc: any) => doc.data());
                return {
                    status: true,
                    data: getAllLevelData,
                    snapshot: getAllLevels,
                    totalRecords: totalLevels.size || 0
                }
            } else {
                return {
                    status: false,
                    data: []
                }
            }
        } catch (err) {
            console.log(err);
            return {
                "status": false,
                "error": err.message
            };
        }
    }
    // Create Role By season for the user
    async createLevel(insertObjs: any) {
        try {
            let insertObj = {
                "organization_id": insertObjs.organization_id || "",
                "sport_id": insertObjs.sport_id,
                "sport_name": insertObjs.sport_name,
                "level_name": insertObjs.level_name,
                "abbreviation": insertObjs.abbreviation,
                "description": insertObjs.description,
                "created_datetime": new Date(),
                "created_uid": insertObjs.auth_uid,
                "updated_datetime": new Date(),
                "updated_uid": "",
                "is_active": false,
                "is_deleted": false,
            }
            let getLevelList: any = await this.adminref.collection('/levels').where('organization_id', '==', insertObjs.organization_id).where('sport_id', '==', insertObjs.sport_id)
                .where('is_deleted', '==', false).
                where('level_name', 'in', [insertObjs.level_name, insertObjs.level_name.toLowerCase(), insertObjs.level_name.toUpperCase()]).get();
            if (getLevelList.size) {
                return {
                    "status": false,
                    "error": "Level already exist!"
                }
            }
            let sportUsedFromOrg = await this.adminref.collection('/organization').doc(insertObjs.organization_id).get();
            let governingObject: any = {
                governing_body_info: ''
            }
            if (sportUsedFromOrg.exists) {
                let changekeyName = sportUsedFromOrg.data().governing_body_info;
                for (let sportChange of changekeyName) {
                    if (sportChange.sport_id === insertObjs.sport_id) {
                        sportChange.is_used = true
                    }
                }
                governingObject.governing_body_info = changekeyName;
                await this.adminref.collection('/organization').doc(insertObjs.organization_id).update(governingObject);
            }
            let createObjRoot: any = await this.adminref.collection('/levels').add(insertObj);
            await createObjRoot.set({ level_id: createObjRoot.id }, { merge: true });
            return { "status": true, "data": "Level created successfully." };
        } catch (err) {
            return {
                "status": false,
                "error": err.message
            };
        }
    }

    async getLevelById(LevelObj: any) {
        try {
            let getLevelById: any = await this.adminref.collection('/levels').doc(LevelObj.level_id).get();
            if (getLevelById.exists) {
                return { "status": true, "data": getLevelById.data() };
            } else {
                return { "status": false, "data": [] };
            }
        } catch (error) {
            return {
                "status": false,
                "error": error.message
            }

        }

    }

    async updateLevel(updateLevelObj: any) {
        try {
            let levelDoc: any = await this.adminref.collection('/levels').doc(updateLevelObj.level_id);

            let isLevelExist: any = await levelDoc.get();
            if (isLevelExist.exists) {
                updateLevelObj['updated_datetime'] = new Date();
                updateLevelObj['updated_uid'] = updateLevelObj.auth_uid;
                let levelInfo: any = await isLevelExist.data();
                if (!levelInfo.is_active) {
                    let getLevelList: any = await this.adminref.collection('/levels').where('level_name', 'in', [updateLevelObj.level_name, updateLevelObj.level_name.toLowerCase(), updateLevelObj.level_name.toUpperCase()])
                        .where('is_deleted', '==', false).get();
                    if (getLevelList.docs.length) {
                        getLevelList = getLevelList.docs.map((doc: any) => doc.id);
                        if (!getLevelList.includes(updateLevelObj.level_id)) {
                            return {
                                "status": false,
                                "message": "Level Name alreay exist."
                            }
                        } else {

                            await levelDoc.update(updateLevelObj);
                            await this.generateKeywordsForLevel(updateLevelObj);
                            return {
                                "status": true,
                                "message": "Level updated successfully."
                            }
                        }
                    } else {
                        await levelDoc.update(updateLevelObj);
                        await this.generateKeywordsForLevel(updateLevelObj)
                        return {
                            "status": true,
                            "message": "Level updated successfully."
                        }
                    }

                } else {
                    return {
                        "status": false,
                        "message": "Update failed since this level has been referred in some other module."
                    }
                }


            } else {
                return {
                    "status": false,
                    "message": "Level is not available."
                }
            }

        } catch (error) {
            return {
                "status": false,
                "message": error.message
            }
        }
    }

    async  generateKeywordsForLevel(userData: any) {
        try {
            const keywordForLevelName = this.createKeywords(`${userData.level_name}`);
            const keywordForSportName = this.createKeywords(`${userData.sport_name}`);
            const keywordForDesc = this.createKeywords(`${userData.description}`);
            let keywordForAlternateName: any;
            let keywordForAlternateAbbre: any;
            const keywordForAbbre = this.createKeywords(`${userData.abbreviation}`);
            if (userData.alternate_level_name) {
                keywordForAlternateName = this.createKeywords(`${userData.alternate_level_name}`);
            }
            if (userData.alternate_abbreviation) {
                keywordForAlternateAbbre = this.createKeywords(`${userData.alternate_abbreviation}`);
            }
            const keywords = [
                ...new Set([
                    '',
                    ...keywordForLevelName,
                    ...keywordForSportName,
                    ...keywordForDesc,
                    ...keywordForAbbre
                ])
            ];
            await this.adminref.collection('/levels').doc(userData.level_id).set({
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

    async deleteLevel(data: any) {
        try {
            let levelDoc: any = await this.adminref.collection('/levels').doc(data.level_id).get();

            if (levelDoc.exists) {
                let levelInfo: any = await levelDoc.data();
                if (!levelInfo.is_active) {
                    // await this.adminref.collection('/organization').doc(data.organization_id).
                    //     collection('/sports').doc(data.sport_id).collection('/levels').doc(data.level_id).delete();
                    await this.adminref.collection('/levels').doc(data.level_id).set({ is_deleted: true }, { merge: true })
                    return {
                        "status": true,
                        "message": "Level has been deleted successfully."
                    }
                } else {
                    return {
                        "status": false,
                        "message": "Unable to delete.The level has been tied up with team."
                    }
                }
            } else {
                return {
                    "status": false,
                    "message": "Level is not available."
                }
            }
        } catch (error) {
            console.log(error);

            return {
                "status": false,
                "message": error.message
            }
        }
    }
}
