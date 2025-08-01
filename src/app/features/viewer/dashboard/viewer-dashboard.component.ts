import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-viewer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="viewer-dashboard">
      <h1>Viewer Dashboard</h1>
      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Disbursements</h3>
            <p class="stat-value">{{ totalDisbursements }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Amount</h3>
            <p class="stat-value">₱{{ totalAmount | number:'1.2-2' }}</p>
          </div>
          <div class="stat-card">
            <h3>This Month</h3>
            <p class="stat-value">{{ thisMonthCount }}</p>
          </div>
        </div>
        
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button routerLink="../reports" class="btn btn-primary">
              View Reports
            </button>
            <button routerLink="../reports/export" class="btn btn-secondary">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer-dashboard {
      padding: 2rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #2563eb;
      margin: 0;
    }
    
    .quick-actions {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
  `]
})
export class ViewerDashboardComponent implements OnInit {
  totalDisbursements = 0;
  totalAmount = 0;
  thisMonthCount = 0;

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // TODO: Implement actual data loading from service
    this.totalDisbursements = 1250;
    this.totalAmount = 5750000;
    this.thisMonthCount = 85;
  }
}