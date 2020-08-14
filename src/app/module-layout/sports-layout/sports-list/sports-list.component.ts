import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sports-list',
  templateUrl: './sports-list.component.html',
  styleUrls: ['./sports-list.component.scss']
})
export class SportsListComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllSportmeta: any = [];
  getAllSportmetaData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  constructor(private router: Router, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document, private restApiService: RestApiService, private http:HttpClient) { }

  ngOnInit() { 
    //this.getSportMeta();  
    this.getSportMetaAPI();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getSportMeta(){

    this.getAllSportmeta = await this.db.collection('sports').orderBy('sport_id').get();
    this.getAllSportmetaData = await this.getAllSportmeta.docs.map((doc: any) => doc.data());
    console.log(this.getAllSportmetaData);
    this.data = this.getAllSportmetaData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
    console.log(this.data);

  }

  
  async getSportMetaAPI(){

    /*
    this.getAllSportmeta = await this.db.collection('sports').orderBy('sport_id').get();
    this.getAllSportmetaData = await this.getAllSportmeta.docs.map((doc: any) => doc.data());
    console.log(this.getAllSportmetaData);
    this.data = this.getAllSportmetaData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false;
    console.log(this.data);
    */

   let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/sports';
   //let Metaurl = this.baseAPIUrl+'sports';

   this.restApiService.lists(Metaurl).subscribe( lists => {
     console.log('---lists----', lists)

     try {

      this.getAllSportmetaData = lists;
      this.data = this.getAllSportmetaData;
      this.dtTrigger.next();
      this.loading = false;
      this.displayLoader = false;      

     } catch (error) {
      
       console.log(error);
       this.data = [];
       this.dtTrigger.next();
       this.loading = false;
       this.displayLoader = false;
       
     }
 
     console.log(this.data);
 
    
   });

  }

  listSports(){
    this.router.navigate(['/sports/list']);
  }

  addSports(){
    this.router.navigate(['/sports/createlist']);
  }
  
  viewSports(resourceId: string){
    this.router.navigate(['/sports/viewlist/'+resourceId]);
  }
  
  editSports(resourceId: string){
    this.router.navigate(['/sports/editlist/'+resourceId]);
  }

  async deleteSports(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Player Custom Meta Field', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          //await this.db.collection('playermetadata').doc(resourceId).delete();
          this.notification.isNotification(true, "Player Custom Field", "Custom Field has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Player Custom Meta Field", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/sports/list']);
}

}
