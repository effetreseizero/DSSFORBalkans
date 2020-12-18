import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from '../../directives/directives.module';
import { MeetinPage } from './meetin.page';

const routes: Routes = [
  {
    path: '',
    component: MeetinPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    DirectivesModule
  ],
  declarations: [MeetinPage]
})
export class MeetinPageModule {}
