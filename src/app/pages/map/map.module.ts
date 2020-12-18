import { ExtentComponent } from './../../shared/modals/extent/extent.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MapPage } from './map.page';
import { TranslateModule } from '@ngx-translate/core';
import { LanguagePopoverComponent } from 'src/app/shared/language-popover/language-popover.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: MapPage
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
  entryComponents: [
    LanguagePopoverComponent,
    ExtentComponent
  ],
  declarations: [MapPage]
})
export class MapPageModule {}
