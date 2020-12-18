import { Component, OnInit, Input, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-extent',
  templateUrl: './extent.component.html',
  styleUrls: ['./extent.component.scss'],
})
export class ExtentComponent implements OnInit {

  public action;
  public addextent:boolean=false;
  public extent;
  public scenario;
  public resolution;
  public hexagonslist;
  public customhexs;
  
  constructor(private modalController: ModalController) { }

  ngOnInit() {
    
    let aaa = this.action;
    let bbb = this.extent;
    let ccc = this.scenario;
    let ddd = this.resolution;
  }

  mapoutput(event) {

    
    this.addextent = true;
    this.hexagonslist = this.uniq_fast(event);
 
  }

  uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}

  confirmExtent(){
    this.modalController.dismiss(this.hexagonslist);
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
