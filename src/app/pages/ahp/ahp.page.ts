import { ToastController } from '@ionic/angular';
import { ActionModalComponent } from './../../shared/modals/action-modal/action-modal.component';
import { UtilitiesService } from './../../services/utilities/utilities.service';
import { DataStoreService } from 'src/app/services/datastore/datastore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ones, index, subset, evaluate, eigs } from 'mathjs';
import * as math from 'mathjs';
import * as numeric from 'numericjs';
import {FunctionsLetter, Functions, FunctionsDescriptions} from '../../models';
declare var calcEigenvalues: any;

@Component({
  selector: 'app-ahp',
  templateUrl: './ahp.page.html',
  styleUrls: ['./ahp.page.scss'],
})
export class AhpPage implements OnInit, AfterViewInit {
  public projectid; // id del progetto
  public stakeholders; // dati degli stakeholders
  public project; // progetto
  public scenario; // scenario
  public scenario_id; // id dello scenario
  private facilitator; // indici modificati dal facilitatore
  public projecttitle; // nome del progetto
  public functions; // funzioni del progetto
  public functionpriority = []; // function priority
  private CR; 
  private NPvector; // vettore dei pesi
  private NP4func = {}; // oggetto contenente i pesi suddivisi per funzione
  public action = 'ahpresults'; 
  public ahpexec: boolean = false;
  public functionsLetter = FunctionsLetter;
  public Functions = Functions;
  public functionDescription = FunctionsDescriptions;
  public ahpdata; // meetin o default, tipo di ahp da eseguire
  public hexagons; // esagoni del progetto
  public allhexagons;
  public status; // status del progetto (todolist)
  /**
   *  shindexids: oggetto degli indici degli esagoni modificati dagli stakeholder,
   *  prende in input tutti gli indici modificati dagli stakeholders e divide le modifiche per id dell'esagono
   */
  private shindexids;
 
  /**
   * oggetto che contiene solo gli indici  
   * che hanno superato la soglia per essere ritenuti interessanti
   * in funzione del numero di modifiche vs partecipanti ed esagoni modificati
   */
  private hexmods = {};

  private Wvector = {}; // oggetto che contiene i pesi risultanti dalla function priority divisi per funzione
  public Weight; // oggetto contenente i pesi ordinati in ordine decrescente
  public Wvalues = []; // valore dei pesi
  public ahptype; // tipo di ahp meetin o default
  Areas; // statistica delle aree degli esagoni risultati dall'elaborazione ahp
  Areas4funct={}; // statistica delle aree degli esagoni risultati dall'elaborazione ahp divise per funzione
  json; // output
 
