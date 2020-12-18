import { SharedModule } from './../../shared/shared.module';
import { LanguagePopoverComponent } from './../../shared/language-popover/language-popover.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomepagePage } from './homepage.page';

const routes: Routes = [
  {
    path: '',
    component: HomepagePage
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
  declarations: [HomepagePage]
})
export class HomepagePageModule {}
