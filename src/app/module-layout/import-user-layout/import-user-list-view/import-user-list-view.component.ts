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
  selector: 'app-import-user-list-view',
  templateUrl: './import-user-list-view.component.html',
  styleUrls: ['./import-user-list-view.component.scss']
})
export class ImportUserListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    db: any = firebase.firestore();
    value: any = [];
  
    
    getLevelValue: any = [];
    getLevelValueData: any = [];
    getLevelValueArray: any = [];
  
    
    getSports: any = [];
    getSportsData: any = [];
    getSportsArray: any = [];
  
    
    getLevel: any = [];
    getLevelData: any = [];
    getLevelArray: any = [];
  
  
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
    createlevelForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createlevelForm = this.formBuilder.group({
        level_name: ['', Validators.required ],
        abbreviation: ['', Validators.required ],
        sport_id: ['', Validators.required ],
        sport_name: [''],
        description: [''],
        organization_id: [''],
      });
    }
    
  
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getLevelInfo();
      this.getAllSports();
      this.loading = false;
      this.displayLoader = false;
    }

    async getLevelInfo(){   
 
      if(this.orgId) {
        this.getLevelValue = await this.db.collection('/organization').doc(this.orgId).collection('/import_users_log').where('imported_file_id', '==', this.resourceID).get();
        this.getLevelValueData = await this.getLevelValue.docs.map((doc: any) => doc.data());
        console.log(this.getLevelValueData);      
      }
      
      /*
      if (this.getLevelValue.exists) {
        this.getLevelValueData = await this.getLevelValue.data();
      } else {
        this.getLevelValueData = [];
      }
      */
    
      this.getLevelValueArray = this.getLevelValueData[0]; 
      console.log(this.getLevelValueArray);

      //this.getAllPositionBySport(this.getPositionValueData.sport_id, this.uid)
    
      //this.loading = false;
      //this.displayLoader = false; 
        
    }
   

    async getAllSports(){    
      
      //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
      this.getSports = await this.db.collection('/organization').doc(this.orgId).collection('/sports').orderBy('sport_id').get();
      this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
      this.getSportsArray = this.getSportsData; 
      console.log(this.getSportsArray);
  
    }
  
     
    get f() { return this.createlevelForm.controls; }
  
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
  
    

    listUser(){
      this.router.navigate(['/useruploads/list']);
    }
  
    addUser(){
      this.router.navigate(['/useruploads/createlist']);
    }
    
    viewUser(resourceId: string){
      this.router.navigate(['/useruploads/viewlist/'+resourceId]);
    }
    
    editUser(resourceId: string){
      this.router.navigate(['/useruploads/editlist/'+resourceId]);
    }
  
    async deleteUser(resourceId: string, resourceName: string){
      
      try {
        this.notification.isConfirmation('', '', 'Level Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
          if (dataIndex[0]) {
            console.log("yes");
            await this.db.collection('levels').doc(resourceId).delete();
            this.notification.isNotification(true, "Level Data", "Level Data has been deleted successfully.", "check-square");
            this.refreshPage();
          } else {
            console.log("no");
          }
        }, (err) => {
          console.log(err);
        })
      } catch (error) {
        console.log(error);
        this.notification.isNotification(true, "Level Data", "Unable to delete.Please try again later.", "times-circle");
      }
    }
   
   refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/level/list']);
  }
   
  }
  
  
  

