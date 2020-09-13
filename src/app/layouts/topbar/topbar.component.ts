import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../core/services/auth.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { DataService } from 'src/app/core/services/data.service';
import { SharedService } from 'src/app/shared/shared.service';
declare var $scope: any;
import { apiURL, Constant } from '../../core/services/config';
import { DropdownService } from '../../core/services/dropdown.service';



import { RestApiService } from '../../shared/rest-api.services';

import { PlayerMetaService } from '../../module-layout/playermeta/playermeta-service';

import { CoachMetaService } from '../../module-layout/coachmeta/coachmeta-service';

import { ManagerMetaService } from '../../module-layout/managermeta/managermeta-service';

import { OrganizationsService } from '../../module-layout/organizations/organizations.service';

import { CannedResponseCrudService } from '../../module-layout/canned-response-layout/canned-response-crud.service';

import { TagCrudService } from '../../module-layout/tag-layout/tag-crud.service';

import { LevelService } from '../../module-layout/level-layout/level-service';

import { PositionCrudService } from '../../module-layout/position-layout/position-crud.service';

import { SeasonCrudService } from '../../module-layout/season-layout/season-crud.service';

import { UserService } from '../../module-layout/user-layout/user-service'

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {

  notificationItems: Array<{}>;
  languages: Array<{
    id: number,
    flag?: string,
    name: string
  }>;
  singleValue = false;
  custAdmin = false
  select = false;
  selectedLanguage: {
    id: number,
    flag?: string,
    name: string
  };
  userData: any;
  organizationListLoader: boolean = false;
  openMobileMenu: boolean;
  userInfo: any[] = [];
  orgInfo: any;
  filteredRole: any[] = [];
  sysAdmin = false
  selectedOrg: any = null;
  sysSelect = false;
  orgCount: number = 1;
  uid: any;
  orgId: any;
  sysAdminWithId: boolean = false;
  showMsg = false;
  data: any;
  profile: any = null;
  loggedUserInfo: any;
  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();
  role: any;
  unAuthorizedActive: boolean = false;
  constructor(
    private dropDownService: DropdownService, 
    public sharedService: SharedService, 
    public cookieService: CookieService, 
    private router: Router, 
    private authService: AuthenticationService, 
    public dataService: DataService,
    private managerCrudService:ManagerMetaService,
    private coachCrudService:CoachMetaService,
    private playerCrudService:PlayerMetaService,
    private organizationsService:OrganizationsService,
    private cannedResponseCrudService:CannedResponseCrudService,
    private tagCrudService:TagCrudService,
    private levelCrudService:LevelService,
    private positionCrudService:PositionCrudService,
    private seasonCrudService:SeasonCrudService,
    private userService:UserService,
    private restApiService: RestApiService) {
    sharedService.missionAnnounced$.subscribe((data: any) => {
      // this.data = data;
      if (data.action === "organizationFilter") {
        if (data.data.organization_id === Constant.organization_id) {
          this.sysAdminWithId = false;
        }
        else {
          this.sysAdminWithId = true;
        }
      } else if (data.action === "isOrganizationUpdated") {
        if ((this.cookieService.getCookie('admin'))) {
          this.getOrgInfoCust(data.data);
        }
        else if (this.cookieService.getCookie('sysAdmin')) {
          this.getOrgInfo(data.data);
        }
      } else if (data.action === "updatedProfile") {
        console.log(data.data);
        this.getProfileImage(data.data);
      }

      if (data === "selectOrganization") {
        this.showMsg = true
      }
      else if (data === "updateOrganizationList") {
        this.getOrganizationList()
      }
    })

  }

  ngOnInit() {
    this.openMobileMenu = false;
    this.uid = this.cookieService.getCookie('uid');
    this.userData = JSON.parse(localStorage.getItem('userInfo'));
    this.filteredRole = JSON.parse(localStorage.getItem('filteredRole'));
    if (this.userData) {
      this.getProfileImage(this.userData);
    }
    if ((this.cookieService.getCookie('admin'))) {
      this.custAdmin = true;
      this.sysAdmin = false;
      if (localStorage.getItem('org_name')) {
        this.selectedOrg = localStorage.getItem('org_name')
      }
    } else if (this.cookieService.getCookie('sysAdmin')) {
      this.organizationListLoader = true;
      this.getOrganizationList();
      this.custAdmin = false;
      this.sysAdmin = true;
      if (localStorage.getItem('org_name')) {
        this.selectedOrg = localStorage.getItem('org_name')
      }
    }
    if (this.filteredRole) {
      if (this.filteredRole.length > 1) {
        this.select = true;
        this.singleValue = false
      }
      else if (this.filteredRole.length === 1) {
        this.select = false;
        this.singleValue = true
      }
    }
    this.loggedUserInfo = this.authService.isAuthenticatedUser();
    if (this.loggedUserInfo) {
      if (this.loggedUserInfo.role == 'sys-admin') {
        this.sysAdmin = true;
        this.custAdmin = false;
      } else if (this.loggedUserInfo.role == 'admin') {
        this.sysAdmin = false;
        this.custAdmin = true;
      } else {
        this.sysAdmin = false;
        this.custAdmin = false;
      }
    }
  }
  getProfileImage(userData: any) {
    if (userData.profile_image && userData.profile_image !== "null" && userData.profile_image !== null) {
      this.profile = userData.profile_image;
    } else {
      this.profile = null;
      if (userData.first_name) {
        let name = userData.first_name;
        let lastname = userData.last_name;
        let initials = name.charAt(0) + "" + lastname.charAt(0);
        document.getElementById("name").innerHTML = initials;
      }
    }
  }
  ngAfterContentInit() {
    if (localStorage.getItem('org_id') === Constant.organization_id) {
      this.sysAdminWithId = false;
    }
    else {
      this.sysAdminWithId = true;
    }
  }
  ngAfterViewInit() {

  }

  async getOrganizationList() {
    console.log('getOrganizationList',this.organizationsService.orgdddataStore.orgdd.length);
    if(this.organizationsService.orgdddataStore.orgdd.length > 0)
    {
      console.log('----orgdd----', this.organizationsService.orgdddataStore.orgdd)
      this.orgInfo =  this.organizationsService.orgdddataStore.orgdd;
      this.organizationListLoader = false;
      //this.cookieService.setCookie('orgDropDown', JSON.stringify(this.orgInfo), 1);
      this.organizationListLoader = false;
    }else{
      setTimeout(() => { this.getOrganizationList() 

       this.organizationsService.organizationsList('organization');
       this.orgInfo = this.organizationsService.orgdddataStore.orgdd;
       
        //this.orgInfo = [];
        this.organizationListLoader = false;
      }, 1000);
    }

    /*
    // this.organizationListLoader = true;
    let organizationListResponse: any = await this.dropDownService.getOrganizationList();
    try {
      if (organizationListResponse.status) {
        this.orgInfo = organizationListResponse['data'];
        this.organizationListLoader = false;
        this.cookieService.setCookie('orgDropDown', JSON.stringify(this.orgInfo), 1);
      } else {
        this.orgInfo = [];
        this.organizationListLoader = false;
      }
    } catch (error) {
      console.log(error);
      this.orgInfo = [];
      this.organizationListLoader = false;
    }
    */
  }

  closeToast() {
    this.showMsg = false;
  }
  addOrganization() {
    // this.sharedService.sendData({action:'addOrganization'});
    this.sharedService.announceMission({ action: 'addOrganization' })
    this.router.navigate(['/organizations']);

  }
  addUser() {
    this.sharedService.announceMission({ action: 'addUsers' })
    this.router.navigate(['/users']);
  }
  addTeam() {
    this.sharedService.announceMission({ action: 'addTeams' })
    this.router.navigate(['/teams']);

  }

  async getOrgInfo(event: any) {
    this.getOrganizationInfo(event)
  }
  async getOrgInfoCust(event: any) {
    this.getOrganizationInfo(event)
  }

  async getOrganizationInfo(event: any) {
    console.log(event);
    /*
    let organizationDetails: any = await this.dropDownService.getOrganizationDetailsById(event.organization_id);
    if (organizationDetails.status) {
      this.cookieService.setCookie('organizationDetails', JSON.stringify(organizationDetails.data), 1);
    }
    this.sharedService.announceMission({ action: 'organizationFilter', data: event });
    if ((this.cookieService.getCookie('admin'))) {
      this.selectedOrg = event.organization_name;
      localStorage.setItem('org_id', event.organization_id)
      localStorage.setItem('org_name', event.organization_name)
      localStorage.setItem('org_abbrev', event.organization_abbrev);
    } else if (this.cookieService.getCookie('sysAdmin')) {
      this.selectedOrg = event.name;
      localStorage.setItem('org_id', event.organization_id)
      localStorage.setItem('org_name', event.name)
      localStorage.setItem('org_abbrev', event.abbrev);
    }
    this.showMsg = false;
    */
    /* 
    this.playerCrudService.dataStore.players.length = 0;
    this.coachCrudService.dataStore.coachs.length = 0;
    this.managerCrudService.dataStore.managers.length = 0;
    */

   console.log('----xyz org----', this.organizationsService.orgdataStore.org)
   let OrgIDValue = ''; 
    if(event.organization_id==1) {
      OrgIDValue = event._id;
    } else {
      OrgIDValue = event.organization_id;
    }
   this.restApiService.lists('organization/'+OrgIDValue).subscribe( res => {
    let organizationDetails = res;
    
    console.log('organizationDetails',organizationDetails);

    if (organizationDetails) {
      //this.cookieService.setCookie('organizationDetails', JSON.stringify(organizationDetails), 1);
    }

    this.sharedService.announceMission({ action: 'organizationFilter', data: event });
    if ((this.cookieService.getCookie('admin'))) {
      this.selectedOrg = event.organization_name;
      localStorage.setItem('org_id', event.organization_id)
      localStorage.setItem('org_name', event.organization_name)
      localStorage.setItem('org_abbrev', event.organization_abbrev);
    } else if (this.cookieService.getCookie('sysAdmin')) {
      this.selectedOrg = event.name;
      localStorage.setItem('org_id', event.organization_id)
      localStorage.setItem('org_name', event.name)
      localStorage.setItem('org_abbrev', event.abbrev);
    }
    this.showMsg = false;
   
   });

     


    /*
    this.orgId = localStorage.getItem('org_id');
    let Metaurl= '';
    
    this.organizationsService.orgdataStore.org = [];
    Metaurl='organization';
    //console.log('Metaurl',Metaurl);
    await this.organizationsService.organizationsList(Metaurl);
    

    this.playerCrudService.dataStore.players = [];
    if(this.orgId=='') {
    Metaurl='playermetadata';
    } else {
    Metaurl='playermetadatabyorg/'+this.orgId;
    }
    //console.log('Metaurl',Metaurl);
    await this.playerCrudService.playersList(Metaurl);

    
    this.coachCrudService.dataStore.coachs = [];
    if(this.orgId=='') {
    Metaurl='coachcustomfield';
    } else {
    Metaurl='coachcustomfieldbyorg/'+this.orgId;
    }
    //console.log('Metaurl',Metaurl);
    await this.coachCrudService.coachsList(Metaurl);


    this.managerCrudService.dataStore.managers = [];
    if(this.orgId=='') {
    Metaurl='managercustomfield';
    } else {
    Metaurl='managercustomfieldbyorg/'+this.orgId;
    }
    //console.log('Metaurl',Metaurl);
    await this.managerCrudService.managersList(Metaurl);


    this.tagCrudService.dataStore.tags = [];
    if(this.orgId=='') {
    Metaurl='tags';
    } else {
    Metaurl='tagsbyorg/'+this.orgId;
    }
    //console.log('Metaurl',Metaurl);
    await this.tagCrudService.tagsList(Metaurl);

 
    this.cannedResponseCrudService.dataStore.cannedresponses = [];
    if(this.orgId=='') {
    Metaurl='cannedresponse';
    } else {
    Metaurl='cannedresponsebyorg/'+this.orgId;
    }
    //console.log('Metaurl',Metaurl);
    await this.cannedResponseCrudService.cannedresponsesList(Metaurl);

    this.levelCrudService.dataStore.levels = [];
    if(this.orgId=='') {
    Metaurl='levels';
    } else {
    Metaurl='levelsbyorg/'+this.orgId;
    }
    //console.log('Metaurl',Metaurl);
    await this.levelCrudService.levelsList(Metaurl);
    */

   //this.organizationsService.orgdataStore.org.length = 0;
   this.tagCrudService.dataStore.tags.length = 0;
   this.cannedResponseCrudService.dataStore.cannedresponses.length = 0;
   this.levelCrudService.dataStore.levels.length = 0;
   this.positionCrudService.dataStore.positions.length = 0;
   this.seasonCrudService.dataStore.seasons.length = 0;
   this.playerCrudService.dataStore.players.length = 0;
   this.coachCrudService.dataStore.coachs.length = 0;
   this.managerCrudService.dataStore.managers.length = 0;
   this.userService.dataStore.users.length = 0;
   
   
    this.router.navigate(['/welcome']);
  }
  /**
   * Logout the user
   */
  logout() {
    this.authService.logout();
  }


}
