import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, Injector } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbDateParserFormatter, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/shared/shared.service';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgiNotificationService } from 'ngi-notification';
declare var $: any;
declare var jQuery: any;
import { DbService } from 'src/app/core/services/db.service';
import { TeamService } from '../team-service';
import { DropdownService } from 'src/app/core/services/dropdown.service';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Logoinfo } from '../../logoinfo.interface';
@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.scss']
})
export class TeamEditComponent implements OnInit {
  @Output() change = new EventEmitter();
  submitted = false;
  error = '';
  isSaveUp: boolean = false;
  saves: boolean = false;
  loaderInfo = new BehaviorSubject<Logoinfo>({ progressBarLoading: 0, statusOfProgress: Constant.gridLoadingMsg });
  loading = false;
  displayLoader: any = true;
  updateTeamForm: FormGroup;
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
  ]
  orgId: any;
  sportId: any;
  height: any = [
    { value: "ft", name: 'in', weight: 'lbs' },
    { value: "m", name: 'cm', weight: 'kg' },
  ]
  choosenPlayers: any;
  selectPlayers: boolean = false;
  choosenCoaches: any;
  selectCoaches: boolean = false;
  choosenManagers: any;
  selectManagers: boolean = false
  data: any;
  playerList: any[] = [];
  managerList: any[] = [];
  coachList: any[] = [];
  positionList: any[] = [];
  teamInfo: any = {};
  teamInfoById: any = [];
  playerCountAtFirst: any;
  noPlayer: boolean = false;
  noCoach: boolean = false;
  noManager: boolean = false;
  injectedData: any;
  allPlayerList: any = [];
  columnWidth: any = '100';
  suspendChangeUpdate: any = false;
  suspendModalConfigs: any = {
    title: "Suspension Details"
  };
  suspensionTypeList: any = [
    { id: "season", name: "Season End Date" },
    { id: "custom", name: "Custom Date" }
  ];
  todayDate: any = new Date();
  seasonEndDate: any;
  constructor(private dropDownService: DropdownService, private db: DbService, private modalConfig: NgbModalConfig, private modalService: NgbModal, private notification: NgiNotificationService, private injector: Injector, public changeRef: ChangeDetectorRef, public cookieService: CookieService, private sharedService: SharedService, private parserFormatter: NgbDateParserFormatter, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService, public teamService: TeamService) {
    this.modalConfig.backdrop = 'static';
    this.modalConfig.keyboard = false;
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data: any) => {
      if (data) {
        if (data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
        } else if (data == "teamRouter") {
          this.change.emit({ action: "teamgrid", data: null })
        }
      }
    })
  }

  ngOnInit() {
    this.injectedData = this.injector.get('injectData')
    this.orgId = localStorage.getItem('org_id')
    this.updateTeamForm = this.formBuilder.group({
      auth_uid: [''],
      organization_id: [''],
      sport_id: [null],
      sport_name: [''],
      season_lable: [''],
      level_name: [''],
      season_id: [null],
      level_id: [null],
      team_name: [''],
      team_id: [''],
      players_count: ['', [Validators.required]],
      coaches_count: ['', [Validators.required]],
      managers_count: ['', [Validators.required]],
      player: this.formBuilder.array([this.player()]),
      coach: this.formBuilder.array([this.coach()]),
      manager: this.formBuilder.array([this.manager()]),
      created_datetime: ['']
    });
    this.uid = this.cookieService.getCookie('uid');
    this.updateTeamForm.patchValue({
      uid: this.uid
    })
    this.getAlignedColumnSize("6");
    if (this.injectedData.data) {
      this.seasonEndDate = this.injectedData.data.season_end_date.toDate();
      this.teamInfo = {
        "auth_uid": this.uid,
        "organization_id": this.orgId,
        "sport_id": this.injectedData.data.sport_id,
        "season_id": this.injectedData.data.season_id,
        "level_id": this.injectedData.data.level_id,
        "level_name": this.injectedData.data.level,
        "team_id": this.injectedData.data.team_id,
        "teamName": this.injectedData.data.team_name,
        "sportName": this.injectedData.data.sport_name,
        "seasonTitle": this.injectedData.data.season_lable
      }
      if (this.teamInfo) {
        this.getMembersByOrg(this.orgId, this.injectedData.data.sport_id, this.injectedData.data.season_id);
        this.getTeamInfoById(this.teamInfo)
        this.getPositionBySport(this.injectedData.data.sport_id)

      }
    }
  }
  get f() { return this.updateTeamForm.controls; }

  get playerArr() {
    return this.updateTeamForm.get('player') as FormArray;
  }
  get coachArr() {
    return this.updateTeamForm.get('coach') as FormArray;
  }
  get managerArr() {
    return this.updateTeamForm.get('manager') as FormArray;
  }

  getAlignedColumnSize(columnlength) {
    if (columnlength != 0) {
      this.columnWidth = Math.floor(100 / columnlength);
    }
  }

  coach() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null, [Validators.required]],
      role: '',
      middle_initial: "",
      last_name: "",
      suffix: "",
      title: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      is_existing: false,
      is_alreadyExist: false,
      is_suspended: false,
      is_terminated: false,
      terminated_datetime: '',
      // suspended_datetime: "",
      suspension_start_date: "",
      suspension_end_date: "",
      duplicateRecord: ''
    });
  }

  player() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null, [Validators.required]],
      middle_initial: "",
      last_name: "",
      suffix: "",
      position_list: ['', [Validators.required]],
      is_existing: false,
      is_alreadyExist: false,
      is_suspended: false,
      is_terminated: false,
      terminated_datetime: '',
      // suspended_datetime: "",
      suspension_start_date: "",
      suspension_end_date: "",
      duplicateRecord: false,
      role: '',
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
    })
  }
  manager() {
    return this.formBuilder.group({
      user_id: "",
      first_name: [null, [Validators.required]],
      middle_initial: "",
      last_name: "",
      role: '',
      suffix: "",
      is_existing: false,
      is_alreadyExist: false,
      is_suspended: false,
      is_terminated: false,
      terminated_datetime: '',
      // suspended_datetime: "",
      suspension_start_date: "",
      suspension_end_date: "",
      duplicateRecord: ''
    })
  }
  positions() {
    return this.formBuilder.group({
      position_id: [""],
      position_name: ['', [Validators.required]],
      abbreviation: "",
    })
  }
  timerFunction(loaderInfo, type) {
    let getObjectValue = loaderInfo.value.progressBarLoading + 10;
    if (type === "initial") {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.gridLoadingMsg });
    } else {
      loaderInfo.next({ progressBarLoading: getObjectValue, statusOfProgress: Constant.msgForUpdating });
    }
  }
  async getTeamInfoById(teamInfo: any) {
    this.loading = true;
    let loaderToGetInfo = setInterval(this.timerFunction, 100, this.loaderInfo, "initial");
    let getTeamInfoIndividual: any = await this.db.getTeamByUid(teamInfo);
    try {
      if (getTeamInfoIndividual) {
        if (getTeamInfoIndividual.status) {
          getTeamInfoIndividual.data.sport = getTeamInfoIndividual.data.sport.replace('_', ' ');
          this.teamInfoById = getTeamInfoIndividual.data;
          if (this.teamInfoById) {
            this.loadForm(this.teamInfoById)
          }
          this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
        } else {
          this.teamInfoById = [];
          this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
        }
      } else {
        this.teamInfoById = [];
        this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
      }
    } catch (error) {
      console.log(error);
      this.teamInfoById = [];
      this.afterLoadingIndividualTeamInfo(loaderToGetInfo)
    }
  }
  afterLoadingIndividualTeamInfo(loaderToGetInfo?: any) {
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderToGetInfo);
    this.loading = false;
    this.displayLoader = false;

  }
  loadForm(teamData: any) {
    teamData.Players.forEach((element, index) => {
      this.playerArr.push(this.player());
      if (element.middle_initial) {
        element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name;
      } else {
        element['name'] = element.first_name + ' ' + element.last_name;
      }
      element.disabled = true;
      this.allPlayerList.push(element);
      this.increaseHeight("Player", "label-player");
    });
    this.playerArr.patchValue(teamData.Players);
    this.playerArr['controls'].forEach((playerInfo, playerIndex) => {
      if (playerInfo['controls'].is_terminated.value) {
        this.disableCol(this.playerArr, playerIndex, 'weight');
        this.disableCol(this.playerArr, playerIndex, 'position_list');
        this.disableCol(this.playerArr, playerIndex, 'height');
        this.disableCol(this.playerArr, playerIndex, 'shoot');
      } if (playerInfo['controls'].is_suspended.value) {
        this.disableCol(this.playerArr, playerIndex, 'weight');
        this.disableCol(this.playerArr, playerIndex, 'position_list');
        this.disableCol(this.playerArr, playerIndex, 'height');
        this.disableCol(this.playerArr, playerIndex, 'shoot');
      }
      if (!playerInfo['controls'].first_name.disabled) {
        playerInfo['controls'].first_name.disable();
      }
    });

    /** Player Information Binding */
    teamData.Players.forEach((player, index) => {
      player.positions.forEach(position => {
        let isExistPositions = this.playerArr.at(index).get('positions').value.filter(item => item.position_id === position.position_id)
        if (isExistPositions.length != 0) {
        } else {
          (this.playerArr.at(index).get('positions') as FormArray).push(this.positions());
          let lh = this.playerArr.at(index).get('positions').value.length;
          (this.playerArr.at(index).get('positions') as FormArray).at(lh - 1).patchValue(position)
        }
      });
      let mapValue = this.playerArr.at(index).get('positions').value.map(item => item.position_id);
      this.playerArr.at(index).patchValue({
        position_list: mapValue,
        is_existing: true,
        is_alreadyExist: true
      })
    });
    /** Endof Player Information Binding */

    /** Coach Information  */
    teamData.Coaches.forEach((coach, index) => {
      this.coachArr.push(this.coach()); //Coach row Initiation
      this.increaseHeight("Coach", "label-coach"); // adjusted Rows
      this.coachArr.at(index).patchValue({
        is_existing: true,
        is_alreadyExist: true
      })
    });
    this.coachArr.patchValue(teamData.Coaches); // Get Response Patch value
    this.coachArr['controls'].forEach((coachInfo, coachIndex) => {
      if (coachInfo['controls'].is_suspended.value || coachInfo['controls'].is_terminated.value) {
        this.disableCol(this.coachArr, coachIndex, 'title')
      }
      if (!coachInfo['controls'].first_name.disabled) {
        coachInfo['controls'].first_name.disable();
      }
    })
    /** Endof Coach Information  */

    /** Manager Informations */
    teamData.Managers.forEach((mang, index) => {
      this.managerArr.push(this.manager());
      this.increaseHeight("Manager", "label-manager");
      this.managerArr.at(index).patchValue({
        is_existing: true,
        is_alreadyExist: true
      })
    });
    this.managerArr.patchValue(teamData.Managers);
    this.managerArr['controls'].forEach(managerInfo => {
      if (!managerInfo['controls'].first_name.disabled) {
        managerInfo['controls'].first_name.disable();
      }
    })
    /** Endof Manager Information Bindings */

    console.log(this.updateTeamForm.value);
  }

  datePickerInitiate(showDate = null) {
    if (showDate) {
      $('#datetime-datepicker').flatpickr({
        enableTime: false,
        dateFormat: "m-d-Y",
        minDate: "today",
        maxDate: this.seasonEndDate,
        defaultDate: this.seasonEndDate
      });
    } else {
      $('#datetime-datepicker').flatpickr({
        enableTime: false,
        dateFormat: "m-d-Y",
        minDate: "today",
        maxDate: this.seasonEndDate
      });
    }

  }
  async getMembersByOrg(orgId, sportId, seasonId) {
    try {
      let queryObj = {
        'auth_uid': this.uid,
        'organization_id': orgId,
        'sport_id': sportId,
        'season_id': seasonId,
        'level_id': sportId,
        'team_id': this.teamInfo.team_id
      }
      let res = await this.teamService.getMembersByOrganization(queryObj);
      if (res.status) {
        this.allPlayerList = res.data.playerList;

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
            });

          }
          if (this.teamInfoById) {
            if (this.teamInfoById.Players) {
              this.teamInfoById.Players.forEach((element, index) => {
                if (element.middle_initial) {
                  element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name;
                } else {
                  element['name'] = element.first_name + ' ' + element.last_name;
                }
                element.disabled = true;
                this.allPlayerList.push(element);
              });
              this.playerList = this.allPlayerList;
            }
          }
        }

        this.coachList = res.data.coach;
        if (this.coachList) {
          this.coachList.forEach(element => {
            if (element.suffix) {
              element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix
            }
            else {
              element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
            }
          });
          this.disableOptions('coach', this.coachList);
        }
        else {
          this.coachList = [];
        }
        if (this.teamInfoById) {
          if (this.teamInfoById.Coaches) {
            this.teamInfoById.Coaches.forEach((element, index) => {
              if (element.middle_initial) {
                element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name;
              } else {
                element['name'] = element.first_name + ' ' + element.last_name;
              }
              element.disabled = true;
              this.coachList.push(element);
            });
          }
        }
        this.managerList = res.data.manager;
        if (this.managerList) {

          this.managerList.forEach(element => {
            if (element.suffix) {
              element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name + ' ' + element.suffix
            }
            else {
              element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name
            }
          });
          this.disableOptions('manager', this.managerList);
        }
        else {
          this.managerList = [];
        }
        if (this.teamInfoById) {
          if (this.teamInfoById.Managers) {
            this.teamInfoById.Managers.forEach((element, index) => {
              if (element.middle_initial) {
                element['name'] = element.first_name + ' ' + element.middle_initial + ' ' + element.last_name;
              } else {
                element['name'] = element.first_name + ' ' + element.last_name;
              }
              element.disabled = true;
              this.managerList.push(element);
            });
          }
        }

      }
      else {
        this.playerList = [];

        this.coachList = [];
        this.managerList = [];
      }
    } catch (error) {
      console.log(error)
    }



  }
  addCoach() {
    if (this.coachList.length === 0) {
      this.noCoach = true
    }
    else if (this.updateTeamForm.controls['coach'].value.length === this.coachList.length && this.coachList.length !== 0) {
      this.noCoach = true
    }
    else {
      this.noCoach = false
      this.coachArr.push(this.coach())
    }
    this.increaseHeight("Coach", "label-coach");
  }
  removeCoach(index) {
    this.noCoach = false;
    this.coachList.forEach(player => {

      if (this.updateTeamForm.controls['coach'].value[index].user_id === player.user_id) {
        player['disabled'] = false
      }
    })
    this.coachArr.removeAt(index);
    this.increaseHeight("Coach", "label-coach");
  }
  suspendCoach(index, rowData, modalContent) {
    setTimeout(() => {
      this.datePickerInitiate();
    }, 400);
    this.suspendModalConfigs.isDetailViewer = false;
    this.suspendModalConfigs.action = 'coach';
    this.suspendModalConfigs.name = rowData['controls'].first_name.value + ' ' + rowData.value.middle_initial + ' ' + rowData.value.last_name;
    this.suspendModalConfigs.data = rowData.value;
    this.suspendModalConfigs.suspended_datetime = '';
    this.suspendModalConfigs.index = index;
    this.suspendModalConfigs.enable = true;
    this.suspendChangeUpdate = false;

    this.modalService.open(modalContent, { size: 'lg' });
  }
  undoCoach(index, rowData) {
    this.notification.isConfirmation('', '', 'Coach Suspended', ' Are you sure to undo the changes?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then((dataIndex) => {
      if (dataIndex[0]) {
        this.coachArr.at(index).patchValue({
          is_suspended: false,
          // suspended_datetime: "",
          suspension_start_date: "",
          suspension_end_date: "",
        })
        this.enableCol(this.coachArr, index, 'title');
      } else {
        /** Do nothing */
      }

    }, (err) => {
      console.log(err);
    })
  }
  addManager() {
    if (this.managerList.length === 0) {
      this.noManager = true
    }
    else if (this.updateTeamForm.controls['manager'].value.length === this.managerList.length && this.managerList.length !== 0) {
      this.noManager = true
    }
    else {
      this.noManager = false
      this.managerArr.push(this.manager())
    }
    this.increaseHeight("Manager", "label-manager");
  }
  removeManager(index) {
    this.noManager = false
    // console.log(this.updateTeamForm.controls['coach'].value[index].user_id)

    this.managerList.forEach(player => {

      if (this.updateTeamForm.controls['manager'].value[index].user_id === player.user_id) {
        player['disabled'] = false
      }
    })
    this.managerArr.removeAt(index)
    this.increaseHeight("Manager", "label-manager");

  }
  suspendManager(index, rowData, modalContent) {
    setTimeout(() => {
      this.datePickerInitiate();
    }, 400);

    this.suspendModalConfigs.isDetailViewer = false;
    this.suspendModalConfigs.action = 'manager';
    this.suspendModalConfigs.name = rowData['controls'].first_name.value + ' ' + rowData.value.middle_initial + ' ' + rowData.value.last_name;
    this.suspendModalConfigs.data = rowData.value;
    this.suspendModalConfigs.suspended_datetime = '';
    this.suspendModalConfigs.index = index;
    this.suspendModalConfigs.enable = true;
    this.suspendChangeUpdate = false;
    this.modalService.open(modalContent, { size: 'lg' });
  }
  undoManager(index, rowData) {
    this.notification.isConfirmation('', '', 'Player Suspended', ' Are you sure to undo the changes?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then((dataIndex) => {
      if (dataIndex[0]) {
        this.managerArr.at(index).patchValue({
          is_suspended: false,
          // suspended_datetime: "",
          suspension_start_date: "",
          suspension_end_date: "",
        })
      } else {
        /** Do nothing */
      }

    }, (err) => {
      console.log(err);
    })
  }

  increaseHeight(id, classHeight) {
    setTimeout(() => {
      if (this.router.url.includes('teams')) {
        var elmnt = document.getElementById(id);
        document.getElementById(classHeight).style.height = elmnt.clientHeight + "px";
      }
    }, 5);

  }
  addPlayer() {
    if (this.allPlayerList.length === 0) {
      this.noPlayer = true
    }
    else if (this.updateTeamForm.controls['player'].value.length === this.allPlayerList.length && this.allPlayerList.length !== 0) {
      this.noPlayer = true
    }
    else {
      this.noPlayer = false;
      this.playerArr.push(this.player())
    }
    this.increaseHeight("Player", "label-player");
    // console.log(this.updateTeamForm)
  }
  removePlayer(index, line) {
    this.noPlayer = false;
    this.allPlayerList.forEach(player => {
      if (this.updateTeamForm.controls['player'].value[index].user_id === player.user_id) {
        player.disabled = false;
      }
    })
    this.playerList.forEach(element => {
      if (this.updateTeamForm.controls['player'].value[index].user_id === element.user_id) {
        element.disabled = false;
        this.allPlayerList.push(element);
      }
    })
    this.playerArr.removeAt(index)
    this.increaseHeight("Player", "label-player");
  }

  onSuspensionTypeChange(event, suspendModalConfigs) {
    if (event) {
      if (event.id == "season") {
        this.suspendChangeUpdate = true;
        setTimeout(() => {
          this.datePickerInitiate(this.seasonEndDate);
        }, 400);
        this.suspendModalConfigs.suspended_datetime = this.seasonEndDate;
        this.suspendModalConfigs.enable = true;

      } else if (event.id == "custom") {
        this.suspendChangeUpdate = false;
        setTimeout(() => {
          this.datePickerInitiate();
        }, 400);
        this.suspendModalConfigs.suspended_datetime = '';
        this.suspendModalConfigs.enable = false;
      }
    } else {
      this.suspendModalConfigs.suspended_datetime = '';
      this.suspendChangeUpdate = false;
      this.suspendModalConfigs.enable = true;
    }
  }

  suspendedDate(event, suspendConfig) {
    if (event.target.value) {
      console.log(suspendConfig.suspended_datetime, "date");
      suspendConfig.suspended_datetime = event.target.value
      if (suspendConfig.suspended_datetime) {
        this.suspendChangeUpdate = true;
      }
    } else {
      this.suspendChangeUpdate = false;
    }
  }
  suspendUserDetail(suspendConfig) {

    let action: any = suspendConfig.action;
    let suspenedDate: any = new Date(suspendConfig.suspended_datetime);

    if (action == "player") {
      this.playerArr.at(suspendConfig.index).patchValue({
        is_suspended: true,
        is_alreadyExist: false,
        suspension_start_date: new Date(),
        suspension_end_date: suspenedDate,

      })
      this.disableCol(this.playerArr, suspendConfig.index, 'weight');
      this.disableCol(this.playerArr, suspendConfig.index, 'position_list');
      this.disableCol(this.playerArr, suspendConfig.index, 'height');
      this.disableCol(this.playerArr, suspendConfig.index, 'shoot');
      this.modalService.dismissAll();
      this.suspendChangeUpdate = false;

    } else if (action == "coach") {
      this.coachArr.at(suspendConfig.index).patchValue({
        is_suspended: true,
        is_alreadyExist: false,
        // suspended_datetime: suspenedDate
        suspension_start_date: new Date(),
        suspension_end_date: suspenedDate,
      })
      this.disableCol(this.coachArr, suspendConfig.index, 'title')
      this.modalService.dismissAll();
      this.suspendChangeUpdate = false;
    } else if (action == "manager") {
      this.managerArr.at(suspendConfig.index).patchValue({
        is_suspended: true,
        is_alreadyExist: false,
        // suspended_datetime: suspenedDate,
        suspension_start_date: new Date(),
        suspension_end_date: suspenedDate,
      })
      this.modalService.dismissAll();
      this.suspendChangeUpdate = false;
    }

  }

  userInfo(index, userData, modalContent) {
    this.suspendModalConfigs.isDetailViewer = true;
    userData['controls'].suspension_end_date.value = userData['controls'].suspension_end_date.value.toDate();
    this.suspendModalConfigs.name = userData['controls'].first_name.value + ' ' + userData.value.middle_initial + ' ' + userData.value.last_name;
    this.suspendModalConfigs.data = userData.value;
    this.suspendModalConfigs.index = index;
    this.suspendModalConfigs.suspension_end_date = moment(userData['controls'].suspension_end_date.value).format('MMMM DD, YYYY').toString(),
      this.suspendChangeUpdate = false;
    // this.suspendModalConfigs.enable = true;

    this.modalService.open(modalContent, { size: 'lg' });
  }

  suspendPlayer(index, rowData, modalContent) {
    setTimeout(() => {
      this.datePickerInitiate();
    }, 400);

    this.suspendModalConfigs.isDetailViewer = false;
    this.suspendModalConfigs.action = 'player';
    this.suspendModalConfigs.name = rowData['controls'].first_name.value + ' ' + rowData.value.middle_initial + ' ' + rowData.value.last_name;
    this.suspendModalConfigs.data = rowData.value;
    this.suspendModalConfigs.suspended_datetime = '';
    this.suspendModalConfigs.index = index;
    this.suspendModalConfigs.enable = true;
    this.suspendChangeUpdate = false;

    this.modalService.open(modalContent, { size: 'lg' });
  }

  undoPlayer(index, rowData) {
    this.notification.isConfirmation('', '', 'Player Suspended', ' Are you sure to undo the changes?', 'question-circle', 'Yes', 'No', 'custom-ngi-confirmation-wrapper').then((dataIndex) => {
      if (dataIndex[0]) {
        this.playerArr.at(index).patchValue({
          is_suspended: false,
          // suspended_datetime: "",
          suspension_start_date: "",
          suspension_end_date: "",
        })
        this.enableCol(this.playerArr, index, 'weight')
        this.enableCol(this.playerArr, index, 'position_list')
        this.enableCol(this.playerArr, index, 'height')
        this.enableCol(this.playerArr, index, 'shoot')
      } else {
        /** Do nothing */
      }

    }, (err) => {
      console.log(err);
    })
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

  selectedPlayer(event, form, rowIndex) {

    if (event) {
      this.selectPlayers = false;
      let isExit = this.playerArr.value.filter(item => item.user_id === event.user_id)
      if (isExit.length != 0) {
        this.playerArr.at(rowIndex).patchValue({
          duplicateRecord: true
        })
        this.disableCol(this.playerArr, rowIndex, 'weight')
        this.disableCol(this.playerArr, rowIndex, 'position_list')
        this.disableCol(this.playerArr, rowIndex, 'height')
        this.disableCol(this.playerArr, rowIndex, 'shoot')
      } else {
        this.playerArr.at(rowIndex).patchValue({
          duplicateRecord: false
        })
        this.playerArr.at(rowIndex).patchValue(event)
        // this.disableOptions('player',this.allPlayerList);
        this.enableCol(this.playerArr, rowIndex, 'weight')
        this.enableCol(this.playerArr, rowIndex, 'position_list')
        this.enableCol(this.playerArr, rowIndex, 'height')
        this.enableCol(this.playerArr, rowIndex, 'shoot')
        this.allPlayerList = this.allPlayerList.filter(item => {
          return item.user_id !== event.user_id
        })

      }
    }


  }
  selectedCoach(event, form, rowIndex) {

    if (event) {
      this.selectCoaches = false;
      let isExit = this.coachArr.value.filter(item => item.user_id === event.user_id)
      if (isExit.length != 0) {
        this.coachArr.at(rowIndex).patchValue({
          duplicateRecord: true
        })
        this.disableCol(this.coachArr, rowIndex, 'title')
      } else {
        this.coachArr.at(rowIndex).patchValue({
          duplicateRecord: false
        })
        this.enableCol(this.coachArr, rowIndex, 'title')
        this.coachArr.at(rowIndex).patchValue(event)
        this.disableOptions('coach', this.coachList);
      }
    }

    else {

    }



  }
  selectedManager(event, form, rowIndex) {
    if (event) {
      this.selectManagers = false
      let isExit = this.managerArr.value.filter(item => item.user_id === event.user_id)
      if (isExit.length != 0) {
        this.managerArr.at(rowIndex).patchValue({
          duplicateRecord: true
        })

      } else {
        this.managerArr.at(rowIndex).patchValue({
          duplicateRecord: false
        })
        this.managerArr.at(rowIndex).patchValue(event)
        this.disableOptions('manager', this.managerList);
      }
    }

  }

  disableOptions(name, list) {
    this.updateTeamForm.controls[name].value.forEach(element => {

      list.forEach(player => {

        if (element.user_id === player.user_id) {
          player['disabled'] = true
        }

      })

    });
  }


  selectedPosition(event, form, row) {

    event.forEach(element => {
      element['position_name'] = element.name
    });

    if (event.length != 0) {

      event.forEach((element, index) => {
        if (this.playerArr.at(row).get('positions').value.length === 1) {
          if (!this.playerArr.at(row).get('positions').value[0].position_id) {
            let filterValue = event.filter(
              item => item.position_id === element.position_id);
            (this.playerArr.at(row).get('positions') as FormArray).patchValue(filterValue)
          }
          else {
            let isExistPosition = this.playerArr.at(row).get('positions').value.filter(item => item.position_id === element.position_id)
            if (isExistPosition.length !== 0) {

            }
            else {
              let filteredValue = event.filter(
                item => item.position_id === element.position_id);
              (this.playerArr.at(row).get('positions') as FormArray).push(this.positions());
              let lh = this.playerArr.at(row).get('positions').value.length;
              (this.playerArr.at(row).get('positions') as FormArray).at(lh - 1).patchValue(filteredValue[0])
            }

          }
        }
        else {

          let isExistPositions = this.playerArr.at(row).get('positions').value.filter(item => item.position_id === element.position_id)

          if (isExistPositions.length != 0) {

          } else {
            let filteredValue = event.filter(
              item => item.position_id === element.position_id);
            (this.playerArr.at(row).get('positions') as FormArray).push(this.positions());

            let lh = this.playerArr.at(row).get('positions').value.length;

            (this.playerArr.at(row).get('positions') as FormArray).at(lh - 1).patchValue(filteredValue[0])
          }
        }
      });
    }

    if (event.length < this.playerArr.at(row).get('positions').value.length) {

      if (event.length >= 0) {
        let userId = this.playerArr.at(row).get('positions').value.map(item => item.position_name)

        let posArr = event.map(item => item.name)
        let diff: any[] = userId.concat(posArr).filter((val) => {
          return !(userId.includes(val) && posArr.includes(val));
        });

        diff.forEach(element => {
          (this.playerArr.at(row).get('positions') as FormArray).removeAt(this.playerArr.at(row).get('positions').value.findIndex(item => item.position_name === element))
        });
      }
      else {

      }

    }

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.datePickerInitiate();
    }, 2000);
  }
  ngAfterContentInit() {
    this.playerArr.removeAt(0);
    this.coachArr.removeAt(0);
    this.managerArr.removeAt(0);
  }

  async getPositionBySport(sportId) {
    this.positionList = [];
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
        form.controls.player.at(index).controls.height.controls.height_main_unit.patchValue('')
        form.controls.player.at(index).controls.height.controls.height_sub_unit.patchValue('')
      }
    }
  }

  async onSubmit(form) {

    this.submitted = true;
    if (form.value.player.length != 0 && this.allPlayerList.length !== 0) {
      this.updateTeamForm.patchValue({
        players_count: form.value.player.length,
      })
    }
    else if (this.allPlayerList.length === 0) {
      this.updateTeamForm.patchValue({
        players_count: form.value.player.length,
      })
    }
    else {
      this.updateTeamForm.patchValue({
        players_count: '',
      })
    }
    if (form.value.coach.length != 0 && this.coachList.length !== 0) {
      this.updateTeamForm.patchValue({
        coaches_count: form.value.coach.length,
      })
    }
    else if (this.coachList.length === 0) {
      this.updateTeamForm.patchValue({
        coaches_count: form.value.coach.length,
      })
    }
    else {
      this.updateTeamForm.patchValue({
        coaches_count: '',
      })
    }
    if (form.value.manager.length != 0 && this.managerList.length !== 0) {
      this.updateTeamForm.patchValue({
        managers_count: form.value.manager.length,
      })
    }
    else if (this.managerList.length === 0) {
      this.updateTeamForm.patchValue({
        managers_count: form.value.manager.length,
      })
    }
    else {
      this.updateTeamForm.patchValue({
        managers_count: '',
      })
    }


    if (form.invalid) {
      if (form.value.players_count === 0 && this.allPlayerList.length !== 0 || form.value.players_count === '' && this.allPlayerList.length !== 0) {
        this.selectPlayers = true
      }
      if (form.value.coaches_count === 0 && this.coachList.length !== 0 || form.value.coaches_count === '' && this.coachList.length !== 0) {
        this.selectCoaches = true
      }
      if (form.value.managers_count === 0 && this.managerList.length !== 0 || form.value.managers_count === "" && this.managerList.length !== 0) {
        this.selectManagers = true
      }
      return
    }
    this.updateTeamForm.patchValue({
      auth_uid: this.uid,
      organization_id: this.orgId,
      season_id: this.teamInfo.season_id,
      sport_id: this.teamInfo.sport_id,
      level_id: this.teamInfo.level_id,
      team_id: this.teamInfo.team_id,
      team_name: this.teamInfo.teamName,
      sport_name: this.teamInfo.sportName,
      season_lable: this.teamInfo.seasonTitle,
      level_name: this.teamInfo.level_name,
      created_datetime: this.injectedData.data.created_datetime
    })
    form.value.player.forEach(element => {
      if (element.role) {
        delete element.role
        element.role = "player"
      }
      else {
        delete element.role;
        element.role = "player"
      }
    });
    form.value.coach.forEach(element => {

      if (element.role) {
        delete element.role
        element.role = "coach"
      }
      else {
        delete element.role;
        element.role = "coach"
      }
    });
    form.value.manager.forEach(element => {

      if (element.role) {
        delete element.role
        element.role = "manager"
      }
      else {
        delete element.role;
        element.role = "manager"
      }
    });
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
      if (!playerInfo['controls'].title.enabled) {
        playerInfo['controls'].title.enable();
      }
    });
    this.managerArr['controls'].forEach(playerInfo => {
      if (!playerInfo['controls'].first_name.enabled) {
        playerInfo['controls'].first_name.enable();
      }
    });
    let playerCount = 0;
    let coachCount = 0;
    let managerCount = 0
    form.value.player.forEach((element, index) => {
      // 
      if (element.user_id) {

      } else {
        this.playerArr.removeAt(index);
        // form.value.player.removeAt(index)
      }
      delete element.position_list;
      delete element.duplicateRecord;
      delete element.is_existing;
      delete element.is_alreadyExist;
      if (!element.is_suspended) {
        playerCount = playerCount + 1;
        form.value['players_count'] = playerCount;
      } else if (form.value.player.length === 1) {
        form.value['players_count'] = playerCount;
      }
    });

    form.value['player'] = form.value.player;

    form.value.coach.forEach((element, index) => {
      if (element.user_id) {

      } else {

        this.coachArr.removeAt(index);
      }
      delete element.is_existing;
      delete element.is_alreadyExist;
      delete element.duplicateRecord;
      if (!element.is_suspended) {
        coachCount = coachCount + 1
        form.value['coaches_count'] = coachCount;
      } else if (form.value.coach.length === 1) {
        form.value['coaches_count'] = coachCount;
      }
    });
    form.value['coach'] = form.value.coach;
    form.value.manager.forEach((element, index) => {
      if (element.user_id) {

      } else {

        this.managerArr.removeAt(index);

      }
      delete element.is_alreadyExist;
      delete element.is_existing;
      delete element.duplicateRecord;
      if (!element.is_suspended) {
        managerCount = managerCount + 1
        form.value['managers_count'] = managerCount;
      } else if (form.value.manager.length === 1) {
        form.value['managers_count'] = managerCount;
      }

    });
    form.value['manager'] = form.value.manager;
    this.reInitialise();
    this.loading = true;
    let loaderWhileUpdate = setInterval(this.timerFunction, 300, this.loaderInfo, "save");
    let updateTeam: any = await this.db.updateTeam(form.value);
    try {
      if (updateTeam) {
        if (updateTeam.status) {
          this.change.emit({ action: "teamgrid", data: this.injectedData.data });
          this.notification.isNotification(true, "Teams", updateTeam.data, "check-square");
          this.loading = false;
          this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
          clearInterval(loaderWhileUpdate);
        } else {
          this.isSuccessFailed(loaderWhileUpdate);
          this.error = updateTeam.error;
        }
      }
    } catch (error) {
      console.log(error);
      this.isSuccessFailed(loaderWhileUpdate);
      this.error = updateTeam.error;
    }
  }

  isSuccessFailed(loaderWhileUpdate?: any) {
    this.submitted = false;         
    this.loaderInfo.next({ progressBarLoading: 100, statusOfProgress: "Loading completed" });
    clearInterval(loaderWhileUpdate);
    this.loading = false;
    this.displayLoader = false;
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  reInitialise() {
    this.displayLoader = true;
    // Reinitializing the loader
    this.loaderInfo.next({ progressBarLoading: 0, statusOfProgress: Constant.msgForUpdating });
  }
  closeError() {
    this.error = '';
  }
  saveUp(value: any) {
    if (value === "up") {
      this.isSaveUp = true;
    } else {
      this.isSaveUp = false;
    }
  }
  goBack() {
    this.change.emit({ action: "teamgrid", data: this.injectedData.data })
    // if (this.injectedData.data.viewBy === "edit") {
    //   this.change.emit({ action: "teamgrid", data: this.injectedData.data })
    // }
    // else {
    //   this.change.emit({ action: "viewteam", data: this.injectedData.data })
    // }
  }

}
