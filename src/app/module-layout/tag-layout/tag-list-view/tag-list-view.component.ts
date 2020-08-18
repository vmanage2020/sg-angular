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
  selector: 'app-tag-list-view',
  templateUrl: './tag-list-view.component.html',
  styleUrls: ['./tag-list-view.component.scss']
})
export class TagListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    value: any = [];
  
    
    getTagValue: any = [];
    getTagValueData: any = [];
    getTagValueArray: any = [];
  
    
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
    
    loading = true;
    displayLoader: any = true;
  
    submitted = false;
    createtagForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createtagForm = this.formBuilder.group({
        tag_name: ['', Validators.required ],
        sport_id: ['', Validators.required ],
        sport_name: [''],
        organization_id: [''],
      });
    }
    
  
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      //this.getTagInfo();
      this.getTagInfoAPI();
      //this.getAllSports();
      this.getAllSportsAPI();
      this.loading = false;
      this.displayLoader = false;
    }
     
    async getTagInfoAPI(){
             
      let Metaurl= 'tags/'+this.resourceID;

      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getTagValueData = lists;
          this.getTagValueArray = this.getTagValueData; 
        } else {
          this.getTagValueData = [];
          this.getTagValueArray = this.getTagValueData; 
        }

        console.log(this.getTagValueArray);

        this.loading = false;
        this.displayLoader = false; 
      
      });

      
    }
   
    
  async getAllSportsAPI(){
    
    let Metaurl= 'sports';

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

    get f() { return this.createtagForm.controls; }
  
   
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
    
    }
   
   refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/tags/list']);
  }
   
  }
  
  
  


