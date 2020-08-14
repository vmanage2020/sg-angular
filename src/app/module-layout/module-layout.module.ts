import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModuleLayoutRoutingModule } from './module-layout-routing.module';
import { DashboardLayoutModule } from './dashboard-layout/dashboard-layout.module';
import { OrganizationLayoutModule } from './organization-layout/organization-layout.module';
import { UserLayoutModule } from './user-layout/user-layout.module';

import { SportsLayoutModule } from './sports-layout/sports-layout.module';
import { PositionLayoutModule } from './position-layout/position-layout.module';
import { SkillcategoriesLayoutModule } from './skillcategories-layout/skillcategories-layout.module';
import { SkillsLayoutModule } from './skills-layout/skills-layout.module';
import { ProfileComponent } from '../components/profile/profile.component';
import { UIModule } from '../shared/ui/ui.module';
import { AdvancedSortableDirective } from '../dataTable/advanced-sortable.directive';
import { PositionSkillLayoutModule } from './position-skill-layout/position-skill-layout.module';
import { SeasonLayoutModule } from './season-layout/season-layout.module';
import { ImportUserLayoutModule } from './import-user-layout/import-user-layout.module';
import { TeamsLayoutModule } from './teams-layout/teams-layout.module';
import { TagLayoutModule } from './tag-layout/tag-layout.module';
import { CannedResponseLayoutModule } from './canned-response-layout/canned-response-layout.module';
import { LevelLayoutModule } from './level-layout/level-layout.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDropdownModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SportsLayoutPOCModule } from './sports-poc-layout/sports-layout.module';


@NgModule({ 
  declarations: [ProfileComponent,AdvancedSortableDirective],
  imports: [
    CommonModule,
    ModuleLayoutRoutingModule,
    DashboardLayoutModule,OrganizationLayoutModule,UserLayoutModule,
    SportsLayoutModule,SportsLayoutPOCModule,PositionLayoutModule,SkillcategoriesLayoutModule,SkillsLayoutModule,UIModule,
    PositionSkillLayoutModule,SeasonLayoutModule,ImportUserLayoutModule,TagLayoutModule,
    TeamsLayoutModule,CannedResponseLayoutModule,
    LevelLayoutModule,NgSelectModule,NgbDatepickerModule,
    FileUploadModule,NgbDropdownModule,
    NgbAlertModule, FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ]
})
export class ModuleLayoutModule { }
