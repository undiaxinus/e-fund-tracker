import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

interface DashboardStats {
  totalDisbursements: number;
  totalAmount: number;
  monthlyDisbursements: number;
  monthlyAmount: number;
  pendingCount: number;
  classificationBreakdown: {
    PS: number;
    MOOE: number;
    CO: number;
    TR: number;
  };
}

interface RecentTransaction {
  id: string;
  disbursementNo: string;
  payee: string;
  amount: number;
  classification: string;
  disbursementDate: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: DashboardStats = {
    totalDisbursements: 0,
    totalAmount: 0,
    monthlyDisbursements: 0,
    monthlyAmount: 0,
    pendingCount: 0,
    classificationBreakdown: {
      PS: 0,
      MOOE: 0,
      CO: 0,
      TR: 0
    }
  };
  recentTransactions: RecentTransaction[] = [];
  isLoading = true;
  currentDate = new Date();

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Load dashboard statistics
      await this.loadStats();
      
      // Load recent transactions
      await this.loadRecentTransactions();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadStats(): Promise<void> {
    try {
      const dashboardData = await this.supabaseService.getDashboardStats();
      
      if (dashboardData.totalDisbursements) {
        this.stats.totalDisbursements = dashboardData.totalDisbursements.length;
        this.stats.totalAmount = dashboardData.totalDisbursements
          .reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0);
      }
      
      if (dashboardData.monthlyDisbursements) {
        this.stats.monthlyDisbursements = dashboardData.monthlyDisbursements.length;
        this.stats.monthlyAmount = dashboardData.monthlyDisbursements
          .reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0);
      }
      
      if (dashboardData.classificationStats) {
        const breakdown = { PS: 0, MOOE: 0, CO: 0, TR: 0 };
        dashboardData.classificationStats.forEach((item: any) => {
          if (breakdown.hasOwnProperty(item.classification)) {
            breakdown[item.classification as keyof typeof breakdown] += parseFloat(item.amount);
          }
        });
        this.stats.classificationBreakdown = breakdown;
      }
      
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async loadRecentTransactions(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.getDisbursements({
        limit: 5
      });
      
      if (error) {
        console.error('Error loading recent transactions:', error);
        return;
      }
      
      this.recentTransactions = data?.slice(0, 5).map((item: any) => ({
        id: item.id,
        disbursementNo: item.disbursement_no,
        payee: item.payee,
        amount: parseFloat(item.amount),
        classification: item.classification,
        disbursementDate: item.disbursement_date,
        status: item.status
      })) || [];
      
    } catch (error) {
      console.error('Error loading recent transactions:', error);
    }
  }

  getGreeting(): string {
    const hour = this.currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'ACTIVE': 'status-active',
      'CANCELLED': 'status-cancelled',
      'ARCHIVED': 'status-archived'
    };
    return statusClasses[status] || 'status-default';
  }

  getClassificationIcon(classification: string): string {
    const icons: { [key: string]: string } = {
      'PS': '👥',
      'MOOE': '🔧',
      'CO': '🏗️',
      'TR': '📋'
    };
    return icons[classification] || '📄';
  }

  getClassificationColor(classification: string): string {
    const colors: { [key: string]: string } = {
      'PS': '#4299e1',
      'MOOE': '#48bb78',
      'CO': '#ed8936',
      'TR': '#9f7aea'
    };
    return colors[classification] || '#718096';
  }

  canEdit(): boolean {
    return this.authService.canEdit();
  }

  canManageUsers(): boolean {
    return this.authService.canManageUsers();
  }

  async refreshData(): Promise<void> {
    await this.loadDashboardData();
  }
}