import { DescriptionComponent } from './../../shared/modals/description/description.component';
import { DataStoreService } from './../../services/datastore/datastore.service';
import { UtilitiesService } from './../../services/utilities/utilities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Options } from 'ng5-slider';
import { ones, index, subset, evaluate, eigs } from 'mathjs';
import * as math from 'mathjs';
import * as numeric from 'numericjs';
import { ToastController, ModalController } from '@ionic/angular';
declare var calcEigenvalues: any;
import {FunctionsLetter, Functions, FunctionsDescriptions} from '../../models';

@Component({
  selector: 'app-functionpriority',
  templateUrl: './functionpriority.page.html',
  styleUrls: ['./functionpriority.page.scss'],
})
export class FunctionpriorityPage implements OnInit, AfterViewInit {
  public projectid; //id progetto
  public stakeholders; //dati stakeholders
  public project; //progetto
  public scenario; //scenario del progetto
  public projecttitle; //titolo del progetto (nome)
  public functions;
  public functionsLetter = FunctionsLetter;
  public Functions = Functions;
  public functionDescription = FunctionsDescriptions;
  functionpriority = [];
  public action = 'meetinresult';
 
  public numbers = []
  priorities=[];
  private shownClassName = 'priorityselected';
  private defaultclass = 'priorityselector';
  private CR;
  private status; 
  private Wvector={};
  Weight=['F1','F1'];
  Wvalues=['F1','F1'];

  private infocard;
  private infocardcontent;
  private hidecard = 'hidecard';
  public collapsed = true;

  RI = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

