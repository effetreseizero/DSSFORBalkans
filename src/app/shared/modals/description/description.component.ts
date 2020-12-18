import { Functions, FunctionsLetter } from '../../../models/functions';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
 

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnInit {
  public body='';
  public title='';
  public subtitle='';
  public Functions = Functions; // modello delle function
  public functionsLetter = FunctionsLetter;
  constructor(private modalController: ModalController, private actionSheet: ActionSheetController) { }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss(false);
  }

}
