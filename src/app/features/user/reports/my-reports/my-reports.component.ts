import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { DisbursementService } from '../../../../core/services/disbursement.service';

interface UserReport {
  id: string;
  title: string;
  description: string;
  createdDate: Date;
  recordCount: number;
  totalAmount: number;
  dateRange: string;
  format: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
}

interface UserStats {
  totalReports: number;
  totalEntries: number;
  totalAmount: number;
  thisMonthEntries: number;
  pendingEntries: number;
  approvedEntries: number;
}

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="my-reports-container">
      <div class="reports-header">
        <h1>My Reports & Activity</h1>
        <div class="header-actions">
          <button class="btn btn-primary" routerLink="/user/reports/export">
            <span class="icon">📊</span>
            Create New Report
          </button>
          <button class="btn btn-secondary" routerLink="/user/reports">
            ← Back to Reports
          </button>
        </div>
      </div>

      <!-- User Statistics -->
      <div class="stats-section">
        <h2>My Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{{ userStats.totalReports }}</h3>
              <p>Reports Generated</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <h3>{{ userStats.totalEntries }}</h3>
              <p>Entries Created</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>₱{{ userStats.totalAmount | number:'1.2-2' }}</h3>
              <p>Total Amount Processed</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <h3>{{ userStats.thisMonthEntries }}</h3>
              <p>This Month's Entries</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Entry Status Overview -->
      <div class="status-section">
        <h2>Entry Status Overview</h2>
        <div class="status-grid">
          <div class="status-card pending">
            <div class="status-icon">⏳</div>
            <div class="status-content">
              <h3>{{ userStats.pendingEntries }}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          
          <div class="status-card approved">
            <div class="status-icon">✅</div>
            <div class="status-content">
              <h3>{{ userStats.approvedEntries }}</h3>
              <p>Approved Entries</p>
            </div>
          </div>
          
          <div class="status-card rejected">
            <div class="status-icon">❌</div>
            <div class="status-content">
              <h3>{{ userStats.totalEntries - userStats.approvedEntries - userStats.pendingEntries }}</h3>
              <p>Rejected Entries</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Filter -->
      <div class="filter-section">
        <h2>My Generated Reports</h2>
        <div class="filters">
          <div class="filter-group">
            <label for="statusFilter">Status:</label>
            <select 
              id="statusFilter" 
              [(ngModel)]="statusFilter" 
              (change)="applyFilters()"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="GENERATING">Generating</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="formatFilter">Format:</label>
            <select 
              id="formatFilter" 
              [(ngModel)]="formatFilter" 
              (change)="applyFilters()"
            >
              <option value="">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="searchTerm">Search:</label>
            <input 
              id="searchTerm" 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="applyFilters()"
              placeholder="Search reports..."
            >
          </div>
        </div>
      </div>

      <!-- Reports List -->
      <div class="reports-list">
        <div *ngFor="let report of filteredReports" class="report-card">
          <div class="report-header">
            <div class="report-title">
              <h3>{{ report.title }}</h3>
              <p>{{ report.description }}</p>
            </div>
            <div class="report-status">
              <span class="status-badge" [ngClass]="report.status.toLowerCase()">
                {{ report.status }}
              </span>
            </div>
          </div>
          
          <div class="report-details">
            <div class="detail-item">
              <span class="label">Created:</span>
              <span class="value">{{ report.createdDate | date:'medium' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Records:</span>
              <span class="value">{{ report.recordCount }} entries</span>
            </div>
            <div class="detail-item">
              <span class="label">Amount:</span>
              <span class="value">₱{{ report.totalAmount | number:'1.2-2' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Period:</span>
              <span class="value">{{ report.dateRange }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Format:</span>
              <span class="value format-badge" [ngClass]="report.format">
                {{ report.format.toUpperCase() }}
              </span>
            </div>
          </div>
          
          <div class="report-actions">
            <button 
              *ngIf="report.status === 'COMPLETED' && report.downloadUrl" 
              class="btn btn-primary btn-sm"
              (click)="downloadReport(report)"
            >
              <span class="icon">📥</span>
              Download
            </button>
            
            <button 
              *ngIf="report.status === 'FAILED'" 
              class="btn btn-warning btn-sm"
              (click)="retryReport(report)"
            >
              <span class="icon">🔄</span>
              Retry
            </button>
            
            <button 
              class="btn btn-secondary btn-sm"
              (click)="viewReportDetails(report)"
            >
              <span class="icon">👁️</span>
              Details
            </button>
            
            <button 
              class="btn btn-danger btn-sm"
              (click)="deleteReport(report)"
            >
              <span class="icon">🗑️</span>
              Delete
            </button>
          </div>
        </div>
        
        <div *ngIf="filteredReports.length === 0" class="no-reports">
          <div class="no-reports-icon">📊</div>
          <h3>No reports found</h3>
          <p>You haven't generated any reports yet or no reports match your filters.</p>
          <button class="btn btn-primary" routerLink="/user/reports/export">
            Create Your First Report
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h2>Recent Activity</h2>
        <div class="activity-timeline">
          <div *ngFor="let activity of recentActivities" class="activity-item">
            <div class="activity-time">
              {{ activity.timestamp | date:'short' }}
            </div>
            <div class="activity-icon" [ngClass]="activity.type">
              {{ activity.icon }}
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <div class="activity-meta" *ngIf="activity.meta">
                <span *ngFor="let meta of activity.meta" class="meta-tag">
                  {{ meta }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-reports-container {
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

    .stats-section,
    .status-section {
      margin-bottom: 2rem;
    }

    .stats-section h2,
    .status-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .status-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid;
    }

    .status-card.pending {
      border-left-color: #f39c12;
    }

    .status-card.approved {
      border-left-color: #27ae60;
    }

    .status-card.rejected {
      border-left-color: #e74c3c;
    }

    .status-icon {
      font-size: 2rem;
    }

    .status-content h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .status-content p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .filter-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .filter-section h2 {
      color: #2c3e50;
      margin: 0 0 1rem 0;
    }

    .filters {
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

    .reports-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .report-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .report-card:hover {
      transform: translateY(-2px);
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .report-title h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .report-title p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.completed {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.generating {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.failed {
      background: #f8d7da;
      color: #721c24;
    }

    .report-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item .label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
    }

    .detail-item .value {
      color: #2c3e50;
      font-weight: 500;
    }

    .format-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .format-badge.pdf {
      background: #e3f2fd;
      color: #1976d2;
    }

    .format-badge.excel {
      background: #e8f5e8;
      color: #388e3c;
    }

    .format-badge.csv {
      background: #fff3e0;
      color: #f57c00;
    }

    .report-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
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

    .btn-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
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

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-warning:hover {
      background: #e67e22;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .no-reports {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-reports-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
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

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      border-left: 2px solid #e9ecef;
      position: relative;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
      min-width: 120px;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .activity-icon.create {
      background: #d5f4e6;
      color: #27ae60;
    }

    .activity-icon.export {
      background: #e8f4fd;
      color: #3498db;
    }

    .activity-icon.update {
      background: #fef9e7;
      color: #f39c12;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-weight: 500;
    }

    .activity-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .meta-tag {
      padding: 0.125rem 0.5rem;
      background: #e9ecef;
      border-radius: 12px;
      font-size: 0.7rem;
      color: #495057;
    }

    .icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .my-reports-container {
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

      .stats-grid,
      .status-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .report-details {
        grid-template-columns: 1fr;
      }

      .report-actions {
        justify-content: center;
      }

      .activity-item {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class MyReportsComponent implements OnInit {
  userStats: UserStats = {
    totalReports: 0,
    totalEntries: 0,
    totalAmount: 0,
    thisMonthEntries: 0,
    pendingEntries: 0,
    approvedEntries: 0
  };

  reports: UserReport[] = [];
  filteredReports: UserReport[] = [];
  recentActivities: any[] = [];

  // Filter properties
  statusFilter = '';
  formatFilter = '';
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserStats();
    this.loadUserReports();
    this.loadRecentActivities();
  }

  private loadUserStats() {
    // Mock data - replace with actual service call
    this.userStats = {
      totalReports: 12,
      totalEntries: 89,
      totalAmount: 1450000,
      thisMonthEntries: 23,
      pendingEntries: 5,
      approvedEntries: 78
    };
  }

  private loadUserReports() {
    // Mock data - replace with actual service call
    this.reports = [
      {
        id: '1',
        title: 'Monthly Financial Report - January 2024',
        description: 'Complete disbursement report for January 2024',
        createdDate: new Date('2024-02-01'),
        recordCount: 45,
        totalAmount: 680000,
        dateRange: 'Jan 1 - Jan 31, 2024',
        format: 'pdf',
        status: 'COMPLETED',
        downloadUrl: '/downloads/report-jan-2024.pdf'
      },
      {
        id: '2',
        title: 'MOOE Expenses Analysis',
        description: 'Analysis of maintenance and operating expenses',
        createdDate: new Date('2024-01-28'),
        recordCount: 23,
        totalAmount: 245000,
        dateRange: 'Jan 1 - Jan 28, 2024',
        format: 'excel',
        status: 'COMPLETED',
        downloadUrl: '/downloads/mooe-analysis.xlsx'
      },
      {
        id: '3',
        title: 'Weekly Summary Report',
        description: 'Weekly disbursement summary',
        createdDate: new Date('2024-01-26'),
        recordCount: 12,
        totalAmount: 125000,
        dateRange: 'Jan 22 - Jan 26, 2024',
        format: 'csv',
        status: 'GENERATING'
      },
      {
        id: '4',
        title: 'Capital Outlay Report',
        description: 'Infrastructure and equipment purchases',
        createdDate: new Date('2024-01-25'),
        recordCount: 8,
        totalAmount: 450000,
        dateRange: 'Jan 1 - Jan 25, 2024',
        format: 'pdf',
        status: 'FAILED'
      }
    ];

    this.applyFilters();
  }

  private loadRecentActivities() {
    // Mock data - replace with actual service call
    this.recentActivities = [
      {
        type: 'export',
        icon: '📊',
        description: 'Generated Monthly Financial Report',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        meta: ['PDF', '45 records', '₱680,000']
      },
      {
        type: 'create',
        icon: '➕',
        description: 'Created new disbursement entry',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        meta: ['MOOE', '₱15,000']
      },
      {
        type: 'update',
        icon: '✏️',
        description: 'Updated disbursement amount',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        meta: ['CO', '₱25,000']
      },
      {
        type: 'export',
        icon: '📊',
        description: 'Exported MOOE analysis to Excel',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        meta: ['Excel', '23 records']
      }
    ];
  }

  applyFilters() {
    let filtered = [...this.reports];

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    // Format filter
    if (this.formatFilter) {
      filtered = filtered.filter(r => r.format === this.formatFilter);
    }

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());

    this.filteredReports = filtered;
  }

  downloadReport(report: UserReport) {
    if (report.downloadUrl) {
      // Mock download - replace with actual download logic
      console.log(`Downloading report: ${report.title}`);
      // window.open(report.downloadUrl, '_blank');
      alert(`Downloading ${report.title}`);
    }
  }

  retryReport(report: UserReport) {
    // Mock retry - replace with actual service call
    console.log(`Retrying report generation: ${report.title}`);
    report.status = 'GENERATING';
    
    // Simulate retry process
    setTimeout(() => {
      report.status = 'COMPLETED';
      report.downloadUrl = `/downloads/retry-${report.id}.${report.format}`;
    }, 3000);
  }

  viewReportDetails(report: UserReport) {
    // Mock view details - replace with actual modal or navigation
    console.log(`Viewing details for: ${report.title}`);
    alert(`Report Details:\n\nTitle: ${report.title}\nRecords: ${report.recordCount}\nAmount: ₱${report.totalAmount.toLocaleString()}\nPeriod: ${report.dateRange}`);
  }

  deleteReport(report: UserReport) {
    if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
      // Mock delete - replace with actual service call
      this.reports = this.reports.filter(r => r.id !== report.id);
      this.applyFilters();
      console.log(`Deleted report: ${report.title}`);
    }
  }
}