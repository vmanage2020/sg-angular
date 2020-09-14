import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { PlayerMetaService } from '../playermeta-service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-playermeta',
  templateUrl: './playermeta.component.html',
  styleUrls: ['./playermeta.component.scss'],
  providers: [NGXLogger]
})
export class PlayermetaComponent implements OnInit {

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

  constructor(private router: Router,
    private notification: NgiNotificationService, 
    @Inject(DOCUMENT) private _document: Document, 
    private restApiService: RestApiService, 
    private http:HttpClient, 
    private playerCrudService:PlayerMetaService,
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
    console.log('---players length----', this.playerCrudService.dataStore.players.length)
    this.logger.debug('Player Master API Start Here====>', new Date().toUTCString());
    if( this.playerCrudService.dataStore.players.length > 0)
    {
      //console.log('---sports length----', this.playerCrudService.dataStore.sports)
      this.logger.debug('Player Master API End Here====>', new Date().toUTCString());
      this.getAllPlayermetaData = this.playerCrudService.dataStore.players;
      this.data = this.getAllPlayermetaData;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {

      setTimeout(() => { this.getPlayerMetaAPI()

        let Metaurl = '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='playermetadata';
        } else {
        Metaurl='playermetadatabyorg/'+this.orgId;
        }  
        this.playerCrudService.playersList(Metaurl);
        this.getAllPlayermetaData = this.playerCrudService.dataStore.players;  

        this.loading = false;
        this.displayLoader = false;
      }, 1000);
      
    }

    /*
    console.log('orgId',this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl='playermetadata';
    } else {
      Metaurl='playermetadatabyorg/'+this.orgId;
    }

    Metaurl='playermetadata';
    
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
 
  listPlayermeta(){
    this.router.navigate(['/playermeta']);
  }

  addPlayermeta(){
    this.router.navigate(['/playermeta/create']);
  }
  
  viewPlayermeta(resourceId: string){
    this.router.navigate(['/playermeta/view/'+resourceId]);
  }
  
  editPlayermeta(resourceId: string){
    this.router.navigate(['/playermeta/edit/'+resourceId]);
  }

  async deletePlayermeta(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Player Custom Meta Field', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
         //console.log("yes");
         
         this.logger.debug('Player Meta Delete API Start Here====>', new Date().toUTCString());          

         let Metaurl='playermetadata/'+resourceId;
        
         this.restApiService.remove(Metaurl).subscribe(data=> 
           {
              
            this.logger.debug('Player Meta Delete API End Here====>', new Date().toUTCString());          
            //console.log(data);
    
            this.playerCrudService.dataStore.players = [];
            let Metaurl= '';
            if(this.orgId=='') {
            Metaurl='playermetadata';
            } else {
            Metaurl='playermetadatabyorg/'+this.orgId;
            }
            this.playerCrudService.playersList(Metaurl);
            //this.playerCrudService.dataStore.players.push(data);
            //this.playerCrudService.dataStore.players = [data].concat(this.playerCrudService.dataStore.players);
            //this.playerCrudService._players.next(Object.assign({}, this.playerCrudService.dataStore).players);


              this.notification.isNotification(true, "Player Custom Field", "Custom Field has been deleted successfully.", "check-square");
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
    this.router.navigate(['/playermeta']);
}

}
