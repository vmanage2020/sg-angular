
import { Component, OnInit, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { NgiNotificationService } from 'ngi-notification';

import { DOCUMENT } from '@angular/common';

import { RestApiService } from '../../../shared/rest-api.services';

import { HttpClient } from '@angular/common/http';

import { CookieService } from 'src/app/core/services/cookie.service';

import { OrganizationsService } from './../organizations.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
 
export class OrganizationsComponent implements OnInit {

  //db: any = firebase.firestore();
  value: any = [];
  getAllplayerlist: any = [];
  getAllPlayerlistData: any = [];

  
  getOrganizationlist: any = [];
  getOrganizationlistData: any = [];


  data: any;
  datax: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
 
  loading = true;
  displayLoader: any = true;

  uid: any;
  orgId: any;

  constructor(private router: Router,
    private notification: NgiNotificationService, 
    @Inject(DOCUMENT) private _document: Document,
    private organizationsService: OrganizationsService,
    public cookieService: CookieService) { }

  ngOnInit() {
    this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getPlayerList();  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true
    }; 
  }

  async getPlayerList(){


    if(this.organizationsService.orgdataStore.org.length > 0)
    {
      console.log('----org----', this.organizationsService.orgdataStore.org)
      this.data = this.organizationsService.orgdataStore.org;
      setTimeout(() => {
        this.dtTrigger.next();
      });
      this.loading = false;
      this.displayLoader = false;  

    }else{
      setTimeout(() => { this.getPlayerList() 
        this.loading = false;
        this.displayLoader = false;
      }, 1000);
    }
    /* if(this.orgId=='') {

      this.getOrganizationlist = await this.db.collection('organization').get();
   
    } else {
      console.log("orgId"+this.orgId);
   
      this.getOrganizationlist = await this.db.collection('organization').get();
      
   
    }
    
   
    this.getOrganizationlistData = await this.getOrganizationlist.docs.map((doc: any) => doc.data());
    console.log(this.getOrganizationlistData);
    this.data = this.getOrganizationlistData;
    this.dtTrigger.next();
    this.loading = false;
    this.displayLoader = false;  */
 
  }

  listOrganization(){
    this.router.navigate(['/organizations']);
  }

  addOrganization(){
    this.router.navigate(['/organizations/create']);
  }
  
  viewOrganization(resourceId: string){
    this.router.navigate(['/organizations/view/'+resourceId]);
  }
  
  editOrganization(resourceId: string){
    console.log('---resourceId---', resourceId)
    this.router.navigate(['/organizations/create'])
    this.organizationsService.editOrgData(resourceId,null)
    //this.router.navigate(['/organizations/edit/'+resourceId]);
  }

  refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/organizations']);
  }

}

