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

import { CannedResponseCrudService } from '../canned-response-crud.service';

@Component({
  selector: 'app-canned-response-list-edit',
  templateUrl: './canned-response-list-edit.component.html',
  styleUrls: ['./canned-response-list-edit.component.scss']
})
export class CannedResponseListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    value: any = [];
  
   
    getCannedResponseValue: any = [];
    getCannedResponseValueData: any = [];
    getCannedResponseValueArray: any = [];
  
    
    getSports: any = [];
    getSportsData: any = [];
    getSportsArray: any = [];
  
    
    getTag: any = [];
    getTagData: any = [];
    getTagArray: any = [];
  
  
    country: any = [];
    countryCodeSelect: any = [];
    
    data: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
  
    uid: any;
    orgId: any;
    orgName: any;
    orgAbbrev: any;
    
    loading = true;
    displayLoader: any = true;
  
    submitted = false;
    createcannedresponseForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient, private cannedresponseCrudService: CannedResponseCrudService) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createcannedresponseForm = this.formBuilder.group({
          canned_response_title: ['', Validators.required ],
          canned_response_description: ['',[Validators.required, Validators.maxLength(300)]],
          sport_id: [null, Validators.required ],
          sport_name: [''],
          organization_id: [''],
          organization_name: [''],
          organization_abbreviation: [''],
      });
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
      
      //let Metaurl='sports';
  
      this.orgId = localStorage.getItem('org_id');
      console.log('orgId',this.orgId);
      let Metaurl= '';
      if(this.orgId=='') {
      Metaurl='sports';
      } else {
      Metaurl='organizationsports/'+this.orgId;
      }
    
  
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
  
     
    get f() { return this.createcannedresponseForm.controls; }
  
    async onSubmit(form) {
      try {
        this.submitted = true;
        if (form.invalid) {
          return;
        }
        
      this.displayLoader = true;
      this.loading = true;
        
  
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.orgName = localStorage.getItem('org_name');
      this.orgAbbrev = localStorage.getItem('org_abbrev');
    
      
      for(let sports of this.getSportsArray){
        if(form.value.sport_id==sports.sport_id)
          {
            form.value.sport_name = sports.name;
          }      
      }
    
      let insertObj = {
        "canned_response_title": form.value.canned_response_title,
        "cannedResponseTitle": form.value.canned_response_title,
        "canned_response_description": form.value.canned_response_description,
        "cannedResponseDesc": form.value.canned_response_description,
        "sport_id": form.value.sport_id,
        "sport_name": form.value.sport_name,
        "is_active": true,
        "is_deleted": false,
        "organization_id": this.orgId,
        "organization_name": this.orgName,
        "organization_abbreviation": this.orgAbbrev,
        "created_datetime": new Date(),
        "created_uid": this.uid,
        "updated_datetime": new Date(),
        "updated_uid": "",
        "sort_order": 0,
      }
          
       let Metaurl = 'cannedresponse/'+this.resourceID;
      
       this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
         {
               
           console.log(data);
            this.cannedresponseCrudService.dataStore.cannedresponses = [];
            this.orgId = localStorage.getItem('org_id');
            if(this.orgId=='') {
              this.cannedresponseCrudService.cannedresponsesList('cannedresponse');
            } else {
              this.cannedresponseCrudService.cannedresponsesList('cannedresponsebyorg/'+this.orgId+'');
            }
        
        //this.cannedresponseCrudService.dataStore.cannedresponses.push(data);
        //this.cannedresponseCrudService.dataStore.cannedresponses = [data].concat(this.cannedresponseCrudService.dataStore.cannedresponses); 
        //this.cannedresponseCrudService._cannedresponses.next(Object.assign({}, this.cannedresponseCrudService.dataStore).cannedresponses);
        
           this.router.navigate(['/cannedresponse/list']);  
           this.notification.isNotification(true, "Canned Response Data", "Canned Response has been updated successfully.", "check-square");
        
         },
         error => {
           console.log(error);  
            this.notification.isNotification(true, "Canned Response Error", error.message, "exclamation-circle");  
            this.createcannedresponseForm.patchValue( {'canned_response_title':null} );
            this.displayLoader = false;
            this.loading = false;    
         }
         );



      } catch (error) {
        
        console.log(error);
         
      }
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



