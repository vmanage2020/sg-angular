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
export class CommonCrudService {
  // adminref: any = firebase.firestore();
  constructor(private titlecasePipe: TitleCasePipe) { }

  async createTemplateHandler(createTagObj: any, adminref: any, collectionName: any) {
    try {
      const getCollection = await adminref.collection(collectionName);
      const save = await this.saveTemplateData(createTagObj, adminref, collectionName, getCollection);
      return save;
    } catch (error) {
      console.log(error);
      return { "status": false, "error": "Something went wrong. Please try again later!" };
    }
  }

  async saveTemplateData(createTagObj: any, adminref: any, collectionName: any, collectionPath: any) {
    try {
      let sportUsedFromOrg= await adminref.collection('/organization').doc(createTagObj.organization_id).get();     
      let governingObject:any={
        governing_body_info:''
      }     
      if(sportUsedFromOrg.exists){
       let changekeyName = sportUsedFromOrg.data().governing_body_info;
       for(let sportChange of changekeyName){
         if(sportChange.sport_id === createTagObj.sports_id){
          sportChange.is_used = true
         }
       }
       governingObject.governing_body_info= changekeyName;   
       await adminref.collection('/organization').doc(createTagObj.organization_id).update(governingObject);
      }
      

        // build obj & create tag
        let dt = new Date();
        let obj: any = {
          "created_uid": createTagObj.auth_id,
          "created_datetime": dt,
          "updated_uid": "",
          "updated_datetime": dt,
          "count": 0
        }
        let id: any;
        switch (collectionName) {
          case "CannedResponse": {
      
            const data = await collectionPath.where('organization_id', '==', createTagObj.organization_id).where('is_deleted', '==',false)
            .where('sport_id', '==', createTagObj.sports_id)
            .where('cannedResponseTitle', '==', createTagObj.name).get();
            if (data.size) {
              return {
                "status": false,
                "error": "Canned Response already exist!"
              }
            }
              
            id = createTagObj.name;
            obj["cannedResponseTitle"] = createTagObj.name;
            obj["canned_response_title"] = createTagObj.name;
            obj["cannedResponseDesc"] = createTagObj.cannedResponseDesc;
            obj["canned_response_description"] = createTagObj.cannedResponseDesc;
            obj["organization_id"] = createTagObj.organization_id;
            obj["organization_name"] = createTagObj.organization_name;
            obj["organization_abbreviation"] = createTagObj.organization_abbreviation;
            obj["sport_id"] = createTagObj.sports_id;
            obj["sport_name"] = createTagObj.sport_name;
            obj["copied_from"] = "";
            obj["is_deleted"] = false;
            obj["count"] = 0;
            delete createTagObj.name;
            console.log(obj);
            let createObjRoot: any = await adminref.collection(collectionName).add(obj);
            await createObjRoot.set({cannedResponseTitle_id : createObjRoot.id}, { merge: true });
            return { "status": true, "data": "Created successfully." };
            break;
          }
          case "Tags": {
            
            const data = await collectionPath.where('organization_id', '==', createTagObj.organization_id).where('is_deleted', '==',false).
            where('sport_id', '==', createTagObj.sports_id).where('tag_name', '==', createTagObj.name).get();
            if (data.size) {
              return {
                "status": false,
                "error": "Tag Name already exist!"
              }
            }
            id = createTagObj.name;
            //obj["tag_id"] = createTagObj.name;
            obj["tag_name"] = createTagObj.name;
            obj["organization_id"] = createTagObj.organization_id;
            obj["organization_name"] = createTagObj.organization_name;
            obj["organization_abbreviation"] = createTagObj.organization_abbreviation;
            obj["sport_id"] = createTagObj.sports_id;
            obj["sport_name"] = createTagObj.sport_name;
            obj["count"] = 0;
            obj["copied_from"] = "";
            obj["is_deleted"] = false;
            delete createTagObj.name;
            console.log(obj);
            let createObjRoot: any = await adminref.collection(collectionName).add(obj);
            await createObjRoot.set({tag_id : createObjRoot.id}, { merge: true });
            return { "status": true, "data": "Created successfully." };
            break;
          }
        }

        // if (createObj) {

        // } else {
        //     return { "status": false, "error": "Something went wrong. Please try again!" };
        // }
    } catch (error) {
      console.log(error);
      return { "status": false, "error": "Error: "+ error.message };
    }

  }
  async deleteTemp(deleteTagObj: any, adminref: any, collectionname: any) {
    try {
      switch (collectionname) {
        case "Tags": 
          let isTagExist: any = await adminref.collection('Tags').doc(deleteTagObj.tag_id).get();
          if (isTagExist.exists) {
            await adminref.collection('Tags').doc(deleteTagObj.tag_id).set({is_deleted:true},{merge:true})
            // await isTagExist.ref.delete();
            return { "status": true, "data": "Deleted successfully." };
          } else {
            return { "status": false, "error": "Delete failed.Tag doesn't exist." };
          }
          break;
        case "CannedResponse": 
        
        let isCannedExist: any = await adminref.collection('CannedResponse').doc(deleteTagObj.cannedResponseTitle_id).get();
        if (isCannedExist.exists) {
          await adminref.collection('CannedResponse').doc(deleteTagObj.cannedResponseTitle_id).set({is_deleted:true},{merge:true})
          // await isCannedExist.ref.delete();
          return { "status": true, "data": "Deleted successfully." };
        } else {
          return { "status": false, "error": "Delete failed. Canned Response doesn't exist." };
        }
        break;
        }
      
     
    } catch (error) {
      console.log(error);
      return { "status": false, "error": "Something went wrong. Please try again later!" };
    }

  }

