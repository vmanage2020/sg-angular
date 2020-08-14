import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
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
  selector: 'app-level-list-edit',
  templateUrl: './level-list-edit.component.html',
  styleUrls: ['./level-list-edit.component.scss']
})
export class LevelListEditComponent implements OnInit {

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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
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
      //this.getLevelInfo();
      this.getLevelInfoAPI();
      //this.getAllSports();
      this.getAllSportsAPI();
      this.loading = false;
      this.displayLoader = false;
    }

    async getLevelInfo(){   
       
      this.getLevelValue = await this.db.collection('levels').doc(this.resourceID).get();
      if (this.getLevelValue.exists) {
        this.getLevelValueData = await this.getLevelValue.data();
      } else {
        this.getLevelValueData = [];
      }
    
      this.getLevelValueArray = this.getLevelValueData; 
      console.log(this.getLevelValueArray);

      //this.getAllPositionBySport(this.getPositionValueData.sport_id, this.uid)
    
      this.loading = false;
      this.displayLoader = false; 
        
    }
   
    async getLevelInfoAPI(){   
       
      let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/levels/'+this.resourceID;
      //let Metaurl = this.baseAPIUrl+'levels/'+this.resourceID;

      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getLevelValueData = lists;
          this.getLevelValueArray = this.getLevelValueData; 
        } else {
          this.getLevelValueData = [];
          this.getLevelValueArray = this.getLevelValueData; 
        }

        console.log(this.getLevelValueArray);

        this.loading = false;
        this.displayLoader = false; 
      
      });
     
    }

    async getAllSports(){    
      
      //this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
      this.getSports = await this.db.collection('/organization').doc(this.orgId).collection('/sports').orderBy('sport_id').get();
      this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
      this.getSportsArray = this.getSportsData; 
      console.log(this.getSportsArray);
  
    }

    
  async getAllSportsAPI(){
    
    let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/sports';
    //let Metaurl = this.baseAPIUrl+'sports';
 
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
        "is_active": false,
        "is_deleted": false,
        "organization_id": this.orgId,
        "created_datetime": new Date(),
        "created_uid": this.uid,
        "updated_datetime": new Date(),
        "updated_uid": "",
        "sort_order": 0,
      }
        
        /*
        await this.db.collection('levels').doc(this.resourceID).update(insertObj);        
        this.router.navigate(['/level/list']);  
        this.notification.isNotification(true, "Level Data", "Level has been updated successfully.", "check-square");
        */

       let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/levels/'+this.resourceID;
       //let Metaurl = this.baseAPIUrl+'levels/'this.resourceID;
   
       this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
         {
               
           console.log(data);
           this.router.navigate(['/level/list']);  
           this.notification.isNotification(true, "Level Data", "Level has been updated successfully.", "check-square");
        
         },
         error => {
           console.log(error);    
         }
         );
        
      } catch (error) {
        
        console.log(error);
         
      }
    }
  
    
  
    listLevel(){
      this.router.navigate(['/level/list']);
    }
  
    addLevel(){
      this.router.navigate(['/level/createlist']);
    }
    
    viewLevel(resourceId: string){
      this.router.navigate(['/level/viewlist/'+resourceId]);
    }
    
    editLevel(resourceId: string){
      this.router.navigate(['/level/editlist/'+resourceId]);
    }
    
    async deleteLevel(resourceId: string, resourceName: string){
      
      try {
        this.notification.isConfirmation('', '', 'Level Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
          if (dataIndex[0]) {
            console.log("yes");
            //await this.db.collection('levels').doc(resourceId).delete();
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
  
  
  
