import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>eTracker Dashboard</h1>
        <p class="welcome-text">Welcome back, {{ currentUser?.email }}</p>
        <div class="role-badge" [ngClass]="roleClass">{{ currentUser?.role }}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ totalDisbursements }}</h3>
            <p>Total Disbursements</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>₱{{ totalAmount | number:'1.2-2' }}</h3>
            <p>Total Amount</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>{{ thisMonthCount }}</h3>
            <p>This Month</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{ pendingCount }}</h3>
            <p>Pending Review</p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button 
            *ngIf="canEdit" 
            class="action-btn primary" 
            routerLink="/user/entries/new"
          >
            <span class="btn-icon">➕</span>
            New Disbursement
          </button>
          
          <button class="action-btn secondary" routerLink="/user/entries">
            <span class="btn-icon">📋</span>
            View All Entries
          </button>
          
          <button class="action-btn secondary" routerLink="/user/reports">
            <span class="btn-icon">📊</span>
            Generate Reports
          </button>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div *ngFor="let activity of recentActivities" class="activity-item">
            <div class="activity-icon" [ngClass]="activity.type">{{ activity.icon }}</div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .welcome-text {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
    }

    .role-badge.ADMIN {
      background: #e74c3c;
      color: white;
    }

    .role-badge.ENCODER {
      background: #3498db;
      color: white;
    }

    .role-badge.VIEWER {
      background: #95a5a6;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .quick-actions {
      margin-bottom: 3rem;
    }

    .quick-actions h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn.primary {
      background: #3498db;
      color: white;
    }

    .action-btn.primary:hover {
      background: #2980b9;
    }

    .action-btn.secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .action-btn.secondary:hover {
      background: #d5dbdb;
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    .recent-activity h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .activity-list {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .activity-icon.create {
      background: #d5f4e6;
      color: #27ae60;
    }

    .activity-icon.update {
      background: #fef9e7;
      color: #f39c12;
    }

    .activity-icon.delete {
      background: #fadbd8;
      color: #e74c3c;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0;
      color: #2c3e50;
      font-weight: 500;
    }

    .activity-time {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  currentUser: any;
  totalDisbursements = 0;
  totalAmount = 0;
  thisMonthCount = 0;
  pendingCount = 0;
  canEdit = false;
  roleClass = '';
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  private loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.canEdit = user?.role === 'ENCODER' || user?.role === 'ADMIN';
      this.roleClass = user?.role || '';
    });
  }

  private loadDashboardStats() {
    // Mock data for now - replace with actual service calls
    this.totalDisbursements = 156;
    this.totalAmount = 2450000;
    this.thisMonthCount = 23;
    this.pendingCount = 5;
  }

  private loadRecentActivities() {
    // Mock data for now - replace with actual service calls
    this.recentActivities = [
      {
        type: 'create',
        icon: '➕',
        description: 'New disbursement entry created for Office Supplies',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: 'update',
        icon: '✏️',
        description: 'Updated disbursement amount for Equipment Purchase',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        type: 'create',
        icon: '📊',
        description: 'Monthly report generated and exported',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];
  }
}