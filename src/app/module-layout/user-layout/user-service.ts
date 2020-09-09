import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
import {get} from "lodash";
import { toUnicode } from 'punycode';

import { RestApiService } from '../../shared/rest-api.services';

// const admin = require('firebase-admin');
@Injectable({
    providedIn: 'root'
})
export class UserService {
    adminref: any = firebase.firestore();
    adminSDKRef: any = firebase.firestore;
    orgId: any;

    public _userlists = new BehaviorSubject<any[]>([]);
  public dataStore:{ users: any } = { users: [] };
  readonly connections = this._userlists.asObservable();

    constructor(private titlecasePipe: TitleCasePipe, private restApiService: RestApiService) {

        this.orgId = localStorage.getItem('org_id');
        this.dataStore.users = [];
        if(this.orgId!='') {
            console.log('---this.orgId---', this.orgId)
            this.getUserList('usersbyorg/'+this.orgId)
        }else{
            this.getUserList('users')
        }
     }

     private handleError(error: HttpErrorResponse) {
        const message = get(error, 'message') || 'Something bad happened; please try again later.';
        return throwError(message);
      }

     getUserList( url )
     {
        this.restApiService.lists(url).subscribe((data: any) => {
            this.dataStore.users = data;
            this._userlists.next(Object.assign({}, this.dataStore).users);
          },
            catchError(this.handleError)
          );
     }

     //getUserId
    selectedUserId = new BehaviorSubject<any>('')
    currentEditUserId = this.selectedUserId.asObservable();


    editUserData(id)
    {
        this.selectedUserId.next(id)
    }


