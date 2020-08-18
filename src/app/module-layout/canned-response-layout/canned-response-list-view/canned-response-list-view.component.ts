import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-canned-response-list-view',
  templateUrl: './canned-response-list-view.component.html',
  styleUrls: ['./canned-response-list-view.component.scss']
})
export class CannedResponseListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    value: any = [];
  
    
    getCannedResponseValue: any = [];
    getCannedResponseValueData: any = [];
    getCannedResponseValueArray: any = [];
  
    
    getSports: any = [];
    getSportsData: any = [];
    getSportsArray: any = [];
  
    data: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
  
    uid: any;
    orgId: any;
    
    loading = true;
    displayLoader: any = true;
  
    submitted = false;
    createtagForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
    }
    
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getCannedResponseInfoAPI();
      this.getAllSportsAPI();
      this.loading = false;
      this.displayLoader = false;
    }
 
    
    async getCannedResponseInfoAPI(){
             
      let Metaurl = 'cannedresponse/'+this.resourceID;
      
      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getCannedResponseValueData = lists;
          this.getCannedResponseValueArray = this.getCannedResponseValueData; 
        } else {
          this.getCannedResponseValueData = [];
          this.getCannedResponseValueArray = this.getCannedResponseValueData; 
        }

        console.log(this.getCannedResponseValueArray);

        this.loading = false;
        this.displayLoader = false; 
      
      });

      
    }
 
    async getAllSportsAPI(){
      
      let Metaurl = 'sports';
     
      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists)
  
        try {
  
        this.getSportsData = lists;
        this.getSportsArray = this.getSportsData;
        
        } catch (error) {
        
          console.log(error);
          this.getSportsArray = [];
          
        }
    
        console.log(this.getSportsArray);
        
      });
  
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
    
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/cannedresponse/list']);
}

   
  }
  
  
  



