import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { expectedRole: 'admin' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'manage-users',
        loadChildren: () => import('./manage-users/manage-users.routes').then(m => m.manageUsersRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('./manage-users/manage-users.routes').then(m => m.manageUsersRoutes)
      },
      {
        path: 'user-management',
        loadChildren: () => import('./manage-users/manage-users.routes').then(m => m.manageUsersRoutes)
      },
      {
        path: 'manage-roles',
        loadChildren: () => import('./manage-roles/manage-roles.routes').then(m => m.manageRolesRoutes)
      },
      {
        path: 'manage-classifications',
        loadChildren: () => import('./manage-classifications/manage-classifications.routes').then(m => m.manageClassificationsRoutes)
      },
      {
        path: 'expense-classifications',
        loadChildren: () => import('./manage-classifications/manage-classifications.routes').then(m => m.manageClassificationsRoutes)
      },
      {
        path: 'disbursement-records',
        loadChildren: () => import('./disbursement-records/disbursement-records.routes').then(m => m.disbursementRecordsRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes').then(m => m.reportsRoutes)
      },
      {
        path: 'system-logs',
        loadChildren: () => import('./system-logs/system-logs.routes').then(m => m.systemLogsRoutes)
      },
      {
        path: 'session-management',
        loadComponent: () => import('./session-management/session-management.component').then(m => m.SessionManagementComponent)
      },
      {
        path: 'archived-data',
        loadChildren: () => import('./archived-data/archived-data.routes').then(m => m.archivedDataRoutes)
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then(m => m.settingsRoutes)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];