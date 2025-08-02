import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../shared/services/sidebar.service';
import { LayoutService, LayoutState } from '../../shared/services/layout.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: any;
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  layoutState: LayoutState;
  currentYear = new Date().getFullYear();
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private layoutService: LayoutService,
    private router: Router
  ) {
    this.layoutState = this.layoutService.getCurrentLayoutState();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSidebarState();
    this.loadLayoutState();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCurrentUser(): void {
    const sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Adjust layout for user role
        this.layoutService.adjustLayoutForRole();
        
        // Redirect to role-based dashboard if on root
        const currentUrl = this.router.url;
        if (currentUrl === '/admin' || currentUrl === '/encoder' || currentUrl === '/viewer') {
          const defaultRoute = this.sidebarService.getDefaultRoute();
          this.router.navigate([defaultRoute]);
        }
      }
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

  private loadLayoutState(): void {
    const layoutSub = this.layoutService.layoutState$.subscribe(state => {
      this.layoutState = state;
    });
    this.subscriptions.push(layoutSub);
  }

  closeMobileMenu(): void {
    this.sidebarService.closeMobileMenu();
  }

  // Getter methods for template
  get showSidebar(): boolean {
    return this.layoutState.showSidebar;
  }

  get showHeader(): boolean {
    return this.layoutState.showHeader;
  }

  get showFooter(): boolean {
    return this.layoutState.showFooter;
  }

  get isLoading(): boolean {
    return this.layoutState.isLoading;
  }

  get currentPage(): string {
    return this.layoutState.currentPage;
  }

  get breadcrumbs(): string[] {
    return this.layoutState.breadcrumbs;
  }
}