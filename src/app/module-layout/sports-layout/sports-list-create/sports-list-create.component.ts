import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { DropdownService } from 'src/app/core/services/dropdown.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { SportsCrudService } from '../sports-crud.service';

import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-sports-list-create',
  templateUrl: './sports-list-create.component.html',
  styleUrls: ['./sports-list-create.component.scss'],
  providers: [NGXLogger]
})
export class SportsListCreateComponent implements OnInit {

  
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
  createsportsForm: FormGroup;

  constructor(private router: Router, 
    private formBuilder: FormBuilder,
    public cookieService: CookieService,
    private sportsCrudService: SportsCrudService, 
    private dropDownService: DropdownService, 
    private notification: NgiNotificationService, 
    private restApiService: RestApiService, 
    private http:HttpClient,
    private logger: NGXLogger) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createsportsForm = this.formBuilder.group({
        auth_uid: [''],
        name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        sport: [''],
        country_code: [null, Validators.required ],
        country: [null],
    });
  }
  

  ngOnInit() {
    this.getCountryCodeListAPI();
    //this.loading = false;
    //this.displayLoader = false;
  }
 
  async getCountryCodeListAPI()
  {

    if(this.sportsCrudService.countrydataStore.country.length > 0)
    {
      this.countryCodeSelect = this.sportsCrudService.countrydataStore.country;
      this.country = false;

      this.loading = false;
      this.displayLoader = false;

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
 
  get f() { return this.createsportsForm.controls; }

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

    /*
    console.log(form.value.country_code);
    console.log(form.value.country);
     */

    let insertObj = {
      "sport": form.value.name,
      "name": form.value.name,
      "country_code": form.value.country_code,
      "country": form.value.country,
      "created_date": new Date(),
      "created_datetime": new Date(),
      "created_uid": this.uid,
      "updated_datetime": new Date(),
      "updated_uid": "",
      "isUsed": false,
    }
  
    this.logger.debug('Sports Add API Start Here====>', new Date().toUTCString());

    let Metaurl = 'sports';

   this.restApiService.create(Metaurl,insertObj).subscribe(data=> 
    {
      this.logger.debug('Sports Add API End Here====>', new Date().toUTCString());    
      //console.log(data);
      this.sportsCrudService.dataStore.sports = [];
      this.sportsCrudService.sportsList('sports');
      //this.sportsCrudService.dataStore.sports.push(data);
      //this.sportsCrudService._sports.next(Object.assign({}, this.sportsCrudService.dataStore).sports);

      this.router.navigate(['/sports/list']);
      this.notification.isNotification(true, "Sports Meta Data", "Sport has been added successfully.", "check-square");

    },
    error => {
      console.log(error); 
      this.notification.isNotification(true, "Sports Error", error.message, "exclamation-circle");  
      this.createsportsForm.patchValue( {'name':null} );
      this.displayLoader = false;
      this.loading = false;
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

