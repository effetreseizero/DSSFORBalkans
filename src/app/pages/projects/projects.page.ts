import { ActionSheetController, AlertController } from '@ionic/angular';
import { DataStoreService } from 'src/app/services/datastore/datastore.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {
  public projects; // projects list
  public currentUser;
  constructor(private router: Router,
              private datastore: DataStoreService,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              ) {
             this.datastore.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.getproject(); // carico i progetti del facilitatore
  }

  createproject() {
    this.router.navigateByUrl('/projects/create'); //redirect pagina nuovo progetto
  }

  /**
   * leggo progetti dal datastore
   */
  getproject() {
    this.datastore.ProjectsSubject.subscribe(res=>{
      
      this.projects = res;
    })
  }

  /**
   * redirect alla pagina del progetto i-esimo
   * @param project 
   */
  gotoproject(project) {
    this.router.navigateByUrl('/project/' + project.id);
  }

  /**
   * redirect alla pagina per l'update del progetto i-esimo
   * @param project 
   */
  updateproject(project) {
   
    this.router.navigateByUrl('/projects/update/' + project.id);
  }

  /**
   * cancello il progetto i-esimo
   * @param project 
   */
  deleteproject(project) {
    this.deleteaction(project);
  }
  /**
   * clono il progetto i-esimo
   * @param project 
   */
  copyproject(project){
    this.copyprojectaction(project);
  }

  /**
   * action sheet per cancellare il progetto i-esimo
   * @param project 
   */
  async deleteaction(project){
    var self = this;
    async function calldeleteactionsheet(project) {

      let actionSheet = await self.actionSheetController.create({
        header: 'Do you really want to delete it?',
        buttons: [
          {
            text: 'Yes, delete',
            handler: () => {
              
              
             return self.datastore.deleteProject(project).then(res=>{
 
             });
            }
          }, {
            text: 'NO',
            handler: () => {

            }
          },
        ]
      });
      await actionSheet.present();
    };
    calldeleteactionsheet(project);
  }

  /**
   * action sheet per clonare il progetto i-esimo
   * @param project 
   */
  async copyprojectaction(project){
    var self = this;
    async function callcloneactionsheet(project) {

      let alertController = await self.alertController.create({
        header: 'Do you want duplicate this project? ',
        subHeader:'Insert new name: ',
        inputs: [
          {
            name: 'name',
            type: 'text',
            placeholder: 'New name'
          }],
        buttons: [
          {
            text: 'Yes',
            handler: data => {
             
             var newproject = Object.assign({}, project);
             newproject.name = data.name;
              
              return self.datastore.dupleProject(newproject).then(res=>{
 
              });
          
         
            }
          }, {
            text: 'No',
            handler: () => {

            }
          },
        ]
      });
      await alertController.present();
    };
    callcloneactionsheet(project);
  }






}
