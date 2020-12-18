
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { DirectivesModule } from '../../directives/directives.module';
import { MeetinResultPage } from './meetin-result.page';

const routes: Routes = [
  {
    path: '',
    component: MeetinResultPage
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
  declarations: [MeetinResultPage
  ],
  exports:[
    MeetinResultPage
  ]
})
export class MeetinResultPageModule {}
