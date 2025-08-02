import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const userRoutes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { permissions: ['canView'] }, // Both ENCODER and VIEWER can access
    children: [
      // Dashboard routes - accessible to both roles
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canView'] }
      },
      
      // Data Entry routes - only for ENCODER role
      {
        path: 'entries',
        canActivate: [RoleGuard],
        data: { permissions: ['canEdit'] }, // Only ENCODER has canEdit permission
        children: [
          {
            path: '',
            loadComponent: () => import('./entries/disbursement-list/disbursement-list.component').then(m => m.DisbursementListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./entries/disbursement-form/disbursement-form.component').then(m => m.DisbursementFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./entries/disbursement-form/disbursement-form.component').then(m => m.DisbursementFormComponent)
          }
        ]
      },
      
      // Reports routes - accessible to both roles
      {
        path: 'reports',
        canActivate: [RoleGuard],
        data: { permissions: ['canView'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
          },
          {
            path: 'export',
            loadComponent: () => import('./reports/export-reports/export-reports.component').then(m => m.ExportReportsComponent)
          },
          {
            path: 'my-reports',
            loadComponent: () => import('./reports/my-reports/my-reports.component').then(m => m.MyReportsComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['canEdit'] } // Only ENCODER can see their own reports
          }
        ]
      },
      
      // Default redirect based on role
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];