import { LoadingController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
/**
 * import rxjs
 */
import { Observable, of, BehaviorSubject, throwError } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { API } from '../api/api.service';
import { User } from '../../models';
import { DataStoreService } from '../datastore/datastore.service';
import * as CryptoJS from 'crypto-js';

export interface Credential {
  email?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  currentCredential: Credential = {};
  private value = '448efaf7a4cdbfae82c65d4c636dc0b3';
  constructor(private http: HttpClient,
    private api: API,
    private datastoreService: DataStoreService,
    public loadingController: LoadingController) { }


  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      duration: 2000,
      message: 'Sync data...',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

  public async login(credentials) {

    if (credentials.email === null || credentials.password === null) {
      return Observable.throw('Please insert credentials');
    } else {
      const rememeberMe = JSON.parse(sessionStorage.getItem('rememberme'));
      if (rememeberMe) {
        sessionStorage.setItem('crdss', this.Encrypt(credentials.email + '&' + credentials.password));
      } else {
        sessionStorage.setItem('crdss', '');
      }

      let allowed = await this.api.login(credentials).toPromise();

      if (allowed[0]) {

       var user = allowed[1];
          sessionStorage.setItem('currentUser', JSON.stringify(user));

          sessionStorage.setItem('loggedIn', 'true');
         this.datastoreService.currentUserSubject.next(user);
          this.datastoreService.callDastastore(); // call all method from datastore;
      //   // open data loading pop-up
          this.presentLoadingWithOptions();

      //   // await for ValvesSubject complete 
          let result = await this.datastoreService.loginAPILoadSubjectObs.toPromise();

      //   //dismiss loadingcontroller and terminate back to loginpage applogin
         this.loadingController.dismiss();


       } else {

        return throwError({ status: 400, error: 'Username or password is incorrect' });
       }


    }
  }

  public register(credentials) {
    
    if (credentials.email === null || credentials.password === null) {
      return Observable.throw('Please insert credentials');
    } else {

      return this.api.register(credentials).pipe(map(allowed => {

      })
      );
    }
  }


  // private Encrypt(value) {
  //   var result = '';
  //   result = this.set(value);
  //   return result;
  // }

  // Decrypt(value) {
  //   var result = '';
  //   result = this.get(value);
  //   return result;
  // }

  Encrypt(value) {
    var result = "";
    for (var i = 0; i < value.length; i++) {
      if (i < value.length - 1) {
        result += value.charCodeAt(i) + 37;
        result += ";";
      }
      else {
        result += value.charCodeAt(i) + 37;
      }
    }
    return result;
  }

  Decrypt(value) {
    var result = "";
    var array = value.split(";");

    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(array[i] - 37);
    }
    return result;
  }


  public handleError(message: Response) {
    console.error(message);
    return throwError({ status: 400, error: { message } });
  }


  // private set(value){
  //   var key = CryptoJS.enc.Utf8.parse(this.value);
  //   var iv = CryptoJS.enc.Utf8.parse(this.value);
  //   var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
  //   {
  //       keySize: 128 / 8,
  //       iv: iv,
  //       mode: CryptoJS.mode.CBC,
  //       padding: CryptoJS.pad.Pkcs7
  //   });

  //   return encrypted.toString();
  // }

  // //The get method is use for decrypt the value.
  // private get(value){
  //   var key = CryptoJS.enc.Utf8.parse(this.value);
  //   var iv = CryptoJS.enc.Utf8.parse(this.value);
  //   var decrypted = CryptoJS.AES.decrypt(value, key, {
  //       keySize: 128 / 8,
  //       iv: iv,
  //       mode: CryptoJS.mode.CBC,
  //       padding: CryptoJS.pad.Pkcs7
  //   });

  //   return decrypted.toString(CryptoJS.enc.Utf8);
  // }


}
