import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import MetisMenu from 'metismenujs/dist/metismenujs';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { Router } from '@angular/router';
import { Constant } from 'src/app/core/services/config';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() isCondensed = false;
  @Output() change = new EventEmitter();

  menu: any;
  isOrganization: boolean = false;
  isDashboard: boolean = false;
  isUser: boolean = false;
  isSports: boolean = false;
  isPlayerMeta: boolean = false;
  isPlayerMetaNew: boolean = false;
  isCoachMeta: boolean = false;
  isManagerMeta: boolean = false;
  isCommon: boolean = false;
  isPosition: boolean = false;
  isSkillCat: boolean = false;
  isSkill: boolean = false;
  isPositionSkill: boolean = false;
  team: boolean = false;
  teamDropDown: boolean = false;
  isUserModule: boolean = false;
  isUserImport: boolean = false;
  isUserList: boolean = false;
  isTag: boolean = false;
  isSeason: boolean = false;
  isCannedResponse: boolean = false;
  isLevel: boolean = false;
  isWelcome: boolean = false;
  custAdmin = false;
  isFeedModule: boolean = false;
  admin = false;
  data: any;
  organization_id: any;
  sysAdminWithId: boolean = false;
  adminWithId: boolean = true;
  loggedUserInfo: any;
  role: any;
  unAuthorizedActive: boolean = false;
  userRouter: any = '/users';
  userListRouter: any = '/users/list';
  teamRouter: any = '/teams';
  importUserRouter: any = '/useruploads';
  isUserModuleLoading: any = false;
  @ViewChild('sideMenu', { static: false }) sideMenu: ElementRef;

  constructor(private sharedService: SharedService, private authService: AuthenticationService, public cookieService: CookieService, public router: Router) {
    sharedService.missionAnnounced$.subscribe(data => {
      this.data = data;
      if (this.data.action === "addUsers") {
        // this.collapsivePage();
      }
      if (this.data.action === "organizationFilter") {
        if (this.data.data.organization_id === Constant.organization_id) {
          this.sysAdminWithId = false;
          this.adminWithId = true;
        }
        else {
          this.sysAdminWithId = true;
          this.adminWithId = false;
        }
      }
      if (data === "userLoaded") {
        this.isUserModuleLoading = false;
      }
      if (data == "organization") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isWelcome = false;
        this.isOrganization = true;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.isUserModule = false;
        this.isDashboard = false;
        this.isSeason = false;
        this.isUser = false
        this.isSports = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isPositionSkill = false;
        this.team = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.teamDropDown = false
      } else if (data == "welcome") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isWelcome = true;
        this.isOrganization = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.isUserModule = false;
        this.isDashboard = false;
        this.isSeason = false;
        this.isUser = false
        this.isSports = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isPositionSkill = false;
        this.team = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.teamDropDown = false;
      }
      else if (data == "dashboard") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isDashboard = true;
        this.isWelcome = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isOrganization = false;
        this.isTag = false;
        this.isSeason = false;
        this.isCannedResponse = false;
        this.isUser = false;
        this.isUserModule = false;
        this.isSports = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkillCat = false;
        this.isPositionSkill = false;
        this.team = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.teamDropDown = false;
        this.isSkill = false;
      } else if (data == "user") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isUser = true;
        this.isWelcome = false;
        this.isLevel = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isTag = false;
        this.isSeason = false;
        this.isFeedModule = false;
        this.isCannedResponse = false;
        this.isUserModule = true
        this.isOrganization = false;
        this.isDashboard = false;
        this.isSports = false;
        this.isCommon = false;
        this.isPositionSkill = false;
        this.isPosition = false;
        this.isSkillCat = false;
        this.isSkill = false;
        this.team = false;
        this.teamDropDown = false
      } else if (data == "userImport") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isUserImport = true;
        this.isUserList = false;
        this.isWelcome = false;
        this.isUserModule = true
        this.isUser = false;
        this.isTag = false;
        this.isLevel = false;
        this.isSeason = false;
        this.isFeedModule = false;
        this.isCannedResponse = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isSports = false;
        this.isCommon = false;
        this.isPositionSkill = false;
        this.isPosition = false;
        this.isSkillCat = false;
        this.isSkill = false;
        this.team = false;
        this.teamDropDown = false
      } else if (data == "userList") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isUserImport = false;
        this.isUserList = true;
        this.isWelcome = false;
        this.isUserModule = true
        this.isUser = false;
        this.isTag = false;
        this.isLevel = false;
        this.isSeason = false;
        this.isFeedModule = false;
        this.isCannedResponse = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isSports = false;
        this.isCommon = false;
        this.isPositionSkill = false;
        this.isPosition = false;
        this.isSkillCat = false;
        this.isSkill = false;
        this.team = false;
        this.teamDropDown = false  
      }
      else if (data == "sport") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isSports = true;
        this.isWelcome = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isCommon = true;
        this.isLevel = false;
        this.isFeedModule = false;
        this.isUserModule = false;
        this.isUser = false;
        this.isSeason = false;
        this.isPositionSkill = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isPosition = false;
        this.isSkillCat = false;
        this.isSkill = false;
        this.team = false;
        this.teamDropDown = false
      }
      else if (data == "position") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isPosition = true;
        this.isCommon = true;
        this.isWelcome = false;
        this.isSports = false;
        this.isFeedModule = false;
        this.isTag = false;
        this.isLevel = false;
        this.isSeason = false;
        this.isCannedResponse = false;
        this.isUser = false;
        this.isOrganization = false;
        this.isPositionSkill = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isDashboard = false;
        this.isSkillCat = false;
        this.isSkill = false;
        this.team = false;
        this.isUserModule = false;
        this.teamDropDown = false

      } else if (data === "level") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isLevel = true;
        this.isCommon = true;
        this.isPosition = false;
        this.isWelcome = false;
        this.isFeedModule = false;
        this.isSports = false;
        this.isTag = false;
        this.isSeason = false;
        this.isCannedResponse = false;
        this.isUser = false;
        this.isOrganization = false;
        this.isPositionSkill = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isDashboard = false;
        this.isSkillCat = false;
        this.isSkill = false;
        this.team = false;
        this.isUserModule = false;
        this.teamDropDown = false
      }
      else if (data == "skillcategory") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isSkillCat = true;
        this.isWelcome = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isCommon = true;
        this.isTag = false;
        this.isCannedResponse = false;
        this.isFeedModule = false;
        this.isPosition = false;
        this.isSkill = false;
        this.isLevel = false;
        this.isSports = false;
        this.isPositionSkill = false;
        this.isUser = false;
        this.isSeason = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
        this.team = false;
        this.teamDropDown = false

      }
      else if (data == "skill") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isSkill = true;
        this.isTag = false;
        this.isLevel = false;
        this.isWelcome = false;
        this.isSeason = false;
        this.isFeedModule = false;
        this.isCannedResponse = false;
        this.isCommon = true;
        this.isSkillCat = false;
        this.isPosition = false;
        this.isSports = false;
        this.isUser = false;
        this.isPositionSkill = false;
        this.isOrganization = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isDashboard = false;
        this.team = false;
        this.teamDropDown = false;
        this.isUserModule = false;

      }
      else if (data == "positionskill") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isPositionSkill = true;
        this.isUserImport = false;
        this.isUserList = false;
        this.isCommon = true;
        this.isLevel = false;
        this.isWelcome = false;
        this.isTag = false;
        this.isFeedModule = false;
        this.isSeason = false;
        this.isCannedResponse = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.team = false;
        this.teamDropDown = false;
        this.isUserModule = false;

      }
      else if (data == "team") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.team = true;
        this.isTag = false;
        this.isLevel = false;
        this.isWelcome = false;
        this.isCannedResponse = false;
        this.teamDropDown = true;
        this.isFeedModule = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false;
        this.isSeason = false;
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;

      }
      else if (data == "tag") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.team = false;
        this.isFeedModule = true;
        this.isTag = true;
        this.isLevel = false;
        this.isCannedResponse = false;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isSeason = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isWelcome = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;

      } else if (data == "cannedResponse") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.team = false;
        this.isTag = false;
        this.isFeedModule = true;
        this.isLevel = false;
        this.isSeason = false;
        this.isWelcome = false;
        this.isCannedResponse = true;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
      }
      else if (data == "season") {
        this.isPlayerMeta = false;
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isSeason = true;
        this.isWelcome = false;
        this.team = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
        this.isPlayerMeta = false;
      }
      else if (data == "playermetadata") {
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isPlayerMeta = true;
        this.isPlayerMetaNew = false;
        this.isSeason = false;
        this.isWelcome = false;
        this.team = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
      }
      else if (data == "playermeta") {
        this.isCoachMeta = false;
        this.isManagerMeta = false;
        this.isPlayerMeta = false;
        this.isPlayerMetaNew = true;
        this.isSeason = false;
        this.isWelcome = false;
        this.team = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
      }
      else if (data == "coachcustomfield") {
        this.isCoachMeta = true;
        this.isManagerMeta = false;
        this.isPlayerMeta = false;
        this.isSeason = false;
        this.isWelcome = false;
        this.team = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
      }
      else if (data == "managermetadata") {
        this.isCoachMeta = false;
        this.isManagerMeta = true;
        this.isPlayerMeta = false;
        this.isSeason = false;
        this.isWelcome = false;
        this.team = false;
        this.isFeedModule = false;
        this.isLevel = false;
        this.isTag = false;
        this.isCannedResponse = false;
        this.teamDropDown = false;
        this.isUserImport = false;
        this.isUserList = false;
        this.isPositionSkill = false;
        this.isCommon = false;
        this.isPosition = false;
        this.isSkill = false
        this.isSports = false;
        this.isUser = false;
        this.isSkillCat = false;
        this.isOrganization = false;
        this.isDashboard = false;
        this.isUserModule = false;
      }
    })
  }

  ngOnInit() {

    this.loggedUserInfo = this.authService.isAuthenticatedUser();
    if (this.loggedUserInfo) {
      if (this.loggedUserInfo.role == 'sys-admin') {
        this.custAdmin = false;
        this.admin = true;
        if (localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
          this.adminWithId = false;
        } else {
          this.adminWithId = true;
          this.organization_id = localStorage.getItem('org_id')
        }
      } else if (this.loggedUserInfo.role == 'admin') {
        this.custAdmin = true
        this.admin = false
        this.organization_id = localStorage.getItem('org_id')
      } else {
        this.custAdmin = false;
        this.admin = false;
      }
    }

  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();

  }
  ngAfterContentInit() {
    if (localStorage.getItem('org_id') === Constant.organization_id) {
      this.sysAdminWithId = false;
    }
    else {
      this.sysAdminWithId = true;
    }
  }


  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }
  tags() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('tagsRouter');
      this.router.navigate(['/tags'])
      this.sharedService.announceMission('updateOrganizationList');
    } else {
      this.sharedService.announceMission('selectOrganization')

    }
  }

  tagslist() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('tagsRouter');
      this.router.navigate(['/tags/list'])
      this.sharedService.announceMission('updateOrganizationList');
    } else {
      this.sharedService.announceMission('selectOrganization')

    }
  }

  cannedResponse() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('cannedResponseRouter');
      this.router.navigate(['/cannedresponse']);
      this.sharedService.announceMission('updateOrganizationList');
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }
  
  cannedResponselist() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('cannedResponseRouter');
      this.router.navigate(['/cannedresponse/list']);
      this.sharedService.announceMission('updateOrganizationList');
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  level() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('levelRouter');
      this.router.navigate(['/level']);
      this.sharedService.announceMission('updateOrganizationList');
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  
  levellist() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('levelRouter');
      this.router.navigate(['/level/list']);
      this.sharedService.announceMission('updateOrganizationList');
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  playermetadata() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('playermetaRouter');
      this.router.navigate(['/playercustomfield']);
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  playermeta() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('playermetaRouter');
      this.router.navigate(['/playermeta']);
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }
  
  coachmetadata() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('coachcustomRouter');
      this.router.navigate(['/coachcustomfield']);
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  coachmeta() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('coachcustomRouter');
      this.router.navigate(['/coachmeta']);
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }
  
  managermetadata() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('managercustomfield');
      this.router.navigate(['/managercustomfield']);
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  managermeta() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('managercustomfield');
      this.router.navigate(['/managermeta']);
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }
  

  createUser() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('userRouter');
      this.userRouter = '/users';
      this.sharedService.announceMission('updateOrganizationList');
      this.isUserModuleLoading = true;
    }
    else {
      this.userRouter = '';
      this.sharedService.announceMission('selectOrganization')
    }
  }
  
  createUserImport() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('userImportRouter');
      this.router.navigate(['/useruploads'])
      this.sharedService.announceMission('updateOrganizationList');
    }
    else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  userList() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('userListRouter');
      this.userListRouter = '/users/list';
    }
    else {
      this.userListRouter = '';
      this.sharedService.announceMission('selectOrganization')
    } 
  }

    
  createUserListImport() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('userImportRouter');
      this.router.navigate(['/useruploads/list'])
      this.sharedService.announceMission('updateOrganizationList');
    }
    else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  season() {
    this.closeCollapse();
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('seasonRouter');
      this.router.navigate(['/season'])
      this.sharedService.announceMission('updateOrganizationList');
      this.change.emit({ action: "seasongrid", data: null })
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  seasonlist() {
    this.closeCollapse();
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('seasonRouter');
      this.router.navigate(['/season/list'])
      this.sharedService.announceMission('updateOrganizationList');
      this.change.emit({ action: "seasongrid", data: null })
    } else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  position() {
    this.sharedService.announceMission('positionRouter');
    this.router.navigate(['/positions']);
    this.sharedService.announceMission('updateOrganizationList');
  }

  positionlist() {
    this.sharedService.announceMission('positionRouter');
    this.router.navigate(['/positions/list']);
    this.sharedService.announceMission('updateOrganizationList');
  }

  sports() {
    this.sharedService.announceMission('sportRouter');
    this.router.navigate(['/sports']);
    this.sharedService.announceMission('updateOrganizationList');
  }

  sportslist() {
    this.sharedService.announceMission('sportRouter');
    this.router.navigate(['/sports/list']);
    this.sharedService.announceMission('updateOrganizationList');
  }

  sportsPoc() {
    this.router.navigate(['/sportspoc']);
    this.sharedService.announceMission('sportRouter');
  }

  organizationRouter() {
    this.closeCollapse();
    if (this.admin && localStorage.getItem('org_id') === Constant.organization_id) {
      this.router.navigate(['/organization']);
      this.sharedService.announceMission('organizationRouter');
    } else {
      this.router.navigate(['/organization']);
    }
    this.sharedService.announceMission('updateOrganizationList');
  }

  
  organizationInfoRouter() {
    
    this.closeCollapse();
    this.router.navigate(['/organizations/info']);
    this.sharedService.announceMission('organizationRouter');
    
  }

  organizationListRouter() {
    this.router.navigate(['/organizations']);
    this.sharedService.announceMission('organizationsRouter');
  }

  dashboardRouter() {
    this.closeCollapse();
    this.sharedService.announceMission('dashboard');
    this.router.navigate(['/dashboard']);
    this.sharedService.announceMission('updateOrganizationList');
  }

  welcomeRouter() {
    this.closeCollapse();
    this.sharedService.announceMission('welcome');
    this.router.navigate(['/welcome']);
    this.sharedService.announceMission('updateOrganizationList');
  }
  
  createTeam() {
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('teamRouter');
      this.router.navigate(['/teams']);
      this.sharedService.announceMission('updateOrganizationList');
    }
    else {
      this.sharedService.announceMission('selectOrganization')
    }
  }
 
  createTeamList() {
    console.log('createTeamList');
    if (localStorage.getItem('org_id')) {
      this.sharedService.announceMission('teamRouter');
      this.router.navigate(['/teams/list']);
      this.sharedService.announceMission('updateOrganizationList');
    }
    else {
      this.sharedService.announceMission('selectOrganization')
    }
  }

  /**
   * small sidebar
   */
  smallSidebar() {
    document.body.classList.add('left-side-menu-sm');
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.remove('topbar-light');
    document.body.classList.remove('boxed-layout');
    document.body.classList.remove('enlarged');
  }

  /**
   * Dark sidebar
   */
  darkSidebar() {
    document.body.classList.remove('left-side-menu-sm');
    document.body.classList.add('left-side-menu-dark');
    document.body.classList.remove('topbar-light');
    document.body.classList.remove('boxed-layout');
  }

  /**
   * Light Topbar
   */
  lightTopbar() {
    document.body.classList.add('topbar-light');
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.remove('left-side-menu-sm');
    document.body.classList.remove('boxed-layout');

  }

  /**
   * Sidebar collapsed
   */
  sidebarCollapsed() {
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.remove('left-side-menu-sm');
    document.body.classList.toggle('enlarged');
    document.body.classList.remove('boxed-layout');
    document.body.classList.remove('topbar-light');
  }

  /**
   * Boxed Layout
   */
  boxedLayout() {
    document.body.classList.add('boxed-layout');
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.add('enlarged');
    document.body.classList.remove('left-side-menu-sm');
  }

  /**
   * Activates the menu dropdown
   */
  _activateMenuDropdown() {
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
      if (window.location.pathname === links[i]['pathname']) {
        menuItemEl = links[i];
        break;
      }
    }

    if (menuItemEl) {
      menuItemEl.classList.add('active');

      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('active');

        const parent2El = parentEl.parentElement;
        if (parent2El) {
          parent2El.classList.add('in');
        }

        const parent3El = parent2El.parentElement;
        if (parent3El) {
          parent3El.classList.add('active');
          parent3El.firstChild.classList.add('active');
        }
      }
    }
  }
  closeCollapse() {
    let tagEventId: any = document.getElementsByClassName('isChild');
    for (let i = 0; i < tagEventId.length; i++) {
      tagEventId[i].classList.remove('active');
      let lastChild = tagEventId[i].lastElementChild;
      lastChild.classList.remove('in');
    }
  }

}
