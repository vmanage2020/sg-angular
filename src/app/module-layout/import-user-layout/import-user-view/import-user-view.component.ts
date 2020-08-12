import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { DataService } from 'src/app/core/services/data.service';
import {DbService} from 'src/app/core/services/db.service'
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import * as moment from 'moment';
import { apiURL, Constant } from 'src/app/core/services/config';

@Component({
  selector: 'app-import-user-view',
  templateUrl: './import-user-view.component.html',
  styleUrls: ['./import-user-view.component.scss']
})
export class ImportUserViewComponent implements OnInit {
  @Output() change = new EventEmitter();
  sports_id:any;
  season_id:any;
  uid:any;
  loading=false
  importedUserInfo:any;
  data:any;
  injectedData:any;

  constructor(private injector:Injector,private sharedService:SharedService,private dataServices: DataService, public dbService:DbService,public cookieService:CookieService, public router: Router,private activatedRoute: ActivatedRoute) { 
    this.uid = this.cookieService.getCookie('uid')
    sharedService.missionAnnounced$.subscribe((data:any) => {

      if(data){
        // this.data=data
         if(data.action === "organizationFilter") {
          this.sharedService.announceMission('welcome');
          this.router.navigate(['/welcome']);
          } else if(data === "userImportRouter") {
            this.change.emit({ action: "userImport" })
          }
       }
    })
  }

  async ngOnInit() {
    this.sharedService.announceMission('userImport');  
    this.injectedData=this.injector.get('injectData') 
    this.importedUserInfo = this.injectedData.data; 
    // let getUserData = await this.dbService.getUserDetails(this.importedUserInfo.)
    this.importedUserInfo.player_records_created = this.importedUserInfo.player_records_created || 0;
    this.importedUserInfo.player_duplicate_records_found = this.importedUserInfo.player_duplicate_records_found || 0;
    this.importedUserInfo.guardian_records_created = this.importedUserInfo.guardian_records_created || 0;
    this.importedUserInfo.guardian_duplicate_records_found = this.importedUserInfo.guardian_duplicate_records_found || 0;
    this.importedUserInfo.total_user_created = this.importedUserInfo.player_records_created + this.importedUserInfo.player_duplicate_records_found + this.importedUserInfo.guardian_records_created + this.importedUserInfo.guardian_duplicate_records_found;

    if(this.importedUserInfo.season_start_date){
      this.importedUserInfo.season_start_date=moment(this.importedUserInfo.season_start_date).format('MMMM DD, YYYY').toString();
    }  
    if(this.importedUserInfo.season_end_date){
      this.importedUserInfo.season_end_date=moment(this.importedUserInfo.season_end_date).format('MMMM DD, YYYY').toString();
    }
    this.importedUserInfo.imported_datetime = this.importedUserInfo.imported_datetime.toDate();
    if(this.importedUserInfo.imported_datetime instanceof Date){
      let localDate = this.importedUserInfo.imported_datetime.toLocaleDateString() + " " + this.importedUserInfo.imported_datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })
      this.importedUserInfo.imported_datetime = localDate;
    }else{
      this.importedUserInfo.imported_datetime = "-";
    }
   

    if(this.importedUserInfo.erroDes.length){
      if(this.importedUserInfo.erroDes.includes('object')){
        this.importedUserInfo.erroDes = '-';
        // console.log(this.importedUserInfo.erroDes);
        
      }else{
        this.importedUserInfo.erroDes = this.importedUserInfo.erroDes.toString();
      }
     
    } else {
      this.importedUserInfo.erroDes = this.importedUserInfo.erroDes.toString();
    }
    if(this.importedUserInfo.status.length){
     
      this.importedUserInfo.status = this.importedUserInfo.status.toString();
    } else {
      this.importedUserInfo.status = this.importedUserInfo.status.toString();
    }   
    if(this.importedUserInfo.original_status){
      if(this.importedUserInfo.original_status.length){
      this.importedUserInfo.original_status = this.importedUserInfo.original_status.toString();
      } else {
        this.importedUserInfo.original_status = this.importedUserInfo.original_status.toString();
      }
    } 
      
  }

  goBack(){
    this.change.emit({ action: "userImport" })
  }
}
