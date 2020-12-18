import { SettingsMapComponent } from './../../shared/settings-map/settings-map.component';
import { DataStoreService } from './../../services/datastore/datastore.service';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Location } from '@angular/common';
import ObjectID from 'bson-objectid';
import { Role, Functions, FunctionsLetter, FunctionsDescriptions } from '../../models';
import { DescriptionComponent } from './../../shared/modals/description/description.component';
import { ActionModalComponent } from './../../shared/modals/action-modal/action-modal.component';




@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit, AfterViewInit {
  public projecttitle = '';
  public projectid; // project id
  public project; // project
  public scenario;
  public activation = true;
  public ifhomepage = true;
  public Functions = Functions; // modello delle function
  public functionsLetter = FunctionsLetter
  public functionDescription = FunctionsDescriptions
  public status = { true: 'Activated', false: 'Disabled' };
  public currentUser;
  public action = 'project';
  @ViewChild(SettingsMapComponent, {static: false}) mappa: SettingsMapComponent;
  /**
   * classi css per modifiche fullscreen
   */
  private shownClassName = 'expandmap';
  private hideClassName = 'hideitem';
  private staholderClassName = 'stakeholder';

  /**
 * click e item dentro html e classi
 */
  private mapexpanded: boolean = false;
  private mapClick;
  private homepage; // div che non contiene la mappa ma tutto il testo
  private resizemap;
  private buttondiv;
  private buttonshowdiv;
  private projectfullscreen;
  public customPickerOptions: any;
  public todolist;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalController: ModalController,
              private actionSheet: ActionSheetController,
              private datastore: DataStoreService,
              private location: Location) {
 
    this.datastore.currentUser.subscribe(x => this.currentUser = x); //leggo il currentuser (facilitatore o stakeholder)
    let self = this;

    this.customPickerOptions = { //opzioni per il timepiker per modificare la data di scadenza del meetin
      buttons: [{
        text: 'Update',
        handler: (evt) => {
          const data = new Date(evt.year.value, (evt.month.value - 1), evt.day.value).toISOString();
          // const date = new Date(data.setMonth(data.getMonth() + 6)).toISOString();
          this.project.expirationdate = data;
          self.datastore.updateProject(self.project).subscribe(res => {
          });
        }
      }, {
        text: 'Close',
        handler: (evt) => {

        }
      }]
    }


  }

  // init component project
  ngOnInit() {
    
    this.projectid = this.route.snapshot.params['id']; // leggo id del progetto dalla barra di navigazione

    // inizio selezione dei bottoni e dei componenti della mappa per il resize a fullscreen
    this.mapClick = document.getElementById('map');  
    this.homepage = document.getElementById('homepage');
    this.resizemap = document.getElementById('resizemap');
    this.buttondiv = document.getElementById('buttondiv');
    this.buttonshowdiv = document.getElementById('buttondivshow');
    this.projectfullscreen = document.getElementById('projectfullscreen');
    // -------------------  fine selezione ----------------------------------

    //se l'utente è il faciltatore
    if (this.isFacilitator()) {
      // leggo e inizializzo progetto del facilitatore
      this.datastore.ProjectsSubject.subscribe(projects => {
        this.project = projects.filter(project => project.id === this.projectid)[0];
        this.projecttitle = this.project.name;
        let functions = this.project.functions;
        this.scenario = this.project.scenario_id;
        this.todolist=this.datastore.todolistSubject.value.filter(x => x.project_id === this.project.id)[0];
      });
    } else {
      // altrimenti
      // leggo e inizializzo progetto dello stakeholder e modifico la mappa che diventa leggermente più grande
      this.projectfullscreen.classList.add(this.staholderClassName);
      this.datastore.currentmeetinProject.subscribe(project => {

        this.project = project;
        this.projecttitle = this.project.name;
        this.scenario = this.project.scenario_id;


      });
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
        componentProps: { title: Title, subtitle:Subtitle, body: Body },
        backdropDismiss: false,
      });
      await descrModal.present();
    }

    descmodal();

  }

  /**
   * collaso mappa
   */
  collapse() {
    if (this.mapClick.classList.contains(this.shownClassName)) {
      this.mapClick.classList.remove(this.shownClassName);
      this.homepage.classList.remove(this.hideClassName);
      this.buttondiv.classList.add(this.hideClassName);
      this.buttonshowdiv.classList.remove(this.hideClassName);
      this.mappa.refresh();
    }
    this.mapexpanded = false;
    if (!this.mapexpanded) {
    }
  };

    /**
   * espando mappa
   */
  expand() {
    if (!this.mapClick.classList.contains(this.shownClassName)) {
      
      this.mapClick.classList.add(this.shownClassName);
      this.homepage.classList.add(this.hideClassName);
      this.buttondiv.classList.remove(this.hideClassName);
      this.buttonshowdiv.classList.add(this.hideClassName);
      this.mappa.refresh();
    };
    this.mapexpanded = true;


  };

  isFacilitator() {
    this.datastore.currentUser.subscribe(x => this.currentUser = x);
    return this.currentUser && this.currentUser.roles === Role.Admin;
  }

  ngAfterViewInit(): void {
   
  }



  gotofunctionpriority() {
    this.datastore.getStakeholdersResults(this.projectid).subscribe(res => {


      this.router.navigateByUrl('/project/functionpriority/' + this.projectid);

    });

  }

  gotToPrintResult(){
    this.router.navigateByUrl('/project/print/' + this.projectid);
  }
 
  /**
   * Modale che attiva o disabilita il progetto
   */
  changeStatus() {

    const self = this;
    const Text = this.project.activated ? 'Disable' : 'Activate';
    async function statusmodal() {
      const StatusModal = await self.modalController.create({
        component: ActionModalComponent,
        componentProps: { title: Text + ' this project', parameter: Text, action: 'statusactivation' },
        backdropDismiss: false,
      });
      await StatusModal.present();
      return await StatusModal.onDidDismiss().then(res => {
        
        if (res.data !== false) {

          // se l'utente abilita o disabilita il progetto allora aggiorno il progetto
          self.project.activated = !self.project.activated;
          if (Text === 'Activate' && self.project.activated) {
            console.log('Activate');
            const token = Math.random().toString(36).substring(2, 8) //token lungo 6 caratteri
            self.project.code = token;
            const data = new Date();
            const date = new Date(data.setMonth(data.getMonth() + 6)).toISOString();
            self.project.expirationdate = date;
            //aggiorno il progetto dal datastore
            self.datastore.updateProject(self.project).subscribe(res => {
            });

          }
        }
      });
    }
    statusmodal();

  }

 

  changeActivation(event) {
 
    this.changeStatus();
  }

  /**
   * go to meeetin result page
   */
  gotomeetinresult() {
    this.datastore.getStakeholdersResults(this.projectid).subscribe(res => {
      
      this.router.navigateByUrl('/project/meetin-result/' + this.projectid);

    });

  }

  /**
   * go to ahp
   */
  gotoahp(){
    this.datastore.getStakeholdersResults(this.projectid).subscribe(res => {
      
      this.router.navigateByUrl('/project/ahp/' + this.projectid);

    });
    
  }
 
}
