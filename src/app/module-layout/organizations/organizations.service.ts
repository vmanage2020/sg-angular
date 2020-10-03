import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';

import { RestApiService } from '../../shared/rest-api.services';
import { get } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {


  public _sports = new BehaviorSubject<any[]>([]);
  public dataStore:{ sports: any } = { sports: [] };
  readonly connections = this._sports.asObservable();

  public _country = new BehaviorSubject<any[]>([]);
  public countrydataStore:{ country: any } = { country: [] };
  readonly connections1 = this._country.asObservable();

  public _state = new BehaviorSubject<any[]>([]);
  public statedataStore:{ state: any } = { state: [] };
  readonly connections2 = this._state.asObservable();

  public _org = new BehaviorSubject<any[]>([]);
  public orgdataStore:{ org: any } = { org: [] };
  readonly connections3 = this._org.asObservable();

  public _orgdd = new BehaviorSubject<any[]>([]);
  public orgdddataStore:{ orgdd: any } = { orgdd: [] };
  readonly connections4 = this._orgdd.asObservable();

  adminref: any = firebase.firestore();
  orgId: any;

  constructor(private titlecasePipe: TitleCasePipe, private restApiService: RestApiService) { 

    this.orgId = localStorage.getItem('org_id');

    //if(this.orgId=='') {
      this.organizationsList('organization');
    /* }else{

    } */

    
    
    this.sportsList('sports');
    this.statesList('states');
    this.getCountryCodeListAPI('countries');
    this.organizationsDropDownList('organization');
  }

  private handleError(error: HttpErrorResponse) {
    const message = get(error, 'message') || 'Something bad happened; please try again later.';
    return throwError(message);
  }

  organizationsList(url)
  {
    this.restApiService.lists(url).subscribe((data: any) => {
      this.orgdataStore.org = data;
      this._org.next(Object.assign({}, this.orgdataStore).org);
    },
      catchError(this.handleError)
    );
  }

  organizationsDropDownList(url)
  {
    this.restApiService.lists(url).subscribe((data: any) => {
      this.orgdddataStore.orgdd = data;
      this._orgdd.next(Object.assign({}, this.orgdddataStore).orgdd);
    },
      catchError(this.handleError)
    );
  }

  sportsList( url ){
    this.restApiService.lists(url).subscribe((data: any) => {
      //console.log('---data----', data)
      this.dataStore.sports = data;
      this._sports.next(Object.assign({}, this.dataStore).sports);
      // console.log(this.dataStore);

    },
      catchError(this.handleError)
    );
  }

  statesList( url )
  {
    this.restApiService.lists(url).subscribe((data: any) => {
      this.statedataStore.state = data;
      this._state.next(Object.assign({}, this.statedataStore).state);
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

  //getbidId
  selectedOrgId = new BehaviorSubject<any>('')
  currentEditOrgId = this.selectedOrgId.asObservable();

  selectedOrgType = new BehaviorSubject<any>('')
  currentEditOrgId1 = this.selectedOrgType.asObservable();


  editOrgData(id, type)
  {
    this.selectedOrgId.next(id)
    this.selectedOrgType.next(type)
  }

  async getOrganizationById(organizationObj: any) {
    try {
      let getOrganizationById: any = await this.adminref.collection('/organization').doc(organizationObj.organization_id).get();
      if (getOrganizationById.exists) {
        const organizationDetail: any = getOrganizationById.data();
        const sportsRef = await this.adminref.collection('/organization').doc(organizationObj.organization_id).collection('/sports').where('isDeleted', '==', false).get();
        return { 'status': true, 'message': 'Organization List info', 'data': organizationDetail }
      } else {
        return { 'status': false, 'message': 'No data available.' }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async getNationalGoverningDetails(orgId: any) {
    try {
      let getOrganizationById: any = await this.adminref.collection('/organization').where('nationalGoverningOrganizations', 'array-contains', orgId).get();
      if (getOrganizationById.size < 2) {
        return { 'status': true, 'data': { isEditable: true } }
      } else {
        return { 'status': false, 'data': { isEditable: false } }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }
  async getStateGoverningDetails(orgId: any) {
    try {
      let getOrganizationById: any = await this.adminref.collection('/organization').where('stateGoverningOrganizations', 'array-contains', orgId).get();
      if (getOrganizationById.size < 2) {
        return { 'status': true, 'data': { isEditable: true } }
      } else {
        return { 'status': false, 'data': { isEditable: false } }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async createOrganization(createOrgObj: any) {
    try {

      const uid = createOrgObj.uid;
      const created = new Date();
      // Add Organization Json
      const organizationObj: any = {
        organization_id: '',
        name: createOrgObj.name || "",
        abbrev: createOrgObj.abbrev || "",
        mobile_phone: createOrgObj.phone || "",
        avatar: createOrgObj.avatar || '',
        fax: createOrgObj.fax || "",
        email_address: createOrgObj.email || "",
        website: createOrgObj.website || "",
        state_code: createOrgObj.state || "",
        state: createOrgObj.state_name || "",
        country_code: createOrgObj.country_code || "",
        country: createOrgObj.country_name || "",
        street1: createOrgObj.street1 || "",
        street2: createOrgObj.street2 || "",
        city: createOrgObj.city || "",
        postal_code: createOrgObj.postal_code || "",
        created_datetime: created,
        created_uid: uid,
        governing_body_info: createOrgObj.governing_body_info || "",
        sports: createOrgObj.sports || "",
        governing_key_array_fields: ''
      }
      let governingBodyDropdownArray: any = [];
      //After Successfull organization add update Json
      const orgSuccessObj: any = {
        organization_id: null,
        governing_body_info: createOrgObj.governing_body_info,
        governing_key_array_fields: ''
      }
      //Role Object Additions
      // const roleObj: any = {
      //   role_by_season_id: '',
      //   role: 'admin',
      //   organization_id: '',
      //   organization_name: createOrgObj.name || "",
      //   organization_abbrev: createOrgObj.abbrev || "",
      //   is_terminated: false,
      //   is_suspended: false,
      //   created_datetime: new Date()
      // }
      const roleObj: any = {
        // user_id: user_id,
        role_by_season_id: '',
        role: 'admin',
        organization_id: "",
        organization_name: createOrgObj.name || "",
        organization_abbrev: createOrgObj.abbrev || "",
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
      let contactObj: any = {};
      let orgExistCheck = await this.adminref.collection('/organization').where('email_address', '==', createOrgObj.email).get();
      if (orgExistCheck.size) {
        return { 'status': false, 'message': "Organization exist with this email address. Please check" }
      } else {
        let ref = await this.adminref.collection('/organization').add(organizationObj);
        orgSuccessObj.organization_id = ref.id;
        for (let individualgoverningBody of orgSuccessObj.governing_body_info) {
          if (individualgoverningBody.is_state_governing_organization === 'true') {
            individualgoverningBody.state_governing_organization_id = ref.id;
            individualgoverningBody.state_governing_organization_name = createOrgObj.name;
            governingBodyDropdownArray.push("true_" + createOrgObj.state + "_" + individualgoverningBody.sport_id)
          }
          if (individualgoverningBody.is_national_governing_organization === 'true') {
            individualgoverningBody.national_governing_organization_id = ref.id;
            individualgoverningBody.national_governing_organization_name = createOrgObj.name;
            governingBodyDropdownArray.push("true_" + createOrgObj.country_code + "_" + individualgoverningBody.sport_id)
          }
        }
        let nationalGoverningOrgs = [];
        let stateGoverningOrgs = [];
        for (let org of orgSuccessObj.governing_body_info) {
          if (org.national_governing_organization_id) {
            nationalGoverningOrgs.push(org.national_governing_organization_id);
          }
          if (org.state_governing_organization_id) {
            stateGoverningOrgs.push(org.state_governing_organization_id);
          }

        }
        orgSuccessObj.governing_key_array_fields = governingBodyDropdownArray;
        orgSuccessObj.nationalGoverningOrganizations = nationalGoverningOrgs;
        orgSuccessObj.stateGoverningOrganizations = stateGoverningOrgs;
        // let sportsData: any;
        await ref.set(orgSuccessObj, { merge: true }); // State & Nation Governing Validation update Changes to the Process

        // Admin Email based document adding // Check if the email already exist in users Collection    

        let sportsInfoResponse = await this.sportsBinding(createOrgObj.sports, ref.id);
        let sportsResponseSnapshots = await this.addSportsDetails(sportsInfoResponse, ref.id);

        roleObj.organization_id = ref.id; // Role_by_season Object Structure
        let checkUser: any = await this.adminref.collection('/users').where('email_address', '==', createOrgObj.primary_admin_email).get();
        //Users Additions
        const userObj: any = {
          gender: '',
          mobile_phone: '',
          city: '',
          country_code: '',
          country: '',
          postal_code: '',
          state_code: '',
          state: '',
          street1: '',
          street2: '',
          profile_image: '',
          created_datetime: new Date(),
          created_uid: createOrgObj.uid,
          is_invited: true,
          is_signup_completed: false,
          organizations: [roleObj.organization_id]
        }

        if (checkUser.size) {
          let userData = checkUser.docs.map((doc: any) => doc.data());
          userData = userData[0];
          contactObj.primary_first_name = userData.first_name || "";
          contactObj.isNewPrimaryUser = false;
          contactObj.primary_last_name = userData.last_name || "";
          contactObj.primary_admin_email = userData.email_address || "";
          contactObj.primary_suffix = userData.suffix || "";
          contactObj.primary_middle_initial = userData.middle_initial || "";
          contactObj.primary_user_id = userData.user_id || "";
          await this.adminref.collection('/users').doc(userData.user_id).set({ organizations: firebase.firestore.FieldValue.arrayUnion(roleObj.organization_id) }, { merge: true });
          let checkUserRole = await this.adminref.collection('/users').doc(userData.user_id).collection('roles_by_season').where('hasRoleEnabled', '==', true).where('organization_id', '==', roleObj.organization_id).where('role', '==', "admin").get();
          if (checkUserRole.size) {
            let primaryUserRole: any = await checkUserRole.docs.map((doc: any) => doc.data());
            primaryUserRole = primaryUserRole[0];
            primaryUserRole.updated_datetime = new Date();
            primaryUserRole.isPrimaryAdmin = true;
            primaryUserRole.user_id = userData.user_id;
            await this.adminref.collection('/users').doc(userData.user_id).collection('roles_by_season').doc(primaryUserRole.role_by_season_id).set(primaryUserRole, { merge: true })
            // await organizationCtrl.sendInviteEmail(userData, adminref, true,false,orgName);
          } else {
            roleObj.created_datetime = new Date();
            roleObj.isPrimaryAdmin = true;
            roleObj.hasRoleEnabled = true;
            roleObj.user_id = userData.user_id;
            let UpdateRole = await this.adminref.collection('/users').doc(userData.user_id).collection('roles_by_season').add(roleObj);
            await UpdateRole.set({ role_by_season_id: UpdateRole.id }, { merge: true });

            let checkUserRes = await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').where('user_id', '==', userData.user_id).get();
            if (checkUserRes.size) {
              userData.isUserDuplicated = true;
            } else {
              userData.isUserDuplicated = false;
            }
            userData.hasRoleEnabled = true;
            userData.role = "admin";
            let roles:any = ["admin"];
            let getUserRoles = await this.adminref.collection('/users').doc(userData.user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles[0]).get();
              userData.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              userData.roles = [];
            }


            await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').add(userData);
            // await organizationCtrl.sendInviteEmail(userData, adminref, true, false, orgName);
          }
        } else {
          userObj.first_name = createOrgObj.primary_first_name || "";
          userObj.last_name = createOrgObj.primary_last_name || "";
          userObj.email_address = createOrgObj.primary_admin_email || "";
          userObj.suffix = createOrgObj.primary_suffix || "";
          userObj.middle_initial = createOrgObj.primary_middle_initial || "";
          userObj.organizations = [roleObj.organization_id]
          // user details for create organization
          contactObj.primary_first_name = userObj.first_name || "";
          contactObj.primary_last_name = userObj.last_name || "";
          contactObj.isNewPrimaryUser = true;
          contactObj.primary_admin_email = userObj.email_address || "";
          contactObj.primary_suffix = userObj.suffix || "";
          contactObj.primary_middle_initial = userObj.middle_initial || "";

          let createUser = await this.adminref.collection('/users').add(userObj);
          userObj.user_id = createUser.id || "";
          contactObj.primary_user_id = userObj.user_id || "";
          await createUser.set({ user_id: createUser.id }, { merge: true });

          roleObj.created_datetime = new Date();
          roleObj.isPrimaryAdmin = true;
          roleObj.hasRoleEnabled = true;
          roleObj.user_id = createUser.id || "";
          let createRole = await this.adminref.collection('/users').doc(createUser.id).collection('/roles_by_season').add(roleObj);
          await createRole.set({ role_by_season_id: createRole.id }, { merge: true });
          let checkUserRes = await this.adminref.collection('/organization').doc(roleObj.organization_id)
            .collection('/users').where('user_id', '==', userObj.user_id).get();
          if (checkUserRes.size) {
            userObj.isUserDuplicated = true;
          } else {
            userObj.isUserDuplicated = false;
          }
          userObj.hasRoleEnabled = true;
          userObj.role = "admin";
          let roles:any = ["admin"];
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
          await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').add(userObj);
          // await organizationCtrl.sendInviteEmail(userObj, this.adminref, true, true, orgName);
        }
        if (createOrgObj.secondary_first_name && createOrgObj.secondary_last_name && createOrgObj.secondary_admin_email) {
          let checkSecondaryUser: any = await this.adminref.collection('/users').where('email_address', '==', createOrgObj.secondary_admin_email).where('last_name', '==', createOrgObj.secondary_last_name).where('first_name', '==', createOrgObj.secondary_first_name).get();
          if (checkSecondaryUser.size) {
            let secondaryUserData = checkSecondaryUser.docs.map((doc: any) => doc.data());
            secondaryUserData = secondaryUserData[0];
            // secondary admin details for organization
            contactObj.secondary_first_name = secondaryUserData.first_name || "";
            contactObj.isNewSecondaryUser = false;
            contactObj.secondary_last_name = secondaryUserData.last_name || "";
            contactObj.secondary_admin_email = secondaryUserData.email_address || "";
            contactObj.secondary_suffix = secondaryUserData.suffix || "";
            contactObj.secondary_middle_initial = secondaryUserData.middle_initial || "";
            contactObj.secondary_user_id = secondaryUserData.user_id || "";
            await this.adminref.collection('/users').doc(secondaryUserData.user_id).set({ organizations: firebase.firestore.FieldValue.arrayUnion(roleObj.organization_id) }, { merge: true });
            // check an dcreate role
            let checksecondaryUserRole = await this.adminref.collection('/users').doc(secondaryUserData.user_id).collection('roles_by_season')
              .where('hasRoleEnabled', '==', true).where('organization_id', '==', roleObj.organization_id).where('role', '==', "admin").get();
            if (checksecondaryUserRole.size) {
              let secondaryUserRole: any = await checksecondaryUserRole.docs.map((doc: any) => doc.data());
              secondaryUserRole = secondaryUserRole[0];
              secondaryUserRole.updated_datetime = new Date();
              secondaryUserRole.isSecondaryAdmin = true;
              secondaryUserRole.user_id = secondaryUserData.user_id || "";
              await this.adminref.collection('/users').doc(secondaryUserData.user_id).collection('roles_by_season')
                .doc(secondaryUserRole.role_by_season_id).set(secondaryUserRole, { merge: true })
              // await organizationCtrl.sendInviteEmail(secondaryUserData, adminref, false,false,orgName);
            } else {
              roleObj.created_datetime = new Date();
              roleObj.isSecondaryAdmin = true;
              roleObj.hasRoleEnabled = true;
              roleObj.user_id = secondaryUserData.user_id
              let UpdateRole = await this.adminref.collection('/users').doc(secondaryUserData.user_id).collection('roles_by_season').add(roleObj);
              await UpdateRole.set({ role_by_season_id: UpdateRole.id }, { merge: true });

              let checkSecUserRes = await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').where('user_id', '==', secondaryUserData.user_id).get();
              if (checkSecUserRes.size) {
                secondaryUserData.isUserDuplicated = true;
              } else {
                secondaryUserData.isUserDuplicated = false;
              }
              secondaryUserData.hasRoleEnabled = true;
              secondaryUserData.role = "admin";
              let roles:any = ["admin"];
            let getUserRoles = await this.adminref.collection('/users').doc(secondaryUserData.user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles[0]).get();
              secondaryUserData.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              secondaryUserData.roles = [];
            }
              await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').add(secondaryUserData);
              // await organizationCtrl.sendInviteEmail(secondaryUserData, this.adminref, false,false,orgName);
            }
          } else {
            userObj.first_name = createOrgObj.secondary_first_name || "";
            userObj.last_name = createOrgObj.secondary_last_name || "";
            userObj.email_address = createOrgObj.secondary_admin_email || "";
            userObj.suffix = createOrgObj.secondary_suffix || "";
            userObj.middle_initial = createOrgObj.secondary_middle_initial || "";
            userObj.organizations = [roleObj.organization_id]
            // secondary admin details for organization
            contactObj.secondary_first_name = userObj.first_name || "";
            contactObj.secondary_last_name = userObj.last_name || "";
            contactObj.isNewSecondaryUser = true;
            contactObj.secondary_admin_email = userObj.email_address || "";
            contactObj.secondary_suffix = userObj.suffix || "";
            contactObj.secondary_middle_initial = userObj.middle_initial || "";
            // create User
            let createSecondaryUser = await this.adminref.collection('/users').add(userObj);
            contactObj.secondary_user_id = createSecondaryUser.id || "";
            await createSecondaryUser.set({ user_id: createSecondaryUser.id }, { merge: true });

            userObj.user_id = createSecondaryUser.id || "";
            roleObj.created_datetime = new Date();
            roleObj.isSecondaryAdmin = true;
            roleObj.hasRoleEnabled = true;
            roleObj.user_id = createSecondaryUser.id;
            let createSecondaryUserRole = await this.adminref.collection('/users').doc(createSecondaryUser.id).collection('/roles_by_season').add(roleObj);
            await createSecondaryUserRole.set({ role_by_season_id: createSecondaryUserRole.id }, { merge: true });

            let checkSecUserRes = await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').where('user_id', '==', userObj.user_id).get();
            if (checkSecUserRes.size) {
              userObj.isUserDuplicated = true;
            } else {
              userObj.isUserDuplicated = false;
            }
            userObj.hasRoleEnabled = true;
            userObj.role = "admin";
            let roles:any = ["admin"];
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
            await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').add(userObj);

            // await organizationCtrl.sendInviteEmail(userObj, this.adminref, false, true, orgName);
          }
        }

        await this.adminref.collection('/organization').doc(ref.id).set(contactObj, { merge: true });
        return { 'status': true, 'message': 'Organization created and Admin Invited Successfully.' }
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'message': error.message }
    }
  }

  async sportsBinding(sportsList: any, organizationId: any) {
    const sportsInfoList: any = [];
    for (let sportsInfo of sportsList) {
      let sportInfo = await this.adminref.collection('/sports').doc(sportsInfo).get();
      if (sportInfo.exists) {
        const sportDetail: any = sportInfo.data();
        // sportDetail.isDeleted = false;
        const positionSnapshot = await this.adminref.collection('/sports').doc(sportsInfo).collection('/positions').get();
        sportDetail.positions = positionSnapshot.size ? positionSnapshot.docs.map(doc => doc.data()) : [];
        const positionSkillSnapshot = await this.adminref.collection('/sports').doc(sportsInfo).collection('/position_skills').get();
        sportDetail.position_skills = positionSkillSnapshot.size ? positionSkillSnapshot.docs.map(doc => doc.data()) : [];
        const skillCategorySnapshot = await this.adminref.collection('/sports').doc(sportsInfo).collection('/skill_categories').get();
        sportDetail.skill_categories = skillCategorySnapshot.size ? skillCategorySnapshot.docs.map(doc => doc.data()) : [];
        sportDetail.skill_categories = await this.skillsBinding(sportDetail.skill_categories);
        sportsInfoList.push(sportDetail);
      }
    }
    return sportsInfoList;
  }

  async addSportsDetails(sportsList: any, organizationId: any) {
    const sportsInfoList: any = [];
    if (sportsList && sportsList.length) {
      for (let sportsInfo of sportsList) {
        const sportsDetailInfo = JSON.parse(JSON.stringify(sportsInfo));
        sportsDetailInfo.isDeleted = false;
        delete sportsDetailInfo.positions; delete sportsDetailInfo.position_skills; delete sportsDetailInfo.skill_categories;
        await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportsInfo.sport_id).set(sportsDetailInfo, { merge: true })
        const sportsDetails: any = {};
        sportsDetails.sport_id = sportsInfo.sport_id;
        sportsDetails.positions = await this.addPositionDetails(sportsInfo, organizationId);
        sportsDetails.position_skills = await this.addPositionSkillsDetails(sportsInfo, organizationId);
        sportsDetails.skill_categories = await this.addSkillCategoryDetails(sportsInfo, organizationId);
        if (sportsDetails) {
          sportsInfoList.push(sportsDetails);
        }
      }
    }

    return sportsInfoList;
  }
  async addPositionDetails(sportsInfo: any, organizationId: any) {
    const positionInfoList: any = [];
    if (sportsInfo.positions && sportsInfo.positions.length) {
      for (let positionInfo of sportsInfo.positions) {
        const positionDetailInfo = JSON.parse(JSON.stringify(positionInfo));
        await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportsInfo.sport_id).collection('/positions').doc(positionInfo.position_id).set(positionDetailInfo, { merge: true });
        positionInfoList.push(positionInfo.position_id);
      }
    }
    return positionInfoList;
  }

  async addPositionSkillsDetails(sportsInfo: any, organizationId: any) {
    const positionSkillsInfoList: any = [];
    if (sportsInfo.position_skills && sportsInfo.position_skills.length) {
      for (let positionSkillsInfo of sportsInfo.position_skills) {
        await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportsInfo.sport_id).collection('/position_skills').doc(positionSkillsInfo.position_skill_id).set(positionSkillsInfo, { merge: true });
        positionSkillsInfoList.push(positionSkillsInfo.position_skill_id);
      }
    }
    return positionSkillsInfoList;
  }

  async addSkillCategoryDetails(sportsInfo: any, organizationId: any) {
    const skillCategoryInfoList: any = [];
    if (sportsInfo.skill_categories && sportsInfo.skill_categories.length) {
      for (let skillCategoryInfo of sportsInfo.skill_categories) {
        const skillCategoryDetailInfo = JSON.parse(JSON.stringify(skillCategoryInfo));
        delete skillCategoryDetailInfo.skills;
        await this.adminref.collection('/organization').doc(organizationId).collection('/sports')
          .doc(sportsInfo.sport_id).collection('/skill_categories').doc(skillCategoryInfo.skill_category_id).set(skillCategoryDetailInfo, { merge: true });
        const skillCategoryDetail: any = {};
        skillCategoryDetail.skill_category_id = skillCategoryInfo.skill_category_id;
        skillCategoryDetail.skills = await this.addSkillsInfo(skillCategoryInfo, sportsInfo.sport_id, organizationId);
        if (skillCategoryDetail) {
          skillCategoryInfoList.push(skillCategoryDetail);
        }
      }
    }
    return skillCategoryInfoList;
  }
  async addSkillsInfo(skillCategoryInfo: any, sportId: any, organizationId: any) {
    const skillsInfoList: any = [];
    if (skillCategoryInfo.skills && skillCategoryInfo.skills.length) {
      for (let skillsInfo of skillCategoryInfo.skills) {
        await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportId).collection('/skill_categories')
          .doc(skillCategoryInfo.skill_category_id).collection('/skills').doc(skillsInfo.skill_id).set(skillsInfo, { merge: true });
        skillsInfoList.push(skillsInfo.skill_id);
      }
    }
    return skillsInfoList;
  }

  async skillsBinding(skillCategoryList: any) {
    const skillsInfoList: any = [];
    if (skillCategoryList && skillCategoryList.length) {
      for (let skillCateInfo of skillCategoryList) {
        const skillCategorysInfo = this.adminref.collection('/sports').doc(skillCateInfo.sport_id).collection('/skill_categories').doc(skillCateInfo.skill_category_id).get();
        if (skillCategorysInfo.exists) {
          const skillCategoryDetail: any = skillCategorysInfo.data();
          const skillsSnapshot = await this.adminref.collection('/sports').doc(skillCateInfo.sport_id).collection('/skill_categories').doc(skillCateInfo.skill_category_id).collection('/skills').get();
          skillCategoryDetail.skills = skillsSnapshot.size ? skillsSnapshot.docs.map(doc => doc.data()) : [];
          if (skillCategoryDetail) {
            skillsInfoList.push(skillCategoryDetail);
          }
        }
      }
    }
    return skillsInfoList;
  }

  // Update Organization

  async updateOrganization(updateOrganizationObj: any) {
    try {
      const uid = updateOrganizationObj.uid;
      const orgEmail = updateOrganizationObj.email;
      const orgId = updateOrganizationObj.organization_id;
      const orgName = updateOrganizationObj.name;
      const abbrev = updateOrganizationObj.abbrev;
      const avatarImg = updateOrganizationObj.avatar;
      const sports: any = updateOrganizationObj.sports;
      const updated = new Date();
      const organizationObj: any = {
        name: orgName,
        abbrev: abbrev,
        avatar: avatarImg,
        phone: updateOrganizationObj.phone,
        fax: updateOrganizationObj.fax,
        email_address: orgEmail,
        website: updateOrganizationObj.website,
        street1: updateOrganizationObj.street1,
        street2: updateOrganizationObj.street2,
        city: updateOrganizationObj.city,
        state: updateOrganizationObj.state_name,
        state_code: updateOrganizationObj.state,
        country: updateOrganizationObj.country_name,
        postal_code: updateOrganizationObj.postal_code,
        country_code: updateOrganizationObj.country_code,
        updated_datetime: updated,
        updated_uid: uid,
        governing_body_info: updateOrganizationObj.governing_body_info || "",
        sports: updateOrganizationObj.sports || "",
        governing_key_array_fields: ''
      }
      let governingBodyDropdownArray = [];

      for (let individualgoverningBody of updateOrganizationObj.governing_body_info) {
        if (individualgoverningBody.is_state_governing_organization === 'true') {
          individualgoverningBody.state_governing_organization_id = updateOrganizationObj.organization_id;
          individualgoverningBody.state_governing_organization_name = updateOrganizationObj.name;
          governingBodyDropdownArray.push("true_" + updateOrganizationObj.state + "_" + individualgoverningBody.sport_id)
        }
        if (individualgoverningBody.is_national_governing_organization === 'true') {
          individualgoverningBody.national_governing_organization_id = updateOrganizationObj.organization_id;
          individualgoverningBody.national_governing_organization_name = updateOrganizationObj.name;
          governingBodyDropdownArray.push("true_" + updateOrganizationObj.country_code + "_" + individualgoverningBody.sport_id)
        }
      }
      let nationalGoverningOrgs = [];
      let stateGoverningOrgs = [];
      for (let org of updateOrganizationObj.governing_body_info) {
        if (org.national_governing_organization_id) {
          nationalGoverningOrgs.push(org.national_governing_organization_id);
        }
        if (org.state_governing_organization_id) {
          stateGoverningOrgs.push(org.state_governing_organization_id);
        }

      }
      // updateOrganizationObj.governing_key_array_fields = governingBodyDropdownArray;
      // updateOrganizationObj.nationalGoverningOrganizations = nationalGoverningOrgs;
      // updateOrganizationObj.stateGoverningOrganizations = stateGoverningOrgs; 
      organizationObj.governing_key_array_fields = governingBodyDropdownArray;
      organizationObj.nationalGoverningOrganizations = nationalGoverningOrgs;
      organizationObj.stateGoverningOrganizations = stateGoverningOrgs;
      if (!orgId) {
        return { 'status': false, 'message': 'Organization Id is required.' }
      }
      else if (!sports) {
        return { 'status': false, 'message': 'Sports is required.' }
      } else if (sports.length === 0) {
        return { 'status': false, 'message': "Sports array Shouldn't be empty." }
      }
      else {
        try {

          let organizationInfo = await this.adminref.collection('/organization').doc(orgId).get();
          if (organizationInfo.exists) {
            let ref = await this.adminref.collection('/organization').doc(orgId).update(organizationObj)
            const sportsOfOrg = await this.adminref.collection('/organization').doc(orgId).collection('/sports').get();
            let sportsRefArr = sportsOfOrg.size ? sportsOfOrg.docs.map(doc => doc.get('sport_id')) : []
            if (!sportsRefArr.length) {
              sportsRefArr = [];
            }
            let sportsOrgReference = await this.differenceOf2Arrays(sports, sportsRefArr);
            let sportsReference = await this.removeSportsBinding(sports, sportsOrgReference, orgId);
            if (sportsReference.data) {
              let sportsInfoResponse = await this.sportsBinding(sports, orgId);
              let orgUpdated = await this.addSportsDetails(sportsInfoResponse, orgId);
              if (orgUpdated) {
                let contactObj: any = {};
                if (updateOrganizationObj.old_primary_admin_email) {
                  if (updateOrganizationObj.old_primary_admin_email !== updateOrganizationObj.primary_admin_email) {
                    if (updateOrganizationObj.old_primary_user_id) {
                      let checkPriamryUser: any = await this.adminref.collection('/users').doc(updateOrganizationObj.old_primary_user_id).get();
                      if (checkPriamryUser.exists) {
                        checkPriamryUser = await checkPriamryUser.data();
                        let checkPriamryRole: any = await this.adminref.collection('/users').doc(updateOrganizationObj.old_primary_user_id).collection('/roles_by_season')
                          .where('organization_id', '==', orgId).where('isPrimaryAdmin', '==', true).get();
                        if (checkPriamryRole.size) {
                          checkPriamryRole = await checkPriamryRole.docs.map((doc: any) => doc.data());
                          checkPriamryRole = checkPriamryRole[0];
                          let checknewUserExist: any = await this.adminref.collection('/users').doc(updateOrganizationObj.primary_user_id).get();
                          if (checknewUserExist.exists) {
                            checknewUserExist = checknewUserExist.data();
                            await this.adminref.collection('/users').doc(updateOrganizationObj.primary_user_id).set({ organizations: firebase.firestore.FieldValue.arrayUnion(orgId) }, { merge: true })
                            let checkNewUSerRole: any = await this.adminref.collection('/users').doc(updateOrganizationObj.primary_user_id).collection('/roles_by_season')
                              .where('hasRoleEnabled', '==', true).where('organization_id', '==', orgId).where('role', '==', "admin").get();
                            if (checkNewUSerRole.size) {
                              checkNewUSerRole = await checkNewUSerRole.docs.map((doc: any) => doc.data());
                              checkNewUSerRole = checkNewUSerRole[0];
                              let roleObj = {
                                "updated_datetime": new Date(),
                                "isPrimaryAdmin": true,
                                "user_id": updateOrganizationObj.primary_user_id
                              }

                              await this.adminref.collection('/users').doc(updateOrganizationObj.primary_user_id).collection('/roles_by_season')
                                .doc(checkNewUSerRole.role_by_season_id).set(roleObj, { merge: true });
                              await this.adminref.collection('/users').doc(updateOrganizationObj.old_primary_user_id).collection('/roles_by_season')
                                .doc(checkPriamryRole.role_by_season_id).set({ updated_datetime: new Date(), isPrimaryAdmin: false }, { merge: true });
                              contactObj.primary_last_name = checknewUserExist.last_name || "";
                              contactObj.primary_admin_email = checknewUserExist.email_address || "";
                              contactObj.primary_suffix = checknewUserExist.suffix || "";
                              contactObj.isNewPrimaryUser = false;
                              contactObj.primary_middle_initial = checknewUserExist.middle_initial || "";
                              contactObj.primary_user_id = checknewUserExist.user_id || "";
                              await this.adminref.collection('/organization').doc(orgId).set(contactObj, { merge: true });
                              // Add user under organization/users
                              let checkUserRes = await this.adminref.collection('/organization').doc(orgId).collection('/users').where('user_id', '==', checknewUserExist.user_id).get();
                              if (checkUserRes.size) {
                                checknewUserExist.isUserDuplicated = true;
                              } else {
                                checknewUserExist.isUserDuplicated = false;
                              }
                              checknewUserExist.hasRoleEnabled = true;
                              checknewUserExist.role = "admin";
                              await this.adminref.collection('/organization').doc(checknewUserExist).collection('/users').add(checknewUserExist);
                              // 
                              // await organizationCtrl.sendInviteEmail(checknewUserExist, this.adminref, true, false, orgName);
                            } else {
                              // build role newly
                              const roleObj: any = {
                                role_by_season_id: '',
                                role: 'admin',
                                organization_id: orgId,
                                organization_name: orgName,
                                organization_abbrev: abbrev,
                                player_user_id: '',
                                season_end_date: '',
                                season_id: '',
                                season_label: '',
                                season_start_date: '',
                                sport_id: '',
                                sport_name: '',
                                team_id: '',
                                team_name: '',
                                level_id: '',
                                level_name: '',
                                is_terminated: false,
                                terminated_datetime: '',
                                is_suspended: false,
                                suspended_datetime: '',
                                created_datetime: new Date()
                              }
                              roleObj.created_datetime = new Date();
                              roleObj.isPrimaryAdmin = true;
                              roleObj.hasRoleEnabled = true;
                              roleObj.user_id = updateOrganizationObj.primary_user_id;
                              let createPrimaryUserRole = await this.adminref.collection('/users').doc(updateOrganizationObj.primary_user_id).collection('/roles_by_season').add(roleObj);
                              await createPrimaryUserRole.set({ role_by_season_id: createPrimaryUserRole.id }, { merge: true });
                              // Set existing primary admin as false
                              await this.adminref.collection('/users').doc(updateOrganizationObj.old_primary_user_id).collection('/roles_by_season')
                                .doc(checkPriamryRole.role_by_season_id).set({ updated_datetime: new Date(), isPrimaryAdmin: false }, { merge: true });
                              contactObj.primary_first_name = checknewUserExist.first_name || "";
                              contactObj.primary_last_name = checknewUserExist.last_name || "";
                              contactObj.primary_admin_email = checknewUserExist.email_address || "";
                              contactObj.isNewPrimaryUser = false;
                              contactObj.primary_suffix = checknewUserExist.suffix || "";
                              contactObj.primary_middle_initial = checknewUserExist.middle_initial || "";
                              contactObj.primary_user_id = checknewUserExist.user_id || "";
                              await this.adminref.collection('/organization').doc(orgId).set(contactObj, { merge: true });
                              // await organizationCtrl.sendInviteEmail(checknewUserExist, this.adminref, true, false, orgName);
                              // Add user under organizations/users
                              let checkUserRes = await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').where('user_id', '==', checknewUserExist.user_id).get();
                              if (checkUserRes.size) {
                                checknewUserExist.isUserDuplicated = true;
                              } else {
                                checknewUserExist.isUserDuplicated = false;
                              }
                              checknewUserExist.hasRoleEnabled = true;
                              checknewUserExist.role = "admin";
                              let roles:any = ["admin"];
            let getUserRoles = await this.adminref.collection('/users').doc(checknewUserExist.user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles[0]).get();
              checknewUserExist.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              checknewUserExist.roles = [];
            }
                              await this.adminref.collection('/organization').doc(roleObj.organization_id).collection('/users').add(checknewUserExist);
                            }
                          } else {
                            return { 'status': false, 'message': "New Primary user doesn't exist." }
                          }
                        } else {
                          return { 'status': false, 'message': "Old primary contact is invalid : Not the primary admin in this organization." }
                        }
                      } else {
                        return { 'status': false, 'message': "Old primary contact doesn't exist." }
                      }
                    } else {
                      return { 'status': false, 'message': "Old primary contact is required." }
                    }
                  }
                }
                // secondary user update
                if (updateOrganizationObj.secondary_admin_email) {
                  if (updateOrganizationObj.old_secondary_admin_email !== updateOrganizationObj.secondary_admin_email) {
                    if (updateOrganizationObj.old_secondary_user_id) {
                      let checkSecondaryUser: any = await this.adminref.collection('/users').doc(updateOrganizationObj.old_secondary_user_id).get();
                      if (checkSecondaryUser.exists) {
                        checkSecondaryUser = await checkSecondaryUser.data();
                        let checkSecondaryRole: any = await this.adminref.collection('/users').doc(updateOrganizationObj.old_secondary_user_id).collection('/roles_by_season')
                          .where('organization_id', '==', orgId).where('isSecondaryAdmin', '==', true).get();
                        if (checkSecondaryRole.size) {
                          checkSecondaryRole = checkSecondaryRole.docs.map((doc: any) => doc.data())
                          checkSecondaryRole = checkSecondaryRole[0];
                          let checknewSecUserExist: any = await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).get();
                          if (checknewSecUserExist.exists) {
                            checknewSecUserExist = checknewSecUserExist.data();
                            await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).set({ organizations: firebase.firestore.FieldValue.arrayUnion(orgId) }, { merge: true })
                            let checkNewSecUSerRole: any = await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).collection('/roles_by_season')
                              .where('hasRoleEnabled', '==', true).where('organization_id', '==', orgId).where('role', '==', "admin").get();
                            if (checkNewSecUSerRole.size) {
                              checkNewSecUSerRole = await checkNewSecUSerRole.docs.map((doc: any) => doc.data());
                              checkNewSecUSerRole = checkNewSecUSerRole[0];
                              let roleObj = {
                                "updated_datetime": new Date(),
                                "isSecondaryAdmin": true,
                                "user_id": updateOrganizationObj.secondary_user_id
                              }
                              await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).collection('/roles_by_season')
                                .doc(checkNewSecUSerRole.role_by_season_id).set(roleObj, { merge: true });
                              // set existing secondary admin false
                              await this.adminref.collection('/users').doc(updateOrganizationObj.old_secondary_user_id).collection('/roles_by_season')
                                .doc(checkSecondaryRole.role_by_season_id).set({ updated_datetime: new Date(), isSecondaryAdmin: false }, { merge: true });
                              contactObj.secondary_first_name = checknewSecUserExist.first_name || "";
                              contactObj.secondary_last_name = checknewSecUserExist.last_name || "";
                              contactObj.isNewSecondaryUser = false;
                              contactObj.secondary_admin_email = checknewSecUserExist.email_address || "";
                              contactObj.secondary_suffix = checknewSecUserExist.suffix || "";
                              contactObj.secondary_middle_initial = checknewSecUserExist.middle_initial || "";
                              contactObj.secondary_user_id = checknewSecUserExist.user_id || "";
                              await this.adminref.collection('/organization').doc(orgId).set(contactObj, { merge: true });
                              // await organizationCtrl.sendInviteEmail(checknewSecUserExist, this.adminref, false, false, orgName);
                              // Add new user under org/users
                              let checkUserRes = await this.adminref.collection('/organization').doc(orgId).collection('/users').where('user_id', '==', checknewSecUserExist.user_id).get();
                              if (checkUserRes.size) {
                                checknewSecUserExist.isUserDuplicated = true;
                              } else {
                                checknewSecUserExist.isUserDuplicated = false;
                              }
                              checknewSecUserExist.hasRoleEnabled = true;
                              checknewSecUserExist.role = "admin";
                              await this.adminref.collection('/organization').doc(orgId).collection('/users').add(checknewSecUserExist);
                            } else {
                              // build role newly
                              const roleObj: any = {
                                role_by_season_id: '',
                                role: 'admin',
                                organization_id: orgId,
                                organization_name: orgName,
                                organization_abbrev: abbrev,
                                player_user_id: '',
                                season_end_date: '',
                                season_id: '',
                                season_label: '',
                                season_start_date: '',
                                sport_id: '',
                                sport_name: '',
                                team_id: '',
                                team_name: '',
                                level_id: '',
                                level_name: '',
                                is_terminated: false,
                                terminated_datetime: '',
                                is_suspended: false,
                                suspended_datetime: '',
                                created_datetime: new Date()
                              }
                              roleObj.created_datetime = new Date();
                              roleObj.isSecondaryAdmin = true;
                              roleObj.hasRoleEnabled = true;
                              roleObj.user_id = updateOrganizationObj.secondary_user_id;
                              let createSecondaryUserRole = await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).collection('/roles_by_season').add(roleObj);
                              await createSecondaryUserRole.set({ role_by_season_id: createSecondaryUserRole.id }, { merge: true });
                              // set existinf secondary admin as false
                              await this.adminref.collection('/users').doc(updateOrganizationObj.old_secondary_user_id).collection('/roles_by_season')
                                .doc(checkSecondaryRole.role_by_season_id).set({ updated_datetime: new Date(), isSecondaryAdmin: false }, { merge: true });

                              contactObj.secondary_first_name = checknewSecUserExist.first_name || "";
                              contactObj.secondary_last_name = checknewSecUserExist.last_name || "";
                              contactObj.secondary_admin_email = checknewSecUserExist.email_address || "";
                              contactObj.isNewSecondaryUser = false;
                              contactObj.secondary_suffix = checknewSecUserExist.suffix || "";
                              contactObj.secondary_middle_initial = checknewSecUserExist.middle_initial || "";
                              contactObj.secondary_user_id = checknewSecUserExist.user_id || "";
                              await this.adminref.collection('/organization').doc(orgId).set(contactObj, { merge: true });
                              // await organizationCtrl.sendInviteEmail(checknewSecUserExist, this.adminref, false, false, orgName);
                              // Add new user under org/users
                              let checkUserRes = await this.adminref.collection('/organization').doc(orgId).collection('/users').where('user_id', '==', checknewSecUserExist.user_id).get();
                              if (checkUserRes.size) {
                                checknewSecUserExist.isUserDuplicated = true;
                              } else {
                                checknewSecUserExist.isUserDuplicated = false;
                              }
                              checknewSecUserExist.hasRoleEnabled = true;
                              checknewSecUserExist.role = "admin";
                              let roles:any = ["admin"];
            let getUserRoles = await this.adminref.collection('/users').doc(checknewSecUserExist.user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles[0]).get();
              checknewSecUserExist.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              checknewSecUserExist.roles = [];
            }
                              await this.adminref.collection('/organization').doc(orgId).collection('/users').add(checknewSecUserExist);
                            }
                          } else {
                            return { 'status': false, 'message': "New Secondary user doesn't exist." }
                          }

                        } else {
                          return { 'status': false, 'message': "Old secondary contact is invalid : Not the primary admin in this organization." }
                        }
                      } else {
                        return { 'status': false, 'message': "Old secondary contact doesn't exist." }
                      }
                    } else {
                      let checknewSecUserExist: any = await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).get();
                      if (checknewSecUserExist.exists) {

                        checknewSecUserExist = checknewSecUserExist.data();
                        let checkNewSecUSerRole: any = await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).collection('/roles_by_season')
                          .where('hasRoleEnabled', '==', true).where('organization_id', '==', orgId).where('role', '==', "admin").get();
                        if (checkNewSecUSerRole.size) {
                          checkNewSecUSerRole = await checkNewSecUSerRole.docs.map((doc: any) => doc.data());
                          checkNewSecUSerRole = checkNewSecUSerRole[0];
                          let roleObj = {
                            "updated_datetime": new Date(),
                            "isSecondaryAdmin": true,
                            "user_id": updateOrganizationObj.secondary_user_id
                          }
                          await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).set({ organizations: firebase.firestore.FieldValue.arrayUnion(orgId) }, { merge: true })
                          await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).collection('/roles_by_season')
                            .doc(checkNewSecUSerRole.role_by_season_id).set(roleObj, { merge: true });
                          // set existing secondary admin false

                          contactObj.secondary_first_name = checknewSecUserExist.first_name || "";
                          contactObj.secondary_last_name = checknewSecUserExist.last_name || "";
                          contactObj.secondary_admin_email = checknewSecUserExist.email_address || "";
                          contactObj.secondary_suffix = checknewSecUserExist.suffix || "";
                          contactObj.isNewSecondaryUser = false;
                          contactObj.secondary_middle_initial = checknewSecUserExist.middle_initial || "";
                          contactObj.secondary_user_id = checknewSecUserExist.user_id || "";
                          await this.adminref.collection('/organization').doc(orgId).set(contactObj, { merge: true });
                          // await organizationCtrl.sendInviteEmail(checknewSecUserExist, this.adminref, false, false, orgName);
                          // Add new user under org/users
                          let checkUserRes = await this.adminref.collection('/organization').doc(orgId).collection('/users').where('user_id', '==', checknewSecUserExist.user_id).get();
                          if (checkUserRes.size) {
                            checknewSecUserExist.isUserDuplicated = true;
                          } else {
                            checknewSecUserExist.isUserDuplicated = false;
                          }
                          checknewSecUserExist.hasRoleEnabled = true;
                          checknewSecUserExist.role = "admin";
                          await this.adminref.collection('/organization').doc(orgId).collection('/users').add(checknewSecUserExist);
                        } else {
                          // build role newly
                          const roleObj: any = {
                            role_by_season_id: '',
                            role: 'admin',
                            organization_id: orgId,
                            organization_name: orgName,
                            organization_abbrev: abbrev,
                            player_user_id: '',
                            season_end_date: '',
                            season_id: '',
                            season_label: '',
                            season_start_date: '',
                            sport_id: '',
                            sport_name: '',
                            team_id: '',
                            team_name: '',
                            level_id: '',
                            level_name: '',
                            is_terminated: false,
                            terminated_datetime: '',
                            is_suspended: false,
                            suspended_datetime: '',
                            created_datetime: new Date()
                          }
                          roleObj.created_datetime = new Date();
                          roleObj.isSecondaryAdmin = true;
                          roleObj.hasRoleEnabled = true;
                          roleObj.user_id = updateOrganizationObj.secondary_user_id;
                          await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).set({ organizations: firebase.firestore.FieldValue.arrayUnion(orgId) }, { merge: true })
                          let createSecondaryUserRole = await this.adminref.collection('/users').doc(updateOrganizationObj.secondary_user_id).collection('/roles_by_season').add(roleObj);
                          await createSecondaryUserRole.set({ role_by_season_id: createSecondaryUserRole.id }, { merge: true });
                          // set existinf secondary admin as false

                          contactObj.secondary_first_name = checknewSecUserExist.first_name || "";
                          contactObj.secondary_last_name = checknewSecUserExist.last_name || "";
                          contactObj.secondary_admin_email = checknewSecUserExist.email_address || "";
                          contactObj.secondary_suffix = checknewSecUserExist.suffix || "";
                          contactObj.isNewSecondaryUser = false;
                          contactObj.secondary_middle_initial = checknewSecUserExist.middle_initial || "";
                          contactObj.secondary_user_id = checknewSecUserExist.user_id || "";
                          await this.adminref.collection('/organization').doc(orgId).set(contactObj, { merge: true });
                          // await organizationCtrl.sendInviteEmail(checknewSecUserExist, this.adminref, false, false, orgName);
                          // Add new user under org/users
                          let checkUserRes = await this.adminref.collection('/organization').doc(orgId).collection('/users').where('user_id', '==', checknewSecUserExist.user_id).get();
                          if (checkUserRes.size) {
                            checknewSecUserExist.isUserDuplicated = true;
                          } else {
                            checknewSecUserExist.isUserDuplicated = false;
                          }
                          checknewSecUserExist.hasRoleEnabled = true;
                          checknewSecUserExist.role = "admin";
                          let roles:any = ["admin"];
            let getUserRoles = await this.adminref.collection('/users').doc(checknewSecUserExist.user_id).collection('/roles_by_season').where('organization_id', '==', roleObj.organization_id).get();
            getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc: any) => doc.data().role) : [];
            roles = getUserRoles.length ? roles.concat(getUserRoles) : roles;
            roles = [...new Set(roles)];

            if (roles[0] && roles[0].length) {
              let getRolesFromMaster = await this.adminref.collection('/roles').where('role_id', 'in', roles[0]).get();
              checknewSecUserExist.roles = getRolesFromMaster.size ? getRolesFromMaster.docs.map((doc: any) => doc.data().name) : [];
            } else {
              checknewSecUserExist.roles = [];
            }
                          await this.adminref.collection('/organization').doc(orgId).collection('/users').add(checknewSecUserExist);
                        }
                      } else {
                        return { 'status': false, 'message': "New Secondary user doesn't exist." }
                      }
                      // return { 'status': false, 'message': "Old secondary contact is required." }
                    }
                  } else {
                    return { 'status': false, 'message': "Old secondary contact and new secondary contact should not be same. Please check." }
                  }
                }
                await this.generateKeywords(updateOrganizationObj)
                return { 'status': true, 'message': 'Organization updated successfully.' }
              } else {
                return { 'status': false, 'message': "Unable to update. Please try again." }
              }
            } else {
              return { 'status': false, 'message': sportsReference.error }
            }
          } else {
            return { 'status': false, 'message': "Organization doesn't exist." }
          }
        } catch (err) {
          return { 'status': false, 'message': err.message }
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
      const keywordForOrgEmailAddress = this.createKeywords(`${userData.email}`);
      const keywordForOrgName = this.createKeywords(`${userData.name}`);
      const keywordForAbbrev = this.createKeywords(`${userData.abbrev}`);
      const keywordForPhone = this.createKeywords(`${userData.phone}`);
      const keywordForCountryCode = this.createKeywords(`${userData.country_name}`);
      const keywordForState = this.createKeywords(`${userData.state_name}`);


      const keywords = [
        ...new Set([
          '',
          ...keywordForOrgEmailAddress,
          ...keywordForOrgName,
          ...keywordForAbbrev,
          ...keywordForPhone,
          ...keywordForCountryCode,
          ...keywordForState
        ])
      ];
      await this.adminref.collection('/organization').doc(userData.organization_id).set({
        keywords: keywords
      }, { merge: true });
      return true;
    } catch (err) {
      console.log(err);

      return true
    }
  }

  differenceOf2Arrays(array1: any, array2: any) {
    var temp = [];
    const arrayOne = array1.toString().split(',').map(String);
    const arrayTwo = array2.toString().split(',').map(String);

    for (var i in arrayOne) {
      if (arrayTwo.indexOf(arrayOne[i]) === -1) temp.push(arrayOne[i]);
    }
    for (i in arrayTwo) {
      if (arrayOne.indexOf(arrayTwo[i]) === -1) temp.push(arrayTwo[i]);
    }
    return temp.sort((a, b) => a - b);
  }
  async removeSportsBinding(sportsList: any, orgSports: any, organizationId: any) {
    try {
      // for (let sportsInfo of orgSports) {
      //   if (sportsInfo) {
      //     // let hasSportMapped = await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportsInfo).listCollections();
      //     let hasSportMapped: any = await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportsInfo);

      //     // cannedResponse
      //     let isCannedResponse: any = await hasSportMapped.collection('/CannedResponse').get();
      //     if (isCannedResponse.size) {
      //       return {
      //         "status": false,
      //         "error": "Cannot delete Sport. This sport has tiedup with canned response."
      //       }
      //     } else {
      //       let isTag: any = await hasSportMapped.collection('/Tags').get();
      //       if (isTag.size) {
      //         return {
      //           "status": false,
      //           "error": "Cannot delete Sport. This sport has tiedup with tags."
      //         }
      //       } else {
      //         let isLevel: any = await hasSportMapped.collection('/Levels').get();
      //         if (isLevel.size) {
      //           return {
      //             "status": false,
      //             "error": "Cannot delete Sport. This sport has tiedup with levels."
      //           }
      //         } else {
      //           let ispositon: any = await hasSportMapped.collection('/positions').get();
      //           if (ispositon.size) {
      //             return {
      //               "status": false,
      //               "error": "Cannot delete Sport. This sport has tiedup with positions."
      //             }
      //           } else {
      //             let isSeason: any = await hasSportMapped.collection('/seasons').get();
      //             if (isSeason.size) {
      //               return {
      //                 "status": false,
      //                 "error": "Cannot delete Sport. This sport has tiedup with seasons."
      //               }
      //             } else {
      //               const sportInfo: any = await this.adminref.collection('/organization').doc(organizationId).collection('/sports').doc(sportsInfo).get();
      //               if (sportInfo.exists) {
      //                 await sportInfo.ref.update({ isDeleted: true });
      //               }
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
      return {
        "status": true,
        "data": "success"
      }
    } catch (err) {
      return {
        "status": false,
        "error": err.message
      }
    }

  }
  async getOrganizationGridResponse(getOrganizationObj: any) {
    try {
      const pageNo = getOrganizationObj.page_no;
      let itemPerPage = getOrganizationObj.item_per_page;
      // const searchKey = request.body.search;
      const uid = getOrganizationObj.uid;
      let totalRecord: any;
      const startFrom = (pageNo - 1) * itemPerPage;

      if (!itemPerPage) { itemPerPage = 10; }
      if (!pageNo) {
        return { 'status': false, 'message': 'Page No is required' }
      } else if (!uid) {
        return { 'status': false, 'message': 'Uid is required' }
      } else {
        let CollectionRef: any = await this.adminref.collection('/organization').orderBy(getOrganizationObj.sortingKey, getOrganizationObj.sortingValue);
        if (getOrganizationObj.searchKey && getOrganizationObj.searchVal) {
          CollectionRef = await CollectionRef.where(getOrganizationObj.searchKey, 'array-contains', getOrganizationObj.searchVal)
        }
        if (getOrganizationObj.isPrevReq) {
          totalRecord = await CollectionRef.get();
          CollectionRef = await CollectionRef.startAt(getOrganizationObj.prevStartAt).limit(getOrganizationObj.item_per_page).get();
        } else if (getOrganizationObj.isNextReq) {
          totalRecord = await CollectionRef.get();
          CollectionRef = await CollectionRef.startAfter(getOrganizationObj.nextStartAt).limit(getOrganizationObj.item_per_page).get();
        } else {
          totalRecord = await CollectionRef.get();
          CollectionRef = await CollectionRef.limit(getOrganizationObj.item_per_page).get();
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
      }
    } catch (error) {
      console.log(error);
      return { 'status': false, 'error': error.message }
    }

  }
}
