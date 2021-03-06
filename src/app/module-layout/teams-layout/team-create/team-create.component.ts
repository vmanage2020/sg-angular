import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgiNotificationService } from 'ngi-notification';
declare var $: any;
declare var jQuery: any;
import { DbService } from 'src/app/core/services/db.service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import { TeamService } from '../team-service';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';

import { RestApiService } from '../../../shared/rest-api.services';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.scss']

})
export class TeamCreateComponent implements OnInit {
  @Output() change = new EventEmitter();
  submitted = false;
  error = '';
  isSaveUp: boolean = false;
  saves: boolean = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  createTeamForm: FormGroup;
  uid: any;
  levelValid: boolean = false;
  seasonValid: boolean = false;
  sportValid: boolean = false;
  lvlList: any;
  seasonList: any;
  SportsList: any;
  sportSelect: boolean = false
  shootList: any = [
    { name: 'Left' },
    { name: 'Right' },
  ];
  orgId: any;
  orgName: any;
  sportId: any;
  height: any = [
    { value: "ft", name: 'in', weight: 'lbs' },
    { value: "m", name: 'cm', weight: 'kg' },
  ]
  choosenPlayersArr: any = [];
  choosenCoachesArr: any = [];
  choosenManagersArr: any = [];

  choosenPlayers: any;
  selectPlayers: boolean = false;
  choosenCoaches: any;
  selectCoaches: boolean = false;
  choosenManagers: any;
  selectManagers: boolean = false;
  seasonSelect: boolean = false;
  data: any;
  levelSelect: boolean = false;
  playerList: any[] = [];
  managerList: any[] = [];
  coachList: any[] = [];
  positionList: any[] = [];
  levelList: any = [];

  playerMetaList: any[] = [];
  coachMetaList: any[] = [];
  managerMetaList: any[] = [];

  allPlayerList: any = [];
  noPlayer: boolean = false;
  allPlayerListCompare: any = [];
  columnWidth: any = '100';
  roleId: any;

  teamplayerList: any[] = [];
  teammanagerList: any[] = [];
  teamcoachList: any[] = [];
  showErrorInArr: any = [];


  playerMetaData: any[] = [];
  coachMetaData: any[] = [];
  managerMetaData: any[] = [];

