import { DescriptionComponent } from './../../shared/modals/description/description.component';
import { FunctionsLetter, FunctionsDescriptions,Functions } from './../../models';
import { DataStoreService } from './../../services/datastore/datastore.service';
import { ExtentComponent } from './../../shared/modals/extent/extent.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ModalController, PopoverController, ActionSheetController } from '@ionic/angular';


@Component({
  selector: 'app-crudprojects',
  templateUrl: './crudprojects.page.html',
  styleUrls: ['./crudprojects.page.scss'],
})
export class CrudprojectsPage implements OnInit {
  public crudproject;
  public action; // action: create, read, update, delete
  public buttonclick = '';
  public projectid; // project id
  public formProject; // projects Form
  public scenaries; // list of scenaries
  public projects; // list of projects
  public selectedProject; // selected project for update action
  public selectedFunctions = [];
  private stakeholder = {};
  private todolist = {};
  customHex = [];
  hexlist = {};
  public ferFunct = [{ id: 'F1', func: 'touristicfunct', value: 'touristic', isChecked: false, letter: 'FT' },
  { id: 'F2', func: 'woodfunct', value: 'wood production', isChecked: false, letter: 'FP'  },
  { id: 'F3', func: 'conservativefunct', value: 'conservative', isChecked: false, letter: 'FC'  },
  { id: 'F4', func: 'protectivefunct', value: 'protective', isChecked: false, letter: 'FM'  }
  ];
  public extentList = [
    { id: 0, name: 'Shkrel', extent: { west: 2165658.8492, south: 5189775.2968, east: 2194107.1635, north: 5224940.3034 } },
    { id: 0, name: 'Rugova', extent: { west: 2223390.3741, south: 5254279.3196, east: 2259138.4286, north: 5278713.8512 } },
    { id: 0, name: 'Knjazevac', extent: { west: 2165658.8492, south: 5189775.2968, east: 2524618.36444, north: 5425298.30912 } },
  ];
  public isHexSelect = false;
  public functionsLetter=FunctionsLetter;
  public functionsDescrtions=FunctionsDescriptions;
  public Functions=Functions;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private datastore: DataStoreService,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.datastore.ScenariesSubject.subscribe(res => {

      this.scenaries = res;
    })

    this.datastore.ProjectsSubject.subscribe(res => {

      this.projects = res;
    })

    this.action = this.route.snapshot.params['action'];
    this.projectid = this.route.snapshot.params['id'];


