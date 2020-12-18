import { Component, OnInit, Directive, ElementRef, HostListener, Input, Output } from '@angular/core';
import { AlertController, LoadingController, } from '@ionic/angular';

@Directive({
  selector: '[passwordToggle]' // Attribute selector
})
export class PasswordToggleDirective {
  @Input('appTargetInput') targetInput;
  @Input('iconname') pwicon;

  constructor(el: ElementRef) {
  }

  @HostListener('click') onMouseDown() {


    let intype = (this.targetInput.el.type == 'text') ? 'password' : 'text';
    this.targetInput.el.type = intype;
    let ictype = (this.pwicon.el.name == 'eye-off') ? 'eye' : 'eye-off';
    this.pwicon.el.name = ictype;
  }

}