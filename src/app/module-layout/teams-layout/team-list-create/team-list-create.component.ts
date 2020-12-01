import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { CookieService } from 'src/app/core/services/cookie.service';

//import { IntegralUISelectionMode } from '@lidorsystems/integralui-web/bin/integralui/components/integralui.core';
//import { IntegralUIListBox } from '@lidorsystems/integralui-web/bin/integralui/components/integralui.listbox';

import { NgiNotificationService } from 'ngi-notification';

import { RestApiService } from '../../../shared/rest-api.services';
import { TeamService } from '../team-service';
declare var $: any;
declare var jQuery: any;

@Component({
  selector: 'app-team-list-create',
  templateUrl: './team-list-create.component.html',
  styleUrls: ['./team-list-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TeamListCreateComponent implements OnInit {

  //@ViewChild('listbox',{static:false}) listbox: IntegralUIListBox;

    comboItems: any = [];
    // An array that holds a list of items in the ListBox on the left
    items: any = [];
    // An array that holds a list of all selected items
    selItems: any = [];
    // Current selection mode is set to single selection
    //private selMode: IntegralUISelectionMode = IntegralUISelectionMode.MultiSimple;


  db: any = firebase.firestore();
  value: any = [];

  
  getSports: any = [];
  getSportsData: any = [];
  getSportsArray: any = ["FootBall", "BasketBall","ValleyBall"];

  
  getTags: any = [];
  getTagsData: any = [];
  getTagsArray: any = [];
  teamplayerList: any[] = [];
  playerList: any[] = [];
  allPlayerList: any = [];
  coachList: any = [];
  teamcoachList: any = [];
  managerList: any = [];
  teammanagerList: any = [];

  orgName: any;
  country: any = [];
  countryCodeSelect: any = [];
  
  data: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  uid: any;
  orgId: any;

  SportsList: any = [];
  seasonList: any = [];
  levelList: any = [];
  sportId: any;
  sportValid: boolean = false;
  seasonSelect : boolean = false;
  levelSelect: boolean = false;
  seasonValid: boolean = false;
  levelValid: boolean = false
  roleId: any;

  loading = true;
  displayLoader: any = true;

  submitted = false;
  createteamForm: FormGroup;
  
  positionList: any[] = [];
  shootList: any = [
    { name: 'Left' },
    { name: 'Right' },
  ];  
  height: any = [
    { value: "ft", name: 'in', weight: 'lbs' },
    { value: "m", name: 'cm', weight: 'kg' },
  ]

  
  playerMetaList: any[] = [];
  coachMetaList: any[] = [];
  managerMetaList: any[] = [];

  constructor(private router: Router, 
    private formBuilder: FormBuilder,
    public cookieService: CookieService, 
    private teamService: TeamService,
    private restApiService: RestApiService,
    private notification: NgiNotificationService) { 
     this.createForm(); 
  }
  
  createForm() {
    this.createteamForm = this.formBuilder.group({

      sport_id: [null, Validators.required],
      season_id: [null, Validators.required],
      level_id: [null, Validators.required],
      level_name: [''],
      team_name: [null, Validators.required],

      player_select: [null],
      coach_select: [null],
      manager_select: [null],

      players_count: [''],
      coaches_count: [''],
      managers_count: [''],

      player: this.formBuilder.array([this.player()]),
      coach: this.formBuilder.array([this.coach()]),
      manager: this.formBuilder.array([this.manager()]),

    });
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
        height_main_uom: [''],
        height_main_unit: ['ft'],
        height_sub_uom: [null],
        height_sub_unit: ['in']
      }),
      weight: this.formBuilder.group({
        weight_main_uom: [''],
        weight_main_unit: ['lbs'],
      }),
      playerMeta: new FormArray([]),
      coachMeta: new FormArray([]),
      managerMeta: new FormArray([])
    })
  }
  manager() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null],
      middle_initial: "",
      last_name: "",
      suffix: "",
      role: '',
    })
  }

  positions() {
    return this.formBuilder.group({
      position_id: [""],
      position_name: [''],
      abbreviation: ""
    })
  }

  get playerArr() {
    return this.createteamForm.get('player') as FormArray;
  }
  get coachArr() {
    return this.createteamForm.get('coach') as FormArray;
  }
  get managerArr() {
    return this.createteamForm.get('manager') as FormArray;
  }

  
  ngAfterViewInit() {
    {

    let self = this; // store here  
    $('#player_select').on('change', function (event) {
      console.log("player_select");
      console.log(event);
      this.choosenPlayers = $(this).val();
      console.log("multiselect choosen players::",this.choosenPlayers);
      //self.getPlayerList(this.choosenPlayers);
      //self.OnPlayerChange( event, this.createteamForm);
    });
    $('#coach_select').on('change', function () {
      console.log("coach_select");
      this.choosenCoaches = $(this).val();
      //self.getCoachList(this.choosenCoaches);
    });
    $('#manager_select').on('change', function () {
      console.log("manager_select");
      this.choosenManagers = $(this).val();
     //self.getManagerList(this.choosenManagers);
    });

    }

  }


  OnPlayerChange( event, form)
  {
      console.log("FOCUS");
      console.log(event);
    
    if (event.type === "focus") {
      if (!form.value.sport_id) {
        console.log('----markas touched----')
        form.controls.player_select.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {

      event.forEach((playerInfo: any) => {
        console.log('---playerInfo---', playerInfo)
        console.log('---fff---', this.createteamForm.controls['player'].value )
        let isPlayerExist = this.createteamForm.controls['player'].value.filter(item => item.user_id === playerInfo.id);
        console.log('---isPlayerExist---', isPlayerExist)
        if (isPlayerExist.length !== 0) {

        } else {
          this.playerArr.push(this.player());

          let length = this.createteamForm.controls['player'].value.length-1;
          let filterValue = this.playerList.filter(
            item => item.user_id === playerInfo.id);
          this.playerArr.at(length).patchValue({
            selectChange: true,
          })
          this.playerArr.at(length).patchValue(filterValue[0]);

          this.createteamForm.patchValue({
            players_count: this.createteamForm.controls['player'].value.length
          })
         /*  this.playerArr.at(this.createteamForm.controls['player'].value.length - 1).patchValue({
            user_id: playerInfo.id
          })

          
            let filteredValue = this.playerList.filter(
              item => item.user_id === playerInfo.id);
              console.log('----filteredValue---',filteredValue);
  
            this.playerArr.patchValue(filteredValue); */
         

        }
      })
     
      if (this.createteamForm.controls['player'].value.length !== event.length) {
        if (this.createteamForm.controls['player'].value) {
          this.createteamForm.controls['player'].value.forEach((formValue: any, index) => {
            console.log('---formValue---', formValue)
            let removePlayerBody = event.filter(eachSport => eachSport.id === formValue.user_id);
            if (removePlayerBody.length !== 0) {

            } else {
              this.playerArr.removeAt(index)
            }
          });
        }
      }
     

    }else if (event.type !== "focus" && event.length === 0) {
      this.playerArr.removeAt(0);
      form.patchValue({
        player_select: null
      })
    }
  }


  OnCoachChange( event, form )
  {
    if (event.type === "focus") {
      if (!form.value.sport_id) {
        console.log('----markas touched----')
        form.controls.coach_select.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {

      event.forEach((coachInfo: any) => {
        console.log('---coachInfo---', coachInfo)
        console.log('---fff---', this.createteamForm.controls['coach'].value )
        let iscoachExist = this.createteamForm.controls['coach'].value.filter(item => item.user_id === coachInfo.id);
        console.log('---iscoachExist---', iscoachExist)
        if (iscoachExist.length !== 0) {

        } else {
          this.coachArr.push(this.coach());

          let length = this.createteamForm.controls['coach'].value.length-1;
          let filterValue = this.coachList.filter(
            item => item.user_id === coachInfo.id);
          this.coachArr.at(length).patchValue({
            selectChange: true,
          })
          this.coachArr.at(length).patchValue(filterValue[0]);

          this.createteamForm.patchValue({
            coaches_count: this.createteamForm.controls['coach'].value.length
          })

          /* this.coachArr.at(this.createteamForm.controls['coach'].value.length - 1).patchValue({
            user_id: coachInfo.id
          }) */
        }
      })
     
      if (this.createteamForm.controls['coach'].value.length !== event.length) {
        if (this.createteamForm.controls['coach'].value) {
          this.createteamForm.controls['coach'].value.forEach((formValue: any, index) => {
            console.log('---formValue---', formValue)
            let removeCoachBody = event.filter(eachSport => eachSport.id === formValue.user_id);
            if (removeCoachBody.length !== 0) {

            } else {
              this.coachArr.removeAt(index)
            }
          });
        }
      }
     

    }else if (event.type !== "focus" && event.length === 0) {
      this.coachArr.removeAt(0);
      form.patchValue({
        coach_select: null
      })
    }
  }

  OnManagerChange(event, form)
  {
    if (event.type === "focus") {
      if (!form.value.sport_id) {
        console.log('----markas touched----')
        form.controls.manager_select.markAsTouched();
      }
    }
    if (event.length !== 0 && event.type !== "focus") {

      event.forEach((managerInfo: any) => {
        console.log('---managerInfo---', managerInfo)
        console.log('---fff---', this.createteamForm.controls['manager'].value )
        let ismanagerExist = this.createteamForm.controls['manager'].value.filter(item => item.user_id === managerInfo.id);
        console.log('---ismanagerExist---', ismanagerExist)
        if (ismanagerExist.length !== 0) {

        } else {
          this.managerArr.push(this.manager());

          let length = this.createteamForm.controls['manager'].value.length-1;
          let filterValue = this.managerList.filter(
            item => item.user_id === managerInfo.id);
          this.managerArr.at(length).patchValue({
            selectChange: true,
          })
          this.managerArr.at(length).patchValue(filterValue[0]);

          this.createteamForm.patchValue({
            managers_count: this.createteamForm.controls['manager'].value.length
          })

          /* this.managerArr.at(this.createteamForm.controls['manager'].value.length - 1).patchValue({
            user_id: managerInfo.id
          }) */
        }
      })
     
      if (this.createteamForm.controls['manager'].value.length !== event.length) {
        if (this.createteamForm.controls['manager'].value) {
          this.createteamForm.controls['manager'].value.forEach((formValue: any, index) => {
            console.log('---formValue---', formValue)
            let removeManagerBody = event.filter(eachSport => eachSport.id === formValue.user_id);
            if (removeManagerBody.length !== 0) {

            } else {
              this.managerArr.removeAt(index)
            }
          });
        }
      }
     

    }else if (event.type !== "focus" && event.length === 0) {
      this.managerArr.removeAt(0);
      form.patchValue({
        manager_select: null
      })
    }
  }

  selectedPlayer( event, form, i)
  {

  }

  
  heightValidation(event, form, index) {

  }

  ngOnInit() {
    console.log('----swamy----')

    this.getSportsList(); 

    this.comboItems = [
      { text: "None" },
      { text: "One" },
      { text: "Multi Simple" },
      { text: "Multi Extended" }
    ];

    // Create a list of items
    this.items = [
      { text: "Inception" },
      { text: "Gravity" },
      { text: "Django Unchained" },
      { text: "Toy Story 3" },
      { text: "The Wolf of Wall Street" },
      { text: "The Town" },
      { text: "Nightcrawler" },
      { text: "Locke" },
      { text: "Prometheus" },
      { text: "The Social Network" },
      { text: "The Conjuring" },
      { text: "Blue Jasmine" },
      { text: "Black Swan" },
      { text: "Prisoners" },
      { text: "The Avengers" },
      { text: "Snowpiercer" },
      { text: "The Dark Knight Rises" },
      { text: "American Hustle" },
      { text: "Dawn of the Planet of the Apes" },
      { text: "Frozen" },
      { text: "Edge of Tomorrow" },
      { text: "Interstellar" },
      { text: "Rush" },
      { text: "Shutter Island" },
      { text: "This Is the End" }
    ];

    // At first there are no selected items
    this.selItems = [];
    this.orgName = localStorage.getItem('org_name');
    /* this.uid = this.cookieService.getCookie('uid');
    this.orgId = localStorage.getItem('org_id');
    this.getAllSports();
    this.loading = false;
    this.displayLoader = false; */

    

  $('#player_select').multiSelect();
  $('#coach_select').multiSelect();
  $('#manager_select').multiSelect();

  }

  onSelectionChanged(e: any){
    // Get the list of currently selected items and display it in the ListBox on the right
    //this.selItems = this.listbox.getList('selected');
  }

  getSportsList(){   
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

  

  selectedSport(event, form) {
    console.log(event);
    if (event.type === "focus") {
      if (!this.orgId) {
        
      }
    }
    if (event.sport_id) {
      this.sportValid = false
      this.sportId = event.sport_id
      this.createteamForm.patchValue({
        season_id: null,
        level_id: null,
        level_name: '',
      })
      this.getOptionForSport(event.sport_id, form);
    }
  }

  getOptionForSport(sport_id, form) {
    //this.removeControls();
    this.getSeasonBySport(sport_id);
    this.getPositionBySport(sport_id);  
    
    
    this.getLevel(this.uid, this.orgId, this.roleId, sport_id);
    
    if (form.value.season_id && form.value.sport_id && form.value.level_id)
    {
      //this.Loadingpagetext();
      //this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, form.value.level_id)
    }
  }

  getPositionBySport(sportId) {

    this.positionList = [];
    this.restApiService.lists('positionsbysports/'+sportId).subscribe( res => {
      this.positionList = res;
      
    }, e => {
      console.log('---Level API error----', e)
    })

  }

  getSeasonBySport(sportId) {
    this.orgId = localStorage.getItem('org_id');
    this.seasonSelect = true;
    this.seasonList = [];
    this.restApiService.lists('seasonsbysportsandorg/'+sportId+'/'+this.orgId).subscribe( res => {
      this.seasonList = res;
      this.seasonSelect = false;
    }, e => {
      console.log('---seassion API error----', e)
    })
  }

  getLevel(uid, orgId, roleId, sportId) {
    this.orgId = localStorage.getItem('org_id');
    this.levelSelect = true;
    this.levelList = [];
    this.restApiService.lists('levelsbysportsandorg/'+sportId+'/'+this.orgId).subscribe( res => {
      this.levelList = res;
      this.levelSelect = false;
    }, e => {
      console.log('---Level API error----', e)
    })
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
        
      }
    }
    if (event.season_id) {
      // console.log(event)
      
      this.seasonValid = false
      if (form.value.season_id && form.value.sport_id && form.value.level_id)
      {
        //this.Loadingpagetext();
        //this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, form.value.level_id)
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
        
      }
    }
    if (event.level_id) {
      this.createteamForm.patchValue({
        level_name: event.level_name
      })
      
      this.levelValid = false;
      if (form.value.season_id && form.value.sport_id && event.level_id)
      {
        //this.Loadingpagetext();
        this.getMembersByOrg(this.orgId, form.value.sport_id, form.value.season_id, event.level_id)
      }
    }
  }

  search(nameKey, myArray){
    
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i]['role_id'] === nameKey) {
            return myArray[i];
        }
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
  
}

  getMembersByOrg(orgId: any, sportId: any, seasonId: any, levelId: any) {
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
  
            }
          })
    }
  }
   
  get f() { return this.createteamForm.controls; }

  goBack()
  {
    this.router.navigate(['/teams/list']);
  }

   submitForm() {
   
      this.submitted = true;
      console.log('----form submit----', this.createteamForm)
      console.log('----form submit value----', this.createteamForm.value);
      if (this.createteamForm.invalid) {
        console.log('---invalid---')
        return;
      }


      var sportsName = '';
        if( this.SportsList != undefined && this.SportsList.length >0)
        {
          this.SportsList.forEach( sp => {
            console.log('---sp---', sp)
             if(sp._id.indexOf(this.createteamForm.value.sport_id) !== -1){
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
            
             if(seas._id.indexOf(this.createteamForm.value.season_id) !== -1){
              seasonName = seas.season_name;
              startDate = seas.season_start_date;
              enddate = seas.season_end_date;
            }
          })
        }

      var jsonObj = {
        is_completed: true,
        season_id                         : this.createteamForm.value.season_id,
        managers_count                    : this.createteamForm.value.manager.length,
        level_name                        : this.createteamForm.value.level_name,
        players_count                     : this.createteamForm.value.player.length,
        sport_name                        : ((sportsName != '') ? sportsName : ''),
        season_start_date                 : ((startDate != '') ? startDate : ''),
        organization_id                   : this.orgId,        
        season_end_date                   : ((enddate != '') ? enddate : ''),
        isMaster                          : true,
        season_lable                      : ((seasonName != '') ? seasonName : ''),
        coaches_count                     : this.createteamForm.value.coach.length,
        sport_id                          : this.createteamForm.value.sport_id,
        level                             : this.createteamForm.value.level_name,
        team_name                         : this.createteamForm.value.team_name,
        team_id                           : '',
        level_id                          : this.createteamForm.value.level_id,
        isActive                          : false,
        organization_name                 : this.orgName
  
      }
      /* var playerJson = {
        players_count: this.createteamForm.value.player.length,
        display_name : 'Players',
        user_list :this.createteamForm.value.player,
        season_id: this.createteamForm.value.season_id,
        sport_id: this.createteamForm.value.sport_id,
        people_id : 'player',
        organization_id: this.orgId,
      } 
      console.log('----playerJson----', playerJson)*/
      console.log('----jsonObj----', jsonObj)

      this.restApiService.create('teams',jsonObj).subscribe( res => {

        if( res._id )
        {
          var playerJson = {
            players_count: this.createteamForm.value.player.length,
            display_name : 'Players',
            user_list :this.createteamForm.value.player,
            season_id: this.createteamForm.value.season_id,
            sport_id: this.createteamForm.value.sport_id,
            people_id : 'player',
            organization_id: this.orgId,
            team_id: res._id
          }
  
          var coachJson = {
            players_count: this.createteamForm.value.coach.length,
            display_name : 'Coaches',
            user_list : this.createteamForm.value.coach,
            season_id: this.createteamForm.value.season_id,
            sport_id: this.createteamForm.value.sport_id,
            people_id : 'coach',
            organization_id: this.orgId,
            team_id: res._id
          }
      
          var managerJson = {
            players_count: this.createteamForm.value.manager.length,
            display_name : 'Managers',
            user_list : this.createteamForm.value.manager,
            season_id: this.createteamForm.value.season_id,
            sport_id: this.createteamForm.value.sport_id,
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

            this.router.navigate(['/teams/list']);

          }, error =>{
            console.log('---error team member API----', error)
          })

        }
        

      }, e =>{
        console.log('----API error---')
      })
       return false;
    /* this.displayLoader = true;
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
      "tag_name": form.value.tag_name,
      "sport_id": form.value.sport_id,
      "sport_name": form.value.sport_name,
      "is_active": true,
      "is_deleted": false,
      "organization_id": this.orgId,
      "created_datetime": new Date(),
      "created_uid": this.uid,
      "updated_datetime": new Date(),
      "updated_uid": "",
      "sort_order": 0,
    }

    //console.log(insertObj); return false;

      let createObjRoot = await this.db.collection('Tags').add(insertObj);
      await createObjRoot.set({ tag_id: createObjRoot.id }, { merge: true });
      
      this.router.navigate(['/tags/list']);

      this.notification.isNotification(true, "Tag Data", "Tag has been added successfully.", "check-square");
      
    } catch (error) {
      
      console.log(error);
       
    } */
  }

  /* listTag(){
    this.router.navigate(['/tags/list']);
  }

  addTag(){
    this.router.navigate(['/tags/createlist']);
  }
  
  viewTag(resourceId: string){
    this.router.navigate(['/tags/viewlist/'+resourceId]);
  }
  
  editTag(resourceId: string){
    this.router.navigate(['/tags/editlist/'+resourceId]);
  }

  async deleteTag(resourceId: string, resourceName: string){
    
    try {
      this.notification.isConfirmation('', '', 'Tags Data', ' Are you sure to delete ' + resourceName + ' ?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then(async (dataIndex) => {
        if (dataIndex[0]) {
          console.log("yes");
          await this.db.collection('Tags').doc(resourceId).delete();
          this.notification.isNotification(true, "Tags Data", "Tags Data has been deleted successfully.", "check-square");
          this.refreshPage();
        } else {
          console.log("no");
        }
      }, (err) => {
        console.log(err);
      })
    } catch (error) {
      console.log(error);
      this.notification.isNotification(true, "Tags Data", "Unable to delete.Please try again later.", "times-circle");
    }
  }
 
 refreshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/tags/list']);
} */


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

