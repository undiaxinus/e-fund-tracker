import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from './sidebar.service';

export interface LayoutState {
  isLoading: boolean;
  showSidebar: boolean;
  showHeader: boolean;
  showFooter: boolean;
  currentPage: string;
  breadcrumbs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private layoutStateSubject = new BehaviorSubject<LayoutState>({
    isLoading: false,
    showSidebar: true,
    showHeader: true,
    showFooter: true,
    currentPage: '',
    breadcrumbs: []
  });

  public layoutState$ = this.layoutStateSubject.asObservable();

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router
  ) {
    this.initializeLayout();
  }

  private initializeLayout(): void {
    // Listen to route changes to update layout state
    this.router.events.subscribe(() => {
      this.updateCurrentPage();
      this.updateBreadcrumbs();
    });
  }

  setLoading(loading: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      isLoading: loading
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  showSidebar(show: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      showSidebar: show
    });
  }

  showHeader(show: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      showHeader: show
    });
  }

  showFooter(show: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      showFooter: show
    });
  }

  private updateCurrentPage(): void {
    const currentUrl = this.router.url;
    const currentState = this.layoutStateSubject.value;
    
    // Extract page name from URL
    const pageName = this.getPageNameFromUrl(currentUrl);
    
    this.layoutStateSubject.next({
      ...currentState,
      currentPage: pageName
    });
  }

  private updateBreadcrumbs(): void {
    const currentUrl = this.router.url;
    const currentState = this.layoutStateSubject.value;
    
    const breadcrumbs = this.generateBreadcrumbs(currentUrl);
    
    this.layoutStateSubject.next({
      ...currentState,
      breadcrumbs
    });
  }

  private getPageNameFromUrl(url: string): string {
    const segments = url.split('/').filter(segment => segment);
    
    if (segments.length === 0) return 'Dashboard';
    
    const lastSegment = segments[segments.length - 1];
    
    // Map URL segments to readable page names
    const pageNameMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'disbursements': 'Disbursements',
      'reports': 'Reports',
      'archive': 'Archive',
      'entries': 'Data Entry',
      'admin': 'Administration',
      'users': 'User Management',
      'roles': 'Role Management',
      'classifications': 'Classifications',
      'settings': 'Settings',
      'audit': 'Audit Logs',
      'new': 'New Entry',
      'pending': 'Pending Approval',
      'approved': 'Approved',
      'financial': 'Financial Reports',
      'analytics': 'Analytics',
      'custom': 'Custom Reports',
      'my': 'My Entries',
      'drafts': 'Draft Entries'
    };
    
    return pageNameMap[lastSegment] || this.capitalizeFirstLetter(lastSegment);
  }

  private generateBreadcrumbs(url: string): string[] {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs: string[] = ['Home'];
    
    let currentPath = '';
    
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const pageName = this.getPageNameFromUrl(currentPath);
      breadcrumbs.push(pageName);
    }
    
    return breadcrumbs;
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getCurrentLayoutState(): LayoutState {
    return this.layoutStateSubject.value;
  }

  // Method to handle role-based layout adjustments
  adjustLayoutForRole(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Adjust layout based on user role
    switch (user.role) {
      case 'ADMIN':
        this.showSidebar(true);
        this.showHeader(true);
        this.showFooter(true);
        break;
      case 'USER':
        this.showSidebar(true);
        this.showHeader(true);
        this.showFooter(true);
        break;
      default:
        // Default layout for unknown roles
        this.showSidebar(true);
        this.showHeader(true);
        this.showFooter(true);
    }
  }

  // Method to handle full-screen mode (e.g., for reports or data entry)
  setFullScreenMode(enabled: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      showSidebar: !enabled,
      showHeader: !enabled,
      showFooter: !enabled
    });
  }

  // Method to reset layout to default state
  resetLayout(): void {
    this.layoutStateSubject.next({
      isLoading: false,
      showSidebar: true,
      showHeader: true,
      showFooter: true,
      currentPage: '',
      breadcrumbs: []
    });
  }
}