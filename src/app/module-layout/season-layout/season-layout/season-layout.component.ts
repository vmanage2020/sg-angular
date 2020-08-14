import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { SeasonGridComponent } from '../season-grid/season-grid.component';
import { SeasonCreateComponent } from '../season-create/season-create.component';
import { SeasonEditComponent } from '../season-edit/season-edit.component';
import { SeasonViewComponent } from '../season-view/season-view.component';

@Component({
  selector: 'app-season-layout',
  templateUrl: './season-layout.component.html',
  styleUrls: ['./season-layout.component.scss']
})
export class SeasonLayoutComponent implements OnInit {
  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.announceMission('season')
    this.componentData({ component: SeasonGridComponent, inputs: { injectData:""} });
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
    if (data.action === "seasongrid") {
      this.componentData({ component: SeasonGridComponent, inputs: { injectData:data} });
    } else if (data.action === "createseason") {
      this.componentData({ component: SeasonCreateComponent, inputs: { injectData: data} });
    } else if (data.action === "editseason") {
      this.componentData({ component: SeasonEditComponent, inputs: { injectData: data} });
    } else if (data.action === "viewseason") {
      this.componentData({ component: SeasonViewComponent, inputs: { injectData: data} });
    }  
  }

}
