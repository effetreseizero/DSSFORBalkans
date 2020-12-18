import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-action-modal',
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.scss'],
})
export class ActionModalComponent implements OnInit {
  public title = '';
  public parameter = '';
  public text;
  public action;


  constructor(private modalController: ModalController, private actionSheet: ActionSheetController) { }


  ngOnInit() {
    if(this.action === 'statusactivation'){
      if(this.parameter === 'Activate') {
        this.text = 'ACTIVATEPROJECT';
      }else{
        this.text = 'DISABLEPROJECT';
      }
    }
  }

  async presentActionSheet() {
    let self = this;
 
    
    const actionSheet = await this.actionSheet.create({
      header: 'are you really sure?',
      buttons: [{
        text: 'YES',
        icon: 'checkmark-outline',
        handler: () => {
          this.modalController.dismiss(true);
        }
      },  {
        text: 'no',
        icon: 'close-outline',
        handler: () => {
          this.modalController.dismiss(false);
        }
      }]
    });
    await actionSheet.present();
  }

  closeModal() {
    this.modalController.dismiss(false);
  }
}