  public RI = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 }; // valori per la matrice di consistenteza




  constructor(private route: ActivatedRoute,
    private router: Router,
    private utility: UtilitiesService,
    private datastore: DataStoreService,
    private toastController: ToastController,
    private utilities: UtilitiesService) { }

  ngOnInit() {

    this.projectid = this.route.snapshot.params['id']; // id del progetto che viene letto dalla barra di navigazione
    this.project = this.datastore.ProjectsSubject.value.filter(x => x.id === this.projectid)[0]; // progetto selezionato
    this.scenario = this.datastore.ScenariesSubject.value.filter(x => x.id === this.project.scenario_id)[0]; // scenario del progetto selezionato
     // esagoni del progetto
    this.status = this.datastore.todolistSubject.value.filter(x => x.project_id === this.project.id)[0]; // to do list del progetto
    this.stakeholders = this.datastore.stakeholdersSubject.value.filter(x => !x.isFacilitator); // valori delle funzioni negli indici degli esagoni modificati dagli stakeholder
    this.facilitator = this.datastore.stakeholdersSubject.value.filter(x => x.isFacilitator)[0]; // valori delle funzioni negli indici degli esagni modificati dal facilitatore
    const hexlist = this.datastore.projectsHexagonsSubject.value.filter(x=>x.project_id === this.project.id)[0]
    this.allhexagons = this.datastore.HexagonsSubject.value[this.project.scenario_id].map(x => x.indexes);
    
    if(hexlist.all){
      this.hexagons = this.allhexagons;
    }else{
      this.hexagons  = this.allhexagons.filter(x=>hexlist.hexagons.indexOf(x.id)>-1);
    }


    this.project.functions.map(x=>{
      this.Wvector[x] = '';  // inizializzo i pesi in base alle funzioni del progetto (pesi inizialmente vuoti)c
    })
    this.functions = this.project.functions; // array delle funzioni del progetto
    this.scenario_id = this.project.scenario_id; // id dello scenario

  }

 ngAfterViewInit(){

 }

 /**
  * metodo per il download della mappa json
  * contiene valori di default, del meetin (solo ahp meetin)
  * e valori risultanti da AHP
  */
 download() {
  
  // let filename='geojsonmap'
  // let blob = new Blob(['\ufeff' + this.json[0]], { type: 'data:text/json;charset=utf-8,;' });
  // let dwldLink = document.createElement("a");
  // let url = URL.createObjectURL(blob);
  // let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
  // if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
  //     dwldLink.setAttribute("target", "_blank");
  // }
  // dwldLink.setAttribute("href", url);
  // dwldLink.setAttribute("download", filename + ".json");
  // dwldLink.style.visibility = "hidden";
  // document.body.appendChild(dwldLink);
  // dwldLink.click();
  // document.body.removeChild(dwldLink);

  let filename=this.project.name+'_kml_map'
  debugger;
  this.json[1]=this.json[1].split('F1').join('FT');
  this.json[1]=this.json[1].split('F2').join('FP');
  this.json[1]=this.json[1].split('F3').join('FC');
  this.json[1]=this.json[1].split('F4').join('FM');
  debugger;
  let blob = new Blob(['\ufeff' + this.json[1]], { type: 'data:text/xml;charset=utf-8,;' });
  let dwldLink = document.createElement("a");
  let url = URL.createObjectURL(blob);
  let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
  if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
  }
  dwldLink.setAttribute("href", url);
  dwldLink.setAttribute("download", filename + ".kml");
  dwldLink.style.visibility = "hidden";
  document.body.appendChild(dwldLink);
  dwldLink.click();
  document.body.removeChild(dwldLink);

}

