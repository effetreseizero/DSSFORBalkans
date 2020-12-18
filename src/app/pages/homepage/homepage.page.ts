import { LanguagePopoverComponent } from './../../shared/language-popover/language-popover.component';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.page.html',
  styleUrls: ['./homepage.page.scss'],
})
export class HomepagePage implements OnInit {
  meetin = '/meetin';
  login = '/login';
  signup = '/signup';
  forbalkans = 'http://smartforest.it/forbalkans';

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

  routing(path){
    this.router.navigateByUrl(path)
  }

  goToLink(){
    window.open(this.forbalkans, "_blank");
}

}