  constructor(private dropDownService: DropdownService, 
    private db: DbService, 
    private notification: NgiNotificationService, 
    public changeRef: ChangeDetectorRef, 
    public cookieService: CookieService, 
    private sharedService: SharedService, 
    private parserFormatter: NgbDateParserFormatter, 
    private formBuilder: FormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    public dataService: DataService, 
    private restApiService: RestApiService,
    public teamService: TeamService) {
    this.uid = this.cookieService.getCookie('uid');
    if ((this.cookieService.getCookie('admin'))) {
      this.roleId = Constant.admin;
    }
    else if ((this.cookieService.getCookie('sysAdmin'))) {
      this.roleId = Constant.sysAdmin;
    }
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data === "teamRouter") {
          this.change.emit({ action: "teamgrid", data: null })
        }
      }
    })

    
  }

  ngOnInit() {
    this.displayLoader = false;
    this.sharedService.announceMission('team');
    this.createTeamForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      sport_id: [null, [Validators.required]],
      season_id: [null, [Validators.required]],
      level_id: [null, [Validators.required]],
      level_name: [''],
      team_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      players_count: ['', [Validators.required]],
      coaches_count: ['', [Validators.required]],
      managers_count: ['', [Validators.required]],
      player_select: [null],
      coach_select: [null],
      manager_select: [null],

      player: this.formBuilder.array([this.player()]),
      coach: this.formBuilder.array([this.coach()]),
      manager: this.formBuilder.array([this.manager()]),

      //playerMeta: new FormArray([]),
      //coachMeta: new FormArray([]),
      //managerMeta: new FormArray([])
    });
    this.uid = this.cookieService.getCookie('uid');
    this.createTeamForm.patchValue({
      uid: this.uid
    })
    this.getAlignedColumnSize("6");
    this.orgId = localStorage.getItem('org_id')

    this.orgName = localStorage.getItem('org_name');
    if (this.orgId) {
      //this.getSportsByOrg(this.orgId)
    }
    // this.getSportsByOrg(this.orgId)
    this.getSportsList();   
   
    

  $('#player_select').multiSelect();
  $('#coach_select').multiSelect();
  $('#manager_select').multiSelect();


  }

 /*  get pmeta() { return this.f.playerMeta as FormArray; }
  get cmeta() { return this.f.coachMeta as FormArray; }
  get mmeta() { return this.f.managerMeta as FormArray; } */

  ngAfterViewInit() {
    {

    let self = this; // store here  
    $('#player_select').on('change', function () {
      console.log("player_select");
      this.choosenPlayers = $(this).val();
      self.getPlayerList(this.choosenPlayers);
    });
    $('#coach_select').on('change', function () {
      console.log("coach_select");
      this.choosenCoaches = $(this).val();
      self.getCoachList(this.choosenCoaches);
    });
    $('#manager_select').on('change', function () {
      console.log("manager_select");
      this.choosenManagers = $(this).val();
      self.getManagerList(this.choosenManagers);
    });

    }

  }

  onPlayerChange(event: any, form) {
    this.choosenPlayersArr = [];
    if (event.type === "focus") {
      console.log("FOCUS");
    }
    if (event.length !== 0 && event.type !== "focus") {
      event.forEach((playerinfo: any) => {
        this.choosenPlayersArr.push(playerinfo.id);
      });
      console.log("choosenPlayers", this.choosenPlayersArr);
      this.choosenPlayers = this.choosenPlayersArr;
      this.getPlayerList(this.choosenPlayers);
    } else if (event.type !== "focus" && event.length === 0) {
      console.log('----empty player----')
      /*this.playerArr.removeAt(0);
      form.patchValue({
        player_select: null
      })*/      
      this.choosenPlayers = [];
      this.getPlayerList(this.choosenPlayers);
    }
  }


  onCoachChange(event: any, form) {
    this.choosenCoachesArr = [];
    if (event.type === "focus") {
      console.log("FOCUS");
    }
    if (event.length !== 0 && event.type !== "focus") {
      event.forEach((coachinfo: any) => {
        this.choosenCoachesArr.push(coachinfo.id);
      });
      console.log("choosenCoaches", this.choosenCoachesArr);
      this.choosenCoaches = this.choosenCoachesArr;
      this.getCoachList(this.choosenCoaches);
    } else if (event.type !== "focus" && event.length === 0) {
      console.log('----empty coach----')
      /*this.coachArr.removeAt(0);
      form.patchValue({
        coach_select: null
      })*/
      this.choosenCoaches = [];
      this.getCoachList(this.choosenCoaches);
    }  
  }


  onManagerChange(event: any, form) {
    this.choosenManagersArr = [];
    if (event.type === "focus") {
      console.log("FOCUS");
    }
    if (event.length !== 0 && event.type !== "focus") {
      event.forEach((managerinfo: any) => {
        this.choosenManagersArr.push(managerinfo.id);
      });
      console.log("choosenManagers", this.choosenManagersArr);
      this.choosenManagers = this.choosenManagersArr;
      this.getManagerList(this.choosenManagers);
    } else if (event.type !== "focus" && event.length === 0) {
      console.log('----empty manager----')
      /*this.managerArr.removeAt(0);
      form.patchValue({
        manager_select: null
      })*/
      this.choosenManagers = [];
      this.getManagerList(this.choosenManagers);
    }  
  }


  onPlayerChangeXX(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        console.log('----markas touched----')
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      //this.isSaveInWhichPosition();
      console.log('---event----', event)
      console.log( '--player value ---',this.createTeamForm.controls['player'].value )
       event.forEach((playerinfo: any) => {
        let isplayerExist = this.createTeamForm.controls['player'].value.filter(item => item.sport_id === playerinfo.id);
        console.log('---isplayerExist----', isplayerExist)
        if (isplayerExist.length !== 0) {

        } else {
          this.playerArr.push(this.player());
          /* this.playerArr.at(this.createTeamForm.controls['player'].value.length - 1).patchValue({
            sport_name: playerinfo.name,
            sport_id: playerinfo.id,
            is_national_true: this.randomGenerator() + true,
            is_state_true: this.randomGenerator() + true,
            is_national_false: this.randomGenerator() + false,
            is_state_false: this.randomGenerator() + false,
          })
          this.getServiceForNational(form.value.country_code, playerinfo.id);
          this.getServiceForState(form.value.state, form.value.country_code, playerinfo.id) */
        }
      });
     if (this.createTeamForm.controls['player'].value.length !== event.length) {
        if (this.createTeamForm.controls['player'].value) {
          this.createTeamForm.controls['player'].value.forEach((formValue: any, index) => {
            console.log('---formValue---', formValue)
            let removeGoverningBody = event.filter(eachSport => eachSport.id === formValue.id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.playerArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {

      console.log('----else sports----')
      this.playerArr.removeAt(0);
      form.patchValue({
        player_select: null
      })
    }

  }
    
  onCoachChangeXX(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        console.log('----markas touched----')
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      //this.isSaveInWhichPosition();
      console.log('---event----', event)
      console.log( '--coach value ---',this.createTeamForm.controls['coach'].value )
       event.forEach((coachinfo: any) => {
        let isCoachExist = this.createTeamForm.controls['coach'].value.filter(item => item.sport_id === coachinfo.id);
        console.log('---isCoachExist----', isCoachExist)
        if (isCoachExist.length !== 0) {

        } else {
          this.coachArr.push(this.coach());
          this.coachArr.at(this.createTeamForm.controls['coach'].value.length - 1).patchValue({})
          
          /* this.playerArr.at(this.createTeamForm.controls['player'].value.length - 1).patchValue({
            sport_name: playerinfo.name,
            sport_id: playerinfo.id,
            is_national_true: this.randomGenerator() + true,
            is_state_true: this.randomGenerator() + true,
            is_national_false: this.randomGenerator() + false,
            is_state_false: this.randomGenerator() + false,
          })
          this.getServiceForNational(form.value.country_code, playerinfo.id);
          this.getServiceForState(form.value.state, form.value.country_code, playerinfo.id) */
        }
      });

     if (this.createTeamForm.controls['coach'].value.length !== event.length) {
        if (this.createTeamForm.controls['coach'].value) {
          this.createTeamForm.controls['coach'].value.forEach((formValue: any, index) => {
            console.log('---formValue---', formValue)
            let removeGoverningBody = event.filter(eachSport => eachSport.id === formValue.id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.coachArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {

      console.log('----else sports----')
      this.coachArr.removeAt(0);
      form.patchValue({
        coach_select: null
      })
    }

  }

  onManagerChangeXX(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        console.log('----markas touched----')
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      //this.isSaveInWhichPosition();
      console.log('---event----', event)
      console.log( '--manager value ---',this.createTeamForm.controls['manager'].value )
       event.forEach((managerinfo: any) => {
        let ismanagerExist = this.createTeamForm.controls['manager'].value.filter(item => item.sport_id === managerinfo.id);
        console.log('---ismanagerExist----', ismanagerExist)
        if (ismanagerExist.length !== 0) {

        } else {
          this.managerArr.push(this.manager());
          /* this.playerArr.at(this.createTeamForm.controls['player'].value.length - 1).patchValue({
            sport_name: playerinfo.name,
            sport_id: playerinfo.id,
            is_national_true: this.randomGenerator() + true,
            is_state_true: this.randomGenerator() + true,
            is_national_false: this.randomGenerator() + false,
            is_state_false: this.randomGenerator() + false,
          })
          this.getServiceForNational(form.value.country_code, playerinfo.id);
          this.getServiceForState(form.value.state, form.value.country_code, playerinfo.id) */
        }
      });
     if (this.createTeamForm.controls['manager'].value.length !== event.length) {
        if (this.createTeamForm.controls['manager'].value) {
          this.createTeamForm.controls['manager'].value.forEach((formValue: any, index) => {
            console.log('---formValue---', formValue)
            let removeGoverningBody = event.filter(eachSport => eachSport.id === formValue.id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.managerArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {

      console.log('----else sports----')
      this.managerArr.removeAt(0);
      form.patchValue({
        manager_select: null
      })
    }

  }

  /*
  OnSportChange(event: any, form) {
    if (event.type === "focus") {
      if (!form.value.country_code) {
        console.log('----markas touched----')
        form.controls.sports.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {
      this.showErrorInArr = [];
      //this.isSaveInWhichPosition();
      console.log('---event----', event)
      console.log( '--governing_body_info value ---',this.createorganizationForm.controls['governing_body_info'].value )
       event.forEach((sportInfo: any) => {
        let isSportExist = this.createorganizationForm.controls['governing_body_info'].value.filter(item => item.sport_id === sportInfo.sport_id);
        if (isSportExist.length !== 0) {

        } else {
          this.governingBodyArr.push(this.getGoverningInfo());
          this.governingBodyArr.at(this.createorganizationForm.controls['governing_body_info'].value.length - 1).patchValue({
            sport_name: sportInfo.name,
            sport_id: sportInfo.sport_id,
            is_national_true: this.randomGenerator() + true,
            is_state_true: this.randomGenerator() + true,
            is_national_false: this.randomGenerator() + false,
            is_state_false: this.randomGenerator() + false,
          })
          this.getServiceForNational(form.value.country_code, sportInfo.sport_id);
          this.getServiceForState(form.value.state, form.value.country_code, sportInfo.sport_id)
        }
      });
     if (this.createorganizationForm.controls['governing_body_info'].value.length !== event.length) {
        if (this.createorganizationForm.controls['governing_body_info'].value) {
          this.createorganizationForm.controls['governing_body_info'].value.forEach((formValue: any, index) => {
            let removeGoverningBody = event.filter(eachSport => eachSport.sport_id === formValue.sport_id);
            if (removeGoverningBody.length !== 0) {

            } else {
              this.governingBodyArr.removeAt(index)
            }
          });
        }
      }
    } else if (event.type !== "focus" && event.length === 0) {

      console.log('----else sports----')
      this.governingBodyArr.removeAt(0);
      form.patchValue({
        sports: ''
      })
    }

  }
  */

  getSportsList()
  {
    if(this.teamService.sportsdataStore.sports.length > 0)
    {
      console.log('---sports list---', this.teamService.sportsdataStore.sports)
      this.SportsList = this.teamService.sportsdataStore.sports;
    }else{
      this.orgId = localStorage.getItem('org_id');
      console.log('orgId',this.orgId);
      let Metaurl= '';
      if(this.orgId=='' || this.orgId==1) {
      Metaurl='sports';
      } else {
      Metaurl='organizationsports/'+this.orgId;
      }
      this.restApiService.lists(Metaurl).subscribe( lists => {
        console.log('---sports list---', lists)
        this.SportsList = lists
      })
    }
  }

  get f() { return this.createTeamForm.controls; }

  get playerArr() {
    return this.createTeamForm.get('player') as FormArray;
  }
  get coachArr() {
    return this.createTeamForm.get('coach') as FormArray;
  }
  get managerArr() {
    return this.createTeamForm.get('manager') as FormArray;
  }


  coach() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null, [Validators.required]],
      middle_initial: "",
      last_name: "",
      role: '',
      suffix: "",
      title: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]]
    });
  }

  player() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null, [Validators.required]],
      middle_initial: "",
      last_name: "",
      suffix: "",
      role: '',
      duplicateRecord: '',
      selectChange: '',
      positions: this.formBuilder.array([this.positions()]),
      shoot: [null, [Validators.required]],
      height: this.formBuilder.group({
        height_main_uom: ['', [Validators.required, Validators.maxLength(3), Validators.pattern('^[0-9]*$')]],
        height_main_unit: ['ft', [Validators.required]],
        height_sub_uom: [null, [Validators.required, Validators.maxLength(3), Validators.pattern('^[0-9]*$')]],
        height_sub_unit: ['in', [Validators.required]]
      }),
      weight: this.formBuilder.group({
        weight_main_uom: ['', [Validators.required, Validators.maxLength(3), Validators.pattern('^[0-9]*$')]],
        weight_main_unit: ['lbs', [Validators.required]],
      }),
      playerMeta: new FormArray([]),
      coachMeta: new FormArray([]),
      managerMeta: new FormArray([])
    })
  }
  manager() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null, [Validators.required]],
      middle_initial: "",
      last_name: "",
      suffix: "",
      role: '',
    })
  }
  positions() {
    return this.formBuilder.group({
      position_id: [""],
      position_name: ['', [Validators.required]],
      abbreviation: ""
    })
  }

  async getSportsByOrg(orgId) {
    this.sportSelect = true
    let getSportsByOrganizationRequest: any = {
      'auth_uid': this.uid, 'organization_id': orgId
    }
    let getSportsByOrganizationResponse: any = await this.dropDownService.getSportsByOrganization(getSportsByOrganizationRequest);
    try {
      if (getSportsByOrganizationResponse.status) {
        this.SportsList = getSportsByOrganizationResponse.data;
        if (this.SportsList.length === 1) {
          if (!this.createTeamForm.controls.sport_id.value) {
            this.createTeamForm.patchValue({
              sport_id: this.SportsList[0].sport_id,
            })
            this.getOptionForSport(this.SportsList[0].sport_id, this.createTeamForm);
          }
        }
        this.sportSelect = false
      } else {
        this.SportsList = []
        this.sportSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.SportsList = [];
      this.sportSelect = false;

    }
  }
  heightValidation(event, form, index) {

    if (form.value.player[index].height.height_main_unit === "ft") {
      form.controls.player.at(index).controls.height.controls.height_sub_unit.patchValue('in');
    } else if (form.value.player[index].height.height_main_unit === "m") {
      form.controls.player.at(index).controls.height.controls.height_sub_unit.patchValue('cm');
    }

    if (form.value.player[index].height.height_main_unit && form.value.player[index].height.height_sub_unit) {
      if (form.value.player[index].height.height_main_unit === "ft" && form.value.player[index].height.height_sub_unit === "in") {
      } else if (form.value.player[index].height.height_main_unit === "m" && form.value.player[index].height.height_sub_unit === "cm") {
      }
      else {
        form.controls.player.at(index).controls.height.controls.height_main_unit.patchValue('');
        form.controls.player.at(index).controls.height.controls.height_sub_unit.patchValue('');
      }
    }

  }
  getAlignedColumnSize(columnlength) {
    if (columnlength != 0) {
      this.columnWidth = Math.floor(100 / columnlength);
    }
  }

  search(nameKey, myArray){
    
      for (var i=0; i < myArray.length; i++) {
          if (myArray[i]['role_id'] === nameKey) {
              return myArray[i];
          }
      }
  }

  getMembersByOrg(orgId: any, sportId: any, seasonId: any, levelId: any) {
    try {
      
      if (sportId && seasonId && levelId)
      {
        setTimeout(() => {
          this.getMetaData('player',this.sportId,this.orgId);
          this.getMetaData('coach',this.sportId,this.orgId)
          this.getMetaData('manager',this.sportId,this.orgId)
          console.log('----this.playerMetaList----', this.playerMetaList)
        }, 1000);

        this.restApiService.lists('playersList/'+seasonId+'/'+levelId+'/'+orgId).subscribe( players => {
          console.log('----players----', players)
          players.forEach( element => {
            this.teamplayerList.push({name: element.first_name+' '+element.last_name, id: element._id});
          })

          this.playerList = players;
          this.playerList.forEach(element => {
            if (element.suffix) {
              if (element.middle_initial) {
                element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                element['user_id'] = element._id;
              } else {
                element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                element['user_id'] = element._id;
              }
            }
            else {
              if (element.middle_initial) {
                element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name;
                element['user_id'] = element._id;
              } else {
                element['name'] = element.first_name + ' ' + element.last_name;
                element['user_id'] = element._id;
              }
            }
          });

          this.allPlayerList = players;
          this.allPlayerList.forEach(element => {
            if (element.suffix) {
              if (element.middle_initial) {
                element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                element['user_id'] = element._id;
              } else {
                element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                element['user_id'] = element._id;
              }
            }
            else {
              if (element.middle_initial) {
                element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name;
                element['user_id'] = element._id;
              } else {
                element['name'] = element.first_name + ' ' + element.last_name;
                element['user_id'] = element._id;
              }
            }

          });
          
        });

        this.restApiService.lists('usersbyorg/'+orgId).subscribe( members => {
          console.log('---member list---', members)
          if( members.length > 0)
          {

            members.forEach( mem => {
              console.log('---test---', mem.roles[0]['role_id'])                
                /* if( this.search('player', mem.roles) )
                {                 
                  this.playerList.push(mem);
                } */
                if( this.search('manager', mem.roles) )
                {
                  this.managerList.push(mem);
                }
                if( this.search('coach', mem.roles) )
                {
                  this.coachList.push(mem);
                }
            })

            setTimeout(() => {

                  /* if( this.playerList.length >0)
                  {
                    this.playerList.forEach(element => {
                      this.teamplayerList.push({name: element.first_name+''+element.last_name, id: element._id});
                    })
                  } */

                  if (this.coachList.length != 0) {
                    this.coachList.forEach(element => {
                      this.teamcoachList.push({name: element.first_name+' '+element.last_name, id: element._id});
                    })

                    this.coachList.forEach(element => {
                      if (element.suffix) {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                        }
                      }
                      else {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name
                        }
                      }
                    });

                  }

                  if(this.managerList.length != 0) {      
                    this.managerList.forEach(element => {
                      this.teammanagerList.push({name: element.first_name+' '+element.last_name, id: element._id});
                    })

                    this.managerList.forEach(element => {
                      if (element.suffix) {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                        }
                      }
                      else {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name
                        }
                      }
                    });

                  }
              
            }, 1000);

            setTimeout(() => {
    
            $('#player_select').multiSelect('refresh');
            $('#coach_select').multiSelect('refresh');
            $('#manager_select').multiSelect('refresh');
            

            }, 1000);
            /* setTimeout(() => {

              if( this.playerList.length !=0 || this.coachList.length != 0 || this.managerList.length != 0)
              {
                  if( this.playerList.length >0)
                  {
                    this.noPlayer = false;
                    this.playerList.forEach(element => {
                      if (element.suffix) {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                        }
                      }
                      else {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name
                        }
                      }
                    });
    
                    $('#player_select').empty().multiSelect('refresh');
                    this.playerList.forEach(element => {
                      $('#player_select').append($('<option></option>').attr('value', element.id).text(element.name));
                    });
                    $('#player_select').multiSelect('refresh');
    
                    console.log('---this.playerList---', this.playerList)
                  }
                  else if( this.playerList.length == 0)
                  {
                    this.createTeamForm.patchValue({
                      players_count: 0
                    })
                    $('#player_select').empty().multiSelect('refresh');
                    $('#player_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
                    $('#player_select option[value="No data available"]').prop('disabled', true);
                    $('#plgetCoachListayer_select').multiSelect('refresh');
                  }


                  if(this.teamService.userssdataStore.users.length > 0)
                  {
                    this.allPlayerList = this.teamService.userssdataStore.users;
                    console.log('---this.allPlayerList swamy---', this.allPlayerList)
                    if(this.allPlayerList) {
                    
                      if (this.allPlayerList.length != 0) {
                        this.allPlayerList.forEach(element => {
                          if (element.suffix) {
                            if (element.middle_initial) {
                              element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                            } else {
                              element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                            }
                          }
                          else {
                            if (element.middle_initial) {
                              element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                            } else {
                              element['name'] = element.first_name + ' ' + element.last_name
                            }
                          }
            
                        });
            
                      }
                    }
                    
                    
                    if (this.allPlayerList && this.playerList) {

                      this.allPlayerList = this.allPlayerList.filter(item => !this.playerList.find(o2 => item.id === o2.id))
                      this.allPlayerListCompare = this.allPlayerList;
                      console.log('---this.allPlayerList aaaa---', this.allPlayerList)
                    } else {
                      this.allPlayerList = this.allPlayerList
                      this.allPlayerListCompare = this.allPlayerList;
                      console.log('---this.allPlayerList bbbb---', this.allPlayerList)
                    }

                  }

                  
    
    
                  if (this.coachList.length != 0) {
                    this.coachList.forEach(element => {
                      if (element.suffix) {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                        }
                      }
                      else {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name
                        }
                      }
                    });
                    //$('#coach_select').empty().multiSelect('refresh');
                    this.coachList.forEach(element => {
                      $('#coach_select').append($('<option></option>').attr('value', element.id).text(element.name));
                    });
                    //$('#coach_select').multiSelect('refresh');
                    // this.createTeamForm.patchValue({
                    //   coaches_count: 0
                    // })
                  }
                  else if (this.coachList.length == 0){
                    this.createTeamForm.patchValue({
                      coaches_count: 0
                    })
                    $('#coach_select').empty().multiSelect('refresh');
                    $('#coach_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
                    $('#coach_select option[value="No data available"]').prop('disabled', true);
                    $('#coach_select').multiSelect('refresh');
                  }
    
                  if(this.managerList.length != 0) {
      
                    this.managerList.forEach(element => {
                      if (element.suffix) {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                        }
                      }
                      else {
                        if (element.middle_initial) {
                          element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                        } else {
                          element['name'] = element.first_name + ' ' + element.last_name
                        }
                      }
                    });
                    //$('#manager_select').empty().multiSelect('refresh');
                    this.managerList.forEach(element => {
                      $('#manager_select').append($('<option></option>').attr('value', element.id).text(element.name));
                    });
                    //$('#manager_select').multiSelect('refresh');
                  }
                  else if(this.managerList.length == 0) {
                    this.createTeamForm.patchValue({
                      managers_count: 0
                    })
                    $('#manager_select').empty().multiSelect('refresh');
                    $('#manager_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
                    $('#manager_select option[value="No data available"]').prop('disabled', true);
                    $('#manager_select').multiSelect('refresh');
                  }
              }else{

                  $('#player_select').empty().multiSelect('refresh');
                  $('#player_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
                  $('#player_select option[value="No data available"]').prop('disabled', true);
                  $('#player_select').multiSelect('refresh');
                  $('#coach_select').empty().multiSelect('refresh');
                  $('#coach_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
                  $('#coach_select option[value="No data available"]').prop('disabled', true);
                  $('#coach_select').multiSelect('refresh');
                  $('#manager_select').empty().multiSelect('refresh');
                  $('#managetCoachListger_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
                  $('#manager_select option[value="No data available"]').prop('disabled', true);
                  $('#manager_select').multiSelect('refresh');
                  this.playerList = [];
                  this.coachList = [];
                  this.managerList = [];
                  this.allPlayerListCompare = [];

              }
              
            }, 1000); */
            

          }
          
        })


        /*let queryObj = { 'auth_uid': this.uid, 'organization_id': orgId, 'sport_id': sportId, 'season_id': seasonId, 'level_id': levelId, 'team_id': '' }
        let getMembersRes = await this.teamService.getMembersByOrganization(queryObj);
        if (getMembersRes.status) {
          console.log(getMembersRes.data);
          this.playerList = getMembersRes.data.player.length ? getMembersRes.data.player : []
          if (this.playerList.length != 0) {
            this.noPlayer = false;
            this.playerList.forEach(element => {
              if (element.suffix) {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                }
              }
              else {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name
                }
              }
            });
            // $('#player_select').empty().multiSelect('refresh');
            $('#player_select').empty().multiSelect('refresh');
            this.playerList.forEach(element => {
              $('#player_select').append($('<option></option>').attr('value', element.user_id).text(element.name));
            });
            $('#player_select').multiSelect('refresh');
          } else {
            this.createTeamForm.patchValue({
              players_count: 0
            })
            $('#player_select').empty().multiSelect('refresh');
            $('#player_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
            $('#player_select option[value="No data available"]').prop('disabled', true);
            $('#player_select').multiSelect('refresh');
          }
  
          this.allPlayerList = getMembersRes.data.playerList.length ? getMembersRes.data.playerList : [];
          if (this.allPlayerList) {
            if (this.allPlayerList.length != 0) {
              this.allPlayerList.forEach(element => {
                if (element.suffix) {
                  if (element.middle_initial) {
                    element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                  } else {
                    element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                  }
                }
                else {
                  if (element.middle_initial) {
                    element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                  } else {
                    element['name'] = element.first_name + ' ' + element.last_name
                  }
                }
  
              });getCoachList
            }
          }
          if (this.allPlayerList && this.playerList) {
            this.allPlayerList = this.allPlayerList.filter(item => !this.playerList.find(o2 => item.user_id === o2.user_id))
            this.allPlayerListCompare = this.allPlayerList;
          } else {
            this.allPlayerList = this.allPlayerList
            this.allPlayerListCompare = this.allPlayerList;
          }
  
          // console.log (this.allPlayerList.filter(item => !this.playerList.find(o2 => item.user_id === o2.user_id)))
  
  
          this.coachList = getMembersRes.data.coach.length ? getMembersRes.data.coach : [];
          if (this.coachList.length != 0) {
            this.coachList.forEach(element => {
              if (element.suffix) {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                }
              }
              else {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name
                }
              }
            });
            $('#coach_select').empty().multiSelect('refresh');
            this.coachList.forEach(element => {
              $('#coach_select').append($('<option></option>').attr('value', element.user_id).text(element.name));
            });
            $('#coach_select').multiSelect('refresh');
            // this.createTeamForm.patchValue({
            //   coaches_count: 0
            // })
          }
          else {
            this.createTeamForm.patchValue({
              coaches_count: 0
            })
            $('#coach_select').empty().multiSelect('refresh');
            $('#coach_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
            $('#coach_select option[value="No data available"]').prop('disabled', true);
            $('#coach_select').multiSelect('refresh');
          }
          this.managerList = getMembersRes.data.manager.length ? getMembersRes.data.manager : [];
          if (this.managerList.length != 0) {
  
            this.managerList.forEach(element => {
              if (element.suffix) {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix;
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name + ' ' + element.suffix;
                }
              }
              else {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name
                }
              }
            });
            $('#manager_select').empty().multiSelect('refresh');
            this.managerList.forEach(element => {
              $('#manager_select').append($('<option></option>').attr('value', element.user_id).text(element.name));
            });
            $('#manager_select').multiSelect('refresh');
          }
          else {
            this.createTeamForm.patchValue({
              managers_count: 0
            })
            $('#manager_select').empty().multiSelect('refresh');
            $('#manager_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
            $('#manager_select option[value="No data available"]').prop('disabled', true);
            $('#manager_select').multiSelect('refresh');
          }
        }
        else {
          $('#player_select').empty().multiSelect('refresh');
          $('#player_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
          $('#player_select option[value="No data available"]').prop('disabled', true);
          $('#player_select').multiSelect('refresh');
          $('#coach_select').empty().multiSelect('refresh');
          $('#coach_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
          $('#coach_select option[value="No data available"]').prop('disabled', true);
          $('#coach_select').multiSelect('refresh');
          $('#manager_select').empty().multiSelect('refresh');
          $('#manager_select').multiSelect('addOption', { value: 'No data available', text: 'No data available', index: 0 });
          $('#manager_select option[value="No data available"]').prop('disabled', true);
          $('#manager_select').multiSelect('refresh');
          this.playerList = [];
          this.coachList = [];
          this.managerList = [];
          this.allPlayerListCompare = [];
        }*/
      }

    } catch (error) {
      console.log(error);

    }
  }

  selectedPosition(event, form, row) {
    console.log(event)

    if (event.type === "focus") {
      if (this.orgId) {
        if (this.sportId) {
          this.sportValid = false
        }
        else {
          this.sportValid = true
        }
      }
      else {
        this.sharedService.announceMission('selectOrganization');
      }
    }

    event.forEach(element => {
      element['position_name'] = element.name
    });

    if (event.length != 0) {

      event.forEach((element, index) => {
        if (this.playerArr.at(row).get('positions').value.length === 1) {
          console.log(this.playerArr.at(row).get('positions').value[0].position_id)
          if (!this.playerArr.at(row).get('positions').value[0].position_id) {
            let filterValue = event.filter(
              item => item.position_id === element.position_id);
            (this.playerArr.at(row).get('positions') as FormArray).patchValue(filterValue)
          }
          else {
            console.log(element.name, "name")
            let isExistPosition = this.playerArr.at(row).get('positions').value.filter(item => item.position_id === element.position_id)
            if (isExistPosition.length !== 0) {

            }
            else {
              console.log(element.name, "name")
              let filteredValue = event.filter(
                item => item.position_id === element.position_id);
              (this.playerArr.at(row).get('positions') as FormArray).push(this.positions());
              console.log(filteredValue, "value", this.playerArr.at(row).get('positions').value)
              let lh = this.playerArr.at(row).get('positions').value.length;
              // console.log((this.playerArr.at(row).get('positions') as FormArray).at(lh));
              (this.playerArr.at(row).get('positions') as FormArray).at(lh - 1).patchValue(filteredValue[0])
            }

          }
        }
        else {

          let isExistPositions = this.playerArr.at(row).get('positions').value.filter(item => item.position_id === element.position_id)
          console.log(isExistPositions)
          if (isExistPositions.length != 0) {

          } else {
            let filteredValue = event.filter(
              item => item.position_id === element.position_id);
            (this.playerArr.at(row).get('positions') as FormArray).push(this.positions());
            console.log(filteredValue, "value", this.playerArr.at(row).get('positions').value)
            let lh = this.playerArr.at(row).get('positions').value.length;
            console.log((this.playerArr.at(row).get('positions') as FormArray).at(lh));
            (this.playerArr.at(row).get('positions') as FormArray).at(lh - 1).patchValue(filteredValue[0])
          }
        }
      });
    }

    if (event.length < this.playerArr.at(row).get('positions').value.length) {

      if (event.length >= 0) {
        let userId = this.playerArr.at(row).get('positions').value.map(item => item.position_name)
        console.log(userId);
        let posArr = event.map(item => item.name)
        let diff: any[] = userId.concat(posArr).filter((val) => {
          return !(userId.includes(val) && posArr.includes(val));
        });
        // console.log(diff,"diff");
        diff.forEach(element => {
          (this.playerArr.at(row).get('positions') as FormArray).removeAt(this.playerArr.at(row).get('positions').value.findIndex(item => item.position_name === element))
        });
      }
      else {

      }

    }
    console.log(this.createTeamForm)
  }
  selectedPlayerFromAll(event, form, index) {
    console.log(event, "event");
    if (event) {
      console.log(this.playerArr.controls[index].get('positions'))
      let isExit = this.playerArr.value.filter(item => item.user_id === event.user_id)
      if (isExit.length != 0) {
        this.playerArr.at(index).patchValue({
          duplicateRecord: true
        })

        this.disableCol(this.playerArr, index, 'weight')
        this.disableCol(this.playerArr, index, 'height')
        this.disableCol(this.playerArr, index, 'shoot')


      } else {
        this.playerArr.at(index).patchValue({
          duplicateRecord: false
        });
        this.enableCol(this.playerArr, index, 'weight')
        //  this.disableCol(this.playerArr,index,'positions')
        this.enableCol(this.playerArr, index, 'height')
        this.enableCol(this.playerArr, index, 'shoot')
        this.allPlayerList = this.allPlayerList.filter(item => {
          if (!item.disabled) {
            return item.user_id !== event.user_id
          }
        })
        this.playerArr.at(index).patchValue(event)
        this.disableOptions('player', this.allPlayerList);
      }
      console.log(this.createTeamForm.value);
    } else {

    }


  }

  disableOptions(name, list) {
    this.createTeamForm.controls[name].value.forEach(element => {

      list.forEach(player => {

        if (element.user_id === player.user_id) {
          player['disabled'] = true
        }

      })

    });
  }
  addPlayer() {
    if (this.allPlayerList) {
      if (this.allPlayerList.length === 0) {
        this.noPlayer = true;
      }
      else {
        let index = this.createTeamForm.value.player.length
        // this.allPlayerList.forEach(element => {
        // let filter=this.createTeamForm.controls['player'].value.filter(item => item.user_id === element.user_id);
        //   if(filter.length !== 0){

        //   }else{

        //     this.playerArr.at(index).patchValue({
        //       selectChange: false
        //     })
        //     this.noPlayer = false;
        //     this.createTeamForm.patchValue({
        //       players_count: this.playerArr.length
        //     })
        //   }
        // });
        this.playerArr.push(this.player())
        this.playerArr.at(index).patchValue({
          selectChange: false
        })
        this.createTeamForm.patchValue({
          players_count: this.createTeamForm.controls['player'].value.length
        })

      }
      this.increaseHeight("Player", "label-player");
    }

  }

  
