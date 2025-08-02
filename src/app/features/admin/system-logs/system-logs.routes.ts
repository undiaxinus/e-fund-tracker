import { Routes } from '@angular/router';

export const systemLogsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./system-logs.component').then(m => m.SystemLogsComponent)
  }
];