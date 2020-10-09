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

import { PositionCrudService } from '../position-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-position-list-edit',
  templateUrl: './position-list-edit.component.html',
  styleUrls: ['./position-list-edit.component.scss'],
  providers: [NGXLogger]
})
export class PositionListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient, private positionCrudService:PositionCrudService,
      private logger: NGXLogger) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createpositionForm = this.formBuilder.group({
          name: ['', Validators.required ],
          abbreviation: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(6), Validators.pattern('^[a-zA-Z]*$')]],
          sport_id: ['', Validators.required ],
          sport_name: [''],
          parent_position_id: [''],
          parent_position_name: [''],
      });
    }
    
  
    ngOnInit() {
      this.getPositionAPI();
      this.getAllSportsAPI();
    }
  
    
    async getPositionAPI(){   
      this.logger.debug('Position Data By ID API Start Here====>', new Date().toUTCString());   
        let Metaurl='positions/'+this.resourceID;

        this.restApiService.lists(Metaurl).subscribe( lists => {
          //console.log('---lists----', lists);
          this.logger.debug('Position Data By ID API End Here====>', new Date().toUTCString());   
          if (lists) {
            this.getPositionValueData = lists;
            this.getPositionValueArray = this.getPositionValueData; 
          } else {
            this.getPositionValueData = [];
            this.getPositionValueArray = this.getPositionValueData; 
          }

          //console.log(this.getPositionValueArray);
          this.getAllPositionBySportAPI(this.getPositionValueData.sport_id, this.uid)
          this.loading = false;
          this.displayLoader = false; 
        
        });
      
    } 
    
    async getAllSportsAPI(){    
    
      
    this.logger.debug('Sports Master API Start Here====>', new Date().toUTCString());
    if( this.positionCrudService.sportsdataStore.sports.length > 0)
    {
      //console.log('---sports length----', this.positionCrudService.dataStore.sports)
      this.logger.debug('Sports Master API End Here====>', new Date().toUTCString());
      this.getSportsArray = this.positionCrudService.sportsdataStore.sports;
      
      this.loading = false;
      this.displayLoader = false;  

    }else {

      setTimeout(() => { this.getAllSportsAPI() 
      
        this.positionCrudService.getSportsListAPI('sports');
        this.getSportsArray = this.positionCrudService.sportsdataStore.sports;

      }, 1000);
      this.loading = false;
      this.displayLoader = false;
    }



      /*
   let Metaurl='sports';
   
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
   */
  
    }
  
    OnSportChange(event) {
      var sport_id_value = event.sport_id;
      //console.log(sport_id_value);
      this.getAllPositionBySportAPI(sport_id_value, this.uid);
    }

    
    async getAllPositionBySportAPI(sport_id,user_id){    
    
      let Metaurl='positionsbysports/'+sport_id;
    

   this.restApiService.lists(Metaurl).subscribe( lists => {
     //console.log('---lists----', lists)

     try {

      this.getPositionsData = lists;
      this.getPositionsArray = this.getPositionsData;
      
     } catch (error) {
      
       console.log(error);
       this.getPositionsArray = [];
       
     }
 
     //console.log(this.getPositionsArray);
     
   });
  
    }

    onUppercase( event: any){
      event.target.value = event.target.value.toUpperCase() 
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
        "updated_datetime": new Date(),
        "updated_uid": this.uid,
        "sort_order": 0,
      }
         
      //console.log('insertObj',insertObj);
      this.logger.debug('Position Update ID API Start Here====>', new Date().toUTCString());   

       let Metaurl='positions/'+this.resourceID;
       
       this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
         {
           //console.log(data);
           this.logger.debug('Position Data By ID API End Here====>', new Date().toUTCString());   

           
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
  
  
  