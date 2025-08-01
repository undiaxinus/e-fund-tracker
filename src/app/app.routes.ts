import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'encoder',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/encoder/encoder.routes').then(m => m.encoderRoutes)
  },
  {
    path: 'viewer',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/viewer/viewer.routes').then(m => m.viewerRoutes)
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
