import { Router } from '@angular/router';
import { DataStoreService } from 'src/app/services/datastore/datastore.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-meetin',
  templateUrl: './meetin.page.html',
  styleUrls: ['./meetin.page.scss'],
})
export class MeetinPage implements OnInit {

  code = '';
  constructor(private datastore: DataStoreService, private router: Router) { }

  ngOnInit() {
  }

  meetIn(form) {

    let Form = form.value;
    this.datastore.getmeetProject(Form.meetincode).subscribe(res => {
      
      if (res[0]) {
        const project = res[1];
        if (new Date(project.expirationdate).getTime() > new Date().getTime()) {
          
          this.router.navigateByUrl('meetin/meetin-user')
        }
      } else {

      }
    })
  }

}
