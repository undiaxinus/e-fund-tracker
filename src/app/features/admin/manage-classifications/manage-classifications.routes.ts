import { Routes } from '@angular/router';

export const manageClassificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./manage-classifications.component').then(m => m.ManageClassificationsComponent)
  }
];