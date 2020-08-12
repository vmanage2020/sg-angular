import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { LevelGridComponent } from '../level-grid/level-grid.component';
import { LevelCreateComponent } from '../level-create/level-create.component';
import { LevelEditComponent } from '../level-edit/level-edit.component';
import { LevelViewComponent } from '../level-view/level-view.component';

@Component({
  selector: 'app-level-layout',
  templateUrl: './level-layout.component.html',
  styleUrls: ['./level-layout.component.scss']
}) 
export class LevelLayoutComponent implements OnInit {
  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.announceMission('level');
    this.componentData({ component: LevelGridComponent, inputs: { injectData:""} });   
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
    if (data.action === "levelgrid") {
      this.componentData({ component: LevelGridComponent, inputs: { injectData:data} });
    } else if (data.action === "createlevel") {
      this.componentData({ component: LevelCreateComponent, inputs: { injectData: data} });
    }
    else if (data.action === "editlevel") {
      this.componentData({ component: LevelEditComponent, inputs: { injectData: data} });
    }
    else if (data.action === "viewlevel") {
      this.componentData({ component: LevelViewComponent, inputs: { injectData: data} });
    }
  }

}
