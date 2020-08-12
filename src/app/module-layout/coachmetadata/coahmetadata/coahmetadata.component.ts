import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { CoachmetadataGridComponent } from '../coachmetadata-grid/coachmetadata-grid.component';
import { CoachcustomfieldCreateComponent } from '../coachcustomfield-create/coachcustomfield-create.component';
import { CoachcustomfieldEditComponent } from '../coachcustomfield-edit/coachcustomfield-edit.component';
import { CoachcustomfieldViewComponent } from '../coachcustomfield-view/coachcustomfield-view.component';

@Component({
  selector: 'app-coahmetadata',
  templateUrl: './coahmetadata.component.html',
  styleUrls: ['./coahmetadata.component.scss']
})
export class CoahmetadataComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;

  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.announceMission('coachcustomfield');
    this.componentData({ component: CoachmetadataGridComponent, inputs: { injectData:""} });  
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
    if (data.action === "coachcustomfield") {
      this.componentData({ component: CoachmetadataGridComponent, inputs: { injectData:data} });
    } 
    else if (data.action === "createcoachfield") {
      this.componentData({ component: CoachcustomfieldCreateComponent, inputs: { injectData: data} });
    }
    else if (data.action === "editcoachfield") {
      this.componentData({ component: CoachcustomfieldEditComponent, inputs: { injectData: data} });
    }
    else if (data.action === "viewcoachfield") {
      this.componentData({ component: CoachcustomfieldViewComponent, inputs: { injectData: data} });
    }
  }

}
