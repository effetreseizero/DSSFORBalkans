import { Component, OnInit, Directive, ElementRef, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { API } from 'src/app/services/api/api.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  consortia; 
  error='';
  registerForm: FormGroup;
  submitted = false;
  constructor(private router: Router, 
              private auth: AuthenticationService, 
              private api: API, 
              private formBuilder: FormBuilder) { }


  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
        validator: this.MustMatch('password', 'confirmPassword') 
      });
  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  get f() { return this.registerForm.controls; }

  registerMe() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    delete this.registerForm.value.confirmPassword;
    this.auth.register(this.registerForm.value).subscribe(
      data => {
          this.router.navigateByUrl('login');
      },
      error => {
        
          this.error = error.error.message;
      });
    //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
  }



}
