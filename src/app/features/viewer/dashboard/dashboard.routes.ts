import { Routes } from '@angular/router';

export const viewerDashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./viewer-dashboard.component').then(m => m.ViewerDashboardComponent)
  }
];