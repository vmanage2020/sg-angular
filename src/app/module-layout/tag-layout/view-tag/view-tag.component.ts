import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { CookieService } from 'src/app/core/services/cookie.service';
import { SharedService } from 'src/app/shared/shared.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { Constant } from 'src/app/core/services/config';

@Component({
  selector: 'app-view-tag',
  templateUrl: './view-tag.component.html',
  styleUrls: ['./view-tag.component.scss']
})
export class ViewTagComponent implements OnInit {
  @Output() change = new EventEmitter();
  submitted = false;
  error = '';
  loading = false;
  uid: any;
  data:any;
  orgId:any;
  injectedData:any;
  constructor(public injector:Injector,public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) { 
    this.uid = this.cookieService.getCookie('uid');
    sharedService.missionAnnounced$.subscribe((data) => {
      if(data){
        this.data=data
         if(this.data.action === "organizationFilter") {
          if(this.data.data.organization_id === Constant.organization_id){
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
      }else{
        this.change.emit({ action: "taggrid" })
      }
          
          } else if(this.data === "tagsRouter") {
            this.change.emit({ action: "taggrid",data: null })
          }
      }
   })
     
  }

  ngOnInit() {
    this.sharedService.announceMission('tag')
    this.orgId = localStorage.getItem('org_id');
    this.injectedData=this.injector.get('injectData')
    console.log(this.injectedData)

  }
  updateTag(){
    this.injectedData.data.viewBy="view";
    console.log(this.injectedData.data)
    this.change.emit({ action: "edittag", data: this.injectedData.data })
  }
  goBack(){
    this.change.emit({ action: "taggrid", data: this.injectedData.data })
  }

}
