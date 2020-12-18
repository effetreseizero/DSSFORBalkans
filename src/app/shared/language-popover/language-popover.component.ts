import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { LanguageService } from 'src/app/services/language/language.service';

@Component({
  selector: 'app-language-popover',
  templateUrl: './language-popover.component.html',
  styleUrls: ['./language-popover.component.scss'],
})
export class LanguagePopoverComponent implements OnInit {
  languages =  [];
  selected = '';
  constructor(private popoverCtrl: PopoverController, private languageService: LanguageService) {
    this.languages = this.languageService.getLanguage();
    this.selected = this.languageService.selected;
   }

  ngOnInit() {
    this.languages = this.languageService.getLanguage();
    this.selected = this.languageService.selected;
  };

  select(lng){
    
    this.languageService.setLanguage(lng);
    this.popoverCtrl.dismiss();
  }

}
