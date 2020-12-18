import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/canActivate/can-activate.service'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  //   { path: 'map', 
  //   loadChildren: () => import('./pages/map/map.module').then(m => m.MapPageModule),
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'homepage',
    loadChildren: () => import('./pages/homepage/homepage.module').then(m => m.HomepagePageModule)
  },
  {
    path: 'meetin',
    loadChildren: () => import('./pages/meetin/meetin.module').then(m => m.MeetinPageModule)
  },
  {
    path: 'meetin/meetin-user',
    loadChildren: () => import('./pages/meetin-user/meetin-user.module').then(m => m.MeetinUserPageModule),
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'projects',
    loadChildren: () => import('./pages/projects/projects.module').then(m => m.ProjectsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:action',
    loadChildren: () => import('./pages/crudprojects/crudprojects.module').then(m => m.CrudprojectsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:action/:id',
    loadChildren: () => import('./pages/crudprojects/crudprojects.module').then(m => m.CrudprojectsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/:id',
    loadChildren: () => import('./pages/project/project.module').then(m => m.ProjectPageModule),
  },
  {
    path: 'project/meetin-result/:id',
    loadChildren: () => import('./pages/meetin-result/meetin-result.module').then(m => m.MeetinResultPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/statistics/:id',
    loadChildren: () => import('./pages/statistics/statistics.module').then(m => m.StatisticsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/print/:id',
    loadChildren: () => import('./pages/printresults/printresults.module').then(m => m.PrintresultsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/ahp/:id',
    loadChildren: () => import('./pages/ahp/ahp.module').then(m => m.AhpPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/functionpriority/:id',
    loadChildren: () => import('./pages/functionpriority/functionpriority.module').then(m => m.FunctionpriorityPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'exports',
    loadChildren: () => import('./pages/exports/exports.module').then(m => m.ExportsPageModule),
    canActivate: [AuthGuard]
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
