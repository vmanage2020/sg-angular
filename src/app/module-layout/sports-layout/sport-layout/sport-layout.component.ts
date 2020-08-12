import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import { SportsGridComponent } from '../sports-grid/sports-grid.component';
import { SportsCreateComponent } from '../sports-create/sports-create.component';
import { SportsEditComponent } from '../sports-edit/sports-edit.component';

@Component({
  selector: 'app-sport-layout',
  templateUrl: './sport-layout.component.html',
  styleUrls: ['./sport-layout.component.scss']
})
export class SportLayoutComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.announceMission('sport');
    this.componentData({ component: SportsGridComponent, inputs: { injectData:""} });
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
    if (data.action === "sportgrid") {
      this.componentData({ component: SportsGridComponent, inputs: { injectData:data} });
    } else if (data.action === "createSport") {
      this.componentData({ component:SportsCreateComponent, inputs: { injectData: data} });
    } else if (data.action === "editSport") {
      this.componentData({ component: SportsEditComponent, inputs: { injectData: data} });
    } 
  }

}
