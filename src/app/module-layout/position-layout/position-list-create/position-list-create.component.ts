import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { PositionCrudService } from '../position-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-position-list-create',
  templateUrl: './position-list-create.component.html',
  styleUrls: ['./position-list-create.component.scss'],
  providers: [NGXLogger]
})
export class PositionListCreateComponent implements OnInit {

  value: any = [];

  
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

  constructor(private router: Router, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient, private positionCrudService:PositionCrudService,
    private logger: NGXLogger) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createpositionForm = this.formBuilder.group({
        name: ['', Validators.required ],
        abbreviation: ['', Validators.required ],
        sport_id: [null, Validators.required ],
        sport_name: [null],
        parent_position_id: [null],
        parent_position_name: [''],
    });
  }
  

  ngOnInit() {
    this.getAllSportsAPI();
  }

 
  async getAllSportsAPI(){
    
    this.logger.debug('Sports Master API Start Here====>', new Date().toUTCString());
    if( this.positionCrudService.sportsdataStore.sports.length > 0)
    {
      //console.log('---sports length----', this.positionCrudService.dataStore.sports)
      this.logger.debug('Sports Master API End Here====>', new Date().toUTCString());
      this.getSportsArray = this.positionCrudService.sportsdataStore.sports;
      this.data = this.getSportsArray;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else {

      setTimeout(() => { this.getAllSportsAPI() }, 1000);
      this.loading = false;
      this.displayLoader = false;
    }

    
   /*  
   let Metaurl='sports';
 
   this.restApiService.lists(Metaurl).subscribe( lists => {
     //console.log('---lists----', lists)

     try {

      this.getSportsData = lists;
      this.getSportsArray = this.getSportsData;
      
      this.loading = false;
      this.displayLoader = false;
      
     } catch (error) {
      
       console.log(error);
       this.getSportsArray = [];
       
     }
 
     //console.log(this.getSportsArray);
     
   });
   */

  } 

  OnSportChange(event) {
    var sport_id_value = event.sport_id;
    console.log(sport_id_value);
    this.getAllPositionBySportAPI(sport_id_value, this.uid);
  }

  
  async getAllPositionBySportAPI(sport_id,user_id){ 

   this.logger.debug('Positions Master By Sports API Start Here====>', new Date().toUTCString());    
   let Metaurl='positionsbysports/'+sport_id;

   this.restApiService.lists(Metaurl).subscribe( lists => {
  
     try {
      this.logger.debug('Positions Master By Sports API End Here====>', new Date().toUTCString());    
      this.getPositionsData = lists;
      this.getPositionsArray = this.getPositionsData;
      
     } catch (error) {
      
       console.log(error);
       this.getPositionsArray = [];
       
     }
 
     //console.log(this.getPositionsArray);
     
   });

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

    //console.log(form.value.country_code);
    //console.log(form.value.country);
      
    
    let insertObj = {
      "name": form.value.name,
      "position_name": form.value.name,
      "abbreviation": form.value.abbreviation,
      "sport_id": form.value.sport_id,
      "sport_name": form.value.sport_name,
      "parent_position_id": form.value.parent_position_id,
      "parent_position_name": form.value.parent_position_name,
      "created_datetime": new Date(),
      "created_uid": this.uid,
      "updated_datetime": new Date(),
      "updated_uid": "",
      "sort_order": 0,
    }
 
    this.logger.debug('Positions Create API Start Here====>', new Date().toUTCString());      

   let Metaurl='positions'; 

   this.restApiService.create(Metaurl,insertObj).subscribe(data=> 
    {
      this.logger.debug('Positions Create API End Here====>', new Date().toUTCString());          
      //console.log(data);

      this.positionCrudService.dataStore.positions = [];
      this.positionCrudService.positionsList('positions');
      //this.positionCrudService.dataStore.positions.push(data);
      //this.positionCrudService.dataStore.positions = [data].concat(this.positionCrudService.dataStore.positions);
      //this.positionCrudService._positions.next(Object.assign({}, this.positionCrudService.dataStore).positions);

      this.router.navigate(['/positions/list']);
      this.notification.isNotification(true, "Position Data", "Position has been added successfully.", "check-square");

    },
    error => {
      console.log(error);    
      this.notification.isNotification(true, "Position Error", error.message, "exclamation-circle");  
      this.createpositionForm.patchValue( {'name':null} );
      this.displayLoader = false;
      this.loading = false;
    }
    );

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
     
  }
 
  refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/positions/list']);
  }
 
}