  async getDataForGrid(getTagListObj, adminref) {
    // pagination

    try {

      if (!getTagListObj.itemPerPage) { getTagListObj.itemPerPage = 10; }
      let CollectionRef: any;
      let totalRecord: any;

      if (!getTagListObj.sport_id) {
        CollectionRef = await adminref.collection(getTagListObj.collectionName).where('is_deleted', '==',false).where('organization_id', '==', getTagListObj.organization_id).orderBy(getTagListObj.sortingKey, getTagListObj.sortingValue);
      } else {
        CollectionRef = await adminref.collection(getTagListObj.collectionName).where('is_deleted', '==',false).where('organization_id', '==', getTagListObj.organization_id).where('sport_id', "==", getTagListObj.sport_id)
          .orderBy(getTagListObj.sortingKey, getTagListObj.sortingValue);
      }
      if (getTagListObj.searchKey && getTagListObj.searchVal) {
        CollectionRef = await CollectionRef.where(getTagListObj.searchKey, 'array-contains', getTagListObj.searchVal)
      }

      if (getTagListObj.isPrevReq) {
        totalRecord = await CollectionRef.get();
        CollectionRef = await CollectionRef.startAt(getTagListObj.prevStartAt).limit(getTagListObj.itemPerPage).get();
      } else if (getTagListObj.isNextReq) {
        totalRecord = await CollectionRef.get();
        CollectionRef = await CollectionRef.startAfter(getTagListObj.nextStartAt).limit(getTagListObj.itemPerPage).get();
      } else {
        totalRecord = await CollectionRef.get();
        CollectionRef = await CollectionRef.limit(getTagListObj.itemPerPage).get();

      }
      if (CollectionRef.size) {
        let CollectionRefData = await CollectionRef.docs.map((doc: any) => doc.data());
        return {
          data: CollectionRefData,
          snapshot: CollectionRef,
          totalRecords: totalRecord.size || 0
        }
      } else {
        return {
          data: []
        }
      }
    } catch (error) {
      console.log(error);
      return {
        status: false,
        error: error.message
      }
    }

  }

}
