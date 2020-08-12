import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { PositionGridComponent } from '../position-grid/position-grid.component';
import { PositionCreateComponent } from '../position-create/position-create.component';
import { PositionEditComponent } from '../position-edit/position-edit.component';

@Component({
  selector: 'app-position-layout',
  templateUrl: './position-layout.component.html',
  styleUrls: ['./position-layout.component.scss']
})
export class PositionLayoutComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.announceMission('position')
    this.componentData({ component: PositionGridComponent, inputs: { injectData:""} });
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
    if (data.action === "positiongrid") {
      this.componentData({ component: PositionGridComponent, inputs: { injectData:data} });
    } else if (data.action === "createposition") {
      this.componentData({ component: PositionCreateComponent, inputs: { injectData: data} });
    } else if (data.action === "editposition") {
      this.componentData({ component: PositionEditComponent, inputs: { injectData: data} });
    } 
  }

}
