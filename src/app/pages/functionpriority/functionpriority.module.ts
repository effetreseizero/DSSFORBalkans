import { DirectivesModule } from './../../directives/directives.module';
import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { Ng5SliderModule } from 'ng5-slider';
import { FunctionpriorityPage } from './functionpriority.page';
import { ExpandableComponent } from '../../shared/expandable/expandable.component';
import { DescriptionComponent } from '../../shared/modals/description/description.component'

const routes: Routes = [
  {
    path: '',
    component: FunctionpriorityPage
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
    DirectivesModule,
    Ng5SliderModule
  ],
  entryComponents:[
    ExpandableComponent,
    DescriptionComponent
  ],
  declarations: [FunctionpriorityPage]
})
export class FunctionpriorityPageModule {}
