import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { SportsCrudService } from '../sports-crud.service';



@Component({
  selector: 'app-sports-list',
  templateUrl: './sports-list.component.html',
  styleUrls: ['./sports-list.component.scss']
})
export class SportsListComponent implements OnInit {

  value: any = [];
  getAllSportmeta: any = [];
  getAllSportmetaData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;
  
  constructor(private router: Router, 
    private sportsCrudService: SportsCrudService, 
    private notification: NgiNotificationService, 
    @Inject(DOCUMENT) private _document: Document, 
    private restApiService: RestApiService, 
    private http:HttpClient) { }

  ngOnInit() {
  this.getSportMetaAPI();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

 
  async getSportMetaAPI(){

    

   
    if( this.sportsCrudService.dataStore.sports.length > 0)
    {
      console.log('---sports length----', this.sportsCrudService.dataStore.sports)

      this.getAllSportmetaData = this.sportsCrudService.dataStore.sports;
      this.data = this.getAllSportmetaData;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {

      setTimeout(() => { this.getSportMetaAPI() }, 1000);
    }

   /* 
   let Metaurl = 'sports';
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
 
    
   }); */

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
         
          let Metaurl = 'sports/'+resourceId;

          this.restApiService.remove(Metaurl).subscribe(data=> 
            {
                  
              console.log(data);
              this.notification.isNotification(true, "Sports Data", "Sports Data has been deleted successfully.", "check-square");
              this.refreshPage();
            },
            error => {
              console.log(error);    
            }
            );
 
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
