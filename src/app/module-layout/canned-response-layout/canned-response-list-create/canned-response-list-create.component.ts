import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-canned-response-list-create',
  templateUrl: './canned-response-list-create.component.html',
  styleUrls: ['./canned-response-list-create.component.scss']
})
export class CannedResponseListCreateComponent implements OnInit {

  value: any = [];

  
  getSports: any = [];
  getSportsData: any = [];
  getSportsArray: any = [];

  
  getCannedResponse: any = [];
  getCannedResponseData: any = [];
  getCannedResponseArray: any = [];


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

  constructor(private router: Router, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createcannedresponseForm = this.formBuilder.group({
        canned_response_title: ['', Validators.required ],
        canned_response_description: ['', Validators.required ],
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
    this.getAllSportsAPI();
    this.loading = false;
    this.displayLoader = false;
  }
 
  async getAllSportsAPI(){
    
    let Metaurl='sports';
 
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
 
     let Metaurl='cannedresponse';
 
     this.restApiService.create(Metaurl,insertObj).subscribe(data=> 
       {
             
         console.log(data);
         this.router.navigate(['/cannedresponse/list']);
         this.notification.isNotification(true, "Canned Response Data", "Canned Response has been added successfully.", "check-square");
   
       },
       error => {
         console.log(error);    
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




