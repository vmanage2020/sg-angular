import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';


import { NgiNotificationService } from 'ngi-notification';


@Component({
  selector: 'app-tag-list-view',
  templateUrl: './tag-list-view.component.html',
  styleUrls: ['./tag-list-view.component.scss']
})
export class TagListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    db: any = firebase.firestore();
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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService) { 
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
      this.getTagInfo();
      this.getAllSports();
      this.loading = false;
      this.displayLoader = false;
    }

    async getTagInfo(){   
       
      this.getTagValue = await this.db.collection('Tags').doc(this.resourceID).get();
      if (this.getTagValue.exists) {
        this.getTagValueData = await this.getTagValue.data();
      } else {
        this.getTagValueData = [];
      }
    
      this.getTagValueArray = this.getTagValueData; 
      console.log(this.getTagValueArray);

      //this.getAllPositionBySport(this.getPositionValueData.sport_id, this.uid)
    
      this.loading = false;
      this.displayLoader = false; 
        
    }
   

    async getAllSports(){    
      
      //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
      this.getSports = await this.db.collection('/organization').doc(this.orgId).collection('/sports').orderBy('sport_id').get();
      this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
      this.getSportsArray = this.getSportsData; 
      console.log(this.getSportsArray);
  
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
        "level_name": form.value.level_name,
        "abbreviation": form.value.abbreviation,
        "sport_id": form.value.sport_id,
        "sport_name": form.value.sport_name,
        "description": form.value.description,
        "is_active": true,
        "is_deleted": false,
        "organization_id": this.orgId,
        "created_datetime": new Date(),
        "created_uid": this.uid,
        "updated_datetime": new Date(),
        "updated_uid": "",
        "sort_order": 0,
      }
        
      
        await this.db.collection('levels').doc(this.resourceID).update(insertObj);

        
        this.router.navigate(['/level/list']);
  
        this.notification.isNotification(true, "Level Data", "Level has been updated successfully.", "check-square");
        
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
      
      try {
        this.notification.isConfirmation('', '', 'Tags Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
          if (dataIndex[0]) {
            console.log("yes");
            await this.db.collection('Tags').doc(resourceId).delete();
            this.notification.isNotification(true, "Tags Data", "Tags Data has been deleted successfully.", "check-square");
            this.refreshPage();
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
  
  
  


