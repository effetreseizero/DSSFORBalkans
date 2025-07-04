import { Directive, HostListener } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
  selector: '[appLogoutButton]'
})
export class LogoutButtonDirective {

  constructor(private location: Location) { }

  @HostListener('click')
  
  onClick() {
    this.location.back();
  }

}
