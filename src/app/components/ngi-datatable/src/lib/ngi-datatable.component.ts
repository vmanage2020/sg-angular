import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { NgiDatatableService } from './ngi-datatable.service';
import { HttpParams } from '@angular/common/http';
import { SharedService } from 'src/app/shared/shared.service';
// import { locateHostElement } from '@angular/core/src/render3/instructions';
// import { NgiNotificationService } from 'ngi-notification';
// import { NgiLoggerService } from 'ngi-logger';
// import { AuthService } from 'src/app/auth.service';


@Component({
  selector: 'ngi-datatable',
  templateUrl: './ngi-datatable.component.html',
  styleUrls: ['./ngi-datatable.component.scss']
})
export class NgiDatatableComponent implements OnInit {

  settings: any;
  configType: any;
  showColumns: any;
  dropdownvalue: any;
  @Input('config') config;
  @Output() viewEvent: EventEmitter<any> = new EventEmitter();
  @Output() editEvent: EventEmitter<any> = new EventEmitter();
  @Output() disableEvent: EventEmitter<any> = new EventEmitter();
  @Output() inviewEvent: EventEmitter<any> = new EventEmitter();
  @Output() addviewEvent: EventEmitter<any> = new EventEmitter();

  carddatatableIdentity: string = this.randomGenerator();
  search;
  pagedItemsHeader: any;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  pager: any = {};
  types: any = {
    type: 'BenchmarkingClassification'
  };
  injectData: any;

  errorMessage: string;
  optionSelected: any = null;
  constructor(private injector: Injector, private datatableservice: NgiDatatableService, private sharedService: SharedService, ) {
    sharedService.missionAnnounced$.subscribe(
      data => {        
        if(data === "CREATECONFIG" || data === "EDITCONFIG" || data === "DELETECONFIG"){
          this.initPage();
        } else if(data === "CREATEUSER" || data === "EDITUSER" || data === "DELETEUSER"){
          this.initPage();
        } else if(data === "CREATEROLE" || data === "DELETEROLE" || data === "UPDATEROLE"){
          this.initPage();
        } else if(data === "CREATEPROJECT" || data === "EDITPROJECT" || data === "DELETEPROJECT"){
          this.initPage();
        } else if(data === "CREATEPFCODE" || data === "EDITPFCODE" || data === "DELETEPFCODE"){
          this.initPage();
        } else if(data === "CREATELOVCONTROL" || data === "EDITLOVCONTROL" || data === "DELETELOVCONTROL"){
          this.initPage();
          if (this.config.isDropdown) {
            this.dropdownService();
          }
        } else if(data === "benchmarkingChange") {                
          if(window.location.href.indexOf("products") == -1) {
            this.initPage(1); 
          }              
          
        } else {
          this.initPage();
        }
       
      })
      
  }



  ngOnInit() {   
    
    this.showColumns = this.config.showColumninfo;

    if (this.config.isDropdown) {
      this.dropdownService();
    }
    this.initPage();

  }

  ngAfterViewInit() {
    // this.notification.isUILoader(true, this.carddatatableIdentity);
  }
  
  ngOnDestroy(){
    try{
      this.config = {};
    }
    catch(e){
      // console.log(e);
    }
    
  }

  dropdownService() {
    // this.datatableservice.getRest(this.config.dropDownList, localStorage.getItem('token')).subscribe(res => {
    //   try {
    //     if (res.status == "true") {
    //       this.dropdownvalue = res.data;
    //       this.optionSelected = this.dropdownvalue[0].id
    //     }
    //   }
    //   catch (e) {

    //   }
    // }, error => {
    //   this.logger.error("Server Error:", error);
    // })
  }

  randomGenerator(): string {
    return Math.floor(Math.random() * 100) + 2 + "" + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5));
  }

  dropDownProperty(event) {
    this.configType = event.name;
    this.types["type"] = event.name;

    this.initPage();
  }

  searchData(keyword) {

    if (keyword != undefined || keyword != null) {
      this.initPage(1, keyword);
    }
  }

  initPage(page: number = 1, keyword: string = "") {

    // Initialize Params Object
    //   let Params = new HttpParams();

    // Object.keys(this.config.params).forEach((key) => {
    //   Params = Params.append(key, this.config.params[key]);
    // });

    // Params = Params.append('page_no', String(page));
    // Params = Params.append('search', keyword);
    let resObj:any = {
      "page_no": page,
      "search": keyword,
      "type": this.types.type,
      // "btype": this.authService.currentUserValue.benchmarking_type
    }   
    // console.log('obj', resObj);
    

    try {
      localStorage.setItem('type', this.types.type);
    } catch (error) {

    }

    // console.log('token', localStorage.getItem('token'));
    // console.log(this.config);    
    // console.log('url', this.config.url);
  //   if(this.config.url != undefined) {
  //   this.datatableservice.postData(this.config.url, resObj, localStorage.getItem('token')).subscribe(res => {
  //     // console.log('url', this.config.url);
  //     // console.log('Response',res);
      
  //     try {
  //       this.notification.isUILoader(false, this.carddatatableIdentity);
  //       if (res.status === "true") {
  //         res.data.forEach(element => {
                       
  //           if(element.user_id){ // UserManagement Benchmarktype Access Array
  //             element.benchmarking_type = element.benchmarking_type.toString();
  //           }  
  //           if(element.template_id) { // Template Group Array
  //             if(element.template_tag_name == "")           {
  //               element.template_tag_name = '-';
  //             } else {
  //               element.template_tag_name = element.template_tag_name.toString();
  //             }
              
  //           }
            
  //         });  
        
  //         this.pagedItemsHeader = res.data;
  //         this.recordsPerPage = res.records_per_page;
  //         this.totalRecords = res.total_records;
  //         this.pager = this.datatableservice.getPager(res.total_records, page, res.records_per_page);

  //       } else if (res.status === "false") {

  //         this.pagedItemsHeader = [];
  //         this.recordsPerPage = 0;
  //         this.totalRecords = 0;
  //         this.errorMessage = res.message;
  //       }
  //     } catch (error) {
  //       this.logger.error(error);
  //     }

  //   });
  //  }
  }

  addEvent() {
    this.addviewEvent.emit(null);
  }
  edit(data) {
    this.editEvent.emit(data);
  }
  disable(data) {
    this.disableEvent.emit(data);
  }

}
