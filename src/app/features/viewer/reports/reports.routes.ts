import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'export',
    loadComponent: () => import('./export-reports/export-reports.component').then(m => m.ExportReportsComponent)
  }
];