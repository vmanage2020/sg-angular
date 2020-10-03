import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { LevelService } from '../level-service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.scss'],
  providers: [NGXLogger]
})
export class LevelListComponent implements OnInit {

  value: any = [];
  getAllLevel: any = [];
  getAllLevelData: any = [];

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
    public cookieService: CookieService, 
    private restApiService: RestApiService, 
    private http:HttpClient, 
    private levelCrudService: LevelService, 
    private logger: NGXLogger) { }

  ngOnInit() { 

    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getLevelAPI();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }
   
  async getLevelAPI(){

    if(this.loading==true) {
      this.logger.debug('Levels List API Start Here====>', new Date().toUTCString());
    }
    
    if( this.levelCrudService.dataStore.levels.length > 0)
    {
      //console.log('---levels length----', this.levelCrudService.dataStore.levels)
      this.logger.debug('Levels List API End Here====>', new Date().toUTCString());
      this.getAllLevelData = this.levelCrudService.dataStore.levels;
      this.data = this.getAllLevelData;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {

      let Metaurl= '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='levels';
        } else {
        Metaurl='levelsbyorg/'+this.orgId;
        }
      this.restApiService.lists(Metaurl).subscribe( res => {
        this.data = res;
        this.dtTrigger.next();
        this.loading = false;
        this.displayLoader = false;  
      })

      /* setTimeout(() => { this.getLevelAPI()

        let Metaurl= '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='levels';
        } else {
        Metaurl='levelsbyorg/'+this.orgId;
        }
        this.levelCrudService.levelsList(Metaurl);
        this.getAllLevelData = this.levelCrudService.dataStore.levels; 
        this.loading = false;
        this.displayLoader = false;
       }, 1000); */

      
    }



    /*
    console.log(this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl='levels';
    } else {
      Metaurl='levelsbyorg/'+this.orgId;
    }

    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getAllLevelData = lists;
       this.data = this.getAllLevelData;
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
  
 
  listLevel(){
    this.router.navigate(['/level/list']);
  }

  addLevel(){
    this.router.navigate(['/level/createlist']);
  }
  
  viewLevel(resourceId: string){
    this.router.navigate(['/level/viewlist/'+resourceId]);
  }
  
  editLevel(resourceId: string){
    this.router.navigate(['/level/editlist/'+resourceId]);
  }

  async deleteLevel(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Level Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
       
          let Metaurl='levels/'+resourceId;

          this.restApiService.remove(Metaurl).subscribe(data=> 
            {
                  
              console.log(data);
              this.notification.isNotification(true, "Level Data", "Level Data has been deleted successfully.", "check-square");
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
      this.notification.isNotification(true, "Level Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/level/list']);
}

}

