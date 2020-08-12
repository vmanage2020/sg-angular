import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { UserGridComponent } from '../user-grid/user-grid.component';
import { UserCreateComponent } from '../user-create/user-create.component';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { UserViewComponent } from '../user-view/user-view.component';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  data:boolean=false;
  @Output() change = new EventEmitter();
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {
    this.sharedService.missionAnnounced$.subscribe((data: any) => {      
      if (data.action === "addUsers") {
        this.data = true;                
      } else if (data == "userRouter") {              
      } else {
        this.data = false;
      }
    })
  }

  ngOnInit() {
    if(this.data){
      this.componentData({ component: UserCreateComponent, inputs: { injectData: ''} });
    }else{
      this.componentData({ component: UserGridComponent, inputs: { injectData:""} });
    }   
     this.sharedService.announceMission('user');
    
  }

  componentData(data: { component: any, inputs?: any }) {
    if (!data) { return; }
    let inputProviders = Object.keys(data.inputs).map((inputName) => { return { provide: inputName, useValue: data.inputs[inputName] }; });
    let resolvedInputs = ReflectiveInjector.resolve(inputProviders);
    let injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.componentOutlet.parentInjector);
    let factory = this.resolver.resolveComponentFactory(data.component);
    let component = factory.create(injector);
    this.componentOutlet.insert(component.hostView);
    if (this.currentComponent) { this.currentComponent.destroy(); }
    this.currentComponent = component;
    // Output Event Emitter 
    this.currentComponent.instance.change.subscribe((change) => { 
      this.onComponentChange(change);
    })
  }
  onComponentChange(data) {
    this.sharedService.announceMission('updateOrganizationList');
    setTimeout(() => {
      window.scrollTo(0,0);
    }, 100);
    if (data.action === "usergrid") {
      this.componentData({ component: UserGridComponent, inputs: { injectData:data} });
    } else if (data.action === "createuser") {
      this.componentData({ component: UserCreateComponent, inputs: { injectData: data} });
    } else if (data.action === "edituser") {
      this.componentData({ component: UserEditComponent, inputs: { injectData: data} });
    } else if (data.action === "viewuser") {
      this.componentData({ component: UserViewComponent, inputs: { injectData: data} });
    }  
  }

}
