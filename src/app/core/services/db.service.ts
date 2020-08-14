import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from "rxjs";
import * as firebase from 'firebase';

@Injectable({
    providedIn: 'root'
})
export class DbService {
    private subject = new Subject<any>();

    constructor() {
    }

    async postData(insertObj: any) {

        let obj = Object.assign({}, insertObj);
        try {
            let data = await firebase.firestore().collection('/teams').where('season_id', '==', insertObj.season_id).where('team_name', '==', insertObj.team_name).get();
            if (data.size) {

                return {
                    "status": false,
                    "error": "Team exist already!"
                }
            } else {
                let dt = new Date();
                obj['created_uid'] = insertObj.auth_uid;
                insertObj['created_uid'] = insertObj.auth_uid;
                insertObj['created_datetime'] = dt;
                obj['created_datetime'] = dt;
                obj['updated_uid'] = insertObj.auth_uid;
                obj['updated_datetime'] = dt;
                delete obj.auth_uid; delete obj.player; delete obj.coach; delete obj.manager;
                // await firebase.firestore().collection('/organization').doc(insertObj.organization_id).collection('/sports').doc(insertObj.sport_id).collection('/seasons').doc(insertObj.season_id).collection('/teams').doc(obj.team_id).set(obj, { merge: true });
                let roleBySeasonObj = await this.getTeamMetaData(insertObj);
                let getAdminList = await firebase.firestore().collectionGroup('roles_by_season').where('organization_id','==',roleBySeasonObj.organization_id).where('role', '==', 'admin').get();
                if(getAdminList.size){
                    for(let eachAdmin of getAdminList.docs){
                        roleBySeasonObj.role = 'admin'
                        let roleObj = eachAdmin.data();
                        if(roleObj.is_terminated){
                            roleBySeasonObj.is_terminated = true
                            roleObj.terminated_datetime = roleObj.terminated_datetime
                        }

                        let addRoleRes = await firebase.firestore().collection('/users').doc(roleObj.user_id).collection('/roles_by_season').add(roleBySeasonObj);
                        await addRoleRes.set({role_by_season_id : addRoleRes.id},{merge : true});
                    }
                }
                let teamMembersId = [];
                let teamMembers: any = [{ people_id: 'player', display_name: 'Players' }, { people_id: 'coach', display_name: 'Coaches' },
                { people_id: 'manager', display_name: 'Managers' }]; // Team Members List of Roles
                for (let teamMemberRole of teamMembers) {

                    let team_members_id = roleBySeasonObj.team_id + "_" + teamMemberRole.people_id;
                    await firebase.firestore().collection('/team_members').doc(team_members_id).set(teamMemberRole, { merge: true });
                    let userDetails: any = {};
                    // userDetails['people_user_id'] = teamMemberRole.people_id;
                    userDetails['created_uid'] = insertObj.auth_uid || "";
                    userDetails['created_datetime'] = dt || "";
                    userDetails['updated_uid'] = insertObj.auth_uid || "";
                    userDetails['updated_datetime'] = dt || "";
                    userDetails['team_id'] = roleBySeasonObj.team_id || "";
                    userDetails['season_id'] = roleBySeasonObj.season_id || "";
                    userDetails['sport_id'] = roleBySeasonObj.sport_id || "";
                    userDetails['organization_id'] = roleBySeasonObj.organization_id || "";

                    // userDetails['people_id'] = teamMemberRole.people_id;
                    // userDetails['display_name'] = teamMemberRole.display_name;
                    // console.log(teamMemberRole);
                    switch (teamMemberRole.people_id) {
                        case "player": {
                            userDetails['user_list'] = insertObj.player;
                            break;
                        }
                        case "coach": {
                            userDetails['user_list'] = insertObj.coach;
                            break;
                        }
                        case "manager": {
                            userDetails['user_list'] = insertObj.manager;
                            break;
                        }
                    }
                    // if (userDetails.people_user_id) {
                    // console.log(userDetails);
                    //User Addition on People Subcollection
                    await firebase.firestore().collection('/team_members').doc(team_members_id).set(userDetails, { merge: true });
                    teamMembersId.push(team_members_id);
                }

                await firebase.firestore().collection('/levels').doc(insertObj.level_id).set({ is_active: true }, { merge: true })
                // Add Rolebyseason fopr each user in this team
                for (let m of insertObj.player) {
                    roleBySeasonObj.role = m.role || "player";
                    roleBySeasonObj.user_id = m.user_id || "";
                    let getTerminationData: any = await firebase.firestore().collection('/users').doc(m.user_id).collection('/roles_by_season').where('organization_id', '==', roleBySeasonObj.organization_id).where('is_terminated', '==', true).get();
                    if (getTerminationData.size) {
                        getTerminationData = await getTerminationData.docs.map((doc: any) => doc.data());
                        getTerminationData = getTerminationData[0];
                        roleBySeasonObj.is_terminated = true
                        roleBySeasonObj.terminated_datetime = getTerminationData.terminated_datetime
                    } else {
                        roleBySeasonObj.is_terminated = false
                    }
                    let newRole = await firebase.firestore().collection('/users').doc(m.user_id).collection('/roles_by_season').add(roleBySeasonObj);
                    for (let x of teamMembersId) {
                        if (x) {
                            let getTeamMembers: any = await firebase.firestore().collection('/team_members').doc(x).get();
                            if (getTeamMembers.exists) {
                                getTeamMembers = getTeamMembers.data();
                                getTeamMembers.user_groupId = getTeamMembers.people_id || "";
                                getTeamMembers.count = 0;
                                getTeamMembers.updated_datetime = new Date();
                                getTeamMembers.group_type = "System_Group"
                                newRole.collection('/MemberGroup').doc(getTeamMembers.people_id).set(getTeamMembers, { merge: true })
                            }
                        }

                    }
                    await newRole.set({ role_by_season_id: newRole.id }, { merge: true })
                }
                for (let n of insertObj.coach) {
                    roleBySeasonObj.role = n.role || "coach";
                    roleBySeasonObj.user_id = n.user_id || "";
                    let getTerminationData: any = await firebase.firestore().collection('/users').doc(n.user_id).collection('/roles_by_season').where('organization_id', '==', roleBySeasonObj.organization_id).where('is_terminated', '==', true).get();
                    if (getTerminationData.size) {
                        getTerminationData = await getTerminationData.docs.map((doc: any) => doc.data());
                        getTerminationData = getTerminationData[0];
                        roleBySeasonObj.is_terminated = true
                        roleBySeasonObj.terminated_datetime = getTerminationData.terminated_datetime
                    } else {
                        roleBySeasonObj.is_terminated = false
                    }
                    let newRole = await firebase.firestore().collection('/users').doc(n.user_id).collection('/roles_by_season').add(roleBySeasonObj);
                    for (let q of teamMembersId) {
                        if (q) {
                            let getTeamMembers: any = await firebase.firestore().collection('/team_members').doc(q).get();
                            if (getTeamMembers.exists) {
                                getTeamMembers = getTeamMembers.data();
                                getTeamMembers.user_groupId = getTeamMembers.people_id || "";
                                getTeamMembers.count = 0;
                                getTeamMembers.updated_datetime = new Date();
                                getTeamMembers.group_type = "System_Group"
                                newRole.collection('/MemberGroup').doc(getTeamMembers.people_id).set(getTeamMembers, { merge: true })
                            }
                        }

                    }
                    await newRole.set({ role_by_season_id: newRole.id }, { merge: true })
                }
                for (let k of insertObj.manager) {
                    roleBySeasonObj.role = k.role || "manager";
                    roleBySeasonObj.user_id = k.user_id || "";
                    let getTerminationData: any = await firebase.firestore().collection('/users').doc(k.user_id).collection('/roles_by_season').where('organization_id', '==', roleBySeasonObj.organization_id).where('is_terminated', '==', true).get();
                    if (getTerminationData.size) {
                        getTerminationData = await getTerminationData.docs.map((doc: any) => doc.data());
                        getTerminationData = getTerminationData[0];
                        roleBySeasonObj.is_terminated = true
                        roleBySeasonObj.terminated_datetime = getTerminationData.terminated_datetime
                    } else {
                        roleBySeasonObj.is_terminated = false
                    }
                    let newRole = await firebase.firestore().collection('/users').doc(k.user_id).collection('/roles_by_season').add(roleBySeasonObj);
                    for (let g of teamMembersId) {
                        if (g) {
                            let getTeamMembers: any = await firebase.firestore().collection('/team_members').doc(g).get();
                            if (getTeamMembers.exists) {
                                getTeamMembers = getTeamMembers.data();
                                getTeamMembers.user_groupId = getTeamMembers.people_id || "";
                                getTeamMembers.count = 0;
                                getTeamMembers.updated_datetime = new Date();
                                getTeamMembers.group_type = "System_Group"
                                newRole.collection('/MemberGroup').doc(getTeamMembers.people_id).set(getTeamMembers, { merge: true })
                            }
                        }

                    }
                    await newRole.set({ role_by_season_id: newRole.id }, { merge: true })
                }
                await firebase.firestore().collection('/teams').doc(roleBySeasonObj.team_id).set({ is_completed: true }, { merge: true });
                console.timeEnd('Function #1')
                return {
                    "status": true,
                    "data": "Created Successfully!"
                }
            }

        } catch (err) {
            console.log(err);

            return {
                "status": false,
                "error": err
            }

        }

    }

