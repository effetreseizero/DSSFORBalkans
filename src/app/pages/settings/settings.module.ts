import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SettingsPage } from './settings.page';
import { TranslateModule } from '@ngx-translate/core';
import { LanguagePopoverComponent } from './../../shared/language-popover/language-popover.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    SharedModule
  ],  
  entryComponents:[
    LanguagePopoverComponent
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
