  import { Component, OnInit } from '@angular/core';

  import * as firebase from 'firebase';
  import { Subject } from 'rxjs';
  
  import 'rxjs/add/operator/map';
  
  import { Router } from '@angular/router';
  import { ActivatedRoute } from '@angular/router';
  
  @Component({
    selector: 'app-coachmeta-view',
    templateUrl: './coachmeta-view.component.html',
    styleUrls: ['./coachmeta-view.component.scss']
  })
  export class CoachmetaViewComponent implements OnInit {
      
      db: any = firebase.firestore();
      value: any = [];
      getAllplayermeta: any = [];
      getAllPlayermetaData: any = [];
    
      data: any;
      dtOptions: DataTables.Settings = {};
      dtTrigger: Subject<any> = new Subject();
     
      resourceID = this.route.snapshot.paramMap.get('resourceId'); 
    
      loading = true;
      displayLoader: any = true;
      
      constructor(private router: Router, private route: ActivatedRoute) { }
      
      ngOnInit() { 
        this.getPlayerMeta();  
      }
    
      async getPlayerMeta(){
        this.getAllplayermeta = await this.db.collection('coachcustomfield').doc(this.resourceID).get();
        if (this.getAllplayermeta.exists) {
          this.getAllPlayermetaData = this.getAllplayermeta.data();
        } else {
          this.getAllPlayermetaData = [];
        }
        
        this.loading = false;
        this.displayLoader = false; 
      }
    
    
      listCoachmeta(){
        this.router.navigate(['/coachmeta']);
      }
    
      addCoachmeta(){
        this.router.navigate(['/coachmeta/create']);
      }
      
      viewCoachmeta(resourceId: string){
        this.router.navigate(['/coachmeta/view/'+resourceId]);
      }
      
      editCoachmeta(resourceId: string){
        this.router.navigate(['/coachmeta/edit/'+resourceId]);
      }
    
      deleteCoachmeta(resourceId: string){
        this.router.navigate(['/coachmeta/delete/'+resourceId]);
      }
    
    }
    