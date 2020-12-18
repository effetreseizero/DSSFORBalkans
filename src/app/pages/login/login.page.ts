import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core'
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { DataStoreService } from 'src/app/services/datastore/datastore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  redirect='/projects';
  resetpassword='/resetpassword';
  signup='/signup';
  projectcode='';
  registerCredentials = { email: '', password: '' };
  error = '';
  rememberme: boolean = false;

  constructor(   private router: Router,
                 private loadingControl: LoadingController,
                 private translate: TranslateService,
                 private authservice: AuthenticationService,
                 private datastoreService: DataStoreService
              ) { }

  ngOnInit() {
    var cr = sessionStorage.getItem('crdss');
    if(cr!==null){
      if(cr.length>11){
        this.rememberme=JSON.parse(sessionStorage.getItem('rememberme'));
        var credentials=this.authservice.Decrypt(cr).split('&');
        this.registerCredentials.email=credentials[0];
        this.registerCredentials.password=credentials[1];
        
      }
    }
  }

  public applogin(){
    // 
    // this.router.navigateByUrl(this.redirect)

  if (this.rememberme) {
    sessionStorage.setItem('rememberme', 'true')
  }else{
    sessionStorage.setItem('rememberme', 'false')
  }
  this.showLoading()
  this.authservice.login(this.registerCredentials).then(
    data => {
      this.router.navigateByUrl(this.redirect);
      // if(this.datastoreService.currentUserValue.firstaccess){
      //   this.router.navigateByUrl(this.firstaccess);
      // }else{
       
      //   this.router.navigateByUrl(this.redirect);
      // }

      if(!this.rememberme){
        this.registerCredentials = { email: '', password: '' };
      }
    },
    error => {

      this.error = error.error.message;
    });


  }

  async showLoading() {
    const loading = await this.loadingControl.create({
      message: 'Please wait...',
      duration: 1000
    });

    await loading.present();
  }

  registerme(){
    this.router.navigateByUrl(this.signup);
  }

}
