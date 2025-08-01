import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const viewerRoutes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { expectedRole: 'viewer' },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.viewerDashboardRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes').then(m => m.reportsRoutes)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];