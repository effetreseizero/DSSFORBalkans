import { Router } from '@angular/router';
import { DataStoreService } from 'src/app/services/datastore/datastore.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-meetin-user',
  templateUrl: './meetin-user.page.html',
  styleUrls: ['./meetin-user.page.scss'],
})
export class MeetinUserPage implements OnInit {
  projectitle;
  project;
  groupname;
  groupnumber=1;
  stakeholder = {};
  constructor(private datastore: DataStoreService,
              private router: Router){}

  ngOnInit() {
    this.datastore.currentmeetinProject.subscribe(res=>{
      this.project = res;
    })
  }

  goToProject(form){
    const Form = form.value;

    this.stakeholder['name']=Form.groupname;
    this.stakeholder['project_id'] = this.project.id;
    this.stakeholder['date'] = new Date().toISOString();
    this.stakeholder['indexes'] = [];
    this.stakeholder['number'] = Form.groupnumber;
    this.stakeholder['isFacilitator'] = false;


    this.datastore.createStakeholder(this.stakeholder).subscribe(res=>{
      
      if(res){
        this.router.navigateByUrl('/project/' + this.project.id)
      }
    })
  }

}
