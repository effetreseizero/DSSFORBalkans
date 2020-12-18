import { DescriptionComponent } from './../../shared/modals/description/description.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DirectivesModule } from './../../directives/directives.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CrudprojectsPage } from './crudprojects.page';
import { ExtentComponent } from './../../shared/modals/extent/extent.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: CrudprojectsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule,
    DirectivesModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  entryComponents: [
    ExtentComponent,
    DescriptionComponent
  ],
  declarations: [CrudprojectsPage]
})
export class CrudprojectsPageModule {}
