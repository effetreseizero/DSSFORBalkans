import { DataStoreService } from 'src/app/services/datastore/datastore.service';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service'

/**
 * servizio di controllo per autorizzare l'ingresso e 
 * la visualizzazione di diverse parti dell'applicativo.
 * 
 * 
 */

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      private datastoreService: DataStoreService) {}

      canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        
        const currentUser = this.datastoreService.currentUserValue;
        if (currentUser) {
              
            // // check if route is restricted by role
            // if (route.data.roles && route.data.roles.indexOf(currentUser.roles[0]) === -1) {
                
            //     // role not authorised so redirect to home page
            //     this.router.navigate(['/']);
            //     return false;
            // }
            // authorised so return true
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

}