  options: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 9, legend: 'Extreme important' },
      { value: 7 },
      { value: 5, legend: 'Good' },
      { value: 3 },
      { value: 1, legend: 'Equal' },
      { value: 0.33 },
      { value: 0.2, legend: 'Fair' },
      { value: 0.14 },
      { value: 0.11, legend: 'Very poor' }
    ]
  };

  public items: any = [];
  inconsistencytoast
  constructor(private route: ActivatedRoute,
              private router: Router,
              private utility: UtilitiesService,
              private datastore: DataStoreService,
              public toastController: ToastController,
              public modalController: ModalController) { }

  ngOnInit() {
    this.infocard = document.getElementById('info-card');  
    this.infocardcontent = document.getElementById('info-content');  
 
    this.projectid = this.route.snapshot.params['id'];
    this.project = JSON.parse(JSON.stringify(this.datastore.ProjectsSubject.value.filter(x => x.id === this.projectid)[0]));
    this.scenario = this.datastore.ScenariesSubject.value.filter(x => x.id === this.project.scenario_id)[0];
    this.stakeholders = this.datastore.stakeholdersSubject.value;
    this.functions = this.project.functions;
    this.scenario = this.project.scenario_id;
    this.status=this.datastore.todolistSubject.value.filter(x => x.project_id === this.project.id)[0];
    this.project.functions.map(x=>{
      this.Wvector[x] = '';
    })
    /**
     * se non ho già assegnato la functionpriority allora 
     * ne assegno una di default e metto tutti i valori a pari a uno.
     */
    if (this.project.functionpriority.length === 0) {
      var count=0;
      for (let i = 0; i < this.functions.length; i++) {
        for (let j = i + 1; j < this.functions.length; j++) {

          this.project.functionpriority.push([this.functions[i], this.functions[j], 1, '']); // functionpriority
          this.numbers[count]=[];
          this.numbers[count].push({ id: 9, func: this.functions[i] },
                              { id: 7, func: this.functions[i] },
                              { id: 5, func: this.functions[i] },
                              { id: 3, func: this.functions[i] },
                              { id: 1, func: '' },
                              { id: 3, func: this.functions[j] },
                              { id: 5, func: this.functions[j] },
                              { id: 7, func: this.functions[j] },
                              { id: 9, func: this.functions[j] })

                              count++;
        }

      }

  
    }else{
      // se invece la functionp priority c'è
      // assegno quei valori
      var count=0;
      for (let i = 0; i < this.functions.length; i++) {
        for (let j = i + 1; j < this.functions.length; j++) {
          this.numbers[count]=[];
          this.numbers[count].push({ id: 9, func: this.functions[i] },
                              { id: 7, func: this.functions[i] },
                              { id: 5, func: this.functions[i] },
                              { id: 3, func: this.functions[i] },
                              { id: 1, func: '' },
                              { id: 3, func: this.functions[j] },
                              { id: 5, func: this.functions[j] },
                              { id: 7, func: this.functions[j] },
                              { id: 9, func: this.functions[j] })

                              count++;
        }
      }
      
    }
    

   
  }

  async presentToastConfirm() {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }

  hoverModal(funct){
    debugger;
    const self = this;
    const Title = this.Functions[funct]
    const Subtitle = this.functionDescription[funct];
    const Body = this.functionsLetter[funct];
    async function descmodal() {
      const descrModal = await self.modalController.create({
        component: DescriptionComponent,
        componentProps: { title: Title, subtitle:Subtitle, body: Body },
        backdropDismiss: false,
      });
      await descrModal.present();
    }

    descmodal();

  }

  expandItem(): void {
  /**
  //  * collaso mappa
  //  */
  if(this.collapsed){
    this.collapsed=!this.collapsed;
    this.infocardcontent.classList.remove(this.hidecard);
  }else{
    this.collapsed=!this.collapsed;
    this.infocardcontent.classList.add(this.hidecard);
  }
  

 
  }

  ngAfterViewInit(){
    this.consistency(); // calcolo consistenza della function priority per la function priority scelta
    this.project.functionpriority.forEach((x,i)=>{
      
      this.priorities.push(document.getElementById(x[0]+x[1]+x[2]+x[3]));
      debugger;
      this.priorities[i].classList.add(this.shownClassName);
      
 
    })
  }

  /**
   *  aggiorno function prioritys
   */
  updateFP() {


      if(this.CR<=0.1){
          this.datastore.updateProject(this.project).subscribe(res => {
        if(res){
          this.status['functionpriority']=true;
          this.datastore.updatetodolist(this.status).subscribe(res=>{
            //this.location.back();
            this.presentToastConfirm();
          })
        }
      });
 

      }else{

        this.inconsistencyToast();

      }


  }

  /**
   * aggiorno valori della function priority
   * @param index indice delle funzioni 
   * @param func  funzione
   * @param value peso
   * @param side  funzione vincente
   */
  changeFuncPriorities(index, func, value, side) {
    
    if (this.project.functionpriority[index] === func) {
      this.priorities[index].classList.remove(this.shownClassName);
      this.priorities[index] = document.getElementById(func[0]+func[1]+value+side)
      this.priorities[index].classList.add(this.shownClassName);
   
      this.project.functionpriority[index][2] = value;
      this.project.functionpriority[index][3] = side;
      this.consistency();
      // this.datastore.updateProject(this.project).subscribe(res => {
      //   if(res){
      //     this.consistency();
      //   }
      // });
    }

  }


  consistency() {

    const functionPriority = this.project.functionpriority;
    const l = this.functions.length;

    const PCmatrix = this.utility.matrix(l, l);

    functionPriority.forEach((priority, index) => {
 
      const index1 = this.project.functions.indexOf(priority[0]);
      const index2 = this.project.functions.indexOf(priority[1]);
      if (priority[3] === priority[0]) {
        PCmatrix[index1][index2] = priority[2]
        PCmatrix[index2][index1] = 1/priority[2]
      } else if (priority[3] === priority[1]) {
        PCmatrix[index1][index2] = 1/priority[2]
        PCmatrix[index2][index1] = priority[2]
      } else {
        PCmatrix[index1][index2] = priority[2]
        PCmatrix[index2][index1] = priority[2]
      }
 
    });


    let Sumcolumn = [];
    for (let i = 0; i < PCmatrix.length; i++) {
      Sumcolumn[i] = [];
      for (let j = 0; j < PCmatrix.length; j++) {
        Sumcolumn[i].push(PCmatrix[j][i]);
      }
      Sumcolumn[i] = Sumcolumn[i].reduce((a, b) => { return a + b });
    }

    let Nmatrix = [];
    for (let j = 0; j < PCmatrix.length; j++) {
      Nmatrix[j] = []
      Sumcolumn.forEach((col, i) => {
        Nmatrix[j][i] = (PCmatrix[j][i] / col)

      });

    }
    let NPvector = [];
    for (let i = 0; i < Nmatrix.length; i++) {
      NPvector[i] = this.utility.getMean(Nmatrix[i])
    }

    let CM = [];
    for (let j = 0; j < PCmatrix.length; j++) {
      CM[j] = 0
      NPvector.forEach((value, i) => {
        CM[j] += (PCmatrix[j][i] * value);
      });
      CM[j] = CM[j] / NPvector[j];
    }


    let CI = (this.utility.getMean(CM) - CM.length) / (CM.length - 1);
    if(this.RI[CM.length]===0){
      this.CR=0;
    }else{
      this.CR = CI / this.RI[CM.length];
    }
    
    if(this.CR > 0.1){
      this.inconsistencyToast();
    }else{
      this.consistencyToast();
      this.project.functions.map((x,y)=>{
        this.Wvector[x] = NPvector[y];
      })
      this.Wvalues=Object.keys(this.Wvector).map(x=>this.Wvector[x]);
      this.Weight=Object.keys(this.Wvector).sort((a,b)=>{return this.Wvector[b]-this.Wvector[a]});
    }
    
  }


  async inconsistencyToast() {
    try {
      this.inconsistencytoast.dismiss();
  } catch(e) {}

    this.inconsistencytoast = await this.toastController.create({
      message: 'The matrix is ​​inconsistent. You have to change the priority of the functions',
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
    this.inconsistencytoast.present();
  }

  async consistencyToast() {
    debugger;
    try {
      this.inconsistencytoast.dismiss();
  } catch(e) {}
  
    const toast = await this.toastController.create({
      message: 'The matrix is ​​consistent!',
      position: 'middle',
      color: 'success',
      duration:500,
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

    setTimeout(()=>{
      toast.present();
    },100)
   
  }


}
