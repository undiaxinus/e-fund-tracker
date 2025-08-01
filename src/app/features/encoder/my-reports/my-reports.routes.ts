import { Routes } from '@angular/router';

export const myReportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./my-reports.component').then(m => m.MyReportsComponent)
  }
];