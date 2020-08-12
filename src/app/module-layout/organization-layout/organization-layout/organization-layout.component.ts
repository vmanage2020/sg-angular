import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { OrganizationGridComponent } from '../organization-grid/organization-grid.component';
import { OrganizationCreateComponent } from '../organization-create/organization-create.component';
import { OrganizationEditComponent } from '../organization-edit/organization-edit.component';
import { OrganizationViewComponent } from '../organization-view/organization-view.component';
import { CookieService } from 'src/app/core/services/cookie.service';
import { Constant } from 'src/app/core/services/config';

@Component({
  selector: 'app-organization-layout',
  templateUrl: './organization-layout.component.html',
  styleUrls: ['./organization-layout.component.scss']
})
export class OrganizationLayoutComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  data: boolean = false;
  constructor(public cookieService: CookieService, private router: Router, private resolver: ComponentFactoryResolver, private sharedService: SharedService) {
    this.sharedService.missionAnnounced$.subscribe((data: any) => {      
      if (data.action === "addOrganization") {
        this.data = true;                
      }
      else {
        this.data = false;
      }
    })
  }

  ngOnInit() {        
    if (this.data) {
      this.componentData({ component: OrganizationCreateComponent, inputs: { injectData: '' } });
    } else {
      if ((this.cookieService.getCookie('admin'))) {
        this.componentData({ component: OrganizationViewComponent, inputs: { injectData: localStorage.getItem('org_id') } });
      } else if (this.cookieService.getCookie('sysAdmin') && localStorage.getItem('org_id') !== Constant.organization_id && localStorage.getItem('org_id')) {
        this.componentData({ component: OrganizationViewComponent, inputs: { injectData: localStorage.getItem('org_id') } });
      }
      else if ((this.cookieService.getCookie('sysAdmin'))) {
        this.componentData({ component: OrganizationGridComponent, inputs: { injectData: "" } });
      }
    }
    this.sharedService.announceMission('organization');
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
    if (data.action === "organizationgrid") {
      this.componentData({ component: OrganizationGridComponent, inputs: { injectData: data } });
    } else if (data.action === "createorganization") {
      this.componentData({ component: OrganizationCreateComponent, inputs: { injectData: data } });
    } else if (data.action === "editorganization") {
      this.componentData({ component: OrganizationEditComponent, inputs: { injectData: data } });
    } else if (data.action === "vieworganization") {
      this.componentData({ component: OrganizationViewComponent, inputs: { injectData: data } });
    }
  }

}
