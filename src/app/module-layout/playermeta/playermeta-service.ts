import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
// const admin = require('firebase-admin');
// import * as admin from "firebase-admin";
@Injectable({
    providedIn: 'root'
})

export class PlayerMetaService {

    constructor(private titlecasePipe: TitleCasePipe, ) { }
    adminref: any = firebase.firestore();
    value: any = [];
    async getPlayermetadata(queryObjs: any) {
        try {
            // Validating payload using joi
            const validateSchema = queryObjs;
            const pageNo = validateSchema.page_no;
            let itemPerPage = validateSchema.item_per_page;
            // const startFrom = (pageNo - 1) * itemPerPage;
            if (!itemPerPage) { itemPerPage = 10; }
            let getAllplayermeta: any;
            let totalplayermeta: any;
            // data fetching                      
            if (validateSchema.sport_id) {
                getAllplayermeta = await this.adminref.collection('playermetadata').where('organization_id', '==', validateSchema.organization_id).where('sport_id', '==', validateSchema.sport_id);
            } else {
                getAllplayermeta = await this.adminref.collection('playermetadata').where('organization_id', '==', validateSchema.organization_id).orderBy('sport_id');
            }

            if (validateSchema.searchKey && validateSchema.searchVal) {
                getAllplayermeta = await getAllplayermeta.where(validateSchema.searchKey, 'array-contains', validateSchema.searchVal.toLowerCase());
            }
            totalplayermeta = getAllplayermeta;
            if (validateSchema.isPrevReq) {

                getAllplayermeta = await getAllplayermeta.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).startAt(validateSchema.prevStartAt).limit(validateSchema.item_per_page).get();
            } else if (validateSchema.isNextReq) {
                getAllplayermeta = await getAllplayermeta.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).startAfter(validateSchema.nextStartAt).limit(validateSchema.item_per_page).get();
            } else {
                getAllplayermeta = await getAllplayermeta.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).limit(validateSchema.item_per_page).get();
            }
            totalplayermeta = await totalplayermeta.orderBy(validateSchema.sortingKey, validateSchema.sortingValue).get();
            if (getAllplayermeta.size) {
                let getAllPlayermetaData = await getAllplayermeta.docs.map((doc: any) => doc.data());
                return {
                    status: true,
                    data: getAllPlayermetaData,
                    snapshot: getAllplayermeta,
                    totalRecords: totalplayermeta.size || 0
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
    async createplayermetadata(insertObjs: any) {
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
            let getLevelList: any = await this.adminref.collection('/playermetadata').where('organization_id', '==', insertObjs.organization_id).where('sport_id', '==', insertObjs.sport_id)
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
            let createObjRoot: any = await this.adminref.collection('/playermetadata').add(insertObj);
            await createObjRoot.set({ field_id: createObjRoot.id }, { merge: true });
            return { "status": true, "data": "Custom Field created successfully." };
        } catch (err) {
            return {
                "status": false,
                "error": err.message
            };
        }
    }

    async getplayerfieldById(playermetaObj: any) {
        try {
            let getplayerfieldById: any = await this.adminref.collection('/playermetadata').doc(playermetaObj.field_id).get();
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

    async updateplayerfield(updateplayermetaObj: any) {
        try {
            let playerfieldDoc: any = await this.adminref.collection('/playermetadata').doc(updateplayermetaObj.field_id);

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
                    let getplayerfieldList: any = await this.adminref.collection('/playermetadata').where('field_name', 'in', [updateplayermetaObj.field_name, updateplayermetaObj.field_name.toLowerCase(), updateplayermetaObj.field_name.toUpperCase()])
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

    async deleteplayerfield(data: any) {
        try {
            let playerfieldDoc: any = await this.adminref.collection('/playermetadata').doc(data.field_id).get();

            if (playerfieldDoc.exists) {
                await this.adminref.collection('/playermetadata').doc(data.field_id).delete();
                return {
                    "status": true,
                    "message": "Custom Field has been deleted successfully."
                }
                
                // let levelInfo: any = await playerfieldDoc.data();
                // if (!levelInfo.is_active) {
                //     // await this.adminref.collection('/organization').doc(data.organization_id).
                //     //     collection('/sports').doc(data.sport_id).collection('/levels').doc(data.level_id).delete();
                //     await this.adminref.collection('/playermetadata').doc(data.field_id).set({ is_deleted: true }, { merge: true })
                //     return {
                //         "status": true,
                //         "message": "Level has been deleted successfully."
                //     }
                // } else {
                //     return {
                //         "status": false,
                //         "message": "Unable to delete.The level has been tied up with team."
                //     }
                // }
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