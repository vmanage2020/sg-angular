import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { CannedResponseCrudService } from '../canned-response-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-canned-response-list',
  templateUrl: './canned-response-list.component.html',
  styleUrls: ['./canned-response-list.component.scss'],
  providers: [NGXLogger]
})
export class CannedResponseListComponent implements OnInit {


  value: any = [];
  getAllCannedResponse: any = [];
  getAllCannedResponseData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;

  reloading = true;

  constructor(private router: Router, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document,public cookieService: CookieService, private restApiService: RestApiService, private http:HttpClient, private cannedresponseCrudService: CannedResponseCrudService,private logger: NGXLogger) { }

  ngOnInit() { 
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getCannedResponsesAPI();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }
 
  async getCannedResponsesAPI(){
    this.logger.debug('Tags List API Start Here====>', new Date().toUTCString());    
    if( this.cannedresponseCrudService.dataStore.cannedresponses.length > 0)
    {
      console.log('---tags length----', this.cannedresponseCrudService.dataStore.cannedresponses)
      this.logger.debug('Tags List API Start Here====>', new Date().toUTCString());
      this.getAllCannedResponseData = this.cannedresponseCrudService.dataStore.cannedresponses;
      this.data = this.getAllCannedResponseData;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {
 
      setTimeout(() => { this.getCannedResponsesAPI();
        this.loading = false;
        this.displayLoader = false; 
       }, 1000);
      
    }



    
    /*
    console.log(this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl= 'cannedresponse';
    } else {
      Metaurl = 'cannedresponsebyorg/'+this.orgId;
    }
    
    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getAllCannedResponseData = lists;
       this.data = this.getAllCannedResponseData;
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
    */
  }
 
  listCannedResponses(){
    this.router.navigate(['/cannedresponse/list']);
  }

  addCannedResponses(){
    this.router.navigate(['/cannedresponse/createlist']);
  }
  
  viewCannedResponses(resourceId: string){
    this.router.navigate(['/cannedresponse/viewlist/'+resourceId]);
  }
  
  editCannedResponses(resourceId: string){
    this.router.navigate(['/cannedresponse/editlist/'+resourceId]);
  }

  async deleteCannedResponses(resourceId: string, resourceName: string){
    this.logger.debug('Canned Response Delete API Start Here====>', new Date().toUTCString());   
    try {
      this.notification.isConfirmation('', '', 'CannedResponse Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes"); 

          
         let Metaurl= 'cannedresponse/'+resourceId;
        
         this.restApiService.remove(Metaurl).subscribe(data=> 
           {       
            this.logger.debug('Canned Response Delete API End Here====>', new Date().toUTCString());             
             console.log(data);
        
             this.cannedresponseCrudService.dataStore.cannedresponses = [];
              this.orgId = localStorage.getItem('org_id');
              if(this.orgId=='') {
                this.cannedresponseCrudService.cannedresponsesList('cannedresponse');
              } else {
                this.cannedresponseCrudService.cannedresponsesList('cannedresponsebyorg/'+this.orgId+'');
              }
             this.notification.isNotification(true, "CannedResponse Data", "CannedResponse Data has been deleted successfully.", "check-square");
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
      this.notification.isNotification(true, "CannedResponse Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/cannedresponse/list']);
}

}



