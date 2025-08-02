import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  children?: NavigationItem[];
  badge?: string;
  disabled?: boolean;
}

export interface QuickAction {
  label: string;
  icon: string;
  route: string;
  class: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  private isMobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  public isMobileMenuOpen$ = this.isMobileMenuOpenSubject.asObservable();

  private navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      route: '/dashboard',
      roles: ['ADMIN', 'ENCODER', 'VIEWER', 'USER']
    },
    {
      label: 'New Fund Disbursement',
      icon: 'M12 4v16m8-8H4',
      route: '/disbursements/new',
      roles: ['ADMIN', 'ENCODER', 'USER']
    },
    {
      label: 'Fund Disbursements',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      route: '/disbursements',
      roles: ['ADMIN', 'ENCODER', 'VIEWER', 'USER']
    },
    {
      label: 'My Fund Entries',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      route: '/disbursements/my-entries',
      roles: ['ADMIN', 'ENCODER', 'USER']
    },
    {
      label: 'Search & Filter Funds',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      route: '/disbursements/search',
      roles: ['ADMIN', 'ENCODER', 'VIEWER', 'USER']
    },
    {
      label: 'Classify Fund Type',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      route: '/disbursements/classify',
      roles: ['ADMIN', 'ENCODER', 'USER']
    },
    {
      label: 'Fund Reports',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      route: '/reports',
      roles: ['ADMIN', 'ENCODER', 'VIEWER', 'USER']
    },
    {
      label: 'Archived Funds',
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      route: '/disbursements/archived',
      roles: ['ADMIN', 'ENCODER', 'VIEWER', 'USER']
    },
    // Admin-only items
    {
      label: 'System Administration',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      route: '/admin',
      roles: ['ADMIN'],
      children: [
        { label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', route: '/admin/manage-users', roles: ['ADMIN'] },
        { label: 'Role Management', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', route: '/admin/manage-roles', roles: ['ADMIN'] },
        { label: 'Fund Classifications', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', route: '/admin/manage-classifications', roles: ['ADMIN'] },
        { label: 'Session Management', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', route: '/admin/session-management', roles: ['ADMIN'] },
        { label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', route: '/admin/settings', roles: ['ADMIN'] },
        { label: 'Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/admin/audit', roles: ['ADMIN'] }
      ]
    }
  ];

  constructor(private authService: AuthService) {}

  toggleSidebar(): void {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.isCollapsedSubject.next(collapsed);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(!this.isMobileMenuOpenSubject.value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(false);
  }

  getNavigationItems(): NavigationItem[] {
    return this.navigationItems.filter(item => this.hasAccess(item.roles));
  }

  getFilteredNavigationItems(): NavigationItem[] {
    return this.navigationItems.filter(item => {
      if (!this.hasAccess(item.roles)) return false;
      
      // Filter children based on role access
      if (item.children) {
        item.children = item.children.filter(child => this.hasAccess(child.roles));
        // Only show parent if it has accessible children or is accessible itself
        return item.children.length > 0 || this.hasAccess(item.roles);
      }
      
      return true;
    });
  }

  getQuickActions(): QuickAction[] {
    const actions: QuickAction[] = [];
    
    if (this.authService.canEdit()) {
      actions.push({
        label: 'New Disbursement',
        icon: '➕',
        route: '/disbursements/new',
        class: 'quick-action-primary',
        roles: ['ADMIN', 'ENCODER']
      });
    }
    
    actions.push({
      label: 'Generate Report',
      icon: '📊',
      route: '/reports',
      class: 'quick-action-secondary',
      roles: ['ADMIN', 'ENCODER', 'VIEWER']
    });
    
    if (this.authService.isAdmin()) {
      actions.push({
        label: 'User Management',
        icon: '👥',
        route: '/admin/users',
        class: 'quick-action-admin',
        roles: ['ADMIN']
      });
    }

    if (this.authService.canEdit()) {
      actions.push({
        label: 'Data Entry',
        icon: '✏️',
        route: '/entries/new',
        class: 'quick-action-encoder',
        roles: ['ADMIN', 'ENCODER']
      });
    }
    
    return actions.filter(action => this.hasAccess(action.roles));
  }

  private hasAccess(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasAnyRole(roles);
  }

  getRoleBasedRoutes(): { [key: string]: string } {
    const user = this.authService.getCurrentUser();
    if (!user) return { default: '/auth/login' };

    let defaultRoute = '/auth/login';
    if (user.role === 'ADMIN') {
      defaultRoute = '/admin/dashboard';
    } else if (user.role === 'USER') {
      defaultRoute = '/dashboard';
    } else if (user.role === 'ENCODER') {
      defaultRoute = '/dashboard';
    } else if (user.role === 'VIEWER') {
      defaultRoute = '/dashboard';
    }

    return {
      default: defaultRoute,
      dashboard: defaultRoute
    };
  }

  getDefaultRoute(): string {
    const routes = this.getRoleBasedRoutes();
    return routes['default'];
  }

  getDashboardRoute(): string {
    const routes = this.getRoleBasedRoutes();
    return routes['dashboard'];
  }
}