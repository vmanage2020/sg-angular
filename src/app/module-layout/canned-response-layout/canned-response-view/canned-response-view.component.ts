import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';
import { apiURL, Constant } from 'src/app/core/services/config';

@Component({
  selector: 'app-canned-response-view',
  templateUrl: './canned-response-view.component.html',
  styleUrls: ['./canned-response-view.component.scss']
})
export class CannedResponseViewComponent implements OnInit {
  @Output() change = new EventEmitter();

  submitted = false;
  error = '';
  loading = false;
  uid: any;
  saves: boolean = false;
  cannedResponseInfo:any;
  data: any;
  orgId: any;
  SportsList: any;
  injectData:any;
  cannedResponseId: any;

  constructor(private injector: Injector, public cookieService: CookieService, private sharedService: SharedService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, public dataService: DataService) {
    this.uid = this.cookieService.getCookie('uid');
    this.injectData = this.injector.get('injectData');
    sharedService.missionAnnounced$.subscribe((data) => {
      if (data) {
        this.data = data;
        if (this.data.action === "organizationFilter") {
          if(this.data.data.organization_id === Constant.organization_id){
            this.sharedService.announceMission('welcome');
            this.router.navigate(['/welcome']);
      }else{
        this.change.emit({ action: "cannedResponseGrid" })
      }
        }else if (this.data == "cannedResponseRouter") {
          if(this.injectData){
            this.change.emit({ action: "cannedResponseGrid" , data: this.cannedResponseInfo })
          }  }
      }
    })
  }

  ngOnInit() {
    this.cannedResponseInfo = this.injectData.data; // Id of Canned Response
    this.sharedService.announceMission('cannedResponse');    
    this.orgId = localStorage.getItem('org_id');
   
  }
  navigateView() {
   
    this.cannedResponseInfo.viewBy="view";
    this.change.emit({ action: "cannedResponseUpdate", data: this.cannedResponseInfo })
  }

  goBack() {
    this.change.emit({ action: "cannedResponseGrid", data: this.cannedResponseInfo })
  }

}
