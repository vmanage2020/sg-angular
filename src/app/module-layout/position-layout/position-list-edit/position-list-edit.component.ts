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
  selector: 'app-position-list-edit',
  templateUrl: './position-list-edit.component.html',
  styleUrls: ['./position-list-edit.component.scss']
})
export class PositionListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    db: any = firebase.firestore();
    value: any = [];
  
    
    getPositionValue: any = [];
    getPositionValueData: any = [];
    getPositionValueArray: any = [];
  
    
    getSports: any = [];
    getSportsData: any = [];
    getSportsArray: any = [];
  
    
    getPositions: any = [];
    getPositionsData: any = [];
    getPositionsArray: any = [];
  
  
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
    createpositionForm: FormGroup;
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createpositionForm = this.formBuilder.group({
          name: ['', Validators.required ],
          abbreviation: ['', Validators.required ],
          sport_id: ['', Validators.required ],
          sport_name: [''],
          parent_position_id: [''],
          parent_position_name: [''],
      });
    }
    
  
    ngOnInit() {
      this.getPosition();
      this.getAllSports();
      this.loading = false;
      this.displayLoader = false;
    }
  
    async getPosition(){   
       
      this.getPositionValue = await this.db.collection('positions').doc(this.resourceID).get();
      if (this.getPositionValue.exists) {
        this.getPositionValueData = await this.getPositionValue.data();
      } else {
        this.getPositionValueData = [];
      }
    
      this.getPositionValueArray = this.getPositionValueData; 
      console.log(this.getPositionValueArray);

      this.getAllPositionBySport(this.getPositionValueData.sport_id, this.uid)
    
      this.loading = false;
      this.displayLoader = false; 
        
    }

    async getAllSports(){    
      
      this.getSports = await this.db.collection('sports').orderBy('sport_id').get();
      this.getSportsData = await this.getSports.docs.map((doc: any) => doc.data());
      this.getSportsArray = this.getSportsData; 
      console.log(this.getSportsArray);
  
    }
  
    OnSportChange(event) {
      console.log(event.target.value);
      this.getAllPositionBySport(event.target.value, this.uid)
    }
  
    
    async getAllPositionBySport(sport_id,user_id){    
      
      this.getPositions = await this.db.collection('positions').where('sport_id', '==', sport_id).get();
      this.getPositionsData = await this.getPositions.docs.map((doc: any) => doc.data());
      this.getPositionsArray = this.getPositionsData; 
      console.log(this.getPositionsArray);
  
    }
  
    
    get f() { return this.createpositionForm.controls; }
  
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
  
      for(let positions of this.getPositionsArray){
        if(form.value.parent_position_id==positions.position_id)
          {
            form.value.parent_position_name = positions.name;
          }      
      }
  
      console.log(form.value.country_code);
      console.log(form.value.country);
        
      
      let insertObj = {
        "name": form.value.name,
        "abbreviation": form.value.abbreviation,
        "sport_id": form.value.sport_id,
        "sport_name": form.value.sport_name,
        "parent_position_id": form.value.parent_position_id,
        "parent_position_name": form.value.parent_position_name,
        "updated_datetime": new Date(),
        "updated_uid": this.uid,
        "sort_order": 0,
      }
        
      
        await this.db.collection('positions').doc(this.resourceID).update(insertObj);

        
        this.router.navigate(['/positions/list']);
  
        this.notification.isNotification(true, "Position Data", "Position has been added successfully.", "check-square");
        
      } catch (error) {
        
        console.log(error);
         
      }
    }
  
    
  
    listPosition(){
      this.router.navigate(['/positions/list']);
    }
  
    addPosition(){
      this.router.navigate(['/positions/createlist']);
    }
    
    viewPosition(resourceId: string){
      this.router.navigate(['/positions/viewlist/'+resourceId]);
    }
    
    editPosition(resourceId: string){
      this.router.navigate(['/positions/editlist/'+resourceId]);
    }
  
    async deletePosition(resourceId: string, resourceName: string){
      
      try {
        this.notification.isConfirmation('', '', 'Player Custom Meta Field', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
          if (dataIndex[0]) {
            console.log("yes");
            //await this.db.collection('playermetadata').doc(resourceId).delete();
            this.notification.isNotification(true, "Player Custom Field", "Custom Field has been deleted successfully.", "check-square");
            this.refreshPage();
          } else {
            console.log("no");
          }
        }, (err) => {
          console.log(err);
        })
      } catch (error) {
        console.log(error);
        this.notification.isNotification(true, "Player Custom Meta Field", "Unable to delete.Please try again later.", "times-circle");
      }
    }
   
    refreshPage() {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/positions/list']);
    }
   
  }
  
  
  