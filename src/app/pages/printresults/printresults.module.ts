import { DirectivesModule } from './../../directives/directives.module';
import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
 
import { IonicModule } from '@ionic/angular';

import { PrintresultsPage } from './printresults.page';

const routes: Routes = [
  {
    path: '',
    component: PrintresultsPage
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
  declarations: [PrintresultsPage]
})
export class PrintresultsPageModule {}
