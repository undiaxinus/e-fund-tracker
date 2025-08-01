import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'disbursements',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/disbursements/disbursement-list/disbursement-list.component').then(m => m.DisbursementListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/disbursements/disbursement-form/disbursement-form.component').then(m => m.DisbursementFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./features/disbursements/disbursement-form/disbursement-form.component').then(m => m.DisbursementFormComponent)
      }
    ]
  },
  // TODO: Add these routes when components are created
  // {
  //   path: 'reports',
  //   loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'archive',
  //   loadComponent: () => import('./features/archive/archive.component').then(m => m.ArchiveComponent),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'admin',
  //   canActivate: [AuthGuard],
  //   children: [
  //     {
  //       path: 'users',
  //       loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
  //     },
  //     {
  //       path: 'settings',
  //       loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent)
  //     },
  //     {
  //       path: 'audit',
  //       loadComponent: () => import('./features/admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
  //     }
  //   ]
  // },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
