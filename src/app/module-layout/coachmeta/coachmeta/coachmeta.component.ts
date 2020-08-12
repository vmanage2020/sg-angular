  import { Component, OnInit, Inject } from '@angular/core';
  import * as firebase from 'firebase';
  import { Subject } from 'rxjs';
  
  import 'rxjs/add/operator/map';
  
  import { Router } from '@angular/router';
  
  import { NgiNotificationService } from 'ngi-notification';
  
  import { DOCUMENT } from '@angular/common';
  
  @Component({
    selector: 'app-coachmeta',
    templateUrl: './coachmeta.component.html',
    styleUrls: ['./coachmeta.component.scss']
  })
  export class CoachmetaComponent implements OnInit {
   
  
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
  
      this.getAllplayermeta = await this.db.collection('coachcustomfield').orderBy('sport_id').get();
      this.getAllPlayermetaData = await this.getAllplayermeta.docs.map((doc: any) => doc.data());
      this.data = this.getAllPlayermetaData;
      this.dtTrigger.next();
      this.loading = false;
      this.displayLoader = false; 
   
    }
   
    listCoachmeta(){
      this.router.navigate(['/coachmeta']);
    }
  
    addCoachmeta(){
      this.router.navigate(['/coachmeta/create']);
    }
    
    viewCoachmeta(resourceId: string){
      this.router.navigate(['/coachmeta/view/'+resourceId]);
    }
    
    editCoachmeta(resourceId: string){
      this.router.navigate(['/coachmeta/edit/'+resourceId]);
    }
  
    async deleteCoachmeta(resourceId: string, resourceName: string){
      
      try {
        this.notification.isConfirmation('', '', 'Coach Custom Meta Field', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
          if (dataIndex[0]) {
            console.log("yes");
            await this.db.collection('coachcustomfield').doc(resourceId).delete();
            this.notification.isNotification(true, "Coach Custom Field", "Custom Field has been deleted successfully.", "check-square");
            this.refreshPage();
          } else {
            console.log("no");
          }
        }, (err) => {
          console.log(err);
        })
      } catch (error) {
        console.log(error);
        this.notification.isNotification(true, "Coach Custom Meta Field", "Unable to delete.Please try again later.", "times-circle");
      }
    }
   
   refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/coachmeta']);
  }
  
  }
  
