import { ToastController } from '@ionic/angular';
import { UtilitiesService } from './../../services/utilities/utilities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStoreService } from './../../services/datastore/datastore.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-meetin-result',
  templateUrl: './meetin-result.page.html',
  styleUrls: ['./meetin-result.page.scss'],
})
export class MeetinResultPage implements OnInit {
  public projectid;
  public stakeholders;
  public project;
  public scenario;
  private currentUser;
  public projecttitle;
  public hexagons;
  public indexes;
  public action = 'meetinresult';
  public hideclass='hide';
  meetinresultmap = true;
  refreshClick
  modifications = {}
  status;
  statistic = ''
  constructor(private route: ActivatedRoute,
    private router: Router,
    private datastore: DataStoreService,
    private utilities: UtilitiesService,
    private location: Location,
    private cd:ChangeDetectorRef,
    private toastController:ToastController) {
    this.datastore.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {

    this.projectid = this.route.snapshot.params['id'];
    this.project = this.datastore.ProjectsSubject.value.filter(x => x.id === this.projectid)[0];
    this.scenario = this.datastore.ScenariesSubject.value.filter(x => x.id === this.project.scenario_id)[0];
    this.status = this.datastore.todolistSubject.value.filter(x => x.project_id === this.project.id)[0];
    this.statistic= this.status.statistics;
    this.hexagons = this.datastore.HexagonsSubject.value[this.scenario.id];
    this.indexes = [...this.hexagons.map(x => x.indexes)];
    this.stakeholders = this.datastore.stakeholdersSubject.value.filter(x => !x.isFacilitator);
    this.projecttitle = this.project.name;
    this.scenario = this.project.scenario_id;


  }

  hidePanel() {
    if (!this.refreshClick.classList.contains(this.hideclass)) {
      this.refreshClick.classList.add(this.hideclass);
    }
  }

  showPanel() {
    if (this.refreshClick.classList.contains(this.hideclass)) {
      this.refreshClick.classList.remove(this.hideclass);
    }
  }

  refresh(){
    
 
    
    this.datastore.getStakeholdersResults(this.projectid).subscribe(res=>{
      this.stakeholders = this.datastore.stakeholdersSubject.value.filter(x => !x.isFacilitator);
      this.meetinresultmap=false;
      setTimeout(()=>{
        this.meetinresultmap=true;
      },100);
     
   
    });

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

  changeStatistic(event) {
    this.statistic = event.target.value;
  }


  // applyStatisticToresult(type) {
  //   let shindexes = this.datastore.getGroupedBySubKey(this.stakeholders.map(x => x.indexes).flat(), 'id', 'functions');
  //   let defunctions = this.datastore.getGroupedBySubKey(this.indexes, 'id', 'defaultproperties');

  //   let result = {};
  //   switch (type) {
  //     case 'mean':

       
  //       Object.keys(shindexes).forEach(index => {
  //         result[index] = Array.from(shindexes[index].reduce(
  //           (acc, obj) => Object.keys(obj).reduce(
  //             (acc, key) => typeof obj[key] == "number"
  //               ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
  //               : acc,
  //             acc),
  //           new Map()),
  //           ([name, values]) =>
  //             //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
  //             ({ [name]: this.utilities.getMean(values) })
  //         )
  //       })

  //       break;
  //     case 'mode':
  //       Object.keys(shindexes).forEach(index => {
  //         result[index] = Array.from(shindexes[index].reduce(
  //           (acc, obj) => Object.keys(obj).reduce(
  //             (acc, key) => typeof obj[key] == "number"
  //               ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
  //               : acc,
  //             acc),
  //           new Map()),
  //           ([name, values]) =>
  //             //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
  //             ({ [name]: this.utilities.getMode(values) })
  //         )
  //       })

  //       break;
  //     case 'median':
  //       Object.keys(shindexes).forEach(index => {
  //         result[index] = Array.from(shindexes[index].reduce(
  //           (acc, obj) => Object.keys(obj).reduce(
  //             (acc, key) => typeof obj[key] == "number"
  //               ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
  //               : acc,
  //             acc),
  //           new Map()),
  //           ([name, values]) =>
  //             //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
  //             ({ [name]: this.utilities.getMedian(values) })
  //         )
  //       })

  //       break;
  //     case 'devst':
 
  //       Object.keys(shindexes).forEach(index => {
  //         result[index] = Array.from(shindexes[index].reduce(
  //           (acc, obj) => Object.keys(obj).reduce(
  //             (acc, key) => typeof obj[key] == "number"
  //               ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
  //               : acc,
  //             acc),
  //           new Map()),
  //           ([name, values]) =>
  //             //({ [name]: values.reduce( (a,b) => a+b ) / values.length })
  //             ({ [name]: this.utilities.getDS(values, defunctions[index][0][name]) })
  //         )
  //       })
        
  //       break;
  //     case 'modifications':

  //       break;
  //     default:

 
      

  //   }

  //   return result;
  // }

  /**
   *     this.status['statisticresult'] = true;
    this.status['statistics'] = type;
    
    this.datastore.updatetodolist(this.status).subscribe(res=>{

    })
   */

   changeStats(type){
    //this.applyStatisticToresult(type);
    this.status['statisticresult'] = true;
    this.status['statistics'] = type;
 
    this.datastore.updatetodolist(this.status).subscribe(res=>{
      this.presentToastConfirm();
    });
   }
 
}
