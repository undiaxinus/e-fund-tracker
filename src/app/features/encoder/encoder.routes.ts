import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const encoderRoutes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { expectedRole: 'encoder' },
    children: [
      {
        path: 'entries',
        loadChildren: () => import('./entries/entries.routes').then(m => m.entriesRoutes)
      },
      {
        path: 'my-reports',
        loadChildren: () => import('./my-reports/my-reports.routes').then(m => m.myReportsRoutes)
      },
      {
        path: '',
        redirectTo: 'entries',
        pathMatch: 'full'
      }
    ]
  }
];