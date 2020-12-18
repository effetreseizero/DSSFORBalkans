import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from '../../directives/directives.module';
import { LoginPage } from './login.page';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    component: LoginPage
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
  declarations: [LoginPage]
})
export class LoginPageModule {}
