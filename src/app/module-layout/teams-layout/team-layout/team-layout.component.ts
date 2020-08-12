import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { TeamGridComponent } from '../team-grid/team-grid.component';
import { TeamCreateComponent } from '../team-create/team-create.component';
import { TeamEditComponent } from '../team-edit/team-edit.component';
import { TeamViewComponent } from '../team-view/team-view.component';

@Component({
  selector: 'app-team-layout',
  templateUrl: './team-layout.component.html',
  styleUrls: ['./team-layout.component.scss']
})
export class TeamLayoutComponent implements OnInit {

 
  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  data:boolean=false;

  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {
    this.sharedService.missionAnnounced$.subscribe((data: any) => {
      console.log(data);
      if (data.action === "addTeams") {
        this.data = true;
      }
      else {
        this.data = false;
      }

    })
  }

  ngOnInit() {
       
    if (this.data) {
      this.componentData({ component: TeamCreateComponent, inputs: { injectData:""} });
    } else {
      this.componentData({ component: TeamGridComponent, inputs: { injectData:""} });
    }
    
    this.sharedService.announceMission('team');
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
    if (data.action === "teamgrid") {
      this.componentData({ component:TeamGridComponent , inputs: { injectData:data} });
    } else if (data.action === "createteam") {
      this.componentData({ component: TeamCreateComponent, inputs: { injectData: data} });
    } else if (data.action === "editteam") {
      this.componentData({ component: TeamEditComponent, inputs: { injectData: data} });
    } else if (data.action === "viewteam") {
      this.componentData({ component: TeamViewComponent, inputs: { injectData: data} });
    }  
  }
}
