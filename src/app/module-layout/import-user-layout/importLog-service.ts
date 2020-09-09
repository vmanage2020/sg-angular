import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
import {get} from "lodash";

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';

import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';

import { RestApiService } from '../../shared/rest-api.services';
@Injectable({
    providedIn: 'root'
})
export class ImportLogService {
    adminref: any = firebase.firestore();
    orgId: any;

    public _importusers = new BehaviorSubject<any[]>([]);
  public dataStore:{ userlogs: any } = { userlogs: [] };
  readonly connections = this._importusers.asObservable();

  public _sports = new BehaviorSubject<any[]>([]);
  public sportsdataStore:{ sports: any } = { sports: [] };
  readonly connections1 = this._sports.asObservable();

    constructor(private titlecasePipe: TitleCasePipe, 
        private restApiService: RestApiService) { 

            this.orgId = localStorage.getItem('org_id');
            console.log('orgId',this.orgId);
            
            var url = 'importuserlogsdbyorg/'+this.orgId;
            this.getUserlogs(url);

            this.getSports('sports');
        }

        private handleError(error: HttpErrorResponse) {
        const message = get(error, 'message') || 'Something bad happened; please try again later.';
        return throwError(message);
        }

        getUserlogs( url)
        {
            this.restApiService.lists(url).subscribe( data => {
                this.dataStore.userlogs = data.reverse();
                this._importusers.next(Object.assign({}, this.dataStore).userlogs);
            },
                catchError(this.handleError)
            );
        }

        getSports( url )
        {
            this.restApiService.lists(url).subscribe( data => {
                this.sportsdataStore.sports = data.reverse();
                this._sports.next(Object.assign({}, this.sportsdataStore).sports);
            },
                catchError(this.handleError)
            );
        }