noPlayer: boolean = false;
allPlayerListCompare: any = [];

choosenPlayersArr: any = [];
choosenCoachesArr: any = [];
choosenManagersArr: any = [];

choosenPlayers: any;
selectPlayers: boolean = false;
choosenCoaches: any;
selectCoaches: boolean = false;
choosenManagers: any;
selectManagers: boolean = false;


increaseHeight(id, classHeight) {
  /*
  setTimeout(() => {
    if (this.router.url.includes('teams')) {
      var elmnt = document.getElementById(id);
      console.log(elmnt);
      console.log(elmnt.clientHeight);
      document.getElementById(classHeight).style.height = elmnt.clientHeight + "px";
    }
  }, 10);
  */
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

removePlayer(playerIndex, line) {
  console.log(this.allPlayerList);
  if (this.allPlayerList) {
    this.allPlayerList.forEach(player => {
      if (this.createteamForm.controls['player'].value[playerIndex].user_id === player.user_id) {
        player['disabled'] = false
      }
    })
    console.log(this.allPlayerList);
  }
  this.allPlayerListCompare.forEach(element => {
    if (this.createteamForm.controls['player'].value[playerIndex].user_id === element.user_id) {
      this.allPlayerList.push(element);
      this.noPlayer = false;
    }
  })
  $("select option[value= '" + line.value.id + "']").prop("selected", false);
  $('#player_select').multiSelect('refresh');
  this.playerArr.removeAt(playerIndex);
  if (this.playerArr.length !== 0) {
    this.createteamForm.patchValue({
      players_count: this.playerArr.length
    })
  } else {
    this.createteamForm.patchValue({
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
    this.createteamForm.patchValue({
      coaches_count: this.coachArr.length
    })
  } else {
    this.createteamForm.patchValue({
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
    this.createteamForm.patchValue({
      managers_count: this.managerArr.length
    })
  } else {
    this.createteamForm.patchValue({
      managers_count: ''
    })
  }

  this.increaseHeight("Manager", "label-manager");
}

getPlayerList(playerArr) {
  this.selectPlayers = false

  if (playerArr.length != 0) {
    playerArr.forEach((selected_player, index) => {
      if (this.createteamForm.controls['player'].value.length === 0) {
        console.log(this.createteamForm.controls['player'].value.length, "length0")
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
        this.createteamForm.patchValue({
          players_count: this.createteamForm.controls['player'].value.length
        })
      }
      else {
        // console.log(this.createteamForm.controls['player'].value)
        let filteredItem = this.createteamForm.controls['player'].value.filter(item => item.user_id === selected_player);
        console.log(filteredItem)

        if (filteredItem.length != 0) {

        } else {
          console.log(this.createteamForm.controls['player'].value.length, "length1")
          let length = this.createteamForm.controls['player'].value.length;
          console.log(length);

          this.playerArr.push(this.player())
          let filterValue = this.playerList.filter(
            item => item.user_id === selected_player);
          this.playerArr.at(length).patchValue({
            selectChange: true,
          })
          this.playerArr.at(length).patchValue(filterValue[0]);

          this.createteamForm.patchValue({
            players_count: this.createteamForm.controls['player'].value.length
          })
          //this.disableCol(this.playerArr, length, 'first_name')
          //this.increaseHeight("Player", "label-player");
        }
        console.log(this.createteamForm)
      }

    });
  }

  if (playerArr.length < this.createteamForm.controls['player'].value.length) {
    let userId = this.createteamForm.controls['player'].value.map(item => item.user_id)
    console.log(userId);
    let diff: any[] = userId.concat(playerArr).filter((val) => {
      return !(userId.includes(val) && playerArr.includes(val));
    });
    console.log(this.createteamForm.value);
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
          this.playerArr.removeAt(this.createteamForm.controls['player'].value.findIndex(item => item.user_id === element));
        }
      }
    });
    this.createteamForm.patchValue({
      players_count: this.createteamForm.controls['player'].value.length
    })
    this.increaseHeight("Player", "label-player");
  }
}


getCoachList(coachArr) {

  this.selectCoaches = false
   console.log(coachArr);
  this.createteamForm.patchValue({
    coaches_count: coachArr.length
  })
  if (coachArr.length != 0) {

    coachArr.forEach((selected_player, index) => {

      // console.log((this.createteamForm.controls['player'].value))
      if (this.createteamForm.controls['coach'].value.length === 0) {
        this.coachArr.push(this.coach())
        let filteredValue = this.coachList.filter(
          item => item.user_id === selected_player);
        //console.log(filteredValue)

        this.coachArr.patchValue(filteredValue);
        //this.disableCol(this.coachArr, 0, 'first_name')
        this.increaseHeight("Coach", "label-coach");
      }
      else {
        // console.log(this.createteamForm.controls['player'].value)
        let filteredItem = this.createteamForm.controls['coach'].value.filter(item => item.user_id === selected_player);
        //console.log(filteredItem)

        if (filteredItem.length != 0) {

        } else {
          // console.log(this.createteamForm.controls['player'].value.length)
          let length = this.createteamForm.controls['coach'].value.length
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

  if (coachArr.length < this.createteamForm.controls['coach'].value.length) {
    let userId = this.createteamForm.controls['coach'].value.map(item => item.user_id)
    // console.log(userId);
    let diff: any[] = userId.concat(coachArr).filter((val) => {
      return !(userId.includes(val) && coachArr.includes(val));
    });
    // console.log(diff,"diff");
    diff.forEach(element => {
      this.coachArr.removeAt(this.createteamForm.controls['coach'].value.findIndex(item => item.user_id === element))
    });
    this.increaseHeight("Coach", "label-coach");
  }
  console.log(this.createteamForm);
}

getManagerList(managerArr) {
  this.selectManagers = false
  // console.log(playerArr);
  this.createteamForm.patchValue({
    managers_count: managerArr.length
  })
  if (managerArr.length != 0) {

    managerArr.forEach((selected_player, index) => {

      // console.log((this.createteamForm.controls['player'].value))
      if (this.createteamForm.controls['manager'].value.length === 0) {
        this.managerArr.push(this.manager())
        let filteredValue = this.managerList.filter(
          item => item.user_id === selected_player);
        //console.log(filteredValue)

        this.managerArr.patchValue(filteredValue);
        //this.disableCol(this.managerArr, 0, 'first_name')
        this.increaseHeight("Manager", "label-manager");
      }
      else {
        // console.log(this.createteamForm.controls['player'].value)
        let filteredItem = this.createteamForm.controls['manager'].value.filter(item => item.user_id === selected_player);
        //console.log(filteredItem)

        if (filteredItem.length != 0) {

        } else {
          // console.log(this.createteamForm.controls['player'].value.length)
          let length = this.createteamForm.controls['manager'].value.length
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

  if (managerArr.length < this.createteamForm.controls['manager'].value.length) {
    let userId = this.createteamForm.controls['manager'].value.map(item => item.user_id)
    // console.log(userId);
    let diff: any[] = userId.concat(managerArr).filter((val) => {
      return !(userId.includes(val) && managerArr.includes(val));
    });
    // console.log(diff,"diff");
    diff.forEach(element => {
      this.managerArr.removeAt(this.createteamForm.controls['manager'].value.findIndex(item => item.user_id === element))
    });
    this.increaseHeight("Manager", "label-manager");
  }

  // console.log(this.createteamForm);
}

 
}
