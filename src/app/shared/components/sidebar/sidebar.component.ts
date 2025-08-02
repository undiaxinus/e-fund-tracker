import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService, NavigationItem, QuickAction } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: any;
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  currentTime = new Date();
  navigationItems: NavigationItem[] = [];
  quickActions: QuickAction[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router
  ) {
    // Update time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSidebarState();
    this.loadNavigationItems();
    this.loadQuickActions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCurrentUser(): void {
    const sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadNavigationItems();
      this.loadQuickActions();
    });
    this.subscriptions.push(sub);
  }

  private loadSidebarState(): void {
    const collapsedSub = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });
    this.subscriptions.push(collapsedSub);

    const mobileSub = this.sidebarService.isMobileMenuOpen$.subscribe(open => {
      this.isMobileMenuOpen = open;
    });
    this.subscriptions.push(mobileSub);
  }

  private loadNavigationItems(): void {
    this.navigationItems = this.sidebarService.getFilteredNavigationItems();
  }

  private loadQuickActions(): void {
    this.quickActions = this.sidebarService.getQuickActions();
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleMobileMenu(): void {
    this.sidebarService.toggleMobileMenu();
  }

  closeMobileMenu(): void {
    this.sidebarService.closeMobileMenu();
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
      'VIEWER': 'Viewer',
      'USER': 'User'
    };
    return roleMap[this.currentUser.role] || this.currentUser.role;
  }

  getRoleBadgeClass(): string {
    if (!this.currentUser) return 'role-default';
    if (this.currentUser.role === 'ADMIN') {
      return 'role-admin';
    } else if (this.currentUser.role === 'USER') {
      if (this.currentUser.permission === 'ENCODER') {
        return 'role-encoder';
      } else if (this.currentUser.permission === 'VIEWER') {
        return 'role-viewer';
      }
    } else if (this.currentUser.role === 'ENCODER') {
      return 'role-encoder';
    } else if (this.currentUser.role === 'VIEWER') {
      return 'role-viewer';
    }
    return 'role-default';
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
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

  // Notification system (placeholder for future implementation)
  getNotificationCount(): number {
    // TODO: Implement notification system
    return 0;
  }

  hasNotifications(): boolean {
    return this.getNotificationCount() > 0;
  }
}