    async getTeamMetaData(insertObj: any) {
        //   get Organization info
        let getOrgInfo: any = await firebase.firestore().collection('/organization').doc(insertObj.organization_id).get();
        if (getOrgInfo.exists) {
            getOrgInfo = await getOrgInfo.data();

        } else {
            getOrgInfo = {}
        }
        // get sports info
        let season_lable = "";
        let getSeasonInfo: any = await firebase.firestore().collection('/seasons').doc(insertObj.season_id).get();
        if (getSeasonInfo.exists) {
            getSeasonInfo = await getSeasonInfo.data();
            if (getSeasonInfo.season_end_date) {
                getSeasonInfo.season_end_date = getSeasonInfo.season_end_date.toDate();
                let dt = new Date();
                if (getSeasonInfo.season_end_date >= dt) {
                    insertObj.isActive = true;
                } else {
                    insertObj.isActive = false;
                }
            }
            // constucting lable from season meta info
            const startDt = getSeasonInfo.season_start_date.toDate()
            const endDt = getSeasonInfo.season_end_date;
            const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const stMonth = startDt.getMonth();
            const edMonth = endDt.getMonth();
            season_lable = await getSeasonInfo.season_name + " | " + month[stMonth] + " " +
                startDt.getDate() + ", " + startDt.getFullYear() + " to " + month[edMonth] + " " +
                endDt.getDate() + ", " + endDt.getFullYear();
        }
        // get sport info
        let getSportInfo: any = await firebase.firestore().collection('/sports')
            .doc(insertObj.sport_id).get();
        if (getSportInfo.exists) {
            getSportInfo = await getSportInfo.data();
        } else {
            getSportInfo = {}
        }

        let teamObj = {
            "team_name": insertObj.team_name || null,
            "level": insertObj.level_name || null,
            "level_id": insertObj.level_id || null,
            "isActive": insertObj.isActive || false,
            "managers_count": insertObj.managers_count || 0,
            "coaches_count": insertObj.coaches_count || 0,
            "players_count": insertObj.players_count || 0,
            "season_lable": season_lable || null,
            "sport_id": getSportInfo.sport_id || null,
            "sport_name": getSportInfo.name || null,
            "season_id": getSeasonInfo.season_id || null,
            "season_start_date": getSeasonInfo.season_start_date || null,
            "season_end_date": getSeasonInfo.season_end_date || null,
            "organization_id": getOrgInfo.organization_id || null,
            "organization_name": getOrgInfo.name || null,
            "created_datetime": insertObj.created_datetime || null,
            "created_uid": insertObj.created_uid || null,
            "updated_uid": insertObj.updated_uid || null,
            "updated_datetime": insertObj.updated_datetime || null,
            "isMaster": true
        }
        // Create Team under organization
        // let createTeam:any = await firebase.firestore().collection('/teams').doc(insertObj.team_name).set(teamObj, { merge: true });
        let sportUsedFromOrg = await firebase.firestore().collection('/organization').doc(insertObj.organization_id).get();
        let governingObject: any = {
            governing_body_info: ''
        }
        if (sportUsedFromOrg.exists) {
            let changekeyName = sportUsedFromOrg.data().governing_body_info;
            for (let sportChange of changekeyName) {
                if (sportChange.sport_id === insertObj.sports_id) {
                    sportChange.is_used = true
                }
            }
            governingObject.governing_body_info = changekeyName;
            await firebase.firestore().collection('/organization').doc(insertObj.organization_id).update(governingObject);
        }
        let createTeam: any = await firebase.firestore().collection('/teams').add(teamObj);
        let team_id = createTeam.id;
        await createTeam.set({ team_id: createTeam.id }, { merge: true })
        // Create new Role by season(team) to the all user of this team
        // / adding in role by season obj
        let roleBySeasonObj: any = {
            "is_suspended": false,
            // "is_terminated": false,
            "level_id": insertObj.level_id || null,
            "level_name": insertObj.level_name || null,
            "organization_abbrev": getOrgInfo.abbrev || null,
            "organization_id": getOrgInfo.organization_id || null,
            "organization_name": getOrgInfo.name || null,
            "season_end_date": getSeasonInfo.season_end_date || null,
            "season_id": getSeasonInfo.season_id || null,
            "season_label": getSeasonInfo.season_name || null,
            "season_start_date": getSeasonInfo.season_start_date || null,
            "sport_id": getSportInfo.sport_id || null,
            "sport_name": getSportInfo.name || null,
            "team_id": team_id || null,
            "team_name": insertObj.team_name || null,
            "created_datetime": new Date(),
            "hasRoleEnabled": true,
        }
        return roleBySeasonObj
    }

