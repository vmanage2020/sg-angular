import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

  @Component({
    selector: 'app-coachmeta-view',
    templateUrl: './coachmeta-view.component.html',
    styleUrls: ['./coachmeta-view.component.scss']
  })
  export class CoachmetaViewComponent implements OnInit {
      
      value: any = [];
      getAllplayermeta: any = [];
      getAllPlayermetaData: any = [];
    
      data: any;
      dtOptions: DataTables.Settings = {};
      dtTrigger: Subject<any> = new Subject();
     
      resourceID = this.route.snapshot.paramMap.get('resourceId'); 
    
      loading = true;
      displayLoader: any = true;
      
      constructor(private router: Router, private route: ActivatedRoute, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { }
      
      ngOnInit() {    
        this.getPlayerMetaAPI();  
      }
    
       async getPlayerMetaAPI(){
      
        let Metaurl='coachcustomfield/'+this.resourceID;
  
        this.restApiService.lists(Metaurl).subscribe( lists => {
          console.log('---lists----', lists);
          if (lists) {
            this.getAllPlayermetaData = lists;
          } else {
            this.getAllPlayermetaData = [];
          }
  
          console.log(this.getAllPlayermetaData);
  
          this.loading = false;
          this.displayLoader = false; 
        
        });
  
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
    
      deleteCoachmeta(resourceId: string){
        this.router.navigate(['/coachmeta/delete/'+resourceId]);
      }
    
    }
    