/*
     ngAfterViewInit() {
    {
      "use strict";
      var FormAdvanced = function () { };
      FormAdvanced.prototype.initMultiSelect = function () {
       
        if ($('[data-plugin="multiselect"]').length > 0)
          $('[data-plugin="multiselect"]').multiSelect($(this).data());
      }, //initilizing
        FormAdvanced.prototype.init = function () {
          var $this = this;
          this.initMultiSelect()
        },
        $.FormAdvanced = new FormAdvanced, $.FormAdvanced.Constructor = FormAdvanced
    }
    //initializing main application module
    {
      "use strict";
      $.FormAdvanced.init();
    }
    let self = this; // store here
    $('#player_select').on('change', function () {
      console.log("player_select");
      this.choosenPlayers = $(this).val();
      // this.changePlayerSelect=true;
      self.getPlayerList(this.choosenPlayers);
    });


    $('#coach_select').on('change', function () {
      console.log("coach_select");
      this.choosenCoaches = $(this).val();
      self.getCoachList(this.choosenCoaches);
    });
    $('#manager_select').on('change', function () {
      console.log("manager_select");
      this.choosenManagers = $(this).val();
      self.getManagerList(this.choosenManagers);
    });

  } 
   

  ngAfterContentInit() {
    this.playerArr.removeAt(0);
    this.coachArr.removeAt(0);
    this.managerArr.removeAt(0);
  } 
*/

  removePlayer(playerIndex, line) {
    console.log(this.allPlayerList);
    if (this.allPlayerList) {
      this.allPlayerList.forEach(player => {
        if (this.createTeamForm.controls['player'].value[playerIndex].user_id === player.user_id) {
          player['disabled'] = false
        }
      })
      console.log(this.allPlayerList);
    }
    this.allPlayerListCompare.forEach(element => {
      if (this.createTeamForm.controls['player'].value[playerIndex].user_id === element.user_id) {
        this.allPlayerList.push(element);
        this.noPlayer = false;
      }
    })
    $("select option[value= '" + line.value.id + "']").prop("selected", false);
    $('#player_select').multiSelect('refresh');
    this.playerArr.removeAt(playerIndex);
    if (this.playerArr.length !== 0) {
      this.createTeamForm.patchValue({
        players_count: this.playerArr.length
      })
    } else {
      this.createTeamForm.patchValue({
        players_count: ''
      })
    }

    this.increaseHeight("Player", "label-player");

  }

  removeCoach(lineIndex, coachInfo) {

    $("select option[value= '" + coachInfo.value.user_id + "']").prop("selected", false);
    $('#coach_select').multiSelect('refresh');
    this.coachArr.removeAt(lineIndex);
    if (this.coachArr.length !== 0) {
      this.createTeamForm.patchValue({
        coaches_count: this.coachArr.length
      })
    } else {
      this.createTeamForm.patchValue({
        coaches_count: ''
      })
    }

    this.increaseHeight("Coach", "label-coach");
  }
  removeManager(lineIndex, managerInfo) {

    $("select option[value= '" + managerInfo.value.user_id + "']").prop("selected", false);
    $('#manager_select').multiSelect('refresh');
    this.managerArr.removeAt(lineIndex);
    if (this.managerArr.length !== 0) {
      this.createTeamForm.patchValue({
        managers_count: this.managerArr.length
      })
    } else {
      this.createTeamForm.patchValue({
        managers_count: ''
      })
    }

    this.increaseHeight("Manager", "label-manager");
  }
  getPlayerList(playerArr) {
    this.selectPlayers = false

    if (playerArr.length != 0) {
      playerArr.forEach((selected_player, index) => {
        if (this.createTeamForm.controls['player'].value.length === 0) {
          console.log(this.createTeamForm.controls['player'].value.length, "length0")
          this.playerArr.push(this.player())
          console.log("this.playerList",this.playerList);
          console.log("selected_player",selected_player);
          
          let filteredValue = this.playerList.filter(
            item => item.user_id === selected_player);
            console.log(filteredValue);

          this.playerArr.patchValue(filteredValue);
          //this.disableCol(this.playerArr, 0, 'first_name')
          //this.increaseHeight("Player", "label-player");
          this.playerArr.at(0).patchValue({
            selectChange: true,
          })
          this.createTeamForm.patchValue({
            players_count: this.createTeamForm.controls['player'].value.length
          })
        }
        else {
          // console.log(this.createTeamForm.controls['player'].value)
          let filteredItem = this.createTeamForm.controls['player'].value.filter(item => item.user_id === selected_player);
          console.log(filteredItem)

          if (filteredItem.length != 0) {

          } else {
            console.log(this.createTeamForm.controls['player'].value.length, "length1")
            let length = this.createTeamForm.controls['player'].value.length;
            console.log(length);

            this.playerArr.push(this.player())
            let filterValue = this.playerList.filter(
              item => item.user_id === selected_player);
            this.playerArr.at(length).patchValue({
              selectChange: true,
            })
            this.playerArr.at(length).patchValue(filterValue[0]);

            this.createTeamForm.patchValue({
              players_count: this.createTeamForm.controls['player'].value.length
            })
            //this.disableCol(this.playerArr, length, 'first_name')
            //this.increaseHeight("Player", "label-player");
          }
          console.log(this.createTeamForm)
        }

      });
    }

    if (playerArr.length < this.createTeamForm.controls['player'].value.length) {
      let userId = this.createTeamForm.controls['player'].value.map(item => item.user_id)
      console.log(userId);
      let diff: any[] = userId.concat(playerArr).filter((val) => {
        return !(userId.includes(val) && playerArr.includes(val));
      });
      console.log(this.createTeamForm.value);
      console.log(diff, "diff");
      diff.forEach(element => {
        // console.log(element,"diffElement");
        let onlyPlayer = this.playerList.filter(item => {
          if (element) {
            return item.user_id === element
          }
        })
        if (onlyPlayer.length !== 0) {
          if (element) {
            this.playerArr.removeAt(this.createTeamForm.controls['player'].value.findIndex(item => item.user_id === element));
          }
        }
      });
      this.createTeamForm.patchValue({
        players_count: this.createTeamForm.controls['player'].value.length
      })
      this.increaseHeight("Player", "label-player");
    }
  }

  increaseHeight(id, classHeight) {
    setTimeout(() => {
      if (this.router.url.includes('teams')) {
        var elmnt = document.getElementById(id);
        console.log(elmnt);
        console.log(elmnt.clientHeight);
        document.getElementById(classHeight).style.height = elmnt.clientHeight + "px";
      }
    }, 10);

  }
  disableCol(arr, index, col) {
    if (!arr.controls[index].get(col).disabled) {
      arr.controls[index].get(col).disable();
    }
  }
  enableCol(arr, index, col) {
    if (!arr.controls[index].get(col).enabled) {
      arr.controls[index].get(col).enable();
    }
  }

  getCoachList(coachArr) {

    this.selectCoaches = false
     console.log(coachArr);
    this.createTeamForm.patchValue({
      coaches_count: coachArr.length
    })
    if (coachArr.length != 0) {

      coachArr.forEach((selected_player, index) => {

        // console.log((this.createTeamForm.controls['player'].value))
        if (this.createTeamForm.controls['coach'].value.length === 0) {
          this.coachArr.push(this.coach())
          let filteredValue = this.coachList.filter(
            item => item.user_id === selected_player);
          //console.log(filteredValue)

          this.coachArr.patchValue(filteredValue);
          //this.disableCol(this.coachArr, 0, 'first_name')
          this.increaseHeight("Coach", "label-coach");
        }
        else {
          // console.log(this.createTeamForm.controls['player'].value)
          let filteredItem = this.createTeamForm.controls['coach'].value.filter(item => item.user_id === selected_player);
          //console.log(filteredItem)

          if (filteredItem.length != 0) {

          } else {
            // console.log(this.createTeamForm.controls['player'].value.length)
            let length = this.createTeamForm.controls['coach'].value.length
            this.coachArr.push(this.coach())
            let filterValue = this.coachList.filter(
              item => item.user_id === selected_player);
            this.coachArr.at(length).patchValue(filterValue[0]);
            //this.disableCol(this.coachArr, length, 'first_name')
            this.increaseHeight("Coach", "label-coach");
          }
        }

      });
    }

    if (coachArr.length < this.createTeamForm.controls['coach'].value.length) {
      let userId = this.createTeamForm.controls['coach'].value.map(item => item.user_id)
      // console.log(userId);
      let diff: any[] = userId.concat(coachArr).filter((val) => {
        return !(userId.includes(val) && coachArr.includes(val));
      });
      // console.log(diff,"diff");
      diff.forEach(element => {
        this.coachArr.removeAt(this.createTeamForm.controls['coach'].value.findIndex(item => item.user_id === element))
      });
      this.increaseHeight("Coach", "label-coach");
    }
    console.log(this.createTeamForm);
  }

  getManagerList(managerArr) {
    this.selectManagers = false
    // console.log(playerArr);
    this.createTeamForm.patchValue({
      managers_count: managerArr.length
    })
    if (managerArr.length != 0) {

      managerArr.forEach((selected_player, index) => {

        // console.log((this.createTeamForm.controls['player'].value))
        if (this.createTeamForm.controls['manager'].value.length === 0) {
          this.managerArr.push(this.manager())
          let filteredValue = this.managerList.filter(
            item => item.user_id === selected_player);
          //console.log(filteredValue)

          this.managerArr.patchValue(filteredValue);
          //this.disableCol(this.managerArr, 0, 'first_name')
          this.increaseHeight("Manager", "label-manager");
        }
        else {
          // console.log(this.createTeamForm.controls['player'].value)
          let filteredItem = this.createTeamForm.controls['manager'].value.filter(item => item.user_id === selected_player);
          //console.log(filteredItem)

          if (filteredItem.length != 0) {

          } else {
            // console.log(this.createTeamForm.controls['player'].value.length)
            let length = this.createTeamForm.controls['manager'].value.length
            this.managerArr.push(this.manager())
            let filterValue = this.managerList.filter(
              item => item.user_id === selected_player);
            this.managerArr.at(length).patchValue(filterValue[0]);
            //this.disableCol(this.managerArr, length, 'first_name')
            this.increaseHeight("Manager", "label-manager");
          }
        }

      });
    }

    if (managerArr.length < this.createTeamForm.controls['manager'].value.length) {
      let userId = this.createTeamForm.controls['manager'].value.map(item => item.user_id)
      // console.log(userId);
      let diff: any[] = userId.concat(managerArr).filter((val) => {
        return !(userId.includes(val) && managerArr.includes(val));
      });
      // console.log(diff,"diff");
      diff.forEach(element => {
        this.managerArr.removeAt(this.createTeamForm.controls['manager'].value.findIndex(item => item.user_id === element))
      });
      this.increaseHeight("Manager", "label-manager");
    }

    // console.log(this.createTeamForm);
  }


  selectedSport(event, form) {
    if (event.type === "focus") {
      if (!this.orgId) {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.sport_id) {
      this.sportValid = false
      this.sportId = event.sport_id
      this.createTeamForm.patchValue({
        season_id: null,
        level_id: null,
        level_name: '',
      })
      this.getOptionForSport(event.sport_id, form);
    }
  }

  getOptionForSport(sport_id, form) {
    this.removeControls();
    this.getSeasonBySport(sport_id);
    this.getPositionBySport(sport_id);  
    
    
    this.getLevel(this.uid, this.orgId, this.roleId, sport_id);
    
    if (form.value.season_id && form.value.sport_id && form.value.level_id)
    {
      //this.Loadingpagetext();
      this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, form.value.level_id)
    }
  }

  getMetaData( type, sports, orgid)
  {

    if( type == 'player')
    {
      var url = 'playermetadatabysportsorg/'+orgid+'/'+sports
    }
    else if( type == 'coach')
    {
      var url = 'coachmetadatabysportsorg/'+orgid+'/'+sports
    }
    else if( type == 'manager')
    {
      var url = 'managermetadatabysportsorg/'+orgid+'/'+sports
    }
    this.restApiService.lists(url).subscribe( res => {
      if( type == 'player')
      {
        //this.playerMetaList = res;
        res.forEach( play => {
          this.playerMetaList.push({
            "ID": play._id,
            "Key": play.field_name.replace(/ +/g, "").toLowerCase(),
            "Name": play.field_name,
            "Type": play.field_type,
            "Value": play.value
            })
        })
        
      }
      else if( type == 'coach')
      {
        //this.coachMetaList = res;
        res.forEach( play => {
          this.coachMetaList.push({
            "ID": play._id,
            "Key": play.field_name.replace(/ +/g, "").toLowerCase(),
            "Name": play.field_name,
            "Type": play.field_type,
            "Value": play.value
            })
        })
      }
      else if( type == 'manager')
      {
        //this.managerMetaList = res;
        res.forEach( play => {
          this.managerMetaList.push({
            "ID": play._id,
            "Key": play.field_name.replace(/ +/g, "").toLowerCase(),
            "Name": play.field_name,
            "Type": play.field_type,
            "Value": play.value
            })
        })
      }
      
      
    }, e => {
      console.log('---Level API error----', e)
    })
  }

  /* getOptionForSport(sport_id, form) {
    this.removeControls();
    this.getSeasonBySport(sport_id);
    this.getPositionBySport(sport_id);
    // this.getLevel(this.uid, this.injectedData.data.organization_id, this.roleId, this.injectedData.data.sport_id);
    this.getLevel(this.uid, this.orgId, this.roleId, sport_id);
    // this.Loadingpagetext();
    // // $('#player_select').append($('<option></option>').attr('value', "loading...").text("loading..."));
    // this.getMembersByOrg(this.orgId, sport_id, form.value.season_id, form.value.level_id)
    
    if (form.value.season_id && form.value.sport_id && form.value.level_id)
    {
      this.Loadingpagetext();
      this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, form.value.level_id)
    }
  } */
  removeControls() {
    const playerControl = <FormArray>this.createTeamForm.controls['player'];
    for (let i = playerControl.length - 1; i >= 0; i--) {
      playerControl.removeAt(i)
    }
    const coachControl = <FormArray>this.createTeamForm.controls['coach'];
    for (let i = coachControl.length - 1; i >= 0; i--) {
      coachControl.removeAt(i)
    }
    const managerControl = <FormArray>this.createTeamForm.controls['manager'];
    for (let i = managerControl.length - 1; i >= 0; i--) {
      managerControl.removeAt(i)
    }
    //$('#player_select').empty().multiSelect('refresh');
    //$('#coach_select').empty().multiSelect('refresh');
    //$('#manager_select').empty().multiSelect('refresh');
  }

  Loadingpagetext(){
    $('#player_select').multiSelect('addOption', { value: 'Loading Players...', text: 'Loading Players...', index: 0 });
    $('#player_select option[value="Loading Players..."]').prop('disabled', true);
    $('#player_select').multiSelect('refresh');
    $('#manager_select').multiSelect('addOption', { value: 'Loading Managers...', text: 'Loading Managers...', index: 0 });
    $('#manager_select option[value="Loading Managers..."]').prop('disabled', true);
    $('#manager_select').multiSelect('refresh');
    $('#coach_select').multiSelect('addOption', { value: 'Loading Coaches...', text: 'Loading Coaches...', index: 0 });
    $('#coach_select option[value="Loading Coaches..."]').prop('disabled', true);
    $('#coach_select').multiSelect('refresh');
  }

  async getSeasonBySport(sportId) {

    this.seasonSelect = true;
    this.seasonList = [];
    this.restApiService.lists('seasonsbysportsandorg/'+sportId+'/'+this.orgId).subscribe( res => {
      this.seasonList = res;
      this.seasonSelect = false;
    }, e => {
      console.log('---seassion API error----', e)
    })

    /* this.seasonSelect = true;
    this.seasonList = [];
    let seasonDropdownRequest: any = {
      'auth_uid': this.uid, 'organization_id': this.orgId, 'sport_id': sportId
    };
    let seasonDropdownResponse: any = await this.dropDownService.getSeasonDropdown(seasonDropdownRequest);
    try {
      if (seasonDropdownResponse.status) {
        this.seasonList = seasonDropdownResponse.data;
        this.seasonSelect = false;
      }
      else {
        this.seasonList = [];
        this.seasonSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.seasonList = [];
      this.seasonSelect = false;
    } */
  }
  async getLevel(uid, orgId, roleId, sportId) {


    this.levelSelect = true;
    this.levelList = [];
    this.restApiService.lists('levelsbysportsandorg/'+sportId+'/'+this.orgId).subscribe( res => {
      this.levelList = res;
      this.levelSelect = false;
    }, e => {
      console.log('---Level API error----', e)
    })
    /* this.levelSelect = true;
    this.levelList = [];
    let getLevelDropdownRequest: any = {
      'auth_uid': uid, 'role_id': roleId, 'sport_id': sportId, 'organization_id': orgId
    }
    let getLevelDropdownResponse: any = await this.dropDownService.getLevelDropdown(getLevelDropdownRequest);
    try {
      if (getLevelDropdownResponse.status) {
        this.levelSelect = false;
        if (getLevelDropdownResponse.message.data != 0) {
          if (typeof (getLevelDropdownResponse.message.data) !== "string") {
            getLevelDropdownResponse.message.forEach(element => {
              if (element.alternate_level_name) {
                element.level_name = element.alternate_level_name
              }
            });
            this.levelList = getLevelDropdownResponse.message;
          }
          else {
            this.levelList = [];
            this.levelSelect = false;
          }
        }
        else {
          this.levelList = [];
          this.levelSelect = false;
        }
      } else {
        this.levelList = [];
        this.levelSelect = false;
      }
    } catch (error) {
      console.log(error);
      this.levelList = [];
      this.levelSelect = false;
    } */
  }

  async getPositionBySport(sportId) {

    this.positionList = [];
    this.restApiService.lists('positionsbysports/'+sportId).subscribe( res => {
      this.positionList = res;
      
    }, e => {
      console.log('---Level API error----', e)
    })

    /* this.positionList = [];
    let positionDropdownRequest: any = {
      'auth_uid': this.uid, 'organization_id': this.orgId, 'sport_id': sportId
    }
    let positionDropdownResponse: any = await this.dropDownService.getPositionDropdown(positionDropdownRequest);
    try {
      if (positionDropdownResponse.status) {
        this.positionList = positionDropdownResponse.data;
      }
      else {
        this.positionList = [];

      }
    } catch (error) {
      console.log(error);
      this.positionList = [];
    } */

  }

  selectedSeason(event, form) {
    if (event.type === "focus") {
      if (this.orgId) {
        if (form.value.sport_id) {
          this.sportValid = false
        }
        else {
          this.sportValid = true
        }
      }
      else {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.season_id) {
      // console.log(event)
      this.removeControls();
      this.seasonValid = false
      if (form.value.season_id && form.value.sport_id && form.value.level_id)
      {
        //this.Loadingpagetext();
        this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, form.value.level_id)
      }
      // this.Loadingpagetext();
      // this.getMembersByOrg(this.orgId, form.value.sport_id, event.season_id, form.value.level_id)

    }
  }


  selectedLevel(event, form) {
    console.log(event)
    if (event.type === "focus") {
      if (this.orgId) {
        if (form.value.sport_id) {
          this.sportValid = false
          if (form.value.season_id) {
            this.seasonValid = false
          }
          else {
            this.seasonValid = true
          }
        }
        else {
          this.sportValid = true
        }
      }
      else {
        this.sharedService.announceMission('selectOrganization');
      }
    }
    if (event.level_id) {
      this.createTeamForm.patchValue({
        level_name: event.level_name
      })
      this.removeControls();
      this.levelValid = false;
      if (form.value.season_id && form.value.sport_id && event.level_id)
      {
        //this.Loadingpagetext();
        this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, event.level_id)
      }
    }


  }
  saveNew(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
    this.saves = false;
  }
  save(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
    this.saves = true;
  }


   onSubmit(form) {
   
    this.submitted = true;
    if (form.invalid) {
      if (!form.value.sport_id) {
        this.sportValid = true
      }
      if (!form.value.season_id) {
        this.seasonValid = true
      }
      if (!form.value.players_count && this.playerList.length !== 0) {
        this.selectPlayers = true
      }
      if (!form.value.coaches_count && this.coachList.length !== 0) {
        this.selectCoaches = true
      }
      if (!form.value.managers_count && this.managerList.length !== 0) {
        this.selectManagers = true
      }
      return
    }
    this.createTeamForm.patchValue({
      auth_uid: this.uid,
      organization_id: this.orgId,
    })
    this.playerArr['controls'].forEach(playerInfo => {
      if (!playerInfo['controls'].first_name.enabled) {
        playerInfo['controls'].first_name.enable();
      }
      if (!playerInfo['controls'].weight.enabled) {
        playerInfo['controls'].weight.enable();
      }
      if (!playerInfo['controls'].height.enabled) {
        playerInfo['controls'].height.enable();
      }
      if (!playerInfo['controls'].shoot.enabled) {
        playerInfo['controls'].shoot.enable();
      }
    });
    this.coachArr['controls'].forEach(playerInfo => {
      if (!playerInfo['controls'].first_name.enabled) {
        playerInfo['controls'].first_name.enable();
      }
    });
    this.managerArr['controls'].forEach(playerInfo => {
      if (!playerInfo['controls'].first_name.enabled) {
        playerInfo['controls'].first_name.enable();
      }
    });

    form.value.player.forEach((element, index) => {
      delete element.selectChange;
      if (element.user_id) {

      } else {
        console.log(element.user_id);
        this.playerArr.removeAt(index);
        // form.value.player.removeAt(index)
      }
      element.role = "player"
      if (element.role.length !== 0) {
        delete element.selectChange;
      }
      else {
        delete element.selectChange;
      }
      if (element.duplicateRecord) {
        delete element[index];
      } else {
        delete element.duplicateRecord;
      }
      delete element.duplicateRecord;
      form.value['players_count'] = form.value.player.length;
    });
    form.value.coach.forEach(element => {
      element.role = "coach"
    });
    form.value.manager.forEach(element => {
      element.role = "manager"
    });
    this.displayLoader = true;
    this.loading = true;
    let intervalForCreating = setInterval(this.timerFunction, 300, this.loaderInfo);
    
    

    console.log('----form submit---', this.createTeamForm)    
    //return false;

    var sportsName = '';
        if( this.SportsList != undefined && this.SportsList.length >0)
        {
          this.SportsList.forEach( sp => {
            console.log('---sp---', sp)
             if(sp._id.indexOf(form.value.sport_id) !== -1){
              sportsName = sp.name
            }
          })
        }

        var seasonName = '';
        var startDate = '';
        var enddate = '';
        if( this.seasonList != undefined && this.seasonList.length >0)
        {
          this.seasonList.forEach( seas => {
            
             if(seas._id.indexOf(form.value.season_id) !== -1){
              seasonName = seas.season_name;
              startDate = seas.season_start_date;
              enddate = seas.season_end_date;
            }
          })
        }

        console.log('----seasons---', this.seasonList)

    var jsonObj = {
      is_completed: true,
      season_id                         : form.value.season_id,
      managers_count                    : form.value.manager.length,
      level_name                        : form.value.level_name,
      players_count                     : form.value.player.length,
      sport_name                        : ((sportsName != '') ? sportsName : ''),
      season_start_date                 : ((startDate != '') ? startDate : ''),
      organization_id                   : this.orgId,        
      season_end_date                   : ((enddate != '') ? enddate : ''),
      isMaster                          : true,
      season_lable                      : ((seasonName != '') ? seasonName : ''),
      coaches_count                     : form.value.coach.length,
      sport_id                          : form.value.sport_id,
      level                             : form.value.level_name,
      team_name                         : form.value.team_name,
      team_id                           : '',
      level_id                          : form.value.level_id,
      isActive                          : false,
      organization_name                 : this.orgName

    }
    console.log('----jsonObj---', jsonObj);
    this.restApiService.create('teams',jsonObj).subscribe( res => {
      console.log('---res----', res)
      if( res._id )
      {

        var playerJson = {
          players_count: form.value.player.length,
          display_name : 'Players',
          user_list :form.value.player,
          season_id: form.value.season_id,
          sport_id: form.value.sport_id,
          people_id : 'player',
          organization_id: this.orgId,
          team_id: res._id
        }
    
        var coachJson = {
          players_count: form.value.coach.length,
          display_name : 'Coaches',
          user_list : form.value.coach,
          season_id: form.value.season_id,
          sport_id: form.value.sport_id,
          people_id : 'coach',
          organization_id: this.orgId,
          team_id: res._id
        }
    
        var managerJson = {
          players_count: form.value.manager.length,
          display_name : 'Managers',
          user_list : form.value.manager,
          season_id: form.value.season_id,
          sport_id: form.value.sport_id,
          people_id : 'manager',
          organization_id: this.orgId,
          team_id: res._id
        }

        var teammembers = {
          team_id             : res._id,
          player              : playerJson, 
          coach               : coachJson,
          manager             : managerJson, 
        }

        this.restApiService.create('teammembers',teammembers).subscribe( memres => {
          console.log('----memres----', memres)
        }, error =>{
          console.log('---error team member API----', error)
        })
      }
      this.change.emit({ action: "teamgrid" });
      this.reLoadPageAfterCreating(intervalForCreating);
      this.notification.isNotification(true, "Teams", res.team_name, "check-square");
      this.router.navigate(['/teams']);
    }, e => {
      console.log('---create Team API error----', e)
      return false;
    })
    
    //this.restApiService.lists
    /* let submit: any = await this.db.postData(form.value);
    try {
      if (submit.status) {
        if (this.saves) {
          this.change.emit({ action: "teamgrid" });
          this.reLoadPageAfterCreating(intervalForCreating);
          this.notification.isNotification(true, "Teams", submit.data, "check-square");
        }
        else {
          this.levelList = [];
          this.SportsList = [];
          this.seasonList = [];
          this.allPlayerList = [];
          this.increaseHeight("Player", "label-player");
          this.increaseHeight("Manager", "label-manager");
          this.increaseHeight("Coach", "label-coach");
          this.getSportsByOrg(this.orgId);
          form.reset();
          this.removeControls();
          this.submitted = false;
          this.reLoadPageAfterCreating(intervalForCreating);
          this.reInitialise(intervalForCreating);
          this.notification.isNotification(true, "Teams", submit.data, "check-square");
        }
      } else {
        this.submitted = false;
        this.loading = false;
        this.error = submit.error;
        this.reInitialise(intervalForCreating);
      }
    } catch (error) {
      this.error = error;
      this.reInitialise(intervalForCreating);

    } */
  }


  reLoadPageAfterCreating(intervalForCreating?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(intervalForCreating);
    this.loading = false;
    this.displayLoader = false;
  }
  reInitialise(intervalId?: any) {
    this.submitted = false;
    this.loading = false;
    this.displayLoader = false;
    clearInterval(intervalId);
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  }

  timerFunction(loaderInfo) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForCreating  });
  }
  closeError() {
    this.error = '';
  }
  goBack() {
    this.change.emit({ action: "teamgrid" })
  }

}
