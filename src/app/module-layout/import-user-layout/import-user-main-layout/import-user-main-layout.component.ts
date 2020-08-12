import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, ReflectiveInjector, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { ImportUserGridComponent } from '../import-user-grid/import-user-grid.component';
import { ImportUserCreateComponent } from '../import-user-create/import-user-create.component';

import { SuccessUserImportRecordComponent } from '../success-user-import-record/success-user-import-record.component';
import { ErrorUserImportRecordComponent } from '../error-user-import-record/error-user-import-record.component';
import { UpdateUserImportRecordComponent } from '../update-user-import-record/update-user-import-record.component';
import { ImportUserViewComponent } from '../import-user-view/import-user-view.component';
@Component({
  selector: 'app-import-user-main-layout',
  templateUrl: './import-user-main-layout.component.html',
  styleUrls: ['./import-user-main-layout.component.scss']
})
export class ImportUserMainLayoutComponent implements OnInit {

  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;
  @Output() change = new EventEmitter();
  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {
    this.sharedService.missionAnnounced$.subscribe((data: any) => {
      if(data) {
        if(data == "userImportRouter") {          
          
        }
      }
    })
  }


  ngOnInit() {
    this.sharedService.announceMission('userImport');
    this.componentData({ component: ImportUserGridComponent, inputs: { injectData:""} });
    this.sharedService.announceMission('updateOrganizationList');
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
    if (data.action === "createUserImport") {
      this.componentData({ component: ImportUserCreateComponent, inputs: { injectData: data } });
    } else if(data.action === "userImport"){
      this.componentData({ component: ImportUserGridComponent, inputs: { injectData: data } });
    } else if(data.action === "UpdateUserImport"){
      this.componentData({ component: UpdateUserImportRecordComponent, inputs: { injectData: data } });
    } else if(data.action === "successUserImport"){
      this.componentData({ component: SuccessUserImportRecordComponent, inputs: { injectData: data } });
    } else if(data.action === "errorUserImport"){
      this.componentData({ component: ErrorUserImportRecordComponent, inputs: { injectData: data } });
    } else if(data.action === "viewUserImport"){
      this.componentData({ component: ImportUserViewComponent, inputs: { injectData: data } });
    } 
  }
}
