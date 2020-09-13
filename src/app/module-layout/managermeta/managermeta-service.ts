import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
// const admin = require('firebase-admin');
// import * as admin from "firebase-admin";

import { RestApiService } from '../../shared/rest-api.services';
import { get } from 'lodash';

@Injectable({
    providedIn: 'root'
})

export class ManagerMetaService {
  
    adminref: any = firebase.firestore();
    value: any = [];

    uid: any;
    orgId: any;

  public _managers = new BehaviorSubject<any[]>([]);
  public dataStore:{ managers: any } = { managers: [] };
  readonly connections = this._managers.asObservable();

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
        if(this.orgId=='') {
        Metaurl='managercustomfield';
        } else {
        Metaurl='managercustomfieldbyorg/'+this.orgId;
        }
        console.log('Metaurl',Metaurl);
        this.managersList(Metaurl);
        //this.getCountryCodeListAPI('countries');
        if(this.orgId=='') {
        Metaurl='sports';
        } else {
        Metaurl='organizationsports/'+this.orgId;
        }
        this.getSportsListAPI(Metaurl);
        //this.getSportsListAPI('sports');
        
     }

     

   private handleError(error: HttpErrorResponse) {
    const message = get(error, 'message') || 'Something bad happened; please try again later.';
    return throwError(message);
  }
  
  managersList( url ){
    this.restApiService.lists(url).subscribe((data: any) => {
      //console.log('---data----', data)
      this.dataStore.managers = data.reverse();
      this._managers.next(Object.assign({}, this.dataStore).managers);
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


    async getManagerCustomFielddata(queryObjs: any) {
        try {
            // Validating payload using joi
            const validateSchema = queryObjs;
            const pageNo = validateSchema.page_no;
            let itemPerPage = validateSchema.item_per_page;
            // const startFrom = (pageNo - 1) * itemPerPage;
            if (!itemPerPage) { itemPerPage = 10; }
            let getAllmanagerfield: any;
            let totalmanagerfield: any;
            // data fetching                      
            if (validateSchema.sport_id) {
                getAllmanagerfield = await this.adminref.collection('managercustomfield').where('organization_id', '==', validateSchema.organization_id).where('sport_id', '==', validateSchema.sport_id);
            } else {
                getAllmanagerfield = await this.adminref.collection('managercustomfield').where('organization_id', '==', validateSchema.organization_id);
            }

            if (validateSchema.searchKey && validateSchema.searchVal) {
                getAllmanagerfield = await getAllmanagerfield.where(validateSchema.searchKey, 'array-contains', validateSchema.searchVal.toLowerCase());
            }
            totalmanagerfield = getAllmanagerfield;
            if (validateSchema.isPrevReq) {

                getAllmanagerfield = await getAllmanagerfield.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).startAt(validateSchema.prevStartAt).limit(validateSchema.item_per_page).get();
            } else if (validateSchema.isNextReq) {
                getAllmanagerfield = await getAllmanagerfield.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).startAfter(validateSchema.nextStartAt).limit(validateSchema.item_per_page).get();
            } else {
                getAllmanagerfield = await getAllmanagerfield.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).limit(validateSchema.item_per_page).get();
            }
            totalmanagerfield = await totalmanagerfield.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).get();
            if (getAllmanagerfield.size) {
                let getAllPlayermetaData = await getAllmanagerfield.docs.map((doc: any) => doc.data());
                return {
                    status: true,
                    data: getAllPlayermetaData,
                    snapshot: getAllmanagerfield,
                    totalRecords: totalmanagerfield.size || 0
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
    async CreateManagerCustomField(insertObjs: any) {
        try {
            this.value = [];
            if ( insertObjs.field_type !== null && insertObjs.field_type !== "Text Field")
            {
                insertObjs['value'].forEach(value => {
                    this.value.push(value.optionvalue);
                  })
                  if (this.value.length === 0)
                  {
                    return {
                        "status": false,
                        "error": "Please add field options"
                    }
                  }
            }
            else
            {
                this.value.push(insertObjs.singlevalue)
            }
            let insertObj = {
                "organization_id": insertObjs.organization_id || "",
                "sport_id": insertObjs.sport_id,
                "sport": insertObjs.sport_name,
                "field_name": insertObjs.field_name,
                "field_type": insertObjs.field_type,
                "value": this.value,
                "is_deletable": insertObjs.is_deletable,
                "is_editable": insertObjs.is_editable,
                "is_required": insertObjs.is_required,
                "created_datetime": new Date(),
                "created_uid": insertObjs.auth_uid,
                "updated_datetime": new Date(),
                "updated_uid": "",
                "is_active": false,
                "is_deleted": false,
            }
            let getLevelList: any = await this.adminref.collection('/managercustomfield').where('organization_id', '==', insertObjs.organization_id).where('sport_id', '==', insertObjs.sport_id)
                // .where('is_deleted', '==', false)
                .where('field_name', 'in', [insertObjs.field_name, insertObjs.field_name.toLowerCase(), insertObjs.field_name.toUpperCase()]).get();
            if (getLevelList.size) {
                return {
                    "status": false,
                    "error": "Field Name already exist!"
                }
            }
            let sportUsedFromOrg = await this.adminref.collection('/organization').doc(insertObjs.organization_id).get();
            let governingObject: any = {
                governing_body_info: ''
            }
            if (sportUsedFromOrg.exists) {
                let changekeyName = sportUsedFromOrg.data().governing_body_info;
                if(changekeyName)
                {

                    for (let sportChange of changekeyName) {
                        if (sportChange.sport_id === insertObjs.sport_id) {
                            sportChange.is_used = true
                        }
                    }
                    
                governingObject.governing_body_info = changekeyName;
                await this.adminref.collection('/organization').doc(insertObjs.organization_id).update(governingObject);
                }
            }
            let createObjRoot: any = await this.adminref.collection('/managercustomfield').add(insertObj);
            await createObjRoot.set({ field_id: createObjRoot.id }, { merge: true });
            return { "status": true, "data": "Custom Field created successfully." };
        } catch (err) {
            return {
                "status": false,
                "error": err.message
            };
        }
    }

    async getManagerfieldById(playermetaObj: any) {
        try {
            let getplayerfieldById: any = await this.adminref.collection('/managercustomfield').doc(playermetaObj.field_id).get();
            if (getplayerfieldById.exists) {
                return { "status": true, "data": getplayerfieldById.data() };
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

    async updateManagerfield(updateplayermetaObj: any) {
        try {
            let playerfieldDoc: any = await this.adminref.collection('/managercustomfield').doc(updateplayermetaObj.field_id);

            let isplayerfieldExist: any = await playerfieldDoc.get();
            if (isplayerfieldExist.exists) {
                this.value = [];
                if ( updateplayermetaObj.field_type !== null && updateplayermetaObj.field_type !== "Text Field")
                {
                    updateplayermetaObj['value'].forEach(value => {
                        this.value.push(value.optionvalue);
                      })
                      if (this.value.length === 0)
                      {
                        return {
                            "status": false,
                            "error": "Please add field options"
                        }
                      }
                }
                else
                {
                    this.value.push(updateplayermetaObj.singlevalue)
                }
                let updateObj = {
                    "sport_id": updateplayermetaObj.sport_id,
                    "sport": updateplayermetaObj.sport,
                    "field_name": updateplayermetaObj.field_name,
                    "field_type": updateplayermetaObj.field_type,
                    "value": this.value,
                    "is_deletable": updateplayermetaObj.is_deletable,
                    "is_editable": updateplayermetaObj.is_editable,
                    "is_required": updateplayermetaObj.is_required,
                    "updated_datetime": new Date(),
                    "updated_uid": updateplayermetaObj.auth_uid
                }
                let playerfieldInfo: any = await isplayerfieldExist.data();
                if (!playerfieldInfo.is_active) {
                    let getplayerfieldList: any = await this.adminref.collection('/managercustomfield').where('field_name', 'in', [updateplayermetaObj.field_name, updateplayermetaObj.field_name.toLowerCase(), updateplayermetaObj.field_name.toUpperCase()])
                        .get();
                    if (getplayerfieldList.docs.length) {
                        getplayerfieldList = getplayerfieldList.docs.map((doc: any) => doc.id);
                        if (!getplayerfieldList.includes(updateplayermetaObj.field_id)) {
                            return {
                                "status": false,
                                "message": "Field Name alreay exist."
                            }
                        } else {

                            await playerfieldDoc.update(updateObj);
                            // await this.generateKeywordsForLevel(updateLevelObj);
                            return {
                                "status": true,
                                "message": "Custom Field updated successfully."
                            }
                        }
                    } else {
                        await playerfieldDoc.update(updateObj);
                        // await this.generateKeywordsForLevel(updateLevelObj)
                        return {
                            "status": true,
                            "message": "Custom Field updated successfully."
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
                    "message": "Custom Field is not available."
                }
            }

        } catch (error) {
            return {
                "status": false,
                "message": error.message
            }
        }
    }

    async deleteManagerfield(data: any) {
        try {
            let playerfieldDoc: any = await this.adminref.collection('/managercustomfield').doc(data.field_id).get();

            if (playerfieldDoc.exists) {
                await this.adminref.collection('/managercustomfield').doc(data.field_id).delete();
                return {
                    "status": true,
                    "message": "Custom Field has been deleted successfully."
                }
            } else {
                return {
                    "status": false,
                    "message": "Manager Field is not available."
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
    
    // async  generateKeywordsForLevel(userData: any) {
    //     try {
    //         const keywordForLevelName = this.createKeywords(`${userData.level_name}`);
    //         const keywordForSportName = this.createKeywords(`${userData.sport_name}`);
    //         const keywordForDesc = this.createKeywords(`${userData.description}`);
    //         let keywordForAlternateName: any;
    //         let keywordForAlternateAbbre: any;
    //         const keywordForAbbre = this.createKeywords(`${userData.abbreviation}`);
    //         if (userData.alternate_level_name) {
    //             keywordForAlternateName = this.createKeywords(`${userData.alternate_level_name}`);
    //         }
    //         if (userData.alternate_abbreviation) {
    //             keywordForAlternateAbbre = this.createKeywords(`${userData.alternate_abbreviation}`);
    //         }
    //         const keywords = [
    //             ...new Set([
    //                 '',
    //                 ...keywordForLevelName,
    //                 ...keywordForSportName,
    //                 ...keywordForDesc,
    //                 ...keywordForAbbre
    //             ])
    //         ];
    //         await this.adminref.collection('/levels').doc(userData.level_id).set({
    //             keywords: keywords}, { merge: true });
    //         return true;


    //     } catch (err) {
    //         console.log(err);
    //         return true;
    //     }
    // }
    // createKeywords(name: any) {
    //     const arrName: any = [];
    //     let curName = '';
    //     if (name === "" || name === null || name === undefined || name === "undefined" || name === '') {
    //         arrName.push(null);
    //         arrName.push("");
    //     } else {
    //         const str = name.toLowerCase();
    //         str.split('').forEach((letter: any) => {
    //             curName += letter;
    //             arrName.push(curName);
    //         });
    //         let arrayValues = str.split(" ");
    //         for (let index of arrayValues) {
    //             let curNameArr = '';
    //             index.split('').forEach((letter: any) => {
    //                 curNameArr += letter;
    //                 arrName.push(curNameArr);
    //             });
    //         }
    //     }

    //     return arrName;
    // }

}