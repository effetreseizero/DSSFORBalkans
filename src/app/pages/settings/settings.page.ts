import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { LanguagePopoverComponent } from './../../shared/language-popover/language-popover.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private popoverCtrl: PopoverController, private router: Router) { }

  ngOnInit() {
  }

  async openLanguagePopover(evt){
    const popover = await this.popoverCtrl.create({
      component: LanguagePopoverComponent,
      event: evt
    });
    await popover.present();
  }

}
