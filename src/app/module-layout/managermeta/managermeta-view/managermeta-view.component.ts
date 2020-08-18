import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-managermeta-view',
  templateUrl: './managermeta-view.component.html',
  styleUrls: ['./managermeta-view.component.scss']
})
export class ManagermetaViewComponent implements OnInit {
    
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
      
      let Metaurl='managercustomfield/'+this.resourceID;
 
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
  
    deleteManagermeta(resourceId: string){
      this.router.navigate(['/managermeta/delete/'+resourceId]);
    }
  
  }
  