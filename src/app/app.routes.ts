import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
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
    path: 'connection-test',
    loadComponent: () => import('./shared/components/connection-test/connection-test.component').then(m => m.ConnectionTestComponent)
  },
  // Unified layout for all authenticated users
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      // Dashboard routes
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canView'] }
      },
      // Disbursements routes
      {
        path: 'disbursements',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canView'] }
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] }
          },
          {
            path: 'pending',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['isAdmin'] }
          },
          {
            path: 'approved',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canView'] }
          }
        ]
      },
      // Reports routes
      {
        path: 'reports',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canView'] }
          },
          {
            path: 'financial',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canView'] }
          },
          {
            path: 'analytics',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canView'] }
          },
          {
            path: 'custom',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] }
          }
        ]
      },
      // Archive route
      {
        path: 'archive',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canView'] }
      },
      // Data Entry routes
      {
        path: 'entries',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] }
          },
          {
            path: 'new',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] }
          },
          {
            path: 'my',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] }
          },
          {
            path: 'drafts',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] }
          }
        ]
      },
      // Admin routes
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { permissions: ['isAdmin'] },
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
          },
          {
            path: 'users',
            loadChildren: () => import('./features/admin/manage-users/manage-users.routes').then(m => m.manageUsersRoutes)
          },
          {
            path: 'roles',
            loadChildren: () => import('./features/admin/manage-roles/manage-roles.routes').then(m => m.manageRolesRoutes)
          },
          {
            path: 'classifications',
            loadChildren: () => import('./features/admin/manage-classifications/manage-classifications.routes').then(m => m.manageClassificationsRoutes)
          },
          {
            path: 'settings',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
          },
          {
            path: 'audit',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
          }
        ]
      },
      // Legacy role-based routes for backward compatibility
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
      },
      {
        path: 'encoder',
        loadChildren: () => import('./features/encoder/encoder.routes').then(m => m.encoderRoutes)
      },
      {
        path: 'viewer',
        loadChildren: () => import('./features/viewer/viewer.routes').then(m => m.viewerRoutes)
      },
      // Default redirect for authenticated users
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
