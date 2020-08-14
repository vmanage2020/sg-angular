import { Component, OnInit, Inject } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-managermeta',
  templateUrl: './managermeta.component.html',
  styleUrls: ['./managermeta.component.scss']
})
export class ManagermetaComponent implements OnInit {
 

  db: any = firebase.firestore();
  value: any = [];
  getAllplayermeta: any = [];
  getAllPlayermetaData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  constructor(private router: Router,private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document) { }

  ngOnInit() { 
    this.getPlayerMeta();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getPlayerMeta(){

    this.getAllplayermeta = await this.db.collection('managercustomfield').orderBy('sport_id').get();
    this.getAllPlayermetaData = await this.getAllplayermeta.docs.map((doc: any) => doc.data());
    this.data = this.getAllPlayermetaData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false; 
 
  }
 
  listManagermeta(){
    this.router.navigate(['/managermeta']);
  }

  addManagermeta(){
    this.router.navigate(['/managermeta/create']);
  }
  
  viewManagermeta(resourceId: string){
    this.router.navigate(['/managermeta/view/'+resourceId]);
  }
  
  editManagermeta(resourceId: string){
    this.router.navigate(['/managermeta/edit/'+resourceId]);
  }

  async deleteManagermeta(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Manager Custom Meta Field', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          await this.db.collection('managercustomfield').doc(resourceId).delete();
          this.notification.isNotification(true, "Manager Custom Field", "Custom Field has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Manager Custom Meta Field", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/managermeta']);
}

}
