import { Routes } from '@angular/router';

export const manageUsersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./manage-users.component').then(m => m.ManageUsersComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent)
  }
];