    async getTeamByUid(teamInfo: any) {
        try {
            if (teamInfo) {
                /* get team data*/
                let getPeopleCollection: any = await firebase.firestore().collection('/team_members').where('team_id', '==', teamInfo.team_id).get();
                if (getPeopleCollection.docs.length) {
                    getPeopleCollection = await getPeopleCollection.docs.map((doc: any) => doc.data());
                    let result: any = {
                        "sport": teamInfo.sportName,
                        "season": teamInfo.seasonTitle,
                        "level": teamInfo.level_name,
                        "teamName": teamInfo.teamName
                    }
                    for (let people of getPeopleCollection) {
                        result[people.display_name] = people.user_list

                    }
                    return { "status": true, data: result };
                } else {
                    return { "status": false, error: "Team doesn't exist" };
                }

            } else {
                return {
                    "status": false,
                    "error": "Validation Error"
                }
            }
        } catch (err) {
            return {
                "status": false,
                "error": err.message
            }
        }

    }

    async updateTeam(updateTeamObj) {
        try {
            console.time('Function #1');
            const validateData = updateTeamObj;
            if (validateData) {
                const getCollection = await firebase.firestore().collection('teams');
                const updatedTeam = await this.updateTeamData(validateData, getCollection, firebase);
                return updatedTeam;
            } else {
                return {
                    "status": false,
                    "error": "Validation Error"
                }
            }

        } catch (err) {
            return {
                "status": false,
                "error": err.message
            };
        }
    }
    // async updateTeam(updateTeamObj) {
    //     try {
    //     console.time('Function #1');
    //     const validateData = updateTeamObj;
    //     if (validateData) {
    //     const getCollection = await firebase.firestore().collection('teams');
    //     const updatedTeam = await this.updateTeamData(validateData, getCollection, firebase);
    //     return updatedTeam;
    //     } else {
    //     return {
    //     "status": false,
    //     "error": "Validation Error"
    //     }
    //     }

