import { Routes } from '@angular/router';

export const entriesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./disbursement-list/disbursement-list.component').then(m => m.DisbursementListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./disbursement-form/disbursement-form.component').then(m => m.DisbursementFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./disbursement-form/disbursement-form.component').then(m => m.DisbursementFormComponent)
  }
];