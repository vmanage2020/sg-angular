import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
// const admin = require('firebase-admin');

import { CommonCrudService } from '../../../app/core/services/common-crud.service'
@Injectable({
  providedIn: 'root'
})
export class CannedResponseCrudService {
  adminref: any = firebase.firestore();

  constructor(private titlecasePipe: TitleCasePipe, private commonService: CommonCrudService) { }
  async createCannedResponse(createcannedResponseObj: any) {
    try {
      const collectionName = "CannedResponse";

      const createdcannedData: any = await this.commonService.createTemplateHandler(createcannedResponseObj, this.adminref, collectionName);
      if (createdcannedData.data) {
        return { 'status': true, 'message': createdcannedData["data"], 'data': createdcannedData["data"] }
      } else {
        return { 'status': false, 'message': createdcannedData["error"], 'error': createdcannedData["error"] }
      }
    } catch (error) {
      return { 'status': false, 'message': error.message }
    }

  }

  async updateCannedResponse(updateCannedResponseObj: any) {
    try {
      const updateData: any = await this.updateCannedResponseTempDesc(updateCannedResponseObj, this.adminref);
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

  async updateCannedResponseTempDesc(updateCannedResponseObj: any, adminref: any) {

    try {
      let isCannedResponseExist: any = await adminref.collection('CannedResponse').doc(updateCannedResponseObj.cannedResponseTitle_id).get();

      if (isCannedResponseExist.exists) {
        await isCannedResponseExist.ref.set({ cannedResponseDesc: updateCannedResponseObj.cannedResponseDesc, canned_response_description: updateCannedResponseObj.cannedResponseDesc }, { merge: true });
        await this.generateCannedResKeywords(updateCannedResponseObj,updateCannedResponseObj.cannedResponseTitle);
        return { "status": true, "data": "Updated successfully." };
      } else {
        return { "status": false, "error": "Update failed.This CannedResponse has tiedup with the feeds.Please check!" };
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }


  }
  
  async deleteCannedResponse(deleteTagObj:any){
    try {
      let collectionname = "CannedResponse"
      const updateData: any = await this.commonService.deleteTemp(deleteTagObj, this.adminref, collectionname);
                    if (updateData.data) {
                      return {'status': true, 'message': updateData.data }
                      
                    } else {
                      return {'status': false, 'message': updateData.error }
                    }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  createKeywords(name:any) {
    const arrName : any = [];
    let curName = '';
    if(name === "" || name === null || name === undefined || name === "undefined" || name === ''){
        arrName.push(null);
        arrName.push("");
    }else{
        const str = name.toLowerCase();
        str.split('').forEach((letter:any) => {
            curName += letter;
            arrName.push(curName);
          });
        let arrayValues = str.split(" ");
        for(let index of arrayValues){
    let curNameArr = '';
            index.split('').forEach((letter:any) => {
                curNameArr += letter;
                arrName.push(curNameArr);
              });
        }
    }
    
    return arrName;
  }

 async generateCannedResKeywords(updateObj:any,snapshot:any) {
    try {
        const keywordForDesc = this.createKeywords(`${updateObj.cannedResponseDesc}`);
        const keywordForTittle = this.createKeywords(`${updateObj.cannedResponseTitle}`);
        const keywordForSportName = this.createKeywords(`${updateObj.sports_name}`);
    const keywords =  [
        ...new Set([
          '',
          ...keywordForTittle,
          ...keywordForSportName,
          ...keywordForDesc
  
        ])
      ];
    await this.adminref.collection('CannedResponse').doc(updateObj.cannedResponseTitle_id).set({keywords : keywords,},{merge : true});
        return true;
    }catch(err){
        console.log(err);
        
return true
    }}
  async getCannedResponseForGrid(getCannedResponseListObj: any) {
    try {
      const userData: any = await this.commonService.getDataForGrid(getCannedResponseListObj, this.adminref);
      if (userData.data) {
        return { 'status': true, 'message': "list", 'data': userData }
      } else {
        return { 'status': false, 'message': userData.error.message, 'error': userData.error }
      }
    } catch (error) {
      return { 'status': false, 'message': error.message }
    }
  }
}
