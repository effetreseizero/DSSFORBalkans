import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, ObservableInput, throwError } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class API {

  // private apilink = 'http://localhost:3002/api/';
  // private loginlink: string = 'http://localhost:3002/api/users';

  private apilink = 'https://fbapi.smartforest.it/api/';
  private loginlink = 'https://fbapi.smartforest.it/api/users';

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private token;

  constructor(private http: HttpClient, ) { }
  /**
   * API method for login
   * @param login <- credentials
   */
  login(login) {
    var data = {}
    if (login.email.indexOf('@') > 0) {
      data = { email: login.email, password: login.password };
    } else {
      data = { username: login.email, password: login.password };
    }
    this.headers.append('Accept', 'application/json');
    return this.http.post(this.loginlink + '/login', data, { headers: this.headers }).pipe(map(res => {
      return res;
    }),
      mergeMap((user: any, index: number): ObservableInput<{}> => {
        if (user.id != null) {
          sessionStorage.setItem('tokenCloud', user.id);
          sessionStorage.setItem('tokenUser', user.userId);
          return this.http.get(this.loginlink + '/' + user.userId + '?access_token=' + user.id).pipe(map((res: any) => {
            const userdata = res;
            this.token = sessionStorage.getItem('tokenCloud');

            return [true, userdata];
          })
          )
        } else {
          return error('Username or password is incorrect');
        }
      }
      ),
      catchError(<T>(errors: any, result?: T) => {
     return error('Username or password is incorrect');
      })
    )
    function error(message) {
      return throwError({ status: 400, error: { message } });
    }
  }

  register(credentials) {
    var data = {}
    if (credentials.email.indexOf('@') > 0) {
      data = { email: credentials.email, password: credentials.password };
    } else {
      data = { username: credentials.email, password: credentials.password };
    }
    
    this.headers.append('Accept', 'application/json');
    return this.http.post(this.loginlink, data, { headers: this.headers }).pipe(map(res => {
      return res;
    }));
  }

  post(api, data) {
    this.headers.append("Accept", "application/json");


    return this.http.post(this.apilink +  api + '?access_token=' + this.token, data, { 'headers': this.headers })
    .pipe(map((res: any) => {
      
      return res;

    }),
      catchError(<T>(error: any, result?: T) => {
        
        return of(result as T);
      })
    )
  };

  put(api, data) {
 
    this.headers.append("Accept", "application/json");
    return this.http.put(this.apilink + api + '?access_token=' + this.token, data, { 'headers': this.headers }).pipe(map((res: any) => {
      return res
    }),
      catchError(<T>(error: any, result?: T) => {
        
        return of(result as T);
      })
    )
  };


  get(api, filter) {
 
    if (filter) {
      return this.http.get(this.apilink + '/' + api + '&access_token=' + this.token, { 'headers': this.headers }).pipe(map((res: any) => {
        return res;
      }),
        catchError(<T>(error: any, result?: T) => {
          
          return of(result as T);
        })
      );

    } else {
      return this.http.get(this.apilink + '/' + api + '?access_token=' + this.token, { 'headers': this.headers }).pipe(map((res: any) => {
        return res;
      }), 
        catchError(<T>(error: any, result?: T) => {
          
          return of(result as T);
        })
      );

    }

  };


  delete(api) {
    this.headers.append("Accept", "application/json");
    return this.http.delete(this.apilink + '/' + api + '?access_token=' + this.token, { 'headers': this.headers }).pipe(map((res: any) => {
      return res
    }),
      catchError(<T>(error: any, result?: T) => {
        
        return of(result as T);
      })
    )
  };

 

}
