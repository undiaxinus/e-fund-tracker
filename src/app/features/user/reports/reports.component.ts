import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

interface ReportSummary {
  classification: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="reports-header">
        <h1>Reports & Analytics</h1>
        <div class="header-actions">
          <button class="btn btn-primary" routerLink="/user/reports/export">
            <span class="icon">📊</span>
            Export Reports
          </button>
          <button 
            *ngIf="canEdit" 
            class="btn btn-secondary" 
            routerLink="/user/reports/my-reports"
          >
            <span class="icon">📋</span>
            My Reports
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filters-section">
        <h2>Filter Data</h2>
        <div class="filters-grid">
          <div class="filter-group">
            <label for="dateFrom">Date From:</label>
            <input 
              id="dateFrom" 
              type="date" 
              [(ngModel)]="dateFrom" 
              (change)="updateReports()"
            >
          </div>
          
          <div class="filter-group">
            <label for="dateTo">Date To:</label>
            <input 
              id="dateTo" 
              type="date" 
              [(ngModel)]="dateTo" 
              (change)="updateReports()"
            >
          </div>
          
          <div class="filter-group">
            <label for="department">Department:</label>
            <select 
              id="department" 
              [(ngModel)]="selectedDepartment" 
              (change)="updateReports()"
            >
              <option value="">All Departments</option>
              <option value="Finance">Finance Department</option>
              <option value="HR">Human Resources</option>
              <option value="IT">Information Technology</option>
              <option value="Operations">Operations</option>
              <option value="Procurement">Procurement</option>
              <option value="Legal">Legal Affairs</option>
              <option value="Planning">Planning & Development</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="fundSource">Fund Source:</label>
            <select 
              id="fundSource" 
              [(ngModel)]="selectedFundSource" 
              (change)="updateReports()"
            >
              <option value="">All Fund Sources</option>
              <option value="General Fund">General Fund</option>
              <option value="Special Education Fund">Special Education Fund</option>
              <option value="Infrastructure Fund">Infrastructure Fund</option>
              <option value="Payroll Fund">Payroll Fund</option>
              <option value="Trust Fund">Trust Fund</option>
              <option value="Development Fund">Development Fund</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-section">
        <h2>Summary Overview</h2>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <h3>₱{{ totalAmount | number:'1.2-2' }}</h3>
              <p>Total Disbursements</p>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <h3>{{ totalCount }}</h3>
              <p>Total Entries</p>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">📅</div>
            <div class="card-content">
              <h3>₱{{ averageAmount | number:'1.2-2' }}</h3>
              <p>Average Amount</p>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <h3>{{ monthlyGrowth }}%</h3>
              <p>Monthly Growth</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Classification Breakdown -->
      <div class="breakdown-section">
        <h2>Classification Breakdown</h2>
        <div class="breakdown-grid">
          <div class="breakdown-chart">
            <div class="chart-container">
              <div *ngFor="let item of classificationSummary" class="chart-bar">
                <div class="bar-container">
                  <div 
                    class="bar" 
                    [style.height.%]="item.percentage"
                    [ngClass]="item.classification"
                  ></div>
                </div>
                <div class="bar-label">
                  <strong>{{ item.classification }}</strong>
                  <span>{{ item.count }} entries</span>
                  <span>₱{{ item.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Classification</th>
                  <th>Count</th>
                  <th>Amount</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of classificationSummary">
                  <td>
                    <span class="classification-badge" [ngClass]="item.classification">
                      {{ item.classification }}
                    </span>
                  </td>
                  <td>{{ item.count }}</td>
                  <td>₱{{ item.totalAmount | number:'1.2-2' }}</td>
                  <td>{{ item.percentage.toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="trend-section">
        <h2>Monthly Trend</h2>
        <div class="trend-chart">
          <div class="chart-grid">
            <div *ngFor="let data of monthlyTrend" class="trend-bar">
              <div class="trend-container">
                <div 
                  class="trend-fill"
                  [style.height.%]="(data.amount / maxMonthlyAmount) * 100"
                ></div>
              </div>
              <div class="trend-label">
                <strong>{{ data.month }}</strong>
                <span>₱{{ data.amount | number:'1.0-0' }}</span>
                <small>{{ data.count }} entries</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div *ngFor="let activity of recentActivities" class="activity-item">
            <div class="activity-icon" [ngClass]="activity.type">
              {{ activity.icon }}
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <div class="activity-meta">
                <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                <span class="activity-user">by {{ activity.user }}</span>
              </div>
            </div>
            <div class="activity-amount" *ngIf="activity.amount">
              ₱{{ activity.amount | number:'1.2-2' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .reports-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .reports-header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .filters-section h2 {
      color: #2c3e50;
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .filter-group input,
    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .summary-section {
      margin-bottom: 2rem;
    }

    .summary-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .card-content h3 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .card-content p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .breakdown-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .breakdown-section h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
    }

    .breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .chart-container {
      display: flex;
      align-items: end;
      gap: 1rem;
      height: 200px;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .chart-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .bar-container {
      height: 150px;
      width: 100%;
      display: flex;
      align-items: end;
    }

    .bar {
      width: 100%;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
    }

    .bar.PS {
      background: linear-gradient(to top, #1976d2, #42a5f5);
    }

    .bar.MOOE {
      background: linear-gradient(to top, #7b1fa2, #ab47bc);
    }

    .bar.CO {
      background: linear-gradient(to top, #388e3c, #66bb6a);
    }

    .bar.TR {
      background: linear-gradient(to top, #f57c00, #ffb74d);
    }

    .bar-label {
      text-align: center;
      font-size: 0.8rem;
    }

    .bar-label strong {
      display: block;
      color: #2c3e50;
    }

    .bar-label span {
      display: block;
      color: #6c757d;
      font-size: 0.7rem;
    }

    .breakdown-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .breakdown-table th,
    .breakdown-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .breakdown-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    .classification-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .classification-badge.PS {
      background: #e3f2fd;
      color: #1976d2;
    }

    .classification-badge.MOOE {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .classification-badge.CO {
      background: #e8f5e8;
      color: #388e3c;
    }

    .classification-badge.TR {
      background: #fff3e0;
      color: #f57c00;
    }

    .trend-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .trend-section h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
    }

    .chart-grid {
      display: flex;
      align-items: end;
      gap: 1rem;
      height: 200px;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .trend-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .trend-container {
      height: 150px;
      width: 100%;
      display: flex;
      align-items: end;
    }

    .trend-fill {
      width: 100%;
      background: linear-gradient(to top, #3498db, #85c1e9);
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
    }

    .trend-label {
      text-align: center;
      font-size: 0.8rem;
    }

    .trend-label strong {
      display: block;
      color: #2c3e50;
    }

    .trend-label span {
      display: block;
      color: #6c757d;
      font-size: 0.7rem;
    }

    .trend-label small {
      display: block;
      color: #95a5a6;
      font-size: 0.6rem;
    }

    .activity-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .activity-section h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background: #f8f9fa;
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

    .activity-icon.export {
      background: #e8f4fd;
      color: #3498db;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
      font-weight: 500;
    }

    .activity-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .activity-amount {
      font-weight: 600;
      color: #27ae60;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .icon {
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .reports-container {
        padding: 1rem;
      }

      .reports-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        flex-direction: column;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .breakdown-grid {
        grid-template-columns: 1fr;
      }

      .chart-container,
      .chart-grid {
        overflow-x: auto;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  canEdit = false;
  
  // Filter properties
  dateFrom = '';
  dateTo = '';
  selectedDepartment = '';
  selectedFundSource = '';
  
  // Summary data
  totalAmount = 0;
  totalCount = 0;
  averageAmount = 0;
  monthlyGrowth = 0;
  
  // Chart data
  classificationSummary: ReportSummary[] = [];
  monthlyTrend: MonthlyData[] = [];
  maxMonthlyAmount = 0;
  
  // Activity data
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserPermissions();
    this.initializeDateFilters();
    this.loadReportsData();
  }

  private loadUserPermissions() {
    this.authService.currentUser$.subscribe(user => {
      this.canEdit = (user?.role === 'USER' && user?.permission === 'ENCODER') || user?.role === 'ADMIN';
    });
  }

  private initializeDateFilters() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.dateFrom = firstDay.toISOString().split('T')[0];
    this.dateTo = lastDay.toISOString().split('T')[0];
  }

  private loadReportsData() {
    // Mock data - replace with actual service calls
    this.totalAmount = 2450000;
    this.totalCount = 156;
    this.averageAmount = this.totalAmount / this.totalCount;
    this.monthlyGrowth = 12.5;
    
    this.classificationSummary = [
      { classification: 'PS', count: 45, totalAmount: 980000, percentage: 40 },
      { classification: 'MOOE', count: 67, totalAmount: 735000, percentage: 30 },
      { classification: 'CO', count: 32, totalAmount: 588000, percentage: 24 },
      { classification: 'TR', count: 12, totalAmount: 147000, percentage: 6 }
    ];
    
    this.monthlyTrend = [
      { month: 'Jan', amount: 180000, count: 12 },
      { month: 'Feb', amount: 220000, count: 15 },
      { month: 'Mar', amount: 195000, count: 13 },
      { month: 'Apr', amount: 245000, count: 18 },
      { month: 'May', amount: 280000, count: 21 },
      { month: 'Jun', amount: 315000, count: 24 }
    ];
    
    this.maxMonthlyAmount = Math.max(...this.monthlyTrend.map(d => d.amount));
    
    this.recentActivities = [
      {
        type: 'create',
        icon: '➕',
        description: 'New disbursement entry created',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'encoder@gov.ph',
        amount: 15000
      },
      {
        type: 'export',
        icon: '📊',
        description: 'Monthly report exported to PDF',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        user: 'viewer@gov.ph'
      },
      {
        type: 'update',
        icon: '✏️',
        description: 'Disbursement amount updated',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        user: 'encoder@gov.ph',
        amount: 25000
      }
    ];
  }

  updateReports() {
    // Reload data based on filters
    this.loadReportsData();
  }
}