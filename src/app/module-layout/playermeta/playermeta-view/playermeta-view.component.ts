import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-playermeta-view',
  templateUrl: './playermeta-view.component.html',
  styleUrls: ['./playermeta-view.component.scss']
})
export class PlayermetaViewComponent implements OnInit {

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
      
    let Metaurl='playermetadata/'+this.resourceID;
  
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

  deletePlayermeta(resourceId: string){
    this.router.navigate(['/playermeta/delete/'+resourceId]);
  }

}
