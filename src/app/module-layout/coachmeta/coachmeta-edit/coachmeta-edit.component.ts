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
    selector: 'app-coachmeta-edit',
    templateUrl: './coachmeta-edit.component.html',
    styleUrls: ['./coachmeta-edit.component.scss']
  })
  export class CoachmetaEditComponent implements OnInit {
  
  
    db: any = firebase.firestore();
    value: any = [];
    getAllplayermeta: any = [];
    getAllPlayermetaData: any = [];
    getAllSportmeta: any = [];
    getAllSportmetaData: any = [];
    getAllTypemeta: any = [];
    getAllTypemetaData: any = [];
  
    getSelectedSportmeta: any = [];
    getSelectedSportmetaData: any = [];
    
    getAllTypemetaDataArray: any = [
      { name: 'Drop Down' },
      { name: 'Check box' },
      { name: 'Radio button' },
      { name: 'Text Field' }
    ]
  
    data: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
   
    resourceID = this.route.snapshot.paramMap.get('resourceId'); 
   
    is_required_form_value = "false";
    is_editable_form_value = "false";
    is_deletable_form_value = "false";
    
    uid: any;
    orgId: any;
    
    loading = true;
    displayLoader: any = true;
    is_required_value = false;
    is_editable_value = false;
    is_deletable_value = false;
  
    submitted = false;
    editplayermetaForm: FormGroup;
  
    constructor(private router: Router,private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
      this.editForm(); 
   }
  
   
   editForm() {
    this.editplayermetaForm = this.formBuilder.group({
        auth_uid: [''],
        organization_id: [''],
        sport_id: [null, Validators.required ],
        sport_name: [''],
        field_name: ['', Validators.required ],
        field_type: [null, Validators.required ],
        is_required: ['', Validators.required ],
        is_editable: ['', Validators.required ],
        is_deletable: ['', Validators.required ],
        singlevalue: [''],
        value: this.formBuilder.array([]),
        field_value: [''],
    });
  }
  
  
    ngOnInit() { 
      
      //this.getPlayerMeta();  
      this.getPlayerMetaAPI();  
      //this.getSports();  
      this.getSportsAPI();  
      //this.getTypes();
      this.getTypesAPI();  
  
    }
  
    async getPlayerMeta(){
      this.getAllplayermeta = await this.db.collection('coachcustomfield').doc(this.resourceID).get();
      if (this.getAllplayermeta.exists) {
        this.getAllPlayermetaData = this.getAllplayermeta.data();
      } else {
        this.getAllPlayermetaData = [];
      }
  
      console.log(this.getAllPlayermetaData);
  
  
      if(this.getAllPlayermetaData.is_required=='true')
      {
        this.is_required_value = true;
      }
  
      if(this.getAllPlayermetaData.is_editable=='true')
      {
        this.is_editable_value = true;
      }
  
      if(this.getAllPlayermetaData.is_deletable=='true')
      {
        this.is_deletable_value = true;
      }
  
      if(this.getAllPlayermetaData.field_type=='Text Field')
      {
        this.getAllPlayermetaData.field_value = this.getAllPlayermetaData.value[0];
      } else {
        this.getAllPlayermetaData.field_value = [this.getAllPlayermetaData.value];
      }
  
      
  
      this.loading = false;
      this.displayLoader = false; 
    }
      
    async getPlayerMetaAPI(){
      
      let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/coachcustomfield/'+this.resourceID;
      //let Metaurl = this.baseAPIUrl+'coachcustomfield/'+this.resourceID;

      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getAllPlayermetaData = lists;
        } else {
          this.getAllPlayermetaData = [];
        }

        
      if(this.getAllPlayermetaData.is_required==true || this.getAllPlayermetaData.is_required=='true')
      {
        this.is_required_value = true;
      }
  
      if(this.getAllPlayermetaData.is_deletable==true || this.getAllPlayermetaData.is_deletable=='true')
      {
        this.is_editable_value = true;
      }
  
      if(this.getAllPlayermetaData.is_deletable==true || this.getAllPlayermetaData.is_deletable=='true')
      {
        this.is_deletable_value = true;
      }
  
      if(this.getAllPlayermetaData.field_type=='Text Field')
      {
        this.getAllPlayermetaData.field_value = this.getAllPlayermetaData.value[0];
      } else {
        this.getAllPlayermetaData.field_value = [this.getAllPlayermetaData.value];
      }
  
        console.log(this.getAllPlayermetaData);

        this.loading = false;
        this.displayLoader = false; 
      
      });

    }
  
    async getSports(){
      this.getAllSportmeta = await this.db.collection('sports').orderBy('sport').get();
      this.getAllSportmetaData = await this.getAllSportmeta.docs.map((doc: any) => doc.data()); 
    }

    async getSportsAPI(){
      
      let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/sports';
      //let Metaurl = this.baseAPIUrl+'sports';
  
      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists)
  
        try {
  
        this.getAllSportmetaData = lists;
        
        } catch (error) {
        
          console.log(error);
          this.getAllSportmetaData = [];
          
        }
    
        console.log(this.getAllSportmetaData);
        
      });
  
    } 
  
    async getTypes(){
      this.getAllTypemetaData = this.getAllTypemetaDataArray; 
    }

    async getTypesAPI(){
      this.getAllTypemetaData = this.getAllTypemetaDataArray; 
    }
    
    listCoachmeta(){
      this.router.navigate(['/coachmeta']);
    }
  
    addCoachmeta(){
      this.router.navigate(['/coachmeta/create']);
    }
    
    viewCoachmeta(resourceId: string){
      this.router.navigate(['/coachmeta/view/'+resourceId]);
    }
    
    editCoachmeta(resourceId: string){
      this.router.navigate(['/coachmeta/edit/'+resourceId]);
    }
  
    deleteCoachmeta(resourceId: string){ 
      this.router.navigate(['/coachmeta/delete/'+resourceId]);
    }

    OnFieldTypeChange(event) {
      /*
        console.log(event);
        console.log(event.target.value);
        if(event.target.value!='Text Field') { 
          this.addnewfield(); 
        }
      */  
      
      var field_type_value = event.name;
      console.log(field_type_value);
      if(field_type_value!='Text Field') { 
        this.addnewfield(); 
      }

    }
  
    get f() { return this.editplayermetaForm.controls; }
  
    
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
    
      /*
        this.getSelectedSportmeta = await this.db.collection('sports').doc(form.value.sport_id).get();
      if (this.getSelectedSportmeta.exists) {
        this.getSelectedSportmetaData = this.getSelectedSportmeta.data();
      } else {
        this.getSelectedSportmetaData = [];
      } 
      */

      for(let sports of this.getAllSportmetaData){
        if(form.value.sport_id==sports.sport_id)
          {
            this.getSelectedSportmetaData.name = sports.name;
          }      
      }
  
        if(form.value.is_required == true) { this.is_required_form_value = 'true'; } else { this.is_required_form_value = 'false'; }
        if(form.value.is_editable == true) { this.is_editable_form_value = 'true'; } else { this.is_editable_form_value = 'false'; }
        if(form.value.is_deletable == true) { this.is_deletable_form_value = 'true'; } else { this.is_deletable_form_value = 'false'; }
   
        if(form.value.field_type=='Text Field') {
          this.value.push(form.value.field_value);
        } else {
          for (let formvalue of form.value.value) {
            if(formvalue.optionvalue!='') {
              this.value.push(formvalue.optionvalue);
            }
          }
        }
  
     let insertObj = {
      "organization_id": this.orgId || "",
      "sport_id": form.value.sport_id,
      "sport": this.getSelectedSportmetaData.name,
      "field_name": form.value.field_name,
      "field_type": form.value.field_type,
      "value": this.value,
      "is_deletable": this.is_deletable_form_value,
      "is_editable": this.is_editable_form_value,
      "is_required": this.is_required_form_value,
      "updated_datetime": new Date(),
      "updated_uid": this.uid,
      "is_active": false,
      "is_deleted": false,
    }
      
      /*
      await this.db.collection('coachcustomfield').doc(this.resourceID).update(insertObj);
      this.router.navigate(['/coachmeta']);
      this.notification.isNotification(true, "Coach Meta Data", "Coach Meta has been updated successfully.", "check-square");
      */

      
     let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/coachcustomfield/'+this.resourceID;
     //let Metaurl = this.baseAPIUrl+'coachcustomfield/'this.resourceID;
 
     this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
       {
             
         console.log(data);
         this.router.navigate(['/coachmeta']);
         this.notification.isNotification(true, "Coach Meta Data", "Coach Meta has been updated successfully.", "check-square");
         
       },
       error => {
         console.log(error);    
       }
       );


      } catch (error) {
        
        console.log(error);
         
      }
    }
  
    
    get fieldvalueBodyArr() {
      return this.editplayermetaForm.get('value') as FormArray;
    }
  
    addnewfield()
    {
      console.log("Add");
      this.fieldvalueBodyArr.push(this.getFieldvalueInfo());
    }
  
    removefield(i: number)
    {
      
      this.fieldvalueBodyArr.removeAt(i);
    }
  
    getFieldvalueInfo() {
      return this.formBuilder.group({
        optionvalue: ['', [Validators.required]],
      })
    }
   
  }
  