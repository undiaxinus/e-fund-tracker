import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any;
  isMobileMenuOpen = false;
  currentTime = new Date();
  
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
    this.loadMobileMenuState();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCurrentUser(): void {
    const sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.subscriptions.push(sub);
  }

  private loadMobileMenuState(): void {
    const mobileSub = this.sidebarService.isMobileMenuOpen$.subscribe(open => {
      this.isMobileMenuOpen = open;
    });
    this.subscriptions.push(mobileSub);
  }

  toggleMobileMenu(): void {
    this.sidebarService.toggleMobileMenu();
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
    if (this.currentUser?.role === 'ADMIN') {
      return 'role-admin';
    } else if (this.currentUser?.role === 'USER') {
      if (this.currentUser?.permission === 'ENCODER') {
        return 'role-encoder';
      } else if (this.currentUser?.permission === 'VIEWER') {
        return 'role-viewer';
      }
    }
    return 'role-default';
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