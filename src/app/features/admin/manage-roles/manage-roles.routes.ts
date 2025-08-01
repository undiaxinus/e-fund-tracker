import { Routes } from '@angular/router';

export const manageRolesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./manage-roles.component').then(m => m.ManageRolesComponent)
  }
];