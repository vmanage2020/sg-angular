import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

import { DropdownService } from 'src/app/core/services/dropdown.service';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sports-list-create',
  templateUrl: './sports-list-create.component.html',
  styleUrls: ['./sports-list-create.component.scss']
})
export class SportsListCreateComponent implements OnInit {

  db: any = firebase.firestore();
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

  constructor(private router: Router, private formBuilder: FormBuilder,public cookieService: CookieService,private dropDownService: DropdownService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createsportsForm = this.formBuilder.group({
        auth_uid: [''],
        name: ['', Validators.required ],
        sport: [''],
        country_code: ['', Validators.required ],
        country: [''],
    });
  }
  

  ngOnInit() {
    //this.getCountryCodeList();
    this.getCountryCodeListAPI();
    this.loading = false;
    this.displayLoader = false;
  }

  async getCountryCodeList() {
    // console.log("getcountrylist")
    this.country = true;
    let getAllCountryResponse: any = await this.dropDownService.getAllCountry();
    try {
      if (getAllCountryResponse.status) {
        this.countryCodeSelect = getAllCountryResponse.data;
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

  }
 

  async getCountryCodeListAPI()
  {
    let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/countries';
    //let Metaurl = this.baseAPIUrl+'countries';

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
  
     
    });

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

    console.log(form.value.country_code);
    console.log(form.value.country);
     

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

    /*
      let createObjRoot = await this.db.collection('sports').add(insertObj);
      await createObjRoot.set({ sport_id: createObjRoot.id }, { merge: true });
    */
   
   console.log( insertObj);
   console.log( JSON.stringify(insertObj));
   //return;
   
    let Metaurl='https://cors-anywhere.herokuapp.com/http://13.229.116.53:3000/sports/';
    //let Metaurl = this.baseAPIUrl+'sports/';

    this.http.post<any>(Metaurl, insertObj  ).subscribe(
        data => {
          
          console.log(data);
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
    this.router.navigate(['/sports/list']);
}
 
}

