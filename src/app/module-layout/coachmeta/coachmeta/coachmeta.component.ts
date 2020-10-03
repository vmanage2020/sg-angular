import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { CoachMetaService } from '../coachmeta-service';

import { NGXLogger } from 'ngx-logger';

  @Component({
    selector: 'app-coachmeta',
    templateUrl: './coachmeta.component.html',
    styleUrls: ['./coachmeta.component.scss'],
    providers: [NGXLogger]
  })
  export class CoachmetaComponent implements OnInit {
   
    value: any = [];
    getAllplayermeta: any = [];
    getAllPlayermetaData: any = [];
  
    data: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
   
    loading = true;
    displayLoader: any = true;
  
    uid: any;
    orgId: any;

    constructor(
      private router: Router,
      private notification: NgiNotificationService, 
      @Inject(DOCUMENT) private _document: Document, 
      private restApiService: RestApiService, 
      private http:HttpClient, 
      private coachCrudService:CoachMetaService,
      private logger: NGXLogger) { }
  
    ngOnInit() { 
      this.orgId = localStorage.getItem('org_id');
      this.getPlayerMetaAPI();  
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        processing: true
      }; 
    }
     
  async getPlayerMetaAPI(){
    console.log('---Coach length----', this.coachCrudService.dataStore.coachs.length)
    this.logger.debug('Coach Master API Start Here====>', new Date().toUTCString());
    if( this.coachCrudService.dataStore.coachs.length > 0)
    {
      //console.log('---sports length----', this.playerCrudService.dataStore.sports.length)
      this.logger.debug('Coach Master API End Here====>', new Date().toUTCString());
      this.getAllPlayermetaData = this.coachCrudService.dataStore.coachs;
      this.data = this.getAllPlayermetaData;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {

      let Metaurl= '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='coachcustomfield';
        } else {
        Metaurl='coachcustomfieldbyorg/'+this.orgId;
        }
      this.restApiService.lists(Metaurl).subscribe( res => {
        this.data = res;
        this.dtTrigger.next();
        this.loading = false;
        this.displayLoader = false;  
      })
      /* setTimeout(() => { this.getPlayerMetaAPI() 
         
      let Metaurl = '';
      if(this.orgId=='' || this.orgId==1) {
        Metaurl='coachcustomfield';
      } else {
      Metaurl='coachcustomfieldbyorg/'+this.orgId;
      }  
      this.coachCrudService.coachsList(Metaurl);
      this.getAllPlayermetaData = this.coachCrudService.dataStore.coachs;  

      this.loading = false;
      this.displayLoader = false;
      }, 1000); */
      
    }

    /*
    console.log('orgId',this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl='coachcustomfield';
    } else {
      Metaurl='coachcustomfieldbyorg/'+this.orgId;
    }

    Metaurl='coachcustomfield';
    
    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getAllPlayermetaData = lists;
       this.data = this.getAllPlayermetaData;
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
          //console.log("yes");

          this.logger.debug('Coach Meta Delete API Start Here====>', new Date().toUTCString());  

         let Metaurl='coachcustomfield/'+resourceId;
         
         this.restApiService.remove(Metaurl).subscribe(data=> 
           {
            this.logger.debug('Coach Meta Delete API End Here====>', new Date().toUTCString());          
            //console.log(data);
    
            this.coachCrudService.dataStore.coachs = [];
            let Metaurl= '';
            if(this.orgId=='') {
            Metaurl='coachcustomfield';
            } else {
            Metaurl='coachcustomfieldbyorg/'+this.orgId;
            }
            this.coachCrudService.coachsList(Metaurl);
            //this.coachCrudService.dataStore.coachs.push(data);
            //this.coachCrudService.dataStore.coachs = [data].concat(this.coachCrudService.dataStore.coachs);
            //this.coachCrudService._coachs.next(Object.assign({}, this.coachCrudService.dataStore).coachs);


              this.notification.isNotification(true, "Coach Custom Field", "Custom Field has been deleted successfully.", "check-square");
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
        this.notification.isNotification(true, "Coach Custom Meta Field", "Unable to delete.Please try again later.", "times-circle");
      }
    }
   
   refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/coachmeta']);
  }
  
  }
  
