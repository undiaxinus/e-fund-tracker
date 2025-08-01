import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentUser: any;
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  currentTime = new Date();

  navigationItems = [
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
        { label: 'View All', route: '/disbursements', roles: ['ADMIN', 'ENCODER', 'VIEWER'] },
        { label: 'New Entry', route: '/disbursements/new', roles: ['ADMIN', 'ENCODER'] }
      ]
    },
    {
      label: 'Reports',
      icon: '📈',
      route: '/reports',
      roles: ['ADMIN', 'ENCODER', 'VIEWER']
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
        { label: 'User Management', route: '/admin/users', roles: ['ADMIN'] },
        { label: 'System Settings', route: '/admin/settings', roles: ['ADMIN'] },
        { label: 'Audit Logs', route: '/admin/audit', roles: ['ADMIN'] }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  async logout(): Promise<void> {
    if (confirm('Are you sure you want to logout?')) {
      await this.authService.signOut();
    }
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstName?.[0] || ''}${this.currentUser.lastName?.[0] || ''}`;
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrator',
      'ENCODER': 'Data Encoder',
      'VIEWER': 'Viewer'
    };
    return roleMap[this.currentUser.role] || this.currentUser.role;
  }

  getRoleBadgeClass(): string {
    if (!this.currentUser) return 'role-default';
    const roleClasses: { [key: string]: string } = {
      'ADMIN': 'role-admin',
      'ENCODER': 'role-encoder',
      'VIEWER': 'role-viewer'
    };
    return roleClasses[this.currentUser.role] || 'role-default';
  }

  hasAccess(roles: string[]): boolean {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role);
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  getFilteredNavigationItems() {
    return this.navigationItems.filter(item => this.hasAccess(item.roles));
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-PH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  // Quick actions based on user role
  getQuickActions() {
    const actions = [];
    
    if (this.authService.canEdit()) {
      actions.push({
        label: 'New Disbursement',
        icon: '➕',
        route: '/disbursements/new',
        class: 'quick-action-primary'
      });
    }
    
    actions.push({
      label: 'Generate Report',
      icon: '📊',
      route: '/reports',
      class: 'quick-action-secondary'
    });
    
    if (this.authService.isAdmin()) {
      actions.push({
        label: 'User Management',
        icon: '👥',
        route: '/admin/users',
        class: 'quick-action-admin'
      });
    }
    
    return actions;
  }

  // Notification system (placeholder for future implementation)
  getNotificationCount(): number {
    // TODO: Implement notification system
    return 0;
  }

  hasNotifications(): boolean {
    return this.getNotificationCount() > 0;
  }
}