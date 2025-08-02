import { Routes } from '@angular/router';

export const archivedDataRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./archived-data.component').then(m => m.ArchivedDataComponent)
  }
];