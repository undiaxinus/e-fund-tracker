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
        path: 'manage-roles',
        loadChildren: () => import('./manage-roles/manage-roles.routes').then(m => m.manageRolesRoutes)
      },
      {
        path: 'manage-classifications',
        loadChildren: () => import('./manage-classifications/manage-classifications.routes').then(m => m.manageClassificationsRoutes)
      },
      {
        path: 'session-management',
        loadComponent: () => import('./session-management/session-management.component').then(m => m.SessionManagementComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];