    //     } catch (err) {
    //     return {
    //     "status": false,
    //     "error": err.message
    //     };
    //     }
    //     }
    async updateTeamData(validateData: any, collectionPath: any, admin: any) {
        try {
            const data = await collectionPath.doc(validateData.team_id).get();
            if (!data.exists) {
                return {
                    "status": false,
                    "error": "No team available for this Team Id"
                }

            } else {

                // build obj & create tag
                let dt = new Date();
                let teamData: any = JSON.parse(JSON.stringify(validateData));
                teamData['updated_uid'] = validateData.auth_uid;
                teamData['updated_datetime'] = dt;

                delete teamData.auth_uid; delete teamData.player; delete teamData.coach; delete teamData.manager;

                await collectionPath.doc(teamData.team_id).set(teamData, { merge: true }); //Update Team


                // validateData.player = validateData.player.filter((user:any) => {
                // if(user.is_suspend === false){
                // return user
                // }
                // });
                // validateData.coach = validateData.coach.filter((user:any) => {
                // if(user.is_suspend === false){
                // return user
                // }
                // });
                // validateData.manager = validateData.manager.filter((user:any) => {
                // if(user.is_suspend === false){
                // return user
                // }
                // });
                // teamData.managers_count = validateData.manager.length || 0;
                // teamData.players_count = validateData.player.length || 0;
                // teamData.coaches_count = validateData.coach.length || 0;
                // / update teams under organziatiom
                // await firebase.firestore().collection('/organization').doc(teamData.organization_id).collection('/teams').doc(teamData.team_id).set(teamData, { merge: true });

                let team_members_ids = [];
                let teamMembers: any = [{ people_id: 'player', display_name: 'Players' }, { people_id: 'coach', display_name: 'Coaches' }, { people_id: 'manager', display_name: 'Managers' }]; // Team Members List of Roles
                let teamMemberRole: any;
                for (teamMemberRole of teamMembers) {
                    let team_members_id = teamData.team_id + "_" + teamMemberRole.people_id;
                    let peopleCollection = await firebase.firestore().collection('/team_members');

                    let PeopleRoleCreated: any = await peopleCollection.doc(team_members_id).set(teamMemberRole, { merge: true });


                    let userDetails: any = {};
                    // userDetails['people_user_id'] = teamMemberRole.people_id;
                    userDetails['updated_uid'] = validateData.auth_uid;
                    userDetails['updated_datetime'] = dt;
                    switch (teamMemberRole.people_id) {
                        case "player": {
                            userDetails['user_list'] = validateData.player || [];
                            userDetails["players_count"] = validateData.players_count || 0;
                            break;
                        }
                        case "coach": {
                            userDetails['user_list'] = validateData.coach || [];
                            userDetails["coaches_count"] = validateData.coaches_count || 0;
                            break;
                        }
                        case "manager": {
                            userDetails['user_list'] = validateData.manager || [];
                            userDetails["managers_count"] = validateData.managers_count || 0;
                            break;
                        }
                    }
                    if (teamMemberRole.people_id) {
                        //User Addition on People Subcollection
                        await peopleCollection.doc(team_members_id).set(userDetails, { merge: true }); //collection('/users').doc(userDetails.people_user_id).
                        team_members_ids.push(team_members_id);
                    }


                }
                let tempPlayer = validateData.player;
                for (let index of tempPlayer) {
                    index.role = "player"
                    let checkUserMAppedInTeam = await firebase.firestore().collectionGroup('roles_by_season').where('user_id', '==', index.user_id).where('team_id', '==', teamData.team_id).get();
                    if (checkUserMAppedInTeam.size === 0) {
                        let getroleByseasonByUid: any = await firebase.firestore().collectionGroup('roles_by_season').where('user_id', '==', index.user_id)
                            .where('level_id', '==', validateData.level_id).where('hasRoleEnabled', '==', true)
                            .where('role', '==', index.role).get();
                        if (getroleByseasonByUid.size) {
                            for (let eachPlayer of getroleByseasonByUid.docs) {
                                let obj = eachPlayer.data();
                                obj.team_id = teamData.team_id;
                                obj.team_name = teamData.team_name;
                                let createNewRole = await firebase.firestore().collection('/users').doc(index.user_id).
                                    collection('roles_by_season').add(obj);
                                await createNewRole.set({ role_by_season_id: createNewRole.id, merge: true });
                                for (let x of team_members_ids) {
                                    if (x) {
                                        let getTeamMembers: any = await firebase.firestore().collection('/team_members').doc(x).get();
                                        if (getTeamMembers.exists) {
                                            getTeamMembers = getTeamMembers.data();
                                            getTeamMembers.user_groupId = getTeamMembers.people_id || "";
                                            getTeamMembers.count = 0;
                                            getTeamMembers.updated_datetime = new Date();
                                            getTeamMembers.group_type = "System_Group"
                                            await createNewRole.collection('/MemberGroup').doc(getTeamMembers.people_id).set(getTeamMembers, { merge: true })
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (index.is_suspended === true) {
                        let suspendInRoleBySeason: any = await firebase.firestore().collection('/users').doc(index.user_id).
                            collection('roles_by_season').where('team_id', '==', validateData.team_id)
                            .where('role', '==', index.role).get();
                        if (suspendInRoleBySeason.size) {
                            suspendInRoleBySeason = await suspendInRoleBySeason.docs.map((doc: any) => doc.data());
                            suspendInRoleBySeason = suspendInRoleBySeason[0];
                            await firebase.firestore().collection('/users').doc(index.user_id).
                                collection('roles_by_season').doc(suspendInRoleBySeason.role_by_season_id).set({
                                    is_suspended: true, suspension_start_date: index.suspension_start_date,
                                    suspension_end_date: index.suspension_end_date
                                }, { merge: true });
                            let getcollectionGroup: any = await firebase.firestore().collectionGroup('MemberGroup').where('team_id', '==', teamData.team_id).get();
                            if (getcollectionGroup.size) {
                                for (let idx of getcollectionGroup.docs) {
                                    // if (idx.ref.path.includes(index.team_id)) {
                                    let userList = await idx.data().user_list;
                                    if (userList.length) {
                                        for (let user of userList) {
                                            if (validateData.user_id === user.user_id && user.role === index.role) {
                                                await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayRemove(user) }, { merge: true });
                                                user.is_suspended = true;
                                                user.suspension_start_date = index.suspension_start_date;
                                                user.suspension_end_date = index.suspension_end_date
                                                await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayUnion(user) }, { merge: true });
                                            }
                                        }
                                    }
                                    // }
                                }
                            }

                        } 
                        // else {
                        //     return { "status": false, "error": "Role doesn't exist to suspend." };
                        //     break;
                        // }
                    }
                }
                // coach suspension
                let tempCoach = validateData.coach;
                for (let index of tempCoach) {
                    index.role = "coach"
                    let checkUserMAppedInTeam = await firebase.firestore().collectionGroup('roles_by_season').where('user_id', '==', index.user_id).where('team_id', '==', teamData.team_id).get();
                    if (checkUserMAppedInTeam.size === 0) {
                        let getroleByseasonByUid: any = await firebase.firestore().collectionGroup('roles_by_season').where('user_id', '==', index.user_id)
                            .where('organization_id', '==', validateData.organization_id).where('sport_id', '==', validateData.sport_id).where('hasRoleEnabled', '==', true)
                            .where('role', '==', index.role).get();
                        if (getroleByseasonByUid.size) {
                            for (let eachPlayer of getroleByseasonByUid.docs) {
                                let obj = eachPlayer.data();
                                obj.team_id = teamData.team_id;
                                obj.team_name = teamData.team_name;
                                let createNewRole = await firebase.firestore().collection('/users').doc(index.user_id).
                                    collection('roles_by_season').add(obj);
                                await createNewRole.set({ role_by_season_id: createNewRole.id, merge: true });
                                for (let x of team_members_ids) {
                                    if (x) {
                                        let getTeamMembers: any = await firebase.firestore().collection('/team_members').doc(x).get();
                                        if (getTeamMembers.exists) {
                                            getTeamMembers = getTeamMembers.data();
                                            getTeamMembers.user_groupId = getTeamMembers.people_id || "";
                                            getTeamMembers.count = 0;
                                            getTeamMembers.updated_datetime = new Date();
                                            getTeamMembers.group_type = "System_Group"
                                            await createNewRole.collection('/MemberGroup').doc(getTeamMembers.people_id).set(getTeamMembers, { merge: true })
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (index.is_suspended === true) {
                        let suspendInRoleBySeason: any = await firebase.firestore().collection('/users').doc(index.user_id).
                            collection('roles_by_season').where('team_id', '==', validateData.team_id)
                            .where('role', '==', index.role).get();
                        if (suspendInRoleBySeason.size) {
                            suspendInRoleBySeason = await suspendInRoleBySeason.docs.map((doc: any) => doc.data());
                            suspendInRoleBySeason = suspendInRoleBySeason[0];
                            await firebase.firestore().collection('/users').doc(index.user_id).
                                collection('roles_by_season').doc(suspendInRoleBySeason.role_by_season_id).set({
                                    is_suspended: true, suspension_start_date: index.suspension_start_date,
                                    suspension_end_date: index.suspension_end_date
                                }, { merge: true });

                            let getcollectionGroup: any = await firebase.firestore().collectionGroup('MemberGroup').where('team_id', '==', teamData.team_id).get();
                            if (getcollectionGroup.size) {
                                for (let idx of getcollectionGroup.docs) {
                                    // if (idx.ref.path.includes(index.team_id)) {
                                    let userList = await idx.data().user_list;
                                    if (userList.length) {
                                        for (let user of userList) {
                                            if (validateData.user_id === user.user_id && user.role === index.role) {
                                                await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayRemove(user) }, { merge: true });
                                                user.is_suspended = true;
                                                user.suspension_start_date = index.suspension_start_date;
                                                user.suspension_end_date = index.suspension_end_date
                                                await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayUnion(user) }, { merge: true });
                                            }
                                        }
                                    }
                                    // }
                                }
                            }
                            // change in member group
                            // let getcollectionGroup: any = await adminref.collectionGroup('MemberGroup').get();
                            // if (getcollectionGroup.size) {
                            // for (let idx of getcollectionGroup.docs) {
                            // let userList = await idx.data().user_list;
                            // if (userList.length) {
                            // for (let user of userList) {
                            // if (index.user_id === user.user_id && user.role === index.role) {
                            // await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayRemove(user) }, { merge: true });
                            // user.is_suspended = true;
                            // await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayUnion(user) }, { merge: true });
                            // }
                            // }
                            // }
                            // }
                            // }
                        } else {
                            return { "status": false, "error": "Role doesn't exist to suspend." };
                            break;
                        }
                    }
                }
                // suspend manager if any

                let tempManager = validateData.manager;
                for (let index of tempManager) {
                    index.role = "manager"
                    let checkUserMAppedInTeam = await firebase.firestore().collectionGroup('roles_by_season').where('user_id', '==', index.user_id).where('team_id', '==', teamData.team_id).get();
                    if (checkUserMAppedInTeam.size === 0) {
                        let getroleByseasonByUid: any = await firebase.firestore().collectionGroup('roles_by_season').where('user_id', '==', index.user_id)
                            .where('organization_id', '==', validateData.organization_id).where('sport_id', '==', validateData.sport_id).where('hasRoleEnabled', '==', true)
                            .where('role', '==', index.role).get();
                        if (getroleByseasonByUid.size) {
                            for (let eachPlayer of getroleByseasonByUid.docs) {
                                let obj = eachPlayer.data();
                                obj.team_id = teamData.team_id;
                                obj.team_name = teamData.team_name;
                                let createNewRole = await firebase.firestore().collection('/users').doc(index.user_id).
                                    collection('roles_by_season').add(obj);
                                await createNewRole.set({ role_by_season_id: createNewRole.id, merge: true });
                                for (let x of team_members_ids) {
                                    if (x) {
                                        let getTeamMembers: any = await firebase.firestore().collection('/team_members').doc(x).get();
                                        if (getTeamMembers.exists) {
                                            getTeamMembers = getTeamMembers.data();
                                            getTeamMembers.user_groupId = getTeamMembers.people_id || "";
                                            getTeamMembers.count = 0;
                                            getTeamMembers.updated_datetime = new Date();
                                            getTeamMembers.group_type = "System_Group"
                                            await createNewRole.collection('/MemberGroup').doc(getTeamMembers.people_id).set(getTeamMembers, { merge: true })
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (index.is_suspended === true) {
                        let suspendInRoleBySeason: any = await firebase.firestore().collection('/users').doc(index.user_id).
                            collection('roles_by_season').where('team_id', '==', validateData.team_id)
                            .where('role', '==', index.role).get();
                        if (suspendInRoleBySeason.size) {
                            suspendInRoleBySeason = await suspendInRoleBySeason.docs.map((doc: any) => doc.data());
                            suspendInRoleBySeason = suspendInRoleBySeason[0];
                            await firebase.firestore().collection('/users').doc(index.user_id).
                                collection('roles_by_season').doc(suspendInRoleBySeason.role_by_season_id).set({
                                    is_suspended: true, suspension_start_date: index.suspension_start_date,
                                    suspension_end_date: index.suspension_end_date
                                }, { merge: true });
                            let getcollectionGroup: any = await firebase.firestore().collectionGroup('MemberGroup').where('team_id', '==', validateData.team_id).get();
                            if (getcollectionGroup.size) {
                                for (let idx of getcollectionGroup.docs) {
                                    // if (idx.ref.path.includes(index.team_id)) {
                                    let userList = await idx.data().user_list;
                                    if (userList.length) {
                                        for (let user of userList) {
                                            if (validateData.user_id === user.user_id && user.role === index.role) {
                                                await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayRemove(user) }, { merge: true });
                                                user.is_suspended = true;
                                                user.suspension_start_date = index.suspension_start_date;
                                                user.suspension_end_date = index.suspension_end_date
                                                await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayUnion(user) }, { merge: true });
                                            }
                                        }
                                    }
                                    // }
                                }
                            }
                            // change in member group
                            // let getcollectionGroup: any = await adminref.collectionGroup('MemberGroup').get();
                            // if (getcollectionGroup.size) {
                            // for (let idx of getcollectionGroup.docs) {
                            // let userList = await idx.data().user_list;
                            // if (userList.length) {
                            // for (let user of userList) {
                            // if (index.user_id === user.user_id && user.role === index.role) {
                            // await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayRemove(user) }, { merge: true });
                            // user.is_suspended = true;
                            // await idx.ref.set({ user_list: admin.firestore.FieldValue.arrayUnion(user) }, { merge: true });
                            // }
                            // }
                            // }
                            // }
                            // }
                        } else {
                            return { "status": false, "error": "Role doesn't exist to suspend." };
                            break;
                        }
                    }
                }
                await this.generateKeywords(validateData, validateData.team_id, validateData.organization_id);
                console.timeEnd('Function #1');
                return { "status": true, "data": "Updated Successfully" };

            }
        } catch (err) {
            return { "status": false, "error": err.message };
        }


    }

    createKeywords(name) {
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

    async generateKeywords(teamData: any, team_id: any, organization_id: any) {
        try {
            const keywordForTeamName = this.createKeywords(`${teamData.team_name}`);
            const keywordForLevel = this.createKeywords(`${teamData.level_name}`);
            const keywordForSeasonLable = this.createKeywords(`${teamData.season_lable}`);
            const keywordForSportName = this.createKeywords(`${teamData.sport_name}`);

            let keywords = [
                ...new Set([
                    '',
                    ...keywordForTeamName,
                    ...keywordForLevel,
                    ...keywordForSeasonLable,
                    ...keywordForSportName
                ])
            ];
            // let keywords = await generateKeywords(teamData: any, snapshot: any, adminref: any);
            if (keywords) {
                await await firebase.firestore()
                    .collection('/teams').doc(team_id).set({
                        keywords: keywords}, { merge: true });
            }
            return true
        } catch (err) {
            console.log(err);

            return false
        }
    }

    async getData(queryObj: any) {
        // return new Observable(async (observer) => {
        try {
            if (queryObj) {
                if (queryObj.sortingKey === "sport") {
                    queryObj.sortingKey = "sport_name";
                }
                if (queryObj.sortingKey === "season") {
                    queryObj.sortingKey = "season_lable";
                }
                if (queryObj.sortingKey === "players") {
                    queryObj.sortingKey = "players_count";
                }
                if (queryObj.sortingKey === "coaches") {
                    queryObj.sortingKey = "coaches_count";
                }
                if (queryObj.sortingKey === "managers") {
                    queryObj.sortingKey = "managers_count";
                }
                const pageNo = queryObj.page_no;
                let itemPerPage = queryObj.item_per_page;

                const startFrom = (pageNo - 1) * itemPerPage;

                if (!itemPerPage) { itemPerPage = 10; }
                let getTeamData: any;
                let totalTeams: any;
                /* get team data*/
                if (queryObj.organizationId) {
                    if (queryObj.seasonType === "All") {
                        getTeamData = await firebase.firestore().collection('/teams').where('organization_id', '==', queryObj.organizationId)
                            .orderBy(queryObj.sortingKey, queryObj.sortingValue);
                    } else if (queryObj.seasonType === "Active") {
                        getTeamData = await firebase.firestore().collection('/teams').where('isActive', '==', true)
                            .where('organization_id', '==', queryObj.organizationId).orderBy(queryObj.sortingKey, queryObj.sortingValue);;
                    } else if (queryObj.seasonType === "Past") {
                        getTeamData = await firebase.firestore()
                            .collection('/teams').where('isActive', '==', false).where('organization_id', '==', queryObj.organizationId)
                            .orderBy(queryObj.sortingKey, queryObj.sortingValue);;

                        // if(teamData.size){
                        //     teamData = teamData.docs.map((doc: any) => doc.data());
                        //     teamData = teamData.sort((a:any, b:any) => {
                        //         b.created_datetime - a.created_datetime;
                        //     });
                        //     teamData.slice(startFrom, (startFrom + queryObj.itemPerPage));
                        // }else{
                        //     teamData = [];
                        // }    
                    } else {
                        return { "status": false, "error": "invalid request" };
                    }
                    if (queryObj.searchKey && queryObj.searchVal) {
                        getTeamData = await getTeamData.where(queryObj.searchKey, 'array-contains', queryObj.searchVal);
                    }
                    let totalRecords: any;
                    totalRecords = await getTeamData.get();
                    // totalRecords = await totalRecords.docs.map((doc:any)=>doc.data());
                    if (queryObj.isNextReq) {
                        getTeamData = await getTeamData.startAfter(queryObj.nextStartAt).limit(queryObj.item_per_page).get();
                    } else if (queryObj.isPrevReq) {
                        getTeamData = await getTeamData.startAt(queryObj.prevStartAt).limit(queryObj.item_per_page).get();
                    } else {
                        getTeamData = await getTeamData.limit(queryObj.item_per_page).get();
                    }
                    if (getTeamData.size) {
                        let teamCollectionRefData = await getTeamData.docs.map((doc: any) => doc.data());
                        console.log(teamCollectionRefData);
                        // userCollectionRefData = _.unionBy(userCollectionRefData,'user_id');
                        console.log(totalRecords);
                        // totalRecords= _.unionBy(totalRecords,'user_id');
                        console.log(teamCollectionRefData);
                        return {
                            status: true,
                            data: teamCollectionRefData,
                            snapshot: getTeamData,
                            totalRecords: totalRecords.size || 0
                        }
                    } else {
                        return {
                            status: false,
                            data: []
                        }
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
    async getUserDetails(user_id: any){
        try{
            if(user_id){
                let userDetails : any= await firebase.firestore().collection('/users').doc(user_id).get();
                if(userDetails.exists){
                    userDetails = userDetails.data();
                }else{
                    userDetails = {};
                }
            }else{
                return {
                    status : false,
                    error : "User id is required!"
                }
            }
        }catch(err){
            return {
                status : false,
                error : err.message
            }
        }
    
    }

    
}