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

@Component({
  selector: 'app-level-list-view',
  templateUrl: './level-list-view.component.html',
  styleUrls: ['./level-list-view.component.scss']
})
export class LevelListViewComponent implements OnInit {

  resourceID = this.route.snapshot.paramMap.get('resourceId'); 
  
    value: any = [];
  
    
    getLevelValue: any = [];
    getLevelValueData: any = [];
    getLevelValueArray: any = [];
  
    
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
  
    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,public cookieService: CookieService, private notification: NgiNotificationService, private restApiService: RestApiService, private http:HttpClient) { 
       this.createForm(); 
    }
    
    createForm() {
      this.createlevelForm = this.formBuilder.group({
        level_name: ['', Validators.required ],
        abbreviation: ['', Validators.required ],
        sport_id: ['', Validators.required ],
        sport_name: [''],
        description: [''],
        organization_id: [''],
      });
    }
    
  
    ngOnInit() {
      this.uid = this.cookieService.getCookie('uid');
      this.orgId = localStorage.getItem('org_id');
      this.getLevelInfoAPI();
      this.getAllSportsAPI();
      this.loading = false;
      this.displayLoader = false;
    }
 
    async getLevelInfoAPI(){   
       
      let Metaurl='levels/'+this.resourceID;
 
      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---lists----', lists);
        if (lists) {
          this.getLevelValueData = lists;
          this.getLevelValueArray = this.getLevelValueData; 
        } else {
          this.getLevelValueData = [];
          this.getLevelValueArray = this.getLevelValueData; 
        }

        console.log(this.getLevelValueArray);

        this.loading = false;
        this.displayLoader = false; 
      
      });
     
    }
   
    
  async getAllSportsAPI(){
    
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
 
   } 
 
     
    get f() { return this.createlevelForm.controls; }
   
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
  
  
  

