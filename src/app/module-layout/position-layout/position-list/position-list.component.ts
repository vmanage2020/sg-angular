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
  selector: 'app-position-list',
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss']
})
export class PositionListComponent implements OnInit {

  db: any = firebase.firestore();
  value: any = [];
  getAllPositionmeta: any = [];
  getAllPositionmetaData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  constructor(private router: Router, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document, private restApiService: RestApiService, private http:HttpClient) { }

  ngOnInit() { 
    //this.getPositionMeta();  
    this.getPositionMetaAPI();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getPositionMeta(){

    this.getAllPositionmeta = await this.db.collection('positions').orderBy('position_id').get();
    this.getAllPositionmetaData = await this.getAllPositionmeta.docs.map((doc: any) => doc.data());
    this.data = this.getAllPositionmetaData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
    console.log(this.data);

  }


  async getPositionMetaAPI(){

   let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/positions';
   //let Metaurl = this.baseAPIUrl+'positions';

   this.restApiService.lists(Metaurl).subscribe( lists => {
     console.log('---lists----', lists)

     try {

      this.getAllPositionmetaData = lists;
      this.data = this.getAllPositionmetaData;
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
 
  listPosition(){
    this.router.navigate(['/positions/list']);
  }

  addPosition(){
    this.router.navigate(['/positions/createlist']);
  }
  
  viewPosition(resourceId: string){
    this.router.navigate(['/positions/viewlist/'+resourceId]);
  }
  
  editPosition(resourceId: string){
    this.router.navigate(['/positions/editlist/'+resourceId]);
  }

  async deletePosition(resourceId: string, resourceName: string){
    
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
    this.router.navigate(['/positions/list']);
}

}

