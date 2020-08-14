import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { CannedResponseGridComponent } from '../canned-response-grid/canned-response-grid.component';
import { CannedResponseCreateComponent } from '../canned-response-create/canned-response-create.component';
import { CannedResponseUpdateComponent } from '../canned-response-update/canned-response-update.component';
import { CannedResponseViewComponent } from '../canned-response-view/canned-response-view.component';

@Component({
  selector: 'app-canned-response-layout',
  templateUrl: './canned-response-layout.component.html',
  styleUrls: ['./canned-response-layout.component.scss']
})
export class CannedResponseLayoutComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.announceMission('cannedResponse');
    this.componentData({ component: CannedResponseGridComponent, inputs: { injectData:""} });    
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
    if (data.action === "cannedResponseGrid") {
      this.componentData({ component: CannedResponseGridComponent, inputs: { injectData: data} });
    } else if (data.action === "cannedResponseCreate") {
      this.componentData({ component: CannedResponseCreateComponent, inputs: { injectData:data} });
    } else if (data.action === "cannedResponseUpdate") {
      this.componentData({ component: CannedResponseUpdateComponent, inputs: { injectData:data} });
    } else if (data.action === "cannedResponseView") {
      this.componentData({ component: CannedResponseViewComponent, inputs: { injectData:data} });
    }
  }

}