    switch (this.action) {
      case 'create':
        this.crudproject = 'CREATEPROJECT';

        this.formProject = this.formBuilder.group({
          name: ['', [Validators.required, Validators.minLength(3)]],
          // duration: ['today', Validators.required],
          // date: [''],
          scenario_id: ['Shkrel'],
          extent: this.extentForm(),
          resolution: ['medium', Validators.required],
          functions: new FormArray([])
          // functpriority: ''
        });


        break;
      case 'read':
        this.crudproject = 'GETPROJECT';



        break;
      case 'update':
        this.crudproject = 'UPDATEPROJECT';

        this.selectedProject = this.projects.filter(project => project.id === this.projectid)[0];


        this.formProject = this.formBuilder.group({
          name: ['', [Validators.required, Validators.minLength(3)]],
          scenario_id: ['Shkrel'],
          extent: this.extentForm(),
          resolution: ['medium', Validators.required],
          functions: new FormArray([]),
          functionpriority_status: false,
          statisticresult_status: false,
          statisticresult_type: "mean"

        });
        let scenario = this.scenaries.filter(x => x.id === this.selectedProject.scenario_id)[0];

        this.formProject.controls['name'].setValue(this.selectedProject.name);
        this.formProject.controls['scenario_id'].setValue(scenario.name);
        this.formProject.controls['resolution'].setValue(scenario.resolution);
        this.formProject.controls['extent'].setValue(scenario.extent);

        const formArray: FormArray = this.formProject.get('functions') as FormArray;
        this.ferFunct.forEach((func, index) => {
          if (this.selectedProject.functions.indexOf(func.id) > -1) {
            formArray.push(new FormControl(func.id));
            this.selectedFunctions.push(index);
          }
        })





        break;
      case 'delete':

        this.crudproject = 'DELETEPROJECT';
        break;
      default:
      // code block
    }

  }

  hoverModal(){
    debugger;
    const self = this;
    const Title = 'HEXAGONRESTITLE'
    const Subtitle = ''
    const Body = 'HEXAGONRESBODY';
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


  extentForm() {
    return this.formBuilder.group({ west: 2165658.8492, south: 5189775.2968, east: 2194107.1635, north: 5224940.3034 });
  }


  defaultpriorityForm(f1, f2) {
    return this.formBuilder.group({
      f1: f1,
      f2: f2,
      priority: '='
    });
  }


  onCheckChange(event) {

    const formArray: FormArray = this.formProject.get('functions') as FormArray;
    /* Selected */
    if (event.target.checked) {

      // Add a new control in the arrayForm
      formArray.push(new FormControl(event.target.value[0]));
      this.selectedFunctions.push(event.target.value[1]);

    }
    /* unselected */
    else {
      // find the unselected element

      let i: number = 0;

      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value == event.target.value[0]) {

          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);
          this.selectedFunctions.splice(i, 1);
          return;
        }

        i++;
      });

    }


  }

  getPriorities(form) {
    return form.controls.functpriority.controls;
  }

  changeResolution(evt) {

    let res = this.formProject.get('resolution');
    res.setValue(evt.target.value);
    
  }


  saveProject(form) {
    
    const Form = form.value;
    Form.functions.sort();

    const scenario = this.scenaries.filter(x => x.name === Form.scenario_id && JSON.stringify(x.extent) === JSON.stringify(Form.extent) && x.resolution === Form.resolution)[0];
    Form.scenario_id = scenario.id;
    if (this.crudproject === 'CREATEPROJECT') {

      /**
       * creo documento stakeholder per il facilittore
      */


      const project = {
        user_id: sessionStorage.getItem('tokenUser'),
        code: '',
        expirationdate: '',
        activated: false,
        public: false,
        indexes: [],
        functionpriority: []

      }

      let progetto = Object.assign(Form, project);

      this.datastore.createProject(progetto).subscribe(res => {

        if (res[0]) {
          
          let proj = res[1]
          this.stakeholder['name'] = this.datastore.currentUserSubject.value.email;
          this.stakeholder['project_id'] = proj.id;
          this.stakeholder['date'] = new Date().toISOString();
          this.stakeholder['indexes'] = [];
          this.stakeholder['number'] = 1;
          this.stakeholder['isFacilitator'] = true;
          this.todolist['project_id'] = proj.id;
          this.todolist['user_id'] = proj.user_id;
          this.todolist['functionpriority'] = false;
          this.todolist['statisticresult'] = false;
          this.todolist['statistics'] = "none";
          this.hexlist['project_id'] = proj.id;
          this.hexlist['hexagons'] = this.customHex;
          this.hexlist['user_id'] = proj.user_id;
          if(this.customHex.length > 0){
            this.hexlist['all'] = false;
          }else{
            this.hexlist['all'] = true;
          }
          this.datastore.createtodolist(this.todolist).subscribe(todolist => {
        
            this.datastore.updateStakeholder(this.stakeholder).subscribe(res => {
              this.datastore.createProjectHexList(this.hexlist).subscribe(res => {
                this.router.navigateByUrl('/projects');
              })
             
            });
          });
     
  
        }
      });
    } else if (this.crudproject === 'UPDATEPROJECT') {

      let progetto = Object.assign(this.selectedProject, Form);
      this.datastore.updateProject(progetto).subscribe(res => {

        if (res) {
          this.router.navigateByUrl('/projects');
        }
      });

    }

    // //var aaa = Object.keys(indexes).map(key=>{return indexes[key].filter((x,i)=>this.selectedFunctions.includes(i))})
    // indexes.forEach(elem => {
    //     Object.keys(elem.defaultproperties).forEach(prop=>{
    //     if(!Form.functions.includes(prop)){
    //       delete elem.defaultproperties[prop];
    //     }
    //   })
    // })





  }

  partecipatory() {

    this.buttonclick = 'partecipatory';
  }

  inview() {

    this.buttonclick = 'inview';
  }

  changeScenario(evt) {


    let value = evt.target.value;
    let extent = this.formProject.get('extent');
    this.extentList.forEach(ext => {
      if (ext.name === value) {
        extent.setValue(ext.extent);
        return;
      }
    });

    this.formProject.get('scenario_id').setValue(value);


  }

  addCustomExtent() {
    this.customHex=[];
    const Extent = this.formProject.get('extent').value;
    const Scenario = this.formProject.get('scenario_id').value;
    const Resolution = this.formProject.get('resolution').value;
    const self = this;
    async function extentmodal() {
      const extentModal = await self.modalController.create({
        component: ExtentComponent,
        componentProps: { action: 'extent', extent: Extent,  scenario: Scenario, resolution: Resolution, customhexs: self.customHex },
        backdropDismiss: false,
      });
      await extentModal.present();
      return await extentModal.onDidDismiss().then(res => {
        
        if(res.data !== undefined){
          self.customHex = res.data;
          self.isHexSelect=true;
        }else{
          self.customHex = [];
        }
       
       

      });
    }
    if(!this.isHexSelect){
      extentmodal();
    }
  }

  resetExtent(){
    var self = this;
    async function callresetactionsheet() {

      let actionSheet = await self.actionSheetController.create({
        header: 'Do you really want to reset hexagons selection?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              self.isHexSelect=false;
              self.changeExtent();
            }
          }, {
            text: 'No',
            handler: () => {

            }
          },
        ]
      });
      await actionSheet.present();
    };
    
    callresetactionsheet();
  }

 
  changeExtent() {

    
      
      this.addCustomExtent();
    

  }




  toggleSection() {

  }



  checkFerFunct() {
    if (this.selectedFunctions.length > 0) {
      return true;
    }

  }


}
