import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError, forkJoin, ObservableInput, Subject } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { User } from '../../models/index';
import { API } from 'src/app/services/api/api.service';
import { Role } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  // login
  private loginAPILoadSubject = new Subject<boolean>();
  public readonly loginAPILoadSubjectObs = this.loginAPILoadSubject.asObservable();
  
  private User; //facilitatore

  // acilitatore e dei suoi dati
  public currentUserSubject: BehaviorSubject<User>; 
  public currentUser: Observable<User>;
  // scenari (shkrell, rugova, knjiazevac)
  public ScenariesSubject = new BehaviorSubject<any>('');
  public currentScenaries = this.ScenariesSubject.asObservable();
   // esagoni degli scenari
  public HexagonsSubject = new BehaviorSubject<any>('');
  public currentHexagons = this.HexagonsSubject.asObservable();

  // progetti
  public ProjectsSubject = new BehaviorSubject<any>('');
  public currentProjects = this.ProjectsSubject.asObservable();

  // progetto del meetin che viene scaricato per gli stakeholder
  public meetinProjectSubject = new BehaviorSubject<any>('');
  public currentmeetinProject = this.meetinProjectSubject.asObservable();
  // stakeholder
  public stakeholderSubject = new BehaviorSubject<any>('');
 
  // dati degli stakeholder 
  public stakeholdersSubject = new BehaviorSubject<any>('');
  public currentStakeholders = this.stakeholdersSubject.asObservable();

  // lista delle cose da fare per il progetto (function priority, meetin result, ahp)
  public todolistSubject = new BehaviorSubject<any>('');
  public currenttodolist = this.todolistSubject.asObservable();

  // risultati dell'AHP
  public ahpresultSubject = new BehaviorSubject<any>('');
  public currentahpresult = this.ahpresultSubject.asObservable();

  //tipo ahp (richiamato da pagina ahp)
  public ahptypeSubject = new BehaviorSubject<any>('');

  public projectsHexagonsSubject = new BehaviorSubject<any>('');
  public currentprojectsHexagons = this.projectsHexagonsSubject.asObservable();

  constructor(private api: API) {
    //inizializzo il currentuser
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // inizializzo datastore dopo il login
  callDastastore() {
    this.loginAPILoadSubject.next(true);
    this.loginAPILoadSubject.complete();
    this.getscenaries(); //scarico gli scenari
    this.getProject(); //scarico gli i progetti
    this.gethexagons(); //scarico gli esagoni degli scenari
    this.gettodolist(); //scarico la todolist dei progetti
    this.getProjectHexList(); //scarico la todolist dei progetti
  }

  public get currentUserValue(): User {

    return this.currentUserSubject.value;
  }

  /**
   * getmeetProject scarica progetto stakeholder
   * @param meetincode codice del meetin per scaricare il progetto per il meetin degli stakeholders
   */
  getmeetProject(meetincode) {
    const f = '?filter[where][code]=' + meetincode;

    return this.api.get('projects' + f, true).pipe(map(res => {

      if (res.length > 0) {
        this.meetinProjectSubject.next(res[0]);
        return [true, res[0]];
      } else {
        return [false, []];
      }

    }), mergeMap((proj: any, index: number): ObservableInput<{}> => {


      if (proj[0]) {
        const fs = '?filter[where][scenario_id]=' + proj[1].scenario_id;
        const fl = '?filter[where][project_id]=' + proj[1].id;
        const hexs = this.api.get('hexagons' + fs, true);
        const hexslist = this.api.get('project_hexagons' + fl, true);
        return forkJoin([hexs,hexslist]).pipe(map(res => {
          this.HexagonsSubject.next(Object.assign({}, { [proj[1].scenario_id]: res[0] }));
          this.projectsHexagonsSubject.next(res[1]);
          
          return [true, proj[1]];
        }))
         
      } else {
        return [false, []];
      }

    })

    );
  };

  /**
   * registrazione stakeholder o facilitatore
   * @param skateholder 
   */
  createStakeholder(skateholder) {
    return this.api.put('stakeholders', skateholder).pipe(map(res => {

      this.stakeholderSubject.next(res);
      return true;
    }));
  } 

  /**
   * aggiorno dati stakeholder
   * indici modificati
   */
  updateStakeholder(skateholder) {

    var newskateholder = Object.assign({}, skateholder);
    delete newskateholder['id'];
    if (skateholder.id === undefined) {
      return this.api.put('stakeholders', newskateholder).pipe(map(res => {

        this.stakeholderSubject.next(skateholder);
        return true;
      }));
    } else {
      return this.api.put('stakeholders/' + skateholder.id, newskateholder).pipe(map(res => {

        this.stakeholderSubject.next(skateholder);
        return true;
      }));
    }


  }

  /**
   * scarico progetti del facilitatore
   */
  getProject() {
    const f = '?filter[where][user_id]=' + this.currentUserSubject.value.id;
    this.api.get('projects' + f, true).subscribe(res => {
      
      this.ProjectsSubject.next(res);
    });
  }

  

  /**
   * creo nuovo progetto
   * @param project nuovo progetto
   */
  createProject(project) {
    return this.api.post('projects', project).pipe(map(res => {
      var projects = this.ProjectsSubject.value;
      var newprojects = res;
      newprojects = projects.concat(newprojects);
      //this.operationsSubject.next(newoperation);
      this.ProjectsSubject.next(newprojects);
      return [true, res];
    }))
  }

  /**
   * aggiorno progetto esistente
   * @param project 
   */
  updateProject(project) {
    var newproject = Object.assign({}, project);
    delete newproject['id']; //elimino id perchè sennò si crea conflitto

    return this.api.put('projects/' + project.id, newproject).pipe(map(res => {

      var projects = this.ProjectsSubject.value;
      var updateproject = project;

      // fields[fields.indexOf(updatefield)] = updatefield;
      projects[projects.indexOf(projects.filter(x => x.id === updateproject.id)[0])] = updateproject;
      this.ProjectsSubject.next(projects);
      return true;
    }));
  };

  /**
   * cancello progetto esistente
   * @param project
   */
  deleteProject(project) {
    return this.api.delete('projects/' + project.id).toPromise().then(res => {
      var projects = this.ProjectsSubject.value;
      var deletedmach = project;
      projects.splice(projects.indexOf(deletedmach), 1);
      this.ProjectsSubject.next(projects);
      return true;
    });
  }

  /**
   * duplico progetto esistente e aggiorno i parametri
   * @param project 
   */
  dupleProject(project) {
    
    var newproject = Object.assign({}, project);
    var list = this.projectsHexagonsSubject.value.filter(x => x.project_id === project.id)[0];
    newproject.code = '';
    newproject.activated = false;
    newproject.expirationdate = '';
    newproject.functionpriority = [];
    debugger;
    newproject['id'];
    delete newproject['id'];
    return this.api.post('projects', newproject).toPromise().then(res => {
      var projects = this.ProjectsSubject.value;
      var newprojects = res;
      newprojects = projects.concat(newprojects);
      //this.operationsSubject.next(newoperation);
      this.ProjectsSubject.next(newprojects);
      return [true, res];
    }).then(proj => {
      if (proj[0]) {
        let stakeholder = {};
        let todolist = {};
        let hexlist = {};
        let projs = proj[1];
        stakeholder['name'] = this.currentUserSubject.value.email;
        stakeholder['project_id'] = projs.id;
        stakeholder['date'] = new Date().toISOString();
        stakeholder['indexes'] = [];
        stakeholder['number'] = 1;
        stakeholder['isFacilitator'] = true;
        todolist['project_id'] = projs.id;
        todolist['user_id'] = projs.user_id;
        todolist['functionpriority'] = false;
        todolist['statisticresult'] = false;
        todolist['statistics'] = "none";
        hexlist['project_id'] = projs.id;
        hexlist['hexagons'] = list.hexagons;
        hexlist['user_id'] = projs.user_id;
        
        if(list.hexagons.length>0){
          hexlist['all'] = false;
        }else{
          hexlist['all'] = true;
        }
        
        this.createtodolist(todolist).subscribe(todolist => {
          

          this.updateStakeholder(stakeholder).subscribe(stakeholder => {
            
            this.createProjectHexList(hexlist).subscribe(res => {
              
            })
           
          });
        });


      }
    });

  }

  getProjectHexList(){
    const fs = '?filter[where][user_id]=' + this.currentUserSubject.value.id;
    this.api.get('project_hexagons' + fs, true).subscribe(res => {
      this.projectsHexagonsSubject.next(res);
     
    })
  }


  createProjectHexList(hexs){
    return this.api.post('project_hexagons', hexs).pipe(map(res => {
      var projlist = this.projectsHexagonsSubject.value;
      var newlist = res;
      newlist = projlist.concat(newlist);
      //this.operationsSubject.next(newoperation);
      this.projectsHexagonsSubject.next(newlist);
       return [true,res];

    }));
  }

  /**
   * scarico gli scenari
   */
  getscenaries() {

    this.api.get('scenaries', false).subscribe(res => {

      this.ScenariesSubject.next(res);

    });

  }

  /**
   * scarico la todolist dei progetti
   */
  gettodolist() {
    if (this.isFacilitator()) {
      const f = '?filter[where][user_id]=' + this.currentUserSubject.value.id;
      this.api.get('todolists' + f, true).subscribe(res => {
        
        this.todolistSubject.next(res);

      });
    }
  }

  /**
   * creo la to do list del progetto
   * @param todolist 
   */
  createtodolist(todolist) {
    return this.api.post('todolists', todolist).pipe(map(res => {
      var todolists = this.todolistSubject.value;
      var newlist = res;
      newlist = todolists.concat(newlist);
      //this.operationsSubject.next(newoperation);
      this.todolistSubject.next(newlist);
      return [true, res];
    }))
  }
  /**
   * aggiorno la todolist quando cambio la priorità delle funzioni 
   * quando faccio il meetin discussion o l'ahp
   * @param todolist 
   */
  updatetodolist(todolist) {
    var newlist = Object.assign({}, todolist);
    delete newlist['id'];

    return this.api.put('todolists/' + todolist.id, newlist).pipe(map(res => {

      var todolists = this.todolistSubject.value;
      var updatelist = todolist;

      // fields[fields.indexOf(updatefield)] = updatefield;
      todolists[todolists.indexOf(todolists.filter(x => x.id === updatelist.id)[0])] = updatelist;
      this.todolistSubject.next(todolists);
      return true;
    }));
  }

  /**
   * scarico per il dati progetto l'elenco degli stakeholder e le loro modifiche
   * @param projectid
   */
  getStakeholdersResults(projectid) {
    const fs = '?filter[where][project_id]=' + projectid;
    return this.api.get('stakeholders' + fs, true).pipe(map(res => {
      let st = res.filter(x => x.isFacilitator !== true);
      this.stakeholdersSubject.next(res);
      return res;
    }

    ))
  }

  /**
   * cosntrollo se e è faciltatore
   */
  isFacilitator() {
    // controllo se l'utente è un facilitatore/admin
    this.currentUser.subscribe(x => this.User = x);
    return this.User && this.User.roles === Role.Admin;
  }

  /**
   * scarico esagoni e li ordino per scenario
   */
  gethexagons() {
    this.api.get('hexagons', false).subscribe(res => {

      let scenaries = this.ScenariesSubject.value;
      const hexagons = this.getGroupedByKey(res, 'scenario_id');
      this.HexagonsSubject.next(hexagons);

    });
  }


  /**
* function for group data by key
* @param {*} data array of data
* @param {*} key key for groupby data
*/
  getGroupedByKey(data, key) {
    let groups = {},
      result = [];
    data.forEach(a => {
      if (!(a[key] in groups)) {
        groups[a[key]] = [];
        result.push(groups[a[key]]);
      }

      groups[a[key]].push(a);
    });
    return groups;
  };

  /**
* function for group data by key
* @param {*} data array of data
* @param {*} key key for groupby data
@param {*} key2 key for groupby inner data
*/
  getGroupedBySubKey(data, key, key2) {
    let groups = {},
      result = [];
    data.forEach(a => {
      if (!(a[key] in groups)) {
        groups[a[key]] = [];
        result.push(groups[a[key]]);
      }

      groups[a[key]].push(a[key2]);
    });
    return groups;
  };


}
