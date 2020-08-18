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
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit {

  value: any = [];
  getAllTags: any = [];
  getAllTagsData: any = [];

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
    this.getTagsAPI();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getTagsAPI(){

    console.log(this.orgId);
    let Metaurl= '';
    if(this.orgId=='') {
      Metaurl = 'tags';
    } else {
      Metaurl = 'tagsbyorg/'+this.orgId;
    }
    
    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)
 
      try {
 
       this.getAllTagsData = lists;
       this.data = this.getAllTagsData;
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
  
 

 
  listTag(){
    this.router.navigate(['/tags/list']);
  }

  addTag(){
    this.router.navigate(['/tags/createlist']);
  }
  
  viewTag(resourceId: string){
    this.router.navigate(['/tags/viewlist/'+resourceId]);
  }
  
  editTag(resourceId: string){
    this.router.navigate(['/tags/editlist/'+resourceId]);
  }

  async deleteTag(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Tags Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");

          let Metaurl = 'tags/'+resourceId;

         this.restApiService.remove(Metaurl).subscribe(data=> 
           {
                 
             console.log(data);
             this.notification.isNotification(true, "Tags Data", "Tags Data has been deleted successfully.", "check-square");
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
      this.notification.isNotification(true, "Tags Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/tags/list']);
}

}


