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

import { TagCrudService } from '../tag-crud.service';


@Component({
  selector: 'app-tag-list-edit',
  templateUrl: './tag-list-edit.component.html',
  styleUrls: ['./tag-list-edit.component.scss']
})
export class TagListEditComponent implements OnInit {

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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient, private tagCrudService: TagCrudService) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createtagForm = this.formBuilder.group({
        tag_name: ['', Validators.required ],
        sport_id: [null, Validators.required ],
        sport_name: [''],
        organization_id: [''],
      });
    }
    
  
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getTagInfoAPI();
      this.getAllSportsAPI();
      //this.loading = false;
      //this.displayLoader = false;
    }
     
    async getTagInfoAPI(){
             
      let Metaurl = 'tags/'+this.resourceID;

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
  
     
    get f() { return this.createtagForm.controls; }
  
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
    
      
      for(let sports of this.getSportsArray){
        if(form.value.sport_id==sports.sport_id)
          {
            form.value.sport_name = sports.name;
          }      
      }
    
      let insertObj = {
        "tag_name": form.value.tag_name,
        "sport_id": form.value.sport_id,
        "sport_name": form.value.sport_name,
        "is_active": false,
        "is_deleted": false,
        "organization_id": this.orgId,
        "created_datetime": new Date(),
        "created_uid": this.uid,
        "updated_datetime": new Date(),
        "updated_uid": "",
        "sort_order": 0,
      }

      let Metaurl = 'tags/'+this.resourceID;
   
       this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
         {
               
           console.log(data);
           this.tagCrudService.dataStore.tags = [];
           this.orgId = localStorage.getItem('org_id');
          if(this.orgId=='') {
            this.tagCrudService.tagsList('tags');
          } else {
            this.tagCrudService.tagsList('tagsbyorg/'+this.orgId+'');
          }
          
           //this.tagCrudService.dataStore.tags.push(data);
           //this.tagCrudService._tags.next(Object.assign({}, this.tagCrudService.dataStore).tags);

           this.router.navigate(['/tags/list']);
           this.notification.isNotification(true, "Tag Data", "Tag has been updated successfully.", "check-square");
           
         },
         error => {
           console.log(error);    
            this.notification.isNotification(true, "Tag Error", error.message, "exclamation-circle");  
            this.createtagForm.patchValue( {'tag_name':null} );
            this.displayLoader = false;
            this.loading = false;  
         }
         );


      } catch (error) {
        
        console.log(error);
         
      }
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
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/tags/list']);
}

}


