import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CookieService } from '../services/cookie.service';
import { User } from '../models/auth.models';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import {apiURL, Constant} from './config';
import { Router } from '@angular/router';

import { RestApiService } from '../../shared/rest-api.services';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user: User;

    constructor(private http: HttpClient, 
        private cookieService: CookieService, 
        private firestore: AngularFirestore, 
        private restApiService: RestApiService,
        private firebaseAuth: AngularFireAuth, 
        private router: Router) {
    }
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // Authorization: this.cookieService.getCookie('token')
 })
    };

    /**
     * Returns the current user
     */
    public currentUser() { //: User {
        // let userData = this.cookieService.getCookie('currentUser');
        // if (!this.user) {
        //     this.user = JSON.parse(userData?.user);
        // }
        // return this.user;      
        return this.cookieService.getCookie('currentUser');
    }

    public getToken() {
        return this.cookieService.getCookie('token');
    }

    getCurrentUser() {
        // return this.firebaseAuth.auth.currentUser.getIdToken(true);
        return this.firebaseAuth.auth.currentUser.getIdToken();
        // firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
        //     // Send token to your backend via HTTPS
        //     // ...
        //   }).catch(function(error) {
        //     // Handle error
        //   });
    }
    isAuthenticated(activeRoute) {
        try {
            let roleList = JSON.parse(localStorage.getItem('roleList'));
            if (roleList) {
                let roleListArr = roleList.map(roles => {
                    if (roles.hasRoleEnabled) {
                        return roles.role.toLowerCase();
                    }
                });
                if (roleListArr.length) {
                    if (roleListArr.includes(activeRoute.role[0]) || roleListArr.includes(activeRoute.role[1])) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }

    }
    isAuthenticatedUser() {
        let roleObj: any = {};
        try {
            let roleList = JSON.parse(localStorage.getItem('roleList'));

            let roleListArr = roleList.map(roles => {
                if (roles.hasRoleEnabled) {

                    return roles.role.toLowerCase();
                }
            });

            if (roleListArr.length) {
                if (roleListArr.includes(Constant.role[0])) { //Customer Admin  
                    roleObj['role'] = Constant.role[0];
                    roleObj['isAvailable'] = true;
                    return roleObj;
                } else if (roleListArr.includes(Constant.role[1])) { // System Admin
                    roleObj['role'] = Constant.role[1];
                    roleObj['isAvailable'] = true;
                    return roleObj;
                } else {      // Other Roles
                    roleObj['role'] = 'other';
                    roleObj['isAvailable'] = false;
                    return roleObj;
                }
            } else {
                roleObj['role'] = 'other';
                roleObj['isAvailable'] = false;
                return roleObj;
            }
        } catch (error) {
            console.log(error);

            roleObj['role'] = 'other';
            roleObj['isAvailable'] = false;
            return roleObj;
        }

    }


    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    login(email: string, password: string) {
        // return this.http.post<any>(`/api/login`, { email, password })
        //     .pipe(map(user => {
        //         // login successful if there's a jwt token in the response
        //         if (user && user.token) {
        //             this.user = user;
        //             // store user details and jwt in cookie
        //             this.cookieService.setCookie('currentUser', JSON.stringify(user), 1);
        //         }
        //         return user;
        //     }));

        //this.restApiService.signInWithEmailAndPassword(email, password)
        //console.log('----email----',email,'----password-----',password);return false;
        return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password);
    }

    verifyCode(code :string){
        return this.firebaseAuth.auth.verifyPasswordResetCode(code);
    }

    confirmPassword(code:string,password:string){
        return this.firebaseAuth.auth.confirmPasswordReset(code,password);
    }


    forgotpassword(email) {
        let actionCodeSettings = {
            url: "https://sportsgravy-testing.firebaseapp.com/account/auth/forgotpwd",
            iOS: {
              bundleId: 'com.iz.sportsgravy'
            },
            android: {
              packageName: 'com.example.android',
              installApp: true,
              minimumVersion: '12'
            },
            handleCodeInApp: true,
            // dynamicLinkDomain: 'sportgravyapplication.page.link/sg'
          };

        return this.firebaseAuth.auth.sendPasswordResetEmail(email,actionCodeSettings);
    }

    getprofile(uid,token): Observable<any> {
        console.log(token);        
        return this.http.post(apiURL.GET_USER_GY_UID, { 'uid': uid },{ headers: new HttpHeaders({ 'Content-Type': 'application/json','idtoken': token }) })
            .pipe(map(user => {
                return user;
            }));
    }

    postData(url, data): Observable<any> {
        return this.http.post(url, data, this.httpOptions);
    }

    getData(url): Observable<any> {
        return this.http.get(url);
    }



    /** 
     * Logout the user*/
 logout() {
        this.firebaseAuth.auth.signOut().then(function () {
            // Sign-out successful.                       
        }).catch(function (error) {
            console.log(error);
        });
        this.deleteBrowserStuff();
        this.router.navigate(['/account/login']);
    }

    logoutForSignup() {
        this.firebaseAuth.auth.signOut().then(function () {
            // Sign-out successful.                       
        }).catch(function (error) {
            console.log(error);
        });
        this.deleteBrowserStuff();
   }
   deleteBrowserStuff(){
    this.cookieService.deleteCookie('currentUser');
    this.cookieService.deleteCookie('isAlreadyLoggedIn');
    this.cookieService.deleteCookie('token');
    this.cookieService.deleteCookie('userData');
    this.cookieService.deleteCookie('roleList');
    this.cookieService.deleteCookie('admin');
    this.cookieService.deleteCookie('sysAdmin');
    this.cookieService.deleteCookie('userName');
    localStorage.clear();
    this.user = null;
}
}

