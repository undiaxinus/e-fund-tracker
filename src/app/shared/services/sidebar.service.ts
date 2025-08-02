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
      icon: '📊',
      route: '/dashboard',
      roles: ['ADMIN', 'ENCODER', 'VIEWER']
    },
    {
      label: 'Disbursements',
      icon: '💰',
      route: '/disbursements',
      roles: ['ADMIN', 'ENCODER', 'VIEWER'],
      children: [
        { label: 'View All', icon: '👁️', route: '/disbursements', roles: ['ADMIN', 'ENCODER', 'VIEWER'] },
        { label: 'New Entry', icon: '➕', route: '/disbursements/new', roles: ['ADMIN', 'ENCODER'] },
        { label: 'Pending Approval', icon: '⏳', route: '/disbursements/pending', roles: ['ADMIN'] },
        { label: 'Approved', icon: '✅', route: '/disbursements/approved', roles: ['ADMIN', 'ENCODER', 'VIEWER'] }
      ]
    },
    {
      label: 'Reports',
      icon: '📈',
      route: '/reports',
      roles: ['ADMIN', 'ENCODER', 'VIEWER'],
      children: [
        { label: 'Financial Reports', icon: '📊', route: '/reports/financial', roles: ['ADMIN', 'ENCODER', 'VIEWER'] },
        { label: 'Analytics', icon: '📈', route: '/reports/analytics', roles: ['ADMIN', 'VIEWER'] },
        { label: 'Custom Reports', icon: '🔧', route: '/reports/custom', roles: ['ADMIN', 'ENCODER'] }
      ]
    },
    {
      label: 'Archive',
      icon: '📦',
      route: '/archive',
      roles: ['ADMIN', 'ENCODER', 'VIEWER']
    },
    {
      label: 'Administration',
      icon: '⚙️',
      route: '/admin',
      roles: ['ADMIN'],
      children: [
        { label: 'User Management', icon: '👥', route: '/admin/users', roles: ['ADMIN'] },
        { label: 'Role Management', icon: '🔐', route: '/admin/roles', roles: ['ADMIN'] },
        { label: 'Classifications', icon: '🏷️', route: '/admin/classifications', roles: ['ADMIN'] },
        { label: 'System Settings', icon: '⚙️', route: '/admin/settings', roles: ['ADMIN'] },
        { label: 'Audit Logs', icon: '📋', route: '/admin/audit', roles: ['ADMIN'] }
      ]
    },
    {
      label: 'Data Entry',
      icon: '✏️',
      route: '/entries',
      roles: ['ADMIN', 'ENCODER'],
      children: [
        { label: 'New Entry', icon: '✏️', route: '/entries/new', roles: ['ADMIN', 'ENCODER'] },
        { label: 'My Entries', icon: '📝', route: '/entries/my', roles: ['ADMIN', 'ENCODER'] },
        { label: 'Draft Entries', icon: '📄', route: '/entries/drafts', roles: ['ADMIN', 'ENCODER'] }
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

    const routeMap: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'ENCODER': '/user/entries',
      'VIEWER': '/user/dashboard'
    };

    return {
      default: routeMap[user.role] || '/auth/login',
      dashboard: routeMap[user.role] || '/auth/login'
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