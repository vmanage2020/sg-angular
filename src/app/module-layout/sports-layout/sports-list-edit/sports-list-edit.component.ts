import { Component, OnInit } from '@angular/core';
//import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';


import { DropdownService } from 'src/app/core/services/dropdown.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { SportsCrudService } from '../sports-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-sports-list-edit',
  templateUrl: './sports-list-edit.component.html',
  styleUrls: ['./sports-list-edit.component.scss'],
  providers: [NGXLogger]
})
export class SportsListEditComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 

  //db: any = firebase.firestore();
  value: any = [];
   
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
  editsportsForm: FormGroup;

  constructor(private router: Router,
    private route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    private sportsCrudService: SportsCrudService, 
    public cookieService: CookieService,
    private dropDownService: DropdownService, 
    private notification: NgiNotificationService, 
    private restApiService: RestApiService, 
    private http:HttpClient,
    private logger: NGXLogger) { 
    this.editForm(); 
 }

 
 editForm() {
  this.editsportsForm = this.formBuilder.group({
        auth_uid: [''],
        name: ['', Validators.required ],
        sport: [''],
        country_code: ['', Validators.required ],
        country: [''],
  });
}

getAllSportmeta: any = [];
getAllSportmetaData: any = [];

  ngOnInit() { 
    this.getSportsMetaAPI();  
    this.getCountryCodeListAPI();
    //this.loading = false;
    //this.displayLoader = false;
  }
  
  async getSportsMetaAPI(){
    this.logger.debug('Sport Data By ID API Start Here====>', new Date().toUTCString());   

    let Metaurl = 'sports/'+this.resourceID;

    this.restApiService.lists(Metaurl).subscribe( lists => {
      //console.log('---lists----', lists);
      this.logger.debug('Sport Data By ID API End Here====>', new Date().toUTCString());   
      if (lists) {
        this.getAllSportmetaData = lists;
      } else {
        this.getAllSportmetaData = [];
      }

      //console.log(this.getAllSportmetaData);
      this.loading = false;
      this.displayLoader = false; 
    
    });
   
  }


  async getCountryCodeListAPI()
  {

    if(this.sportsCrudService.countrydataStore.country.length > 0)
    {
      this.countryCodeSelect = this.sportsCrudService.countrydataStore.country;
      this.country = false;
    }else{
      setTimeout(() => { this.getCountryCodeListAPI() }, 1000);
    }
    /* let Metaurl = 'countries';

    this.restApiService.lists(Metaurl).subscribe( lists => {
      console.log('---lists----', lists)

      try {
        if (lists) {
          this.countryCodeSelect = lists;
          this.country = false;
        }
        else {
          this.countryCodeSelect = [];
          this.country = false;
        }
      } catch (error) {
        console.log(error);
        this.countryCodeSelect = [];
        this.country = false;
      }
  
      console.log(this.countryCodeSelect);
  
     
    }); */

  }

  
  
  get f() { return this.editsportsForm.controls; }

  
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
  
    
    for(let ccs of this.countryCodeSelect){
      if(form.value.country_code==ccs.country_code)
      {
        form.value.country = ccs.name;
      }      
    }

    //console.log(form.value.country_code);
    //console.log(form.value.country);
     

    let insertObj = {
      "sport": form.value.name,
      "name": form.value.name,
      "country_code": form.value.country_code,
      "country": form.value.country,
      "updated_datetime": new Date(),
      "updated_uid": this.uid,
      "isUsed": false,
    }

    this.logger.debug('Sport Update API Start Here====>', new Date().toUTCString());   

    let Metaurl = 'sports/'+this.resourceID;

    this.restApiService.update(Metaurl,insertObj).subscribe(data=> 
      {
        //console.log(data);
        this.logger.debug('Sport Update API End Here====>', new Date().toUTCString());   

        this.sportsCrudService.dataStore.sports = [];
        this.sportsCrudService.sportsList('sports');
        //this.sportsCrudService.dataStore.sports.push(data);
        //this.sportsCrudService.dataStore.sports = [data].concat(this.sportsCrudService.dataStore.sports);
        //this.sportsCrudService._sports.next(Object.assign({}, this.sportsCrudService.dataStore).sports);

        this.router.navigate(['/sports/list']);
        this.notification.isNotification(true, "Sports Meta Data", "Sport has been added successfully.", "check-square");
  
      },
      error => {
        console.log(error);    
      }
      );
  
    } catch (error) {
      
      console.log(error);
       
    }
  }


    
  listSports(){
    this.router.navigate(['/sports/list']);
  }

  addSports(){
    this.router.navigate(['/sports/createlist']);
  }
  
  viewSports(resourceId: string){
    this.router.navigate(['/sports/viewlist/'+resourceId]);
  }
  
  editSports(resourceId: string){
    this.router.navigate(['/sports/editlist/'+resourceId]);
  }

  async deleteSports(resourceId: string, resourceName: string){
   }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/sports/list']);
}
}