    // get All users list
    async getImportUserList(getSportObj: any) {


        try {
            const validateData = getSportObj;
            const pageNo = validateData.page_no;
            let itemPerPage = validateData.item_per_page;

            const startFrom = (pageNo - 1) * itemPerPage;

            if (!itemPerPage) { itemPerPage = 10; }
            let totalLog: any
            let logData: any
            /* get team data*/
            if (validateData.seasonType === "All") {
                logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                    .collection('/import_users_log');

            } else if (validateData.seasonType === "Active") {
                logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                    .collection('/import_users_log').where('isActive', '==', true);
            } else if (validateData.seasonType === "Past") {
                logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                    .collection('/import_users_log').where('isActive', '==', false);
            } else {
                return { "status": false, "error": "invalid request" };
            }
            if (validateData.searchKey && validateData.searchVal) {
                logData = await logData.where(validateData.searchKey, 'array-contains', validateData.searchVal);
            }
            totalLog = await logData.get();

            if (validateData.isNextReq) {
                logData = await logData.where(validateData.searchKey, 'array-contains', validateData.searchVal).orderBy(getSportObj.sortingKey, getSportObj.sortingValue)
                    .startAfter(getSportObj.nextStartAt).limit(getSportObj.item_per_page).get();
            } else if (validateData.isPrevReq) {
                logData = await logData.where(validateData.searchKey, 'array-contains', validateData.searchVal).orderBy(getSportObj.sortingKey, getSportObj.sortingValue)
                    .startAfter(getSportObj.nextStartAt).limit(getSportObj.item_per_page).get();
            } else {
                logData = await logData.orderBy(getSportObj.sortingKey, getSportObj.sortingValue).limit(getSportObj.item_per_page).get();
            }
            if (logData.size) {
                let importUserRef = logData;
                let importUserCollectionRefData = await logData.docs.map((doc: any) => doc.data());
                return {
                    status: true,
                    data: importUserCollectionRefData,
                    snapshot: importUserRef,
                    totalRecords: totalLog.size || 0
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

    async getImportUserData(queryObj: any) {
        try {
            const validateData = queryObj;
            if (validateData) {
                const pageNo = queryObj.page_no;
                let logData: any;
                let itemPerPage = queryObj.item_per_page;

                const startFrom = (pageNo - 1) * itemPerPage;

                if (!itemPerPage) { itemPerPage = 10; }
                /* get team data*/
                if (validateData.filterType === "All") {
                    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data');
                } else if (validateData.filterType === "Error") {
                    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data').where('processed_flag', 'in', ['e', 'E']);
                } else if (validateData.filterType === "UnProcessed") {
                    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data').where('processed_flag', 'in', ['n', 'N'])
                } else if (validateData.filterType === "Success") {
                    logData = await this.adminref.collection('/organization').doc(validateData.organization_id)
                        .collection('/import_users_log').doc(validateData.imported_file_id).collection('/imported_users_data').where('processed_flag', 'in', ['y', 'Y'])
                } else {
                    return { "status": false, "error": "invalid request" };
                }
                if (validateData.searchKey && validateData.searchVal) {
                    logData = await logData.where(validateData.searchKey, 'array-contains', validateData.searchVal);
                }
                let totalRecords: any;
                totalRecords = await logData.get();
                if (validateData.isNextReq) {
                    logData = await logData.orderBy(validateData.sortingKey, validateData.sortingValue).startAfter(validateData.nextStartAt).limit(validateData.item_per_page).get();
                } else if (validateData.isPrevReq) {
                    logData = await logData.orderBy(validateData.sortingKey, validateData.sortingValue).startAt(validateData.prevStartAt).limit(validateData.item_per_page).get();
                } else {
                    logData = await logData.orderBy(validateData.sortingKey, validateData.sortingValue).limit(validateData.item_per_page).get();
                }
                if (logData.size) {
                    let userCollectionRefData = await logData.docs.map((doc: any) => doc.data());
                    userCollectionRefData = userCollectionRefData.map((log: any) => {
                        // log.athlete_1_dob = log.athlete_1_dob.toDate();

                        let obj = {
                            "id": log.id,
                            "player_first_name": log.athlete_1_first_name,
                            "player_last_name": log.athlete_1_last_name || null,
                            "player_initial": log.athlete_1_middle_name || null,
                            "player_gender": log.athlete_1_gender || null,
                            "player_DOB": log.athlete_1_dob ? log.athlete_1_dob.toDate() : null,
                            "level_of_play": log["Level of Play"] || null,
                            "guardian1_first_name": log["guardian_1_first_name"] || null,
                            "guardian1_last_name": log["guardian_1_last_name"] || null,
                            "guardian1_email_address": log["guardian_1_email_1"] || null,
                            "guardian2_first_name": log["guardian_2_first_name"] || null,
                            "guardian2_last_name": log["guardian_2_last_name"] || null,
                            "guardian2_email_address": log["guardian_2_email_1"] || null,
                            "status": log.status || null,
                            "processed_flag": log.processed_flag || null,
                            "error_description": log.error_description || null,
                            "address": log.athlete_1_address_1 || null,
                            "city": log.athlete_1_city_1 || null,
                            "state": log.athlete_1_state_1 || null,
                            "country": log.athlete_1_country_1 || null,
                            "postal_code": log.athlete_1_zip_1 || null,
                            "error_for_status": log.error_for_status || null
                        }
                        return obj;
                    });
                    console.log(userCollectionRefData);
                    // userCollectionRefData = _.unionBy(userCollectionRefData,'user_id');
                    console.log(totalRecords);
                    // totalRecords= _.unionBy(totalRecords,'user_id');
                    console.log(userCollectionRefData);
                    return {
                        status: true,
                        data: userCollectionRefData,
                        snapshot: logData,
                        totalRecords: totalRecords.size || 0
                    }

                } else {
                    return {
                        status: false,
                        data: []
                    }
                }
            } else {
                return {
                    "status": false,
                    "error": "Validation Error"
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

    buildObj = (inputObj: any) => {
        try {
            let returnObj = [];
            for (let inx of inputObj) {
                let obj = {
                    "athlete_1_first_name": inx.athlete_1_first_name || "-",
                    "athlete_1_middle_name": inx.athlete_1_middle_name || "-",
                    "athlete_1_last_name": inx.athlete_1_last_name || "-",
                    "athlete_1_dob": inx.athlete_1_dob ? inx.athlete_1_dob.toDate() : "-",
                    "athlete_1_gender": inx.athlete_1_gender || "-",
                    "athlete_1_level": inx.athlete_1_level || "-",
                    "athlete_1_email": inx.athlete_1_email || "-",
                    "athlete_1_address_1": inx.athlete_1_address_1 || "-",
                    "athlete_1_address_1_cont": inx.athlete_1_address_1_cont || "-",
                    "athlete_1_city_1": inx.athlete_1_city_1 || "-",
                    "athlete_1_state_1": inx.athlete_1_state_1 || "-",
                    "athlete_1_zip_1": inx.athlete_1_zip_1 || "-",
                    "athlete_1_country_1": inx.athlete_1_country_1 || "-",
                    "athlete_1_citizenship": inx.athlete_1_citizenship || "-",
                    "guardian_1_first_name": inx.guardian_1_first_name || "-",
                    "guardian_1_last_name": inx.guardian_1_last_name || "-",
                    "guardian_1_phone_1": inx.guardian_1_phone_1 || "-",
                    "guardian_1_phone_2": inx.guardian_1_phone_2 || "-",
                    "guardian_1_email_1": inx.guardian_1_email_1 || "-",
                    "guardian_2_first_name": inx.guardian_2_first_name || "-",
                    "guardian_2_last_name": inx.guardian_2_last_name || "-",
                    "guardian_2_phone_1": inx.guardian_2_phone_1 || "-",
                    "guardian_2_email_1": inx.guardian_2_email_1 || "-",
                    "guardian_1_medical_insurance_company": inx.guardian_1_medical_insurance_company || "-",
                    "guardian_1_medical_insurance_group_number": inx.guardian_1_medical_insurance_group_number || "-",
                    "guardian_1_medical_insurance_policy_number": inx.guardian_1_medical_insurance_policy_number || "-",
                    "emergency_contact_1_first_name": inx.emergency_contact_1_first_name || "-",
                    "emergency_contact_1_last_name": inx.emergency_contact_1_last_name || "-",
                    "emergency_1_phone_1": inx.emergency_1_phone_1 || "-",
                    "emergency_1_address_1": inx.emergency_1_address_1 || "-",
                    "emergency_1_city_1": inx.emergency_1_city_1 || "-",
                    "emergency_1_state_1": inx.emergency_1_state_1 || "-",
                    "emergency_1_zip_1": inx.emergency_1_zip_1 || "-",
                    "physician_1_first_name": inx.physician_1_first_name || "-",
                    "physician_1_last_name": inx.physician_1_last_name || "-",
                    "physician_1_phone_1": inx.physician_1_phone_1 || "-",
                    "hospital_of_choice_1": inx.hospital_of_choice_1 || "-",
                    "medical_issue_1": inx.medical_issue_1 || "-",
                    "medical_issue_2": inx.medical_issue_2 || "-",
                    "medical_issue_3": inx.medical_issue_3 || "-",
                    "medical_issue_4": inx.medical_issue_4 || "-",
                    "medical_issue_5": inx.medical_issue_5 || "-",
                    "allergy_1": inx.allergy_1 || "-",
                    "allergy_2": inx.allergy_2 || "-",
                    "allergy_3": inx.allergy_3 || "-",
                    "allergy_4": inx.allergy_4 || "-",
                    "allergy_5": inx.allergy_5 || "-",
                    "other": inx.other || "-",
                    "other_medical_history_implications": inx.other_medical_history_implications || "-",
                    "tetanus_booster": inx.tetanus_booster || "-",
                    "tetanus_booster_date": inx.tetanus_booster_date || "-",
                    "taking_medications": inx.taking_medications || "-",
                    "medication_1": inx.medication_1 || "-",
                    "medication_2": inx.medication_2 || "-",
                    "medication_3": inx.medication_3 || "-",
                    "medication_4": inx.medication_4 || "-",
                    "medication_5": inx.medication_5 || "-",
                    "medication_1_dosage": inx.medication_1_dosage || "-",
                    "medication_2_dosage": inx.medication_2_dosage || "-",
                    "medication_3_dosage": inx.medication_3_dosage || "-",
                    "medication_4_dosage": inx.medication_4_dosage || "-",
                    "medication_5_dosage": inx.medication_5_dosage || "-",
                    "medication_1_frequency": inx.medication_1_frequency || "-",
                    "medication_2_frequency": inx.medication_2_frequency || "-",
                    "medication_3_frequency": inx.medication_3_frequency || "-",
                    "medication_4_frequency": inx.medication_4_frequency || "-",
                    "medication_5_frequency": inx.medication_5_frequency || "-",
                    "restrictions": inx.restrictions || "-",
                    "medical_restrictions_list": inx.medical_restrictions_list || "-",
                    "Consent to Treat Agreement": inx["Consent to Treat Agreement"] || "-",
                    "guardian_1_signature_1": inx.guardian_1_signature_1 || "-",
                    "Parent/Guardian Code of Conduct Signature": inx["Parent/Guardian Code of Conduct Signature"] || "-",
                    "Parent Code of Conduct Signature_cp1": inx["Parent Code of Conduct Signature_cp1"] || "-",
                    "How would you like to pay today?": inx["How would you like to pay today?"] || "-",
                    "Registration Fee - Online In Full": inx["Registration Fee - Online In Full"] || "-",
                    "Registration Fee - Offline": inx["Registration Fee - Offline"] || "-",
                    "Registration Fee - Payment Plan": inx["Registration Fee - Payment Plan"] || "-",
                    "Offline password": inx["Offline password"] || "-",
                    "Raffle Fees": inx["Raffle Fees"] || "-",
                    "Please enter the name of your Oldest skater": inx["Please enter the name of your Oldest skater"] || "-",
                    "Admin Only: Paid in Full": inx["Admin Only: Paid in Full"] || "-",
                    "Admin Only:  Offline Payment Check Number 1": inx["Admin Only:  Offline Payment Check Number 1"] || "-",
                    "Admin Only:  Offline Payment Amount 1": inx["Admin Only:  Offline Payment Amount 1"] || "-",
                    "Admin Only:  Offline Payment Check Number 2": inx["Admin Only:  Offline Payment Check Number 2"] || "-",
                    "Admin Only:  Offline Payment Amount 2": inx["Admin Only:  Offline Payment Amount 2"] || "-",
                    "Admin Only: Raffle Fee Check": inx["Admin Only: Raffle Fee Check"] || "-",
                    "Admin Only: Raffle Amount": inx["Admin Only: Raffle Amount"] || "-",
                    "Admin Only: Raffle Tickets Received": inx["Admin Only: Raffle Tickets Received"] || "-",
                    "Volunteer Electronic Signature": inx["Volunteer Electronic Signature"] || "-",
                    "guardian_1_signature_1_cp3": inx["guardian_1_signature_1_cp3"] || "-",
                    "Admin Only: Volunteer Hour Check Number 1": inx["Admin Only: Volunteer Hour Check Number 1"] || "-",
                    "Admin Only: Volunteer Hour Check Amount 1": inx["Admin Only: Volunteer Hour Check Amount 1"] || "-",
                    "Admin Only: Volunteer Hour Check Number 2": inx["Admin Only: Volunteer Hour Check Number 2"] || "-",
                    "Admin Only: Volunteer Hour Check Amount 2": inx["Admin Only: Volunteer Hour Check Amount 2"] || "-",
                    "Terms and Conditions Acceptance": inx["Terms and Conditions Acceptance"] || "-",
                    "guardian_1_signature_4": inx["guardian_1_signature_4"] || "-",
                    "Entry Number": inx["Entry Number"] || "-",
                    "usa_hockey_confirmation_number": inx["usa_hockey_confirmation_number"] || "-",
                    "Player Profile": inx["Player Profile"] || "-",
                    "Registration Date": inx["Registration Date"] || "-",
                    "Order Number": inx["Order Number"] || "-",
                    "Account Email": inx["Account Email"] || "-",
                    "Secondary Email": inx["Secondary Email"] || "-",
                    "Entry Status": inx["Entry Status"] || "-",
                    "SportsEngine ID": inx["SportsEngine ID"] || "-",
                    "Unclaimed Profiles": inx["Unclaimed Profiles"] || "-",
                    "Order Status": inx["Order Status"] || "-",
                    "Item Payment Status": inx["Item Payment Status"] || "-",
                    "Payment Type": inx["Payment Type"] || "-",
                    "Gross": inx.Gross || "-",
                    "Net": inx.Net || "-",
                    "Service Fee": inx["Service Fee"] || "-",
                    "Gross Outstanding": inx["Gross Outstanding"] || "-",
                    "Net Outstanding": inx["Net Outstanding"] || "-",
                    "Service Fee Outstanding": inx["Service Fee Outstanding"] || "-",
                    "Gross Forecast": inx["Gross Forecast"] || "-",
                    "Net Forecast": inx["Net Forecast"] || "-",
                    "Service Fee Forecast": inx["Service Fee Forecast"] || "-",
                    "Discount Amount": inx["Discount Amount"] || "-",
                    "Discount Names": inx["Discount Names"] || "-",
                    "Subtotal": inx.Subtotal || "-",
                    "Refunds": inx.Refunds || "-"
                }
                returnObj.push(obj);
            }
            return { "status": true, data: returnObj }
        } catch (err) {
            return { "status": false, error: err.message }
        }

    }

    async uploadRegistrationFile(queryObj: any) {
        try {
            // const created = new Date();
            const userRegisterationDataObj: any = {
                // "": '',
                "file_id": queryObj.file_id,
                "imported_user_id": queryObj.auth_id,
                "imported_by": queryObj.imported_by,
                "imported_datetime": queryObj.imported_datetime,
                "imported_file_url": queryObj.imported_file_url,
                "imported_file_name": queryObj.imported_file_name,
                "imported_file_template": queryObj.imported_file_template,
                "organization_id": queryObj.organization_id,
                "sports_id": queryObj.sports_id,
                "sports_name": queryObj.sports_name,
                "season_id": queryObj.season_id,
                "season_name": queryObj.season_name,
                "status": queryObj.status || [],
                "season_start_date": new Date(queryObj.season_start_date),
                "season_end_date": new Date(queryObj.season_end_date),
                "total_records": queryObj.total_records || 0,
                "processed_records": 0,
                "error_records": 0,
                "erroDes": [],
                "processed_Flag": 'N',
                "total_records_found": 0,
                "total_players_found": 0,
                "total_guardains_found": 0,
                "player_records_created": 0,
                "guardian_records_created": 0,
                "player_duplicate_records_found": 0,
                "guardian_duplicate_records_found": 0
            }
            let dt = new Date();
            console.log("userRegisterationDataObj.season_end_date");
            console.log(userRegisterationDataObj.season_end_date);

            userRegisterationDataObj.season_end_date = new Date(userRegisterationDataObj.season_end_date);
            console.log(userRegisterationDataObj.season_end_date);
            if (userRegisterationDataObj.season_end_date >= dt) {
                userRegisterationDataObj.isActive = true;
            } else {
                userRegisterationDataObj.isActive = false;
            }
            const organizationRef = await this.adminref.collection('/organization').doc(queryObj.organization_id).get();
            if (organizationRef.exists) {
                if (queryObj.imported_file_id) {
                    await organizationRef.ref.collection('/import_users_log').doc(queryObj.imported_file_id).delete();
                    let importedUserSnapshot = await organizationRef.ref.collection('/import_users_log').add(userRegisterationDataObj);
                    await importedUserSnapshot.set({ imported_file_id: importedUserSnapshot.id }, { merge: true })
                    return { status: true, message: "File Imported Successfully", data: importedUserSnapshot };
                } else {
                    let importedUserSnapshot = await organizationRef.ref.collection('/import_users_log').add(userRegisterationDataObj);
                    await importedUserSnapshot.set({ imported_file_id: importedUserSnapshot.id }, { merge: true })
                    return { status: true, message: "File Imported Successfully", data: importedUserSnapshot };
                }
            } else {
                return {
                    "status": false,
                    "error": "Organization doesn't exist"
                };
            }
        } catch (err) {
            return {
                "status": false,
                "error": err.message
            };
        }
    }
}
