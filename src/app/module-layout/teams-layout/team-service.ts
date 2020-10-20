import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
import * as _ from "lodash";

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHeaderResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError, BehaviorSubject } from "rxjs";
import { retry, catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { RestApiService } from '../../shared/rest-api.services';
import { get } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    adminref: any = firebase.firestore();
    orgId: any;

    public _sports = new BehaviorSubject<any[]>([]);
  public sportsdataStore:{ sports: any } = { sports: [] };
  readonly sportsconnections = this._sports.asObservable();

  public _users = new BehaviorSubject<any[]>([]);
  public userssdataStore:{ users: any } = { users: [] };
  readonly sportsconnections1 = this._users.asObservable();


    constructor(private titlecasePipe: TitleCasePipe, private restApiService: RestApiService) { 

        this.orgId = localStorage.getItem('org_id');
        console.log('orgId',this.orgId);
        let Metaurl= '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='sports';
        } else {
        Metaurl='organizationsports/'+this.orgId;
        }
        this.getSportsListAPI(Metaurl);
        this.getUsers()

    }

    private handleError(error: HttpErrorResponse) {
    const message = get(error, 'message') || 'Something bad happened; please try again later.';
    return throwError(message);
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

    getUsers()
    {
        this.restApiService.lists('users').subscribe((data: any) => {
            this.userssdataStore.users = data;
            this._users.next(Object.assign({}, this.userssdataStore).users);
        }, e=>{

        })
    }


    /*Create Sport*/
    async getMembersByOrganization(userObjs: any) {

        try {
            let playerUserIds = [];
            let allPlayerUserIds = [];
            // Validating payload using joi
            const validateMembersData = userObjs;
            //  Get coach list
            let getCoachesList = await this.adminref.collectionGroup('roles_by_season')
            .where('organization_id', '==',validateMembersData.organization_id).where('role', '==','coach').where('hasRoleEnabled','==', true)
            .get();
        
            if(getCoachesList.size){
                getCoachesList = getCoachesList.docs.map((doc:any) => doc.data());
                for(let coachInfo of getCoachesList){
                    if(coachInfo.is_terminated === true){
                        // let getUserIdOfCoachList = getCoachesList.filter(item => item.user_id !== coachInfo.user_id);
                        getCoachesList = getCoachesList.filter(item => item.user_id !== coachInfo.user_id);

                    }
                }
            }else{
                getCoachesList=[];
            }

            if(getCoachesList.length !== 0){
                getCoachesList = getCoachesList.map((doc:any) => doc.user_id);
                getCoachesList= _.uniq(getCoachesList);
            }   
                               
            // get Manager List
            let getManagerList = await this.adminref.collectionGroup('roles_by_season')
            .where('organization_id', '==',validateMembersData.organization_id).where('role', '==','manager').where('hasRoleEnabled','==', true)           
            .get();
            if(getManagerList.size){
                getManagerList = getManagerList.docs.map((doc:any) => doc.data());
                for(let coachInfo of getManagerList){
                    if(coachInfo.is_terminated === true){
                        // let getUserIdOfCoachList = getCoachesList.filter(item => item.user_id !== coachInfo.user_id);
                        getManagerList = getManagerList.filter(item => item.user_id !== coachInfo.user_id);

                    }
                }
            }else{
                getManagerList=[];
            }
            if(getManagerList.length !== 0){
                getManagerList = getManagerList.map((doc:any) => doc.user_id);
                getManagerList= _.uniq(getManagerList);   
            }
           
            // get Players List based on level
            let getPlayersList = await this.adminref.collectionGroup('roles_by_season')
            .where('role', '==','player').where('level_id', '==', validateMembersData.level_id)
            .get();
            getPlayersList = getPlayersList.size ? getPlayersList.docs.map((doc:any) => doc.data().user_id) : [];
            getPlayersList = _.uniq(getPlayersList);
            getPlayersList = _.filter(getPlayersList, (o:any) => o);
            
            // users in same level and sholud not mapped in any team
            for(let index of getPlayersList){
                let getUserRoles = await this.adminref.collection('/users').doc(index).collection('/roles_by_season').get();
                getUserRoles = getUserRoles.size ? getUserRoles.docs.map((doc:any)=> doc.data()) : [];
                let counter = 0;
                if(getUserRoles.length){
                    for(let m of getUserRoles){
                        if(m.season_id === validateMembersData.season_id && m.level_id === validateMembersData.level_id && 
                            m.team_id && m.role === "player"){
                            counter++;
                            break;
                        }else if(m.season_id === validateMembersData.season_id && m.level_id === validateMembersData.level_id && 
                            m.role === "player" && (m.is_suspended || m.is_terminated) ){
                            counter++;
                        }else if(m.season_id === validateMembersData.season_id && m.level_id === validateMembersData.level_id && 
                            m.role === "player" && m.hasRoleEnabled === false){
                            counter++;
                        }
                    }
                    if(counter === 0){
                        playerUserIds.push(index);
                    }
                }
            }

            // get Players List based on all level
            let getAllPlayersList = await this.adminref.collectionGroup('roles_by_season').where('role', '==', "player")
            .where('organization_id', '==', validateMembersData.organization_id).where('sport_id', '==', validateMembersData.sport_id)           
            .get();
            getAllPlayersList = getAllPlayersList.size ? getAllPlayersList.docs.map((doc:any) => doc.data().user_id) : [];
            getAllPlayersList = _.uniq(getAllPlayersList);
            getAllPlayersList = _.filter(getAllPlayersList, (o:any) => o);
            // users in same level and sholud not mapped in any team
            for(let idx of getAllPlayersList){
                let getAllUserRoles = await this.adminref.collection('/users').doc(idx).collection('/roles_by_season').get();
                getAllUserRoles = getAllUserRoles.size ? getAllUserRoles.docs.map((doc:any)=> doc.data()) : [];
                let counter = 0;
                if(getAllUserRoles.length){
                    for(let l of getAllUserRoles){
                        if(l.organization_id === validateMembersData.organization_id && l.sport_id === validateMembersData.sport_id && 
                            l.role === "player" && (l.is_suspended || l.is_terminated)){
                            counter++;
                        }else if(l.organization_id === validateMembersData.organization_id && l.sport_id === validateMembersData.sport_id && 
                            l.role === "player" && l.hasRoleEnabled === false){
                            counter++;
                        }
                    }
                    if(counter === 0){
                        allPlayerUserIds.push(idx);
                    }
                }
            }
           
            getAllPlayersList =  _.difference(allPlayerUserIds, playerUserIds);
             let dataResponse:any = {}

            //  Get all players details for all the list
            if(allPlayerUserIds.length){
                let getAllPlayersDetails:any = [];
                for(let w of allPlayerUserIds){
                    let getUSerDeatilById:any = await this.adminref.collection('/users').doc(w).get();
                    if(getUSerDeatilById.exists){
                        getAllPlayersDetails.push(getUSerDeatilById.data());
                    }
                }
                // let getAllPlayersDetails = await this.adminref.collection('/users').where('user_id','in',allPlayerUserIds).get();
                dataResponse['playerList'] = getAllPlayersDetails.length ? getAllPlayersDetails : []
            }else{
                dataResponse['playerList'] = [];
            }
            
            //  Get players details - level specific
            if(playerUserIds.length){
                let getPlayersDetails:any = [];
                for(let c of playerUserIds){
                    let getAllUserDeatilById:any = await this.adminref.collection('/users').doc(c).get();
                    if(getAllUserDeatilById.exists){
                        getPlayersDetails.push(getAllUserDeatilById.data());
                    }
                }
                dataResponse['player'] = getPlayersDetails.length ? getPlayersDetails: []
            }
            else{
                dataResponse['player'] = [];
            }
            

            //  Get manager details 
            if(getManagerList.length){
                let getManagerDetails:any = [];
                for(let c of getManagerList){
                    let getAllManagerDeatilById:any = await this.adminref.collection('/users').doc(c).get();
                    if(getAllManagerDeatilById.exists){
                        getManagerDetails.push(getAllManagerDeatilById.data());
                    }
                }
                dataResponse['manager'] = getManagerDetails.length ? getManagerDetails : []    
            }else{
                dataResponse['manager'] = [];
            }
            
            // Get Coach details pull
            
            if(getCoachesList.length){
                let getCoachDetails:any = [];
                for(let c of getCoachesList){
                    let getAllCoachDeatilById:any = await this.adminref.collection('/users').doc(c).get();
                    if(getAllCoachDeatilById.exists){
                        getCoachDetails.push(getAllCoachDeatilById.data());
                    }
                }
                dataResponse['coach'] = getCoachDetails.length ? getCoachDetails : []
            }else{
                dataResponse['coach'] = [];
            }
            return {
                "status": true,
                "data": dataResponse
            }
            
        } catch (err) {
            console.log(err);
            
            return {
                "status": false,
                "error": err
            };
        }
    }

// Remove Duplicates 

getUnique(array){
    var uniqueArray = [];
    
    // Loop through array values
    for(let i of array){
        if(uniqueArray.indexOf(i) >= 0 -1) {
            uniqueArray.push(array[i]);
        }
    }
    return uniqueArray;
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

   


}
