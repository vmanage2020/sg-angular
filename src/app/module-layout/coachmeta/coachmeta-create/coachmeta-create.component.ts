import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { CoachMetaService } from '../coachmeta-service';

import { NGXLogger } from 'ngx-logger';

  @Component({
    selector: 'app-coachmeta-create',
    templateUrl: './coachmeta-create.component.html',
    styleUrls: ['./coachmeta-create.component.scss'],
    providers: [NGXLogger]
  })
  export class CoachmetaCreateComponent implements OnInit {
  
      value: any = [];
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
      createplayermetaForm: FormGroup;
    
      constructor(
        private router: Router, 
        private formBuilder: FormBuilder,
        public cookieService: CookieService, 
        private notification: NgiNotificationService, 
        private restApiService: RestApiService, 
        private http:HttpClient, 
        private coachCrudService:CoachMetaService,
        private logger: NGXLogger) { 
         this.createForm(); 
      }
      
      createForm() {
        this.createplayermetaForm = this.formBuilder.group({
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
        this.orgId = localStorage.getItem('org_id');
        this.coachCrudService.sportsdataStore.sports = [];
        this.getSportsAPI();  
        this.getTypesAPI();  
        this.is_required_value = false;
        this.is_editable_value = false;
        this.is_deletable_value = false;
        this.loading = false;
        this.displayLoader = false;
      }
       
      async getSportsAPI(){
       
      this.logger.debug('Sports Master API Start Here====>', new Date().toUTCString());
      if( this.coachCrudService.sportsdataStore.sports.length > 0)
      {
        //console.log('---sports length----', this.coachCrudService.dataStore.sports)
        this.logger.debug('Sports Master API End Here====>', new Date().toUTCString());
        this.getAllSportmetaData = this.coachCrudService.sportsdataStore.sports;
        this.data = this.getAllSportmetaData;
        setTimeout(() => {
          this.dtTrigger.next();
        });
        this.loading = false;
        this.displayLoader = false;  

      }else {

        setTimeout(() => { this.getSportsAPI() 
        
        let Metaurl = '';
        if(this.orgId=='' || this.orgId==1) {
        Metaurl='sports';
        } else {
        Metaurl='organizationsports/'+this.orgId;
        }  
        this.coachCrudService.getSportsListAPI(Metaurl);
        this.getAllSportmetaData = this.coachCrudService.sportsdataStore.sports;
        
        }, 1000);
        this.loading = false;
        this.displayLoader = false;
      }
 
        /*
        let Metaurl='sports';
        
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
        */

      }
     
      async getTypesAPI(){
        this.getAllTypemetaData = this.getAllTypemetaDataArray;
      }
    
    
      OnFieldTypeChange(event) {
        console.log(event);
        var field_type_value = event.name;
        console.log(field_type_value);
        if(field_type_value!='Text Field') { 

          if( this.fieldvalueBodyArr.length>0)
          {
            this.removeAllfield(this.fieldvalueBodyArr.length)
          }else{
            this.removefield(0)
          }   
          this.addnewfield(); 
        }
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
    
      get f() { return this.createplayermetaForm.controls; }
    
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
            "created_datetime": new Date(),
            "created_uid": this.uid,
            "updated_datetime": new Date(),
            "updated_uid": "",
            "is_active": false,
            "is_deleted": false,
        }
    
        
        this.logger.debug('Coach Meta Create API Start Here====>', new Date().toUTCString());          

         let Metaurl='coachcustomfield';
         
         this.restApiService.create(Metaurl,insertObj).subscribe(data=> 
           {
            this.logger.debug('Coach Meta Create API End Here====>', new Date().toUTCString());          
            //console.log(data);
    
            this.coachCrudService.dataStore.coachs = [];
            let Metaurl= '';
            if(this.orgId=='') {
            Metaurl='coachcustomfield';
            } else {
            Metaurl='coachcustomfieldbyorg/'+this.orgId;
            }
            this.coachCrudService.coachsList(Metaurl);
            //this.coachCrudService.dataStore.coachs.push(data);
            //this.coachCrudService.dataStore.coachs = [data].concat(this.coachCrudService.dataStore.coachs);
            //this.coachCrudService._coachs.next(Object.assign({}, this.coachCrudService.dataStore).coachs);

             this.router.navigate(['/coachmeta']);
             this.notification.isNotification(true, "Coach Meta Data", "Coach Meta has been added successfully.", "check-square");
   
           },
           error => {
             console.log(error);    
              this.notification.isNotification(true, "Coach Meta Error", error.message, "exclamation-circle");  
              this.createplayermetaForm.patchValue( {'field_name':null} );
              this.displayLoader = false;
              this.loading = false;  
           }
           );

           
        } catch (error) {
          
          console.log(error);
           
        }
      }
    
      get fieldvalueBodyArr() {
        return this.createplayermetaForm.get('value') as FormArray;
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

      removeAllfield(k)
      {
        while (this.fieldvalueBodyArr.length !== 0) {
          this.fieldvalueBodyArr.removeAt(0)
        }
      }
    
      getFieldvalueInfo() {
        return this.formBuilder.group({
          optionvalue: ['', [Validators.required]],
        })
      }
     
    }
    
  