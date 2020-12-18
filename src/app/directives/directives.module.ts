import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PasswordToggleDirective } from './pwdtongle/pwdtongle.directive';
import { BackButtonDirective } from './backbutton/backbutton.directive';
import { LogoutButtonDirective } from './logout-button/logout-button.directive';

const COMPONENTS = [
    PasswordToggleDirective,
    BackButtonDirective
]

@NgModule({
  declarations: [
    ...COMPONENTS,
    LogoutButtonDirective
  ], 
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    ...COMPONENTS
  ],
})
export class DirectivesModule { }
