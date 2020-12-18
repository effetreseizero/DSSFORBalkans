import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';
import { SharedModule } from './shared/shared.module';
import { DirectivesModule } from './directives/directives.module';
import { AuthenticationService } from './services/authentication/authentication.service';
import { API } from './services/api/api.service';
import { DataStoreService } from './services/datastore/datastore.service';
import { UtilitiesService } from './services/utilities/utilities.service';
import { LogoutModalComponent } from './shared/modals/logout-modal/logout-modal.component';
import { Ng5SliderModule } from 'ng5-slider';

const PROVIDERS = [
  AuthenticationService,
  API,
  DataStoreService,
  UtilitiesService
];

export function createTranslateLoader(http: HttpClient){
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
    LogoutModalComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader:{
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SharedModule,
    DirectivesModule,
    Ng5SliderModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
