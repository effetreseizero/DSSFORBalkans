import { DataStoreService } from './../../../services/datastore/datastore.service';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss'],
})
export class LogoutModalComponent implements OnInit {
  title;
  stakeholder;
  project;
  untildate;
  constructor(private modalController: ModalController,
              private route: ActivatedRoute,
              private datastore: DataStoreService) { }

  ngOnInit() {
     this.project = this.datastore.meetinProjectSubject.value;
     this.untildate =  new Date(this.project.expirationdate).toLocaleDateString();
  
    this.stakeholder = this.datastore.stakeholderSubject.value;
    
  }

  closeModal(){
    this.modalController.dismiss(true);
  }

  returnBack(){
    this.modalController.dismiss(false);
  }

}