/**
 * 
 * @param event mappa risultante per il download
 */
 outGeojson(event){
  this.json = event;
 }

 

  runAHP(ahp) {
    
    let hexagon = JSON.parse(JSON.stringify(this.hexagons)); // copio gli esagoni
    
    // per ogni esagono estrapolo solo le funzioni selezionate dal progetto
    hexagon.map(hex=>{
      hex.defaultproperties = Object.keys(hex.defaultproperties).filter(key => this.project.functions.includes(key)).reduce((obj, key) => {
         obj[key] = hex.defaultproperties[key];
         return obj;
         }, {});
     })

   
    if (this.consistency()) { // se la matrice della funztion priority è consistente allora calcolo ahp
      // AHPvector vettore ottenuto moltiplicando il le funzioni degli esagoni per il vettore dei pesi della matrice di consistenza
      let AHPvector = [];
      // array degli indici degli esagoni con la funzione vincitrice
      let AHPwinner: any[] = [];
  
      switch (ahp) { // tipo di ahp da calcolare
        case 'default': //ahp con valori di default senza modifiche
          this.ahpexec = false;
          
          // creo oggetto contentente id degli esagoni e i valori delle funzioni 
          // moltiplicati per il vettore dei pesi ottenuto dal controllo della consistenza
          // della priorità delle funzioni
          hexagon.map((x, i) => {
            AHPvector[x.id] = {}; 
            AHPvector[x.id].defaultproperties={};
            Object.keys(x.defaultproperties).map(y => {
              AHPvector[x.id][y] = x.defaultproperties[y] * this.NP4func[y];
              AHPvector[x.id].defaultproperties[y] = x.defaultproperties[y];
            });
          });
          
          // estrapolo l'indece degli esagoni con la funzione vincitrice
          Object.keys(AHPvector).map(x => {
            AHPwinner[x] = {}
            let Func = Object.keys(AHPvector[x]).reduce((a, b) => AHPvector[x][a] > AHPvector[x][b] ? a : b);
            //AHPwinner[x][Func] = Math.round(AHPvector[x][Func]);
            AHPwinner[x][Func] = AHPvector[x].defaultproperties[Func];
          });
          this.ahptype='';
          this.datastore.ahptypeSubject.next(''); // '' tipo ahp default (altrimenti meetin)
          this.datastore.ahpresultSubject.next(AHPwinner); // aggiorno valore degli indici con valori risultati da AHP
          this.ahpexec = true;



          break;

        case 'meetin':
          this.ahpexec = false;
          this.ahptype='meetin'
          let stat = this.status.statistics; // seleziono il tipo di statistica per il calcolo dell'ahp
      
          let stakeholdermodification = this.applyStatisticToresult(stat);  // calcolo statistica sulle modifiche degli stakeholders
          let Findexes = this.datastore.getGroupedBySubKey(this.facilitator.indexes.flat(), 'id', 'functions');
          

          hexagon.map((x, i) => {
            Object.keys(stakeholdermodification).map(y => {
              if (x.id === y) {
                stakeholdermodification[y].forEach(mod => {
                  Object.keys(mod).map(key => {
                  
                    if(this.hexmods[y][key]){
                      x.defaultproperties[key] = Math.round(mod[key]);
                    }else{
                      x.defaultproperties[key] = x.defaultproperties[key];
                    }
                    

                  })
                })
              } else {
                x.defaultproperties = x.defaultproperties;
              }

            });
            Object.keys(Findexes).map(y => {
              if (x.id === y) {
                Findexes[y].forEach(mod => {
                  Object.keys(mod).map(key => {
                    x.defaultproperties[key] = Math.round(mod[key]);
                  })
                })
              } else {
                x.defaultproperties = x.defaultproperties;
              }

            });
          })
          
          hexagon.map((x, i) => {
            AHPvector[x.id] = {};
            AHPvector[x.id].defaultproperties={}
            Object.keys(x.defaultproperties).map(y => {
               AHPvector[x.id][y] = x.defaultproperties[y] * this.NP4func[y];
               AHPvector[x.id].defaultproperties[y] = x.defaultproperties[y];
            });
          });
          
          Object.keys(AHPvector).map(x => {
            AHPwinner[x] = {}
            //AHPwinner[x].defaultproperties={}
            let Func = Object.keys(AHPvector[x]).reduce((a, b) => AHPvector[x][a] > AHPvector[x][b] ? a : b);
            AHPwinner[x][Func] = AHPvector[x].defaultproperties[Func]
           // AHPwinner[x].defaultproperties[Func]=AHPvector[x].defaultproperties[Func]
          });
          
          this.datastore.ahptypeSubject.next('meetin');
          this.datastore.ahpresultSubject.next(AHPwinner);


          this.ahpexec = true;

          break;

      }

    }



  }

  /**
   * tipo di statistica da applicare
   * @param type (mean, mode, median)
   */
  applyStatisticToresult(type) {
    
    let shindexes = this.datastore.getGroupedBySubKey(this.stakeholders.map(x => x.indexes).flat(), 'id', 'functions'); // indici degli esagoni degli stakeholder raggruppati per id dell'esagono e funzioni
    let defunctions = this.datastore.getGroupedBySubKey(this.hexagons, 'id', 'defaultproperties'); // indici degli esagoni di default ragruppati per id e funzioni di default
    this.shindexids = this.datastore.getGroupedByKey(this.stakeholders.map(x => x.indexes).flat(), 'id'); // indici degli esagoni degli stakeholder raggruppati per id
    
    let mod_array = Object.keys(shindexes).map(x => { return shindexes[x] }); // array con i valori delle funzioni modificate dagli stakeholders per ogni indice
    let partecipants = this.stakeholders.map(x => x.number).reduce((a, b) => a + b, 0); // numero di partecipanti totali
    let func_array = {} // soglia che rende un esagono interessante
    let aarr = {} // array di tutte le modifiche per ogni funzione
    let mod_num = 0;
    mod_num = mod_array.flat().map(x => Object.keys(x).map(y => x[y]).length).reduce((a, b) => a + b, 0) // numero di modifche agli esagoni


    this.project.functions.forEach(f => {
      aarr[f] = mod_array.map(x => x.map(y => y[f]).length) // array con in numero di modifiche per ogni esagono modificato (es. 1 esagono con 4 modiche a F1 e 2 a F2)
      if(aarr[f].length===0 || partecipants===0){
        func_array[f]=0;
      }else{
        /**
         * calcolo del valore soglia per rendere un esagono interessante,
         * media del numero di modifiche per la funzione i-esima per ogni esagono modificiato per il numero 
         * di modifiche per la funzione i-esima
         * diviso il numero di partecipanti per il numero totale di modifiche
         */

        func_array[f] = (this.utilities.getMean(aarr[f]) * aarr[f].length) / (partecipants * mod_num); 

      }
      
    })


    this.hexmods = {};
    Object.keys(this.shindexids).forEach(key => {
      this.hexmods[key] = {};
      this.shindexids[key].forEach(index => {
        Object.keys(index.functions).forEach(f => {
          this.hexmods[key][f] =  (this.shindexids[key].filter(x => x.functions.hasOwnProperty(f)).length * aarr[f].length) / (partecipants * mod_num) >= func_array[f];
        });
      });
    });
    
    let result = {};
    switch (type) {
      case 'mean':

        Object.keys(shindexes).forEach(index => {
          if(!this.utilities.isEmpty(this.hexmods[index])){
            result[index] = Array.from(shindexes[index].reduce(
              (acc, obj) => Object.keys(obj).reduce(
                (acc, key) => typeof obj[key] == "number"
                  ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
                  : acc,
                acc),
              new Map()),
              ([name, values]) =>
                //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
                ({ [name]: this.utilities.getMean(values) })
            )
          }


        })

        break;
      case 'mode':
        Object.keys(shindexes).forEach(index => {
          result[index] = Array.from(shindexes[index].reduce(
            (acc, obj) => Object.keys(obj).reduce(
              (acc, key) => typeof obj[key] == "number"
                ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
                : acc,
              acc),
            new Map()),
            ([name, values]) =>
              //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
              ({ [name]: this.utilities.getMode(values) })
          )
        })

        break;
      case 'median':
        Object.keys(shindexes).forEach(index => {
          result[index] = Array.from(shindexes[index].reduce(
            (acc, obj) => Object.keys(obj).reduce(
              (acc, key) => typeof obj[key] == "number"
                ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
                : acc,
              acc),
            new Map()),
            ([name, values]) =>
              //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
              ({ [name]: this.utilities.getMedian(values) })
          )
        })

        break;
      case 'devst':

        Object.keys(shindexes).forEach(index => {
          result[index] = Array.from(shindexes[index].reduce(
            (acc, obj) => Object.keys(obj).reduce(
              (acc, key) => typeof obj[key] == "number"
                ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
                : acc,
              acc),
            new Map()),
            ([name, values]) =>
              //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
              ({ [name]: this.utilities.getDS(values, defunctions[index][0][name]) })
          )
        })

        break;
      case 'modifications':

        break;

    }

    return result;
  }

  /**
   * calcolo la matrice di consistenza relativa alla
   * function priority
   */
  consistency() {

    const functionPriority = this.project.functionpriority; // array esistente della function priority (vedi function priority)
    const l = this.functions.length; // numero di funzioni del progetto
    const PCmatrix = this.utility.matrix(l, l); // inizializzo matrice nxn delle priorità
    /**
     * per ogni coppia di funzioni controllo la loro #priorità e
     * riempio la matrice con i pesi e reciproco dei pesi
     * #priorità -> array di 4 valori [Funzione i,Funzione j, #valore_peso, Funzione vincente]
     * #valore_peso -> [1,3,5,7,9]
     * 
     */
    functionPriority.forEach((priority, index) => {
      const index1 = this.project.functions.indexOf(priority[0]); // indice della funzione i-esima [1,2,3,4]
      const index2 = this.project.functions.indexOf(priority[1]); // indice della funzione j-esima [1,2,3,4]
      if (priority[3] === priority[0]) { // se la funzione vincente è la funzione i-esima 
        PCmatrix[index1][index2] = priority[2] 
        PCmatrix[index2][index1] = 1 / priority[2]

      } else if (priority[3] === priority[1]) { // se la funzione vincente è la funzione j-esima 
        PCmatrix[index1][index2] = 1 / priority[2]
        PCmatrix[index2][index1] = priority[2]
      } else { // se le funzioni hanno uguale priorità (valore 1)
        PCmatrix[index1][index2] = priority[2]
        PCmatrix[index2][index1] = priority[2]
      }

    });


    let Sumcolumn = []; // vettore somma delle colonne della matrice
    // per ogni indice del vettore insierico l'array dei valori colonna della matrice dei pesi e 
    // poi sommo tutti i valori (reduce)
    for (let i = 0; i < PCmatrix.length; i++) {
      Sumcolumn[i] = [];
      for (let j = 0; j < PCmatrix.length; j++) { 
        Sumcolumn[i].push(PCmatrix[j][i]);
      }
      Sumcolumn[i] = Sumcolumn[i].reduce((a, b) => { return a + b });
    }

    let Nmatrix = []; //matrice dei pesi normalizzata, dividendo i valori colonna con i pesi colonna
    for (let j = 0; j < PCmatrix.length; j++) {
      Nmatrix[j] = []
      Sumcolumn.forEach((col, i) => {
        Nmatrix[j][i] = (PCmatrix[j][i] / col)

      });

    }

    this.NPvector = []; // vettore delle priorità
    for (let i = 0; i < Nmatrix.length; i++) {
      this.NPvector[i] = this.utility.getMean(Nmatrix[i]) // vettore delle priorità
      this.NP4func[this.project.functions[i]] = this.utility.getMean(Nmatrix[i]) // vettore delle priorità divise per funzioni
    }

    let CM = []; // matrice della consistenza
    for (let j = 0; j < PCmatrix.length; j++) {
      CM[j] = 0
      this.NPvector.forEach((value, i) => {
        CM[j] += (PCmatrix[j][i] * value);
      });
      CM[j] = CM[j] / this.NPvector[j];
    }

    
    let CI = (this.utility.getMean(CM) - CM.length) / (CM.length - 1); // indice di consistenza
    // CR rapporto di consistenza
    // RI random index
    if (this.RI[CM.length] === 0) {
      this.CR = 0;
    } else {
      this.CR = CI / this.RI[CM.length];
    }

 
    if(this.CR > 0.1){ // Se CR > 0.1 allora la matrice è inconsistente
      this.presentToast() 
      return false;
    }else{
      // se la matrice è consistente allora asegno le priorità (pesi)
      if(this.ahpdata !== undefined){
        this.project.functions.map((x,y)=>{ 
          this.Wvector[x] = this.NPvector[y]; // vettore delle priorità
        })
        this.Wvalues=Object.keys(this.Wvector).map(x=>this.Wvector[x]);
        this.Weight=Object.keys(this.Wvector).sort((a,b)=>{return this.Wvector[b]-this.Wvector[a]});  // vettore delle priorità ordinato per funzione in ordine decrescente
      }

      return true
    }

  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'The matrix is ​​inconsistent. You have to change the priority of the functions',
      duration: 2000,
      position: 'middle',
      color: 'warning',
      buttons: [
        {
          text: 'X',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }

 
  // gestisco output dell'AHP dappa mappa
  addStats(event){

    this.Areas = event; // aree default, meetin e ahp
    this.Areas.tot = Math.round(this.Areas.tot);
    this.Areas.hotarea = Math.round(this.Areas.hotarea);

    this.Areas.functions.map(x => this.Areas4funct[x] = this.Areas[x]);
    Object.keys(this.Areas4funct).map(x => {
      this.Areas4funct[x].area = Math.round(this.Areas4funct[x].area);
      this.Areas4funct[x].mean = Math.round(this.Areas4funct[x].func / this.Areas4funct[x].count);
      this.Areas4funct[x].hot.area = Math.round(this.Areas4funct[x].hot.area);
      this.Areas4funct[x].hot.mean = Math.round(this.Areas4funct[x].hot.func / this.Areas4funct[x].hot.count).toString() === 'NaN' ? 0 : Math.round(this.Areas4funct[x].hot.func/this.Areas4funct[x].hot.count);
    });
  }

}
