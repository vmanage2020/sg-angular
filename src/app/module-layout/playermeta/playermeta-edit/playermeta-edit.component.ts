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

import { PlayerMetaService } from '../playermeta-service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-playermeta-edit',
  templateUrl: './playermeta-edit.component.html',
  styleUrls: ['./playermeta-edit.component.scss'],
  providers: [NGXLogger]
})
export class PlayermetaEditComponent implements OnInit {

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

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    public cookieService: CookieService, 
    private notification: NgiNotificationService, 
    private restApiService: RestApiService, 
    private http:HttpClient, 
    private playerCrudService:PlayerMetaService,
    private logger: NGXLogger) { 
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
    this.orgId = localStorage.getItem('org_id');
    this.getPlayerMetaAPI();  
    this.playerCrudService.sportsdataStore.sports = [];
    this.getSportsAPI();  
    this.getTypesAPI();  
  }
   
  async getPlayerMetaAPI(){
      
    let Metaurl='playermetadata/'+this.resourceID;
    
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
 
  async getSportsAPI(){

        
    this.logger.debug('Sports Master API Start Here====>', new Date().toUTCString());
    if( this.playerCrudService.sportsdataStore.sports.length > 0)
    {
      //console.log('---sports length----', this.playerCrudService.dataStore.sports)
      this.logger.debug('Sports Master API End Here====>', new Date().toUTCString());
      this.getAllSportmetaData = this.playerCrudService.sportsdataStore.sports;
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
      this.playerCrudService.getSportsListAPI(Metaurl);
      this.getAllSportmetaData = this.playerCrudService.sportsdataStore.sports; 

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
  
  
  listPlayermeta(){ 
    this.router.navigate(['/playermeta']);
  }

  addPlayermeta(){ 
    this.router.navigate(['/playermeta/create']);
  }
  
  viewPlayermeta(resourceId: string){ 
    this.router.navigate(['/playermeta/view/'+resourceId]);
  }
  
  editPlayermeta(resourceId: string){ 
    this.router.navigate(['/playermeta/edit/'+resourceId]);
  }

  deletePlayermeta(resourceId: string){ 
    this.router.navigate(['/playermeta/delete/'+resourceId]);
  }

  OnFieldTypeChange(event) {
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
    
  
   this.logger.debug('Player Meta Update API Start Here====>', new Date().toUTCString()); 

   let Metaurl='playermetadata/'+this.resourceID;
  
   this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
     {
           
      this.logger.debug('Player Meta Update API End Here====>', new Date().toUTCString());          
      //console.log(data);

      this.playerCrudService.dataStore.players = [];
      let Metaurl= '';
      if(this.orgId=='') {
      Metaurl='playermetadata';
      } else {
      Metaurl='playermetadatabyorg/'+this.orgId;
      }
      this.playerCrudService.playersList(Metaurl);
      //this.playerCrudService.dataStore.positions.push(data);
      //this.playerCrudService.dataStore.positions = [data].concat(this.playerCrudService.dataStore.positions);
      //this.playerCrudService._positions.next(Object.assign({}, this.playerCrudService.dataStore).positions);
      

       this.router.navigate(['/playermeta']);
       this.notification.isNotification(true, "Player Meta Data", "Player Meta has been updated successfully.", "check-square");
       
     },
     error => {
       console.log(error);    
        this.notification.isNotification(true, "Player Meta Error", error.message, "exclamation-circle");  
        this.editplayermetaForm.patchValue( {'field_name':null} );
        this.displayLoader = false;
        this.loading = false;    
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
    console.log("removefield",i);
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
