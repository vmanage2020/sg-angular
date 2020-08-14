import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { TagGridComponent } from '../tag-grid/tag-grid.component';
import { CreateTagComponent } from '../create-tag/create-tag.component';
import { EditTagComponent } from '../edit-tag/edit-tag.component';
import { ViewTagComponent } from '../view-tag/view-tag.component';

@Component({
  selector: 'app-tag-layout',
  templateUrl: './tag-layout.component.html',
  styleUrls: ['./tag-layout.component.scss']
})
export class TagLayoutComponent implements OnInit {
  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.announceMission('tag')
    this.componentData({ component: TagGridComponent, inputs: { injectData:""} });
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
    if (data.action === "taggrid") {
      this.componentData({ component: TagGridComponent, inputs: { injectData:data} });
    } else if (data.action === "createtag") {
      this.componentData({ component: CreateTagComponent, inputs: { injectData: data} });
    } else if (data.action === "edittag") {
      this.componentData({ component: EditTagComponent, inputs: { injectData: data} });
    } else if (data.action === "viewtag") {
      this.componentData({ component: ViewTagComponent, inputs: { injectData: data} });
    }  
  }

}
