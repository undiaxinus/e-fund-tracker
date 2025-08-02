import { Routes } from '@angular/router';

export const disbursementRecordsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./disbursement-records.component').then(m => m.DisbursementRecordsComponent)
  }
];