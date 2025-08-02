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
      
      // Search routes - accessible to both roles
      {
        path: 'search',
        loadComponent: () => import('./search/search.component').then(m => m.SearchComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canView'] }
      },
      
      // Classification routes - only for ENCODER role
      {
        path: 'classify',
        loadComponent: () => import('./classify/classify.component').then(m => m.ClassifyComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canEdit'] } // Only ENCODER can classify entries
      },
      
      // My Entries routes - only for ENCODER role
      {
        path: 'my-entries',
        loadComponent: () => import('./my-entries/my-entries.component').then(m => m.MyEntriesComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canEdit'] } // Only ENCODER can see their own entries
      },
      
      // Archived routes - accessible to both roles
      {
        path: 'archived',
        loadComponent: () => import('./archived/archived.component').then(m => m.ArchivedComponent),
        canActivate: [RoleGuard],
        data: { permissions: ['canView'] }
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