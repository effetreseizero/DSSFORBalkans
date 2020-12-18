import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from '../../directives/directives.module';
import { MeetinUserPage } from './meetin-user.page';

const routes: Routes = [
  {
    path: '',
    component: MeetinUserPage
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
  declarations: [MeetinUserPage]
})
export class MeetinUserPageModule {}
