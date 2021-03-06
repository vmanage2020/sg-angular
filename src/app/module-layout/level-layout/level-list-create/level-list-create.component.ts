import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { LevelService } from '../level-service';

@Component({
  selector: 'app-level-list-create',
  templateUrl: './level-list-create.component.html',
  styleUrls: ['./level-list-create.component.scss']
})
export class LevelListCreateComponent implements OnInit {

  value: any = [];

  
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

  constructor(private router: Router, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient, private levelService:LevelService) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createlevelForm = this.formBuilder.group({
        level_name: ['', Validators.required ],
        abbreviation: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(6), Validators.pattern('^[a-zA-Z]*$')]],
        sport_id: [null, Validators.required ],
        sport_name: [null],
        description: ['',[Validators.maxLength(300)]],
        organization_id: [''],
    });
  }
  

  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getAllSportsAPI();
    this.loading = false;
    this.displayLoader = false;
  }
   
  async getAllSportsAPI(){
    
    //let Metaurl='sports';

    this.orgId = localStorage.getItem('org_id');
    console.log('orgId',this.orgId);
    let Metaurl= '';
    if(this.orgId=='' || this.orgId==1) {
    Metaurl='sports';
    } else {
    Metaurl='organizationsports/'+this.orgId;
    }
    
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


  onUppercase( event: any){
    event.target.value = event.target.value.toUpperCase() 
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
 
   let Metaurl='levels';
 
   this.restApiService.create(Metaurl,insertObj).subscribe(data=> 
    {
          
      console.log(data);
      this.levelService.dataStore.levels = [];
      this.orgId = localStorage.getItem('org_id');
      if(this.orgId=='') {
        this.levelService.levelsList('levels');
      } else {
        this.levelService.levelsList('levelsbyorg/'+this.orgId+'');
      }
      
      //this.levelService.dataStore.levels.push(data);
      //this.levelService.dataStore.levels = [data].concat(this.levelService.dataStore.levels); 
      //this.levelService._levels.next(Object.assign({}, this.levelService.dataStore).levels);
      
      this.router.navigate(['/level/list']);
      this.notification.isNotification(true, "Level Data", "Level has been added successfully.", "check-square");

    },
    error => {
      console.log(error);    
      this.notification.isNotification(true, "Level Error", error.message, "exclamation-circle");  
      this.createlevelForm.patchValue( {'level_name':null} );
      this.displayLoader = false;
      this.loading = false;  
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
     
  }

  
  refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/level/list']);
  }
 
}


