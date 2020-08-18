import { Component, OnInit, Inject } from '@angular/core';

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
    this.getPositionMetaAPI();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getPositionMetaAPI(){

   let Metaurl='positions';
  
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
          
          let Metaurl='positions/'+resourceId;

          this.restApiService.remove(Metaurl).subscribe(data=> 
            {
                  
              console.log(data);
              this.notification.isNotification(true, "Position Data", "Position Data has been deleted successfully.", "check-square");
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
      this.notification.isNotification(true, "Position Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/positions/list']);
}

}

