import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { ManagercustomfieldGridComponent } from '../managercustomfield-grid/managercustomfield-grid.component';
import { ManagercustomfieldCreateComponent } from '../managercustomfield-create/managercustomfield-create.component';
import { ManagercustomfieldEditComponent } from '../managercustomfield-edit/managercustomfield-edit.component';
import { ManagercustomfieldViewComponent } from '../managercustomfield-view/managercustomfield-view.component';

@Component({
  selector: 'app-managermetadata',
  templateUrl: './managermetadata.component.html',
  styleUrls: ['./managermetadata.component.scss']
})
export class ManagermetadataComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.announceMission('coachcustomfield');
    this.componentData({ component: ManagercustomfieldGridComponent, inputs: { injectData:""} });  
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
    setTimeout(() => {
      window.scrollTo(0,0);
    }, 100);
    if (data.action === "managercustomfield") {
      this.componentData({ component: ManagercustomfieldGridComponent, inputs: { injectData:data} });
    } 
    else if (data.action === "createmanagerfield") {
      this.componentData({ component: ManagercustomfieldCreateComponent, inputs: { injectData: data} });
    }
    else if (data.action === "editmanagerfield") {
      this.componentData({ component: ManagercustomfieldEditComponent, inputs: { injectData: data} });
    }
    else if (data.action === "viewmanagerfield") {
      this.componentData({ component: ManagercustomfieldViewComponent, inputs: { injectData: data} });
    }
  }

}
