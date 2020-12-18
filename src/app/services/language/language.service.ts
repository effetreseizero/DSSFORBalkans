import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage'

const LNG_KEY = '';

@Injectable({
  providedIn: 'root'
})

export class LanguageService {
selected = '';
  constructor(private translate: TranslateService,
              private storage: Storage) { }

  setInitialAppLanguage(){
    let language = this.translate.getBrowserLang();
    this.translate.setDefaultLang('en');
    this.storage.set(LNG_KEY, 'en');
    this.storage.get(LNG_KEY).then(val => {
      
      if(val){
        this.setLanguage(val);
        this.selected = val;
      }
    });
  }

  getLanguage(){
    return[
      {text: 'Shqipe', value: 'al', img: 'assets/imgs/flags/al.png'},
      {text: 'Italiano', value: 'it', img: 'assets/imgs/flags/it.png'},
      {text: 'English', value: 'en', img: 'assets/imgs/flags/en.png'},
      {text: 'Srpski', value: 'srb', img: 'assets/imgs/flags/srb.png'} 
    ]
  }

  setLanguage(lng){
    
    this.translate.use(lng);
    this.selected = lng;
    this.storage.set(LNG_KEY, lng);
  }
}
