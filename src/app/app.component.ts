import { LogoutModalComponent } from './shared/modals/logout-modal/logout-modal.component';
import { DataStoreService } from './services/datastore/datastore.service';
import { Component } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LanguageService } from './services/language/language.service';
import { Router } from '@angular/router';
import { Role } from './models';
 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  private currentUser;
  public appPages = [
    // {
    //   title: 'MAP',
    //   url: '/map',
    //   icon: 'map-outline',
    //   hidden: !this.isFacilitator()
    // },
    {
      title: 'PROJECTS',
      url: '/projects',
      icon: 'list-outline',
      hidden: !this.isFacilitator()
    },
    // {
    //   title: 'EXPORTS',
    //   url: '/exports',
    //   icon: 'cloud-download-outline',
    //   hidden: !this.isFacilitator()
    // },
    {
      title: 'SETTINGS',
      url: '/settings',
      icon: 'settings-sharp',
      hidden: !this.isFacilitator()
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private languageService: LanguageService,
    private datastore: DataStoreService,
    private modalController: ModalController
  ) {
    this.initializeApp();
  }

  isFacilitator() {
    
    this.datastore.currentUser.subscribe(x => this.currentUser = x);
    return this.currentUser && this.currentUser.roles === Role.Admin;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.languageService.setInitialAppLanguage();
      this.isFacilitator();
    });
  }

  logout(){
    // this.userData.logout().then(() => {
    //   return this.router.navigateByUrl('/app/tabs/schedule');
    // });
    if(!this.isFacilitator()){
      this.logoutModal();
  
    }else{
      this.router.navigateByUrl('/');
    }
  }

  logoutModal() {

    const self = this;
    async function logoutModal() {
      const extentModal = await self.modalController.create({
        component: LogoutModalComponent,
        backdropDismiss: false,
      });
      await extentModal.present();
      return await extentModal.onDidDismiss().then(res => {
      
        if(res.data){
          self.router.navigateByUrl('/');
        }
          
      });
    }
    logoutModal();

  }
}
