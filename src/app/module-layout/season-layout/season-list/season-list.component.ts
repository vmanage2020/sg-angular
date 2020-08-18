import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { CookieService } from 'src/app/core/services/cookie.service';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-season-list',
  templateUrl: './season-list.component.html',
  styleUrls: ['./season-list.component.scss']
})
export class SeasonListComponent implements OnInit {

  value: any = [];
  getAllSeasons: any = [];
  getAllSeasonsData: any = [];

  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;

  constructor(private router: Router, private notification: NgiNotificationService, @Inject(DOCUMENT) private _document: Document,public cookieService: CookieService, private restApiService: RestApiService, private http:HttpClient) { }

  ngOnInit() { 
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getSeasonsAPI();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getSeasonsAPI(){
   
    console.log('orgId',this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl='seasons';
    } else {
      Metaurl='seasonsbyorg/'+this.orgId;
    }

    Metaurl='seasons';

        
    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getAllSeasonsData = lists;
       this.data = this.getAllSeasonsData;
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
 
  listSeason(){
    this.router.navigate(['/season/list']);
  }

  addSeason(){
    this.router.navigate(['/season/createlist']);
  }
  
  viewSeason(resourceId: string){
    this.router.navigate(['/season/viewlist/'+resourceId]);
  }
  
  editSeason(resourceId: string){
    this.router.navigate(['/season/editlist/'+resourceId]);
  }

  async deleteSeason(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Seasons Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          
          let Metaurl='seasons/'+resourceId;
        
         this.restApiService.remove(Metaurl).subscribe(data=> 
           {
              console.log(data);
              this.notification.isNotification(true, "Seasons Data", "Seasons Data has been deleted successfully.", "check-square");
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
      this.notification.isNotification(true, "Seasons Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/season/list']);
}

}



