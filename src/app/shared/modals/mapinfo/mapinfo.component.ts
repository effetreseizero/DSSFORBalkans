import { DescriptionComponent } from './../description/description.component';
import { Functions, FunctionsLetter, FunctionsDescriptions } from './../../../models';
import { UtilitiesService } from './../../../services/utilities/utilities.service';
import { DataStoreService } from './../../../services/datastore/datastore.service';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Options } from 'ng5-slider';
 

@Component({
  selector: 'app-mapinfo',
  templateUrl: './mapinfo.component.html',
  styleUrls: ['./mapinfo.component.scss'],
})
export class MapinfoComponent implements OnInit {
  public properties;
  public action = ''
  public hexindex;
  public functions = {};
  public values;
  public fvalues ={}; //valori del facilitatore
  public title;
  public Action;
  public Indexes;
  private facilitatorIndex;
  public modifications = {};
  public shindexes;
  public stats = [];
  options: Options = {
    floor: 0,
    step: 1,
    ceil: 10
  };
  public Functions = Functions; // modello delle function
  public functionsLetter = FunctionsLetter;
  public functionDescription = FunctionsDescriptions;

  constructor(private modalController: ModalController,
              private datastore: DataStoreService,
              private utilities: UtilitiesService,
              private actionSheetController: ActionSheetController) { }

  ngOnInit() {
    
    this.values = Object.assign({}, this.properties.functions);
    this.fvalues = Object.assign({}, this.properties.functions);
    Object.keys(this.fvalues).map(x => this.fvalues[x] = '');
    //this.fvalues = Object.assign({}, this.values);
    // copia dei valori che verranno modificati.

    if (this.Action === 'meetinresult') 
    {
      this.action = 'drawhexagon';
      //this.title = "MEETINRESULTINFO" //DANIELE
      this.title = ""
      this.facilitatorIndex =   this.datastore.stakeholdersSubject.value.filter(x => x.isFacilitator)[0].indexes.filter(y=>y.id===this.hexindex)[0];
      if(this.facilitatorIndex !== undefined){
        this.fvalues = Object.assign(this.fvalues, this.facilitatorIndex.functions);
  
      }

      if(!this.utilities.isEmpty(this.properties.modification)){
        Object.keys(this.properties.functions).forEach(key => {
          if (this.Indexes !== undefined) {
            this.shindexes = Object.keys(this.datastore.getGroupedBySubKey(this.Indexes, 'id', 'functions')).map(x => this.datastore.getGroupedBySubKey(this.Indexes, 'id', 'functions')[x])[0];
            this.modifications[key] = this.Indexes.map(x => x.functions[key]).filter(y => y !== undefined);
  
            this.stats = Array.from(this.shindexes.reduce(
              (acc, obj) => Object.keys(obj).reduce(
                (acc, key) => typeof obj[key] == "number"
                  ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
                  : acc,
                acc),
              new Map()),
              ([name, values]) =>
                //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
                ({ id: name, mean: parseFloat(this.utilities.getMean(values).toFixed(2)), devSt: this.checkNumber(this.utilities.getDS(values, this.values[name])) })
            );
  
          } else {
            this.modifications[key] = {};
          }
  
        })
  
      }



    }
  }

  hoverModal(funct){
     
      debugger;
      const self = this;
      const Title = this.Functions[funct];
      const Subtitle = this.functionDescription[funct]
      const Body = this.functionsLetter[funct];
      async function descmodal() {
        const descrModal = await self.modalController.create({
          component: DescriptionComponent,
          componentProps: { title: Title, body: Body+'_short' },
          backdropDismiss: false,
        });
        await descrModal.present();
      }
  
      descmodal();
  
    
  }


  checkNumber(number) {
    
    if (number === Infinity || number.toString() === 'NaN') {
      return '-';
    } else {
      return parseFloat(number.toFixed(2));
    }
  }

  confirmFunctionChange() {
    this.modalController.dismiss(this.functions);
  }

  changeFunction(event) {
    
    this.functions[event.key] = event.value;

  }

  convertArrayToObject = (array, key) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  }

  resetValues() {
    this.resetValueAction();
  }

  async resetValueAction() {
    var self = this;
    async function resetaalueaction() {
      let actionSheet = await self.actionSheetController.create({
        header: 'Do you really want to reset values to default?',
        buttons: [
          {
            text: 'Reset',
            handler: () => {
              self.modalController.dismiss('resetvalues');
            }
          }, {
            text: 'Abort',
            handler: () => {

            }
          },
        ]
      });
      await actionSheet.present();
    };
    resetaalueaction();
  }


  closeModal() {
    this.modalController.dismiss();
  }


}
