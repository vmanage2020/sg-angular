import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { UserService } from '../user-service'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllplayerlist: any = [];
  getAllPlayerlistData: any = [];

  data: any;
  datax: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;

  constructor(private router: Router,
    private notification: NgiNotificationService, 
    @Inject(DOCUMENT) private _document: Document,
    private userService: UserService,
    private restApiService: RestApiService, 
    public cookieService: CookieService) { }

  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getUserList();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getUserList(){

    
    if( this.userService.dataStore.users.length > 0)
    {
      console.log('---Season length----', this.userService.dataStore.users);
      this.getAllPlayerlistData = this.userService.dataStore.users;
      this.data = this.getAllPlayerlistData;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {


      let Metaurl= '';
      if(this.orgId=='' || this.orgId==1) {
      Metaurl='users';
      } else {
      Metaurl='usersbyorg/'+this.orgId;
      }
    this.restApiService.lists(Metaurl).subscribe( res => {
      this.data = res;
      this.dtTrigger.next();
      this.loading = false;
      this.displayLoader = false;  
    })

      /* if(this.loading == true ) {
            
        let Metaurl= '';
        if(this.orgId=='') {
          Metaurl='users';
        } else {
          Metaurl='usersbyorg/'+this.orgId;
        }
        await this.userService.getUserList(Metaurl);
    
        setTimeout(() => { 
          this.getUserList()
          this.loading = false;
          this.displayLoader = false;
        }, 1000);

      } */
    }

    /* onservable code here starts * /
    console.log('this.userService.dataStore.users.length',this.userService.dataStore.users.length);
    if(this.userService.dataStore.users.length >0)
    {
      this.data = this.userService.dataStore.users;
      this.dtTrigger.next();
      this.loading = false;
      this.displayLoader = false;
      
    }else{
      setTimeout(() => {
          this.getUserList();
          this.loading = false;
          this.displayLoader = false;
      }, 1000);
    }
    /* observable code ends here */

    //this.getAllplayerlist = await this.db.collection('users').orderBy('sport_id').get();


    /* if(this.orgId=='') {
      this.getAllplayerlist = await this.db.collection('users').get();
    } else {
      console.log("orgId"+this.orgId);
      
      //this.getAllplayerlist = await this.db.collection('users').where('organization_id', '==', this.orgId).get();

      this.getAllplayerlist = await this.db.collection('/organization').doc(this.orgId).collection('/users')
                            .where('isUserDuplicated', '==', false).get();
    }
    
    this.getAllPlayerlistData = await this.getAllplayerlist.docs.map((doc: any) => doc.data());
    console.log(this.getAllPlayerlistData);
    this.data = this.getAllPlayerlistData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false;  */
 
  }

  removeLastChar(value, char){
      var lastChar = value.slice(-1);
      if(lastChar == char) {
        value = value.slice(0, -1);
      }
      return value;
  }

  listUser(){
    this.router.navigate(['/users/list']);
  }

  addUser(){
    this.router.navigate(['/users/createlist']);
  }
  
  viewUser(resourceId: string){
    this.router.navigate(['/users/viewlist/'+resourceId]);
  }
  
  editUser(resourceId: string){    
    this.router.navigate(['/users/editlist/'+resourceId]);
  }

  refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/users/list']);
  }

}
