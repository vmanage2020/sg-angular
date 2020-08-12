import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { PlayermetaGridComponent } from '../playermeta-grid/playermeta-grid.component';
import { PlayermetaCreateComponent } from '../playermeta-create/playermeta-create.component';
import { PlayerfieldViewComponent } from '../playerfield-view/playerfield-view.component';
import { PlayerfieldEditComponent } from '../playerfield-edit/playerfield-edit.component';



@Component({
  selector: 'app-playermetadata',
  templateUrl: './playermetadata.component.html',
  styleUrls: ['./playermetadata.component.scss']
})
export class PlayermetadataComponent implements OnInit {
  @ViewChild('componentOutlet', { static: true, read: ViewContainerRef }) componentOutlet: ViewContainerRef;
  currentComponent = null;

  constructor(private router: Router,  private resolver: ComponentFactoryResolver, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.announceMission('playermetadata');
    this.componentData({ component: PlayermetaGridComponent, inputs: { injectData:""} });   
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
    if (data.action === "playermetadata") {
      this.componentData({ component: PlayermetaGridComponent, inputs: { injectData:data} });
    } 
    else if (data.action === "createplayermetadata") {
      this.componentData({ component: PlayermetaCreateComponent, inputs: { injectData: data} });
    }
    else if (data.action === "editplayerfield") {
      this.componentData({ component: PlayerfieldEditComponent, inputs: { injectData: data} });
    }
    else if (data.action === "viewplayerfield") {
      this.componentData({ component: PlayerfieldViewComponent, inputs: { injectData: data} });
    }
  }

}