    /*Create Sport*/
    async createUser(userObjs: any) {
        try {
            const validateData = userObjs;

            let checkUserExist = await this.adminref.collection('/users').where('email_address', '==', validateData.email).where('organizations', 'array-contains', validateData.organization_id).get();
            if (checkUserExist.size) {
                return {
                    status: false,
                    error: "user already exist!"
                }
                // Not allowing user to create role, let them know update role
            } else {
                let isUserExistRef = await this.adminref.collection('/users').where('email_address', '==', validateData.email).get();
                if (isUserExistRef.size) {
                    isUserExistRef = isUserExistRef.docs.map((doc: any) => doc.data());
                    isUserExistRef = isUserExistRef[0];
                    await this.adminref.collection('/users').doc(isUserExistRef.user_id).update({ organizations: this.adminSDKRef.FieldValue.arrayUnion(validateData.organization_id) })

                    for (let idx of validateData.roles) {
                        await this.addRole(validateData, idx, isUserExistRef.user_id, isUserExistRef);
                    }
                    return {
                        status: true,
                        "data": "User created successfully."
                    }
                } else {
                    const userObj = {
                        user_id: '',
                        first_name: validateData.first_name || "",
                        middle_initial: validateData.middle_initial || '',
                        last_name: validateData.last_name || "",
                        suffix: validateData.suffix || '',
                        gender: '',
                        date_of_birth: validateData.date_of_birth || "",
                        email_address: validateData.email || "",
                        mobile_phone: validateData.mobile_phone || "",
                        parent_user_id: [],
                        city: validateData.city || "",
                        country_code: validateData.country_code || "",
                        country: validateData.country_name || "",
                        postal_code: validateData.postal_code || "",
                        state: validateData.state_name || "",
                        state_code: validateData.state || "",
                        street1: validateData.street1 || "",
                        street2: validateData.street2 || "",
                        organization_id: validateData.organization_id || "",
                        organization_name: validateData.organization_name || "",
                        organization_abbrev: validateData.organization_abbrev || "",
                        created_datetime: new Date() || "",
                        created_uid: validateData.uid || "",
                        is_invited: false,
                        is_signup_completed: false,
                        profile_image: '',
                        organizations: [validateData.organization_id]
                    }
                    let saveUserData = await this.adminref.collection('/users').add(userObj);
                    userObj.user_id = saveUserData.id;
                    await this.adminref.collection('/users').doc(saveUserData.id).set({ user_id: saveUserData.id }, { merge: true });
                    for (let idx of validateData.roles) {
                        await this.addRole(validateData, idx, saveUserData.id, userObj);
                    }
                    return {
                        status: true,
                        "data": "User created successfully."
                    }
                }

            }
        } catch (err) {
            console.log(err);
            return { status: false, error: err.message };
        }// get import log data
        // get importLog details for map oragnizatin details
    }
    // Create Role By season for the user
    async addRole(validateData: any, role: any, user_id: any, userObj: any) {
        try {
            // Mapping role obj
            const roleObj = {
                user_id: user_id,
                role_by_season_id: '',
                role: role || "",
                organization_id: validateData.organization_id || "",
                organization_name: validateData.organization_name || "",
                organization_abbrev: validateData.organization_abbrev || "",
                created_datetime: new Date(),
                hasRoleEnabled: true,
                terminated_datetime: new Date(),
                team_name: "",
                is_terminated: false,
                season_id: "",
                team_id: "",
                is_suspended: false,
                suspension_start_date: '',
                suspension_end_date: '',
                season_end_date: new Date(),
                season_label: "",
                sport_id: "",
                season_start_date: new Date(),
                level_id: "",
                sport_name: "",
                level_name: "",
            }
            userObj.role = role;
            userObj.hasRoleEnabled = true;
            let checkUserExistRes = await this.adminref.collection('/organization').doc(validateData.organization_id).collection('/users').where('user_id', '==', userObj.user_id).get();
            if (checkUserExistRes.size) {
                userObj.isUserDuplicated = true
            } else {
                userObj.isUserDuplicated = false
            }
            let roles:any = [validateData.roles];
            let getUserRoles = await this.adminref.collection('/users').doc(userObj.user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles[0]).get();
              userObj.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              userObj.roles = [];
            }
            await this.adminref.collection('/organization').doc(validateData.organization_id).collection('/users').add(userObj);
            let saveRole = await this.adminref.collection('/users').doc(user_id).collection('/roles_by_season').add(roleObj);
            await saveRole.set({ role_by_season_id: saveRole.id }, { merge: true });
            return {
                status: true,
                data: "Success"
            }
        } catch (err) {
            console.log(err);

            return {
                status: false,
                error: err.message
            }
        }

    }

    // get All users list
    async getAllUsers(getSportObj: any) {
        try {
            let userExist = await this.adminref.collection('/users').doc(getSportObj.uid).get();
            if (getSportObj.organization_id) {
                if (!userExist.exists) { throw new Error("No data available for this UID"); }
                let userCollectionRef;
                if (getSportObj.searchKey && getSportObj.searchVal) {
                    if (getSportObj.role_id === 'all') {
                        userCollectionRef = await this.adminref.collection('/organization').doc(getSportObj.organization_id).collection('/users')
                            .where('isUserDuplicated', '==', false).where(getSportObj.searchKey, 'array-contains', getSportObj.searchVal).orderBy(getSportObj.sortingKey, getSportObj.sortingValue);
                    } else {
                        userCollectionRef = await this.adminref.collection('/organization').doc(getSportObj.organization_id).collection('/users').where('role', '==', getSportObj.role_id)
                            .where(getSportObj.searchKey, 'array-contains', getSportObj.searchVal).orderBy(getSportObj.sortingKey, getSportObj.sortingValue);
                    }
                } else {
                    if (getSportObj.role_id === 'all') {
                        userCollectionRef = await this.adminref.collection('/organization').doc(getSportObj.organization_id).collection('/users')
                            .where('isUserDuplicated', '==', false).orderBy(getSportObj.sortingKey, getSportObj.sortingValue);
                    } else {
                        userCollectionRef = await this.adminref.collection('/organization').doc(getSportObj.organization_id).collection('/users').where('role', '==', getSportObj.role_id)
                            .orderBy(getSportObj.sortingKey, getSportObj.sortingValue);
                    }
                }
                let totalRecords: any;
                totalRecords = await userCollectionRef.get();
                // totalRecords = await totalRecords.docs.map((doc:any)=>doc.data());               
                if (getSportObj.isNextReq) {
                    userCollectionRef = await userCollectionRef.startAfter(getSportObj.nextStartAt).limit(getSportObj.item_per_page).get();
                } else if (getSportObj.isPrevReq) {
                    userCollectionRef = await userCollectionRef.startAt(getSportObj.prevStartAt).limit(getSportObj.item_per_page).get();
                } else {
                    userCollectionRef = await userCollectionRef.limit(getSportObj.item_per_page).get();
                }
                if (userCollectionRef.size) {
                    let userCollectionRefData = await userCollectionRef.docs.map((doc: any) => doc.data());
                    console.log('DATA LIST');
                    console.log(userCollectionRefData);
                    
                    // for(let eachUser of userCollectionRefData){
                    //     if(eachUser.user_id){
                    //         let getUserFromUserCollection = await this.adminref.collection('/users').doc(eachUser.user_id)
                    //         .collection('/roles_by_season').where('organization_id','==',getSportObj.organization_id).get();
                    //         eachUser.roles = [];
                    //         if(getUserFromUserCollection.size){
                    //             for(let eachRole of getUserFromUserCollection.docs){
                    //                 if(eachRole.data().role){
                    //                     eachUser.roles.push(eachRole.data().role);
                    //                 }
                    //             }
                    //         }
                    //         eachUser.roles = eachUser.roles.length ? [...new Set(eachUser.roles)] : []
                    //     }else{
                    //         eachUser.roles = [];
                    //     }
                    // }
                    return {
                        status: true,
                        data: userCollectionRefData,
                        snapshot: userCollectionRef,
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
            return { 'status': false, 'error': error.message }
        }
    }

    // get userDetails By Id for login and fetch filtered data(only active user)
    async getUserById(queryObj: any) {
        try {

            let userinformation: any = await this.adminref.collection('/users').doc(queryObj.uid).get();
            if (userinformation.exists) {
                let userInfo: any = userinformation.data()
                userInfo.roles_by_seasons = [];
                //Role By Season Info
                let roleBySeasonInfo = await this.adminref.collection('/users').doc(queryObj.uid).collection('roles_by_season').get();
                const roleBySeasonArr: any = roleBySeasonInfo.size ? roleBySeasonInfo.docs.map(doc => doc.data()) : []
                if (roleBySeasonArr.length !== 0) {
                    for (let index of roleBySeasonArr) {
                        userInfo.roles_by_seasons.push(index);
                    }
                    return { 'status': true, 'message': 'User Profile Informations', 'data': userInfo }

                } else {
                    return { 'status': true, 'message': 'User Profile Informations', 'data': userInfo }
                }
            } else {
                return { 'status': false, 'message': 'No data available with this uid' }
            }
        } catch (error) {
            console.log(error);
            return { 'status': false, 'error': error.message }
        }
    }
    // get userDetails By Id
    async getUserDetailsById(queryObj: any) {
        try {

            let userinformation: any = await this.adminref.collection('/users').doc(queryObj.uid).get();
            if (userinformation.exists) {
                let userInfo: any = userinformation.data()
                userInfo.roles_by_seasons = [];
                //Role By Season Info
                let roleBySeasonInfo = await this.adminref.collection('/users').doc(queryObj.uid).collection('roles_by_season').where('hasRoleEnabled','==',true).where('is_suspended','==',false).where('is_terminated','==',false).get();
                const roleBySeasonArr: any = roleBySeasonInfo.size ? roleBySeasonInfo.docs.map(doc => doc.data()) : []
                if (roleBySeasonArr.length !== 0) {
                    for (let index of roleBySeasonArr) {
                        userInfo.roles_by_seasons.push(index);
                    }
                    return { 'status': true, 'message': 'User Profile Informations', 'data': userInfo }

                } else {
                    return { 'status': true, 'message': 'User Profile Informations', 'data': userInfo }
                }
            } else {
                return { 'status': false, 'message': 'No data available with this uid' }
            }
        } catch (error) {
            console.log(error);
            return { 'status': false, 'error': error.message }
        }
    }

    // get all guardians by uid
    async getGuardianById(queryObj: any) {
        try {
            const uid = queryObj.uid;
            let userExist: any = await this.adminref.collection('/users').doc(uid).get();
            if (userExist.exists) {
                userExist = await userExist.data();
                let userIds: any = [];
                let getParentInfo: any = [];
                if (userExist.parent_user_id && userExist.parent_user_id.length) {
                    getParentInfo = await this.adminref.collection('/users').where('user_id', 'in', userExist.parent_user_id).get();
                    if (getParentInfo.size) {
                        getParentInfo = getParentInfo.docs.map((doc: any) => doc.data());

                    } else {
                        getParentInfo = [];
                    }
                }

                let playersWithOtherGuardianInfo: any = await this.adminref.collection('/users').where('parent_user_id', 'array-contains', uid).get();
                if (playersWithOtherGuardianInfo.size) {
                    let playersList: any = await playersWithOtherGuardianInfo.docs.map((doc: any) => doc.data());
                    for (let list of playersList) {
                        let uidIndex = list.parent_user_id.indexOf(uid);
                        if (uidIndex > -1) {
                            list.parent_user_id.splice(uidIndex, 1);
                        }
                        userIds = userIds.concat(list.parent_user_id);
                    }
                    userIds.push(uid);
                    if (userIds.length) {
                        // let unique = [...new Set(userIds)];
                        let otherGuardianDetailInfo: any = await this.adminref.collection('/users').where('user_id', 'in', userIds).get();
                        if (otherGuardianDetailInfo.size) {
                            otherGuardianDetailInfo = otherGuardianDetailInfo.docs.map((doc: any) => doc.data());
                            getParentInfo = getParentInfo.concat(otherGuardianDetailInfo);
                            return { status: true, message: 'Parent List Information', data: getParentInfo };
                        } else {
                            userIds = []
                            return { status: true, message: 'Parent List is not available', data: getParentInfo };

                        }
                    } else {
                        return { status: true, message: 'Parent List Information', data: getParentInfo };
                    }
                } else {
                    playersWithOtherGuardianInfo = [];
                    return { status: true, message: 'Parent List Information', data: getParentInfo };
                }

            } else {
                return { status: false, message: 'No data available for this Uid' };
            }
        } catch (error) {
            console.log(error);
            return { 'status': false, 'error': error.message }
        }
    }

    // get all palyers by uid
    async getPalyersById(queryObj: any) {
        try {
            const uid = queryObj.uid;
            let userExist = await this.adminref.collection('/users').doc(uid).get();
            if (userExist.exists) {
                let playerInfo = await this.adminref.collection('/users').where('parent_user_id', 'array-contains', uid).get()
                let playersList: any = playerInfo.docs.map(doc => doc.data());
                playersList = playersList.map((user: any) => {
                    if (user.date_of_birth) {
                        let currentYear = new Date().getFullYear();
                        let userDOBYear = new Date(user.date_of_birth).getFullYear();
                        user.age = currentYear - userDOBYear;
                    }
                    if (!(user.isParentConsentCompleted)) {
                        user.isParentConsentCompleted = false
                    }
                    return user;
                });
                playersList = playersList.sort(this.compare);
                return { status: true, message: 'Players List Informations', data: playersList };

            } else {
                return { status: false, message: 'No Player for this Uid' };
            }
        } catch (error) {
            console.log(error);
            return { 'status': false, 'error': error.message }
        }
    }

    compare(user1: any, user2: any) {
        let comparison = 0;
        if (user1.age > user2.age) {
            comparison = 1;
        } else if (user1.age < user2.age) {
            comparison = -1;
        }
        return comparison;
    }

    /*Update User*/
    async updateUser(userObjs: any) {

        try {
            const validateData = userObjs;

            const userObj: any = {
                middle_initial: validateData.middle_initial || '',
                suffix: validateData.suffix || '',
                mobile_phone: validateData.mobile_phone || "",
                city: validateData.city || "",
                country_code: validateData.country_code || "",
                country: validateData.country_name || "",
                postal_code: validateData.postal_code || "",
                state: validateData.state_name || "",
                state_code: validateData.state || "",
                street1: validateData.street1 || "",
                street2: validateData.street2 || "",
                date_of_birth: validateData.date_of_birth,
                profile_image: validateData.profile_image || null,
                email_address:validateData.email_address
            };
            let checkUserExist = await this.adminref.collection('/users').doc(validateData.user_id).get();
            if (checkUserExist.exists) {
                await checkUserExist.ref.set(userObj, { merge: true });
                if (validateData.organization_id) {
                    let userReference: any = await this.adminref.collection('/organization').doc(validateData.organization_id).collection('/users').where('user_id', '==', validateData.user_id).get();
                    if (userReference.size) {
                        let userList: any = userReference.docs;
                        for (let index of userList) {

                            userObj.first_name = validateData.first_name || "";
                            userObj.mobile_phone = validateData.mobile_phone || "";
                            userObj.last_name = validateData.last_name || "";
                            userObj.date_of_birth = validateData.date_of_birth || "";
                            userObj.organization_id = validateData.organization_id || "";
                            userObj.organization_name = validateData.organization_name || "";
                            userObj.organization_abbrev = validateData.organization_abbrev || "";
                            userObj.email_address = validateData.email_address || "";
                            userObj.city = validateData.city || "";
                            userObj.state_code = validateData.state || "";
                            userObj.state = validateData.state_name || "";
                            userObj.postal_code = validateData.postal_code || "";
                            userObj.country_code = validateData.country_code || "",
                                userObj.country = validateData.country_name || "",
                                await this.generateKeywords(index, userObj);
                            await index.ref.set(userObj, { merge: true });
                        }
                    }
                    if (validateData.roles) {
                        for (let index of validateData.roles) {
                            if (index.hasRoleEnabled) {
                                if (index.role_by_season_id) {
                                    let getRoleData = await this.adminref.collection('/users').doc(validateData.user_id).collection('/roles_by_season').doc(index.role_by_season_id).get();
                                    if (getRoleData.exists) {
                                        await getRoleData.ref.set(index, { merge: true });
                                    } else {
                                        // build obj for new role assigning
                                        return {
                                            status: false,
                                            error: "Role doesn't exist!"
                                        };

                                    }
                                } else {
                                    let userObj = await checkUserExist.data();
                                    userObj.role = index.role;
                                    userObj.hasRoleEnabled = true;
                                    userObj.first_name = validateData.first_name || "";
                                    userObj.last_name = validateData.last_name || "";
                                    userObj.date_of_birth = validateData.date_of_birth || "";
                                    userObj.email_address = validateData.email_address || "";
                                    userObj.organization_id = validateData.organization_id || "";
                                    userObj.organization_name = validateData.organization_name || "";
                                    userObj.organization_abbrev = validateData.organization_abbrev || "";
                                    userObj.city = validateData.city || "";
                                    userObj.state = validateData.state_name || "";
                                    userObj.state_code = validateData.state || "";
                                    userObj.postal_code = validateData.postal_code || "";
                                    userObj.country_code = validateData.country_code || "";
                                    userObj.country = validateData.country_name || "";
                                    let checkUSerExistInUserSub = await this.adminref.collection('/organization').doc(validateData.organization_id).collection('/users').where('user_id', '==', userObj.user_id).get();
                                    if (checkUSerExistInUserSub.size) {
                                        userObj.isUserDuplicated = true
                                    } else {
                                        userObj.isUserDuplicated = false
                                    }
                                    let roles:any = [validateData.roles[0]];
            let getUserRoles = await this.adminref.collection('/users').doc(userObj.user_id).collection('/roles_by_season').where('organization_id', '==', validateData.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles).get();
              userObj.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              userObj.roles = [];
            }
                                    await this.adminref.collection('/organization').doc(validateData.organization_id).collection('/users').add(userObj);


                                    const roleObj = {
                                        hasRoleEnabled: true,
                                        role_by_season_id: '',
                                        role: index.role || "",
                                        organization_id: index.organization_id || "",
                                        organization_name: index.organization_name || "",
                                        organization_abbrev: index.organization_abbrev || "",
                                        updated_datetime: new Date(),
                                        updated_by: validateData.uid,
                                        user_id: validateData.user_id,
                                        terminated_datetime: new Date(),
                                        team_name: "",
                                        is_terminated: false,
                                        season_id: "",
                                        team_id: "",
                                        is_suspended: false,
                                        suspension_start_date: '',
                                        suspension_end_date: '',
                                        season_end_date: new Date(),
                                        season_label: "",
                                        sport_id: "",
                                        season_start_date: new Date(),
                                        level_id: "",
                                        sport_name: "",
                                        level_name: "",
                                    }
                                    let createRole = await this.adminref.collection('/users').doc(validateData.user_id).collection('/roles_by_season').add(roleObj);
                                    await createRole.set({ role_by_season_id: createRole.id }, { merge: true });
                                }
                            } else {
                                if (index.role_by_season_id) {
                                    let getUserRes = await this.adminref.collection('/organization').doc(validateData.organization_id).collection('/users').where('user_id', '==', validateData.user_id).where('role', '==', index.role).get();
                                    // getUserRes = getUserRes.docs.map((doc:any) => doc.data());
                                    for (let user of getUserRes) {
                                        await user.ref.set({ hasRoleEnabled: false }, { merge: true });
                                    }
                                    let getRoleData = await this.adminref.collection('/users').doc(validateData.user_id).collection('/roles_by_season').doc(index.role_by_season_id).get();
                                    if (getRoleData.exists) {
                                        await getRoleData.ref.set(index, { merge: true });
                                    } else {
                                        return {
                                            status: false,
                                            error: "User doesn't have this role"
                                        };
                                    }
                                } else {
                                    return {
                                        status: false,
                                        error: "User doesn't have this role"
                                    };
                                }
                            }
                            if (index.is_terminated) {
                                // if (index.terminated_datetime) {
                                    await this.adminref.collection('/users').doc(validateData.user_id).collection('/roles_by_season').doc(index.role_by_season_id).set({ "is_terminated": true, terminated_datetime: index.terminated_datetime }, { merge: true });
                                    // update in people collection
                                    let getcollectionGroup: any = await this.adminref.collectionGroup('MemberGroup').get();
                                    if (getcollectionGroup.size) {
                                        for (let idx of getcollectionGroup.docs) {
                                            if (idx.ref.path.includes(index.organization_id)) {
                                                let userList = await idx.data().user_list;
                                                if (userList.length) {
                                                    for (let user of userList) {
                                                        if (validateData.user_id === user.user_id) {
                                                            await idx.ref.set({ user_list: this.adminSDKRef.FieldValue.arrayRemove(user) }, { merge: true });
                                                            user.is_terminated = true;
                                                            user.terminated_datetime = index.terminated_datetime;
                                                            await idx.ref.set({ user_list: this.adminSDKRef.FieldValue.arrayUnion(user) }, { merge: true });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    // update teams/people
                                    let getPeoplecollectionGroup: any = await this.adminref.collectionGroup('people').where('people_id', '==', index.role).get();
                                    if (getPeoplecollectionGroup.size) {
                                        for (let idx of getPeoplecollectionGroup.docs) {
                                            if (idx.ref.path.includes(index.organization_id)) {
                                                let userList = await idx.data().user_list;
                                                if (userList.length) {
                                                    for (let user of userList) {
                                                        if (validateData.user_id === user.user_id) {
                                                            await idx.ref.set({ user_list: this.adminSDKRef.FieldValue.arrayRemove(user) }, { merge: true });
                                                            user.is_terminated = true;
                                                            user.terminated_datetime = index.terminated_datetime;
                                                            await idx.ref.set({ user_list: this.adminSDKRef.FieldValue.arrayUnion(user) }, { merge: true });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    // let getmemberGroupByOrganization = await adminref

                                // } else {
                                //     return {
                                //         status: false,
                                //         error: "Termination date is required"
                                //     };
                                // }

                            }
                        }
                    }
                }

                return {
                    status: true,
                    data: "Updated successfully"
                };
            } else {
                return {
                    status: false,
                    error: "User doesn't exist"
                };
            }


        } catch (err) {
            console.log(err);
            return { status: false, error: err.message };
        }// get import log data
        // get importLog details for map oragnizatin details
    }

    async resendInviteService(uid : any){
        try{
            let checkUserExist = await this.adminref.collection('/users').doc(uid).get();
        if(checkUserExist.exists){
            const userData: any = checkUserExist.data();
            if (userData.is_invited && !userData.is_signup_completed) {
                await this.adminref.collection('/users').doc(uid).set({
                    is_invited: false,lastSentInviteTime : new Date()
                },{merge : true});
                return{ 'status': true, 'message': 'User Reinvited Successfully' }
            } else {
                return { 'status': false, 'message': 'Please check! Signedup already or Not yet invited' }
            }
        }else{
            return{ 'status': false, 'message': 'No data available with this Uid' }
        }
        }catch(err){
            return{ 'status': false, 'message': err.message }
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
    async generateKeywords(index: any, userData: any) {
        try {
            console.log("inside keyword generation");
            userData.first_name = userData.first_name ? userData.first_name + " " : "";
            userData.middle_initial = userData.middle_initial ? userData.middle_initial + " " : "";
            userData.last_name = userData.last_name ? userData.last_name + " " : "";
            userData.suffix = userData.suffix ? userData.suffix + " " : ""
            let name = userData.first_name + userData.middle_initial + userData.last_name + userData.suffix;
            const keywordForFullName = this.createKeywords(`${name}`);
            const keywordForFirstName = this.createKeywords(`${userData.first_name}`);
            const keywordForMiddleInitial = this.createKeywords(`${userData.middle_initial}`);
            const keywordForLastname = this.createKeywords(`${userData.last_name}`);
            const keywordForSuffix = this.createKeywords(`${userData.suffix}`);
            const keywordForcity = this.createKeywords(`${userData.city}`);
            const keywordForcountrycode = this.createKeywords(`${userData.country}`);
            const keywordForstate = this.createKeywords(`${userData.state}`);
            const keywordEmail = this.createKeywords(`${userData.email_address}`);
            const keywordMobileno = this.createKeywords(`${userData.mobile_phone}`);
            const keywordPostalCode = this.createKeywords(`${userData.postal_code}`);
            const keywords = [
                ...new Set([
                    '',
                    ...keywordForFullName,
                    ...keywordForMiddleInitial,
                    ...keywordForLastname,
                    ...keywordPostalCode,
                    ...keywordForSuffix,
                    ...keywordForFirstName,
                    ...keywordForcity,
                    ...keywordForcountrycode,
                    ...keywordForstate,
                    ...keywordEmail,
                    ...keywordMobileno

                ])
            ];

            const firstNameKeywords = [
                ...new Set([
                    '',
                    ...keywordForMiddleInitial,
                    ...keywordForLastname,
                    ...keywordForSuffix,
                    ...keywordForFirstName,

                ])
            ];
            userData.keywords = keywords;
            await index.ref.set(userData, { merge: true });
            return true;
        } catch (err) {
            console.log(err);

            return true
        }
    }


}
