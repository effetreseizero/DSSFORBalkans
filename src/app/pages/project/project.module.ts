import { SettingsMapComponent } from './../../shared/settings-map/settings-map.component';
import { DescriptionComponent } from './../../shared/modals/description/description.component';
import { DirectivesModule } from './../../directives/directives.module';
import { ActionModalComponent } from '../../shared/modals/action-modal/action-modal.component';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProjectPage } from './project.page';
 
const routes: Routes = [
  {
    path: '',
    component: ProjectPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    SharedModule,
    DirectivesModule
  ],
  entryComponents:[
    ActionModalComponent,
    DescriptionComponent
  ],
  declarations: [ProjectPage]
})
export class ProjectPageModule {}
