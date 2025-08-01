import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="my-reports-container">
      <div class="header">
        <h1>My Reports</h1>
        <div class="header-stats">
          <span class="stat">Total Entries: {{ totalEntries }}</span>
          <span class="stat">This Month: {{ thisMonthEntries }}</span>
        </div>
      </div>
      
      <div class="filters-section">
        <form [formGroup]="filterForm" class="filter-form">
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input type="date" id="startDate" formControlName="startDate" class="form-control">
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input type="date" id="endDate" formControlName="endDate" class="form-control">
            </div>
            <div class="form-group">
              <label for="classification">Classification</label>
              <select id="classification" formControlName="classification" class="form-control">
                <option value="">All Classifications</option>
                <option value="PS">Personnel Services (PS)</option>
                <option value="MOOE">MOOE</option>
                <option value="CO">Capital Outlay (CO)</option>
                <option value="TR">Trust Receipts (TR)</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" (click)="applyFilters()" class="btn btn-primary">Apply Filters</button>
            <button type="button" (click)="resetFilters()" class="btn btn-secondary">Reset</button>
            <button type="button" (click)="exportMyData()" class="btn btn-success">Export My Data</button>
          </div>
        </form>
      </div>
      
      <div class="summary-cards">
        <div class="summary-card">
          <h3>My Entries Summary</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total Amount Encoded</span>
              <span class="stat-value">₱{{ myStats.totalAmount | number:'1.2-2' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average per Entry</span>
              <span class="stat-value">₱{{ myStats.averageAmount | number:'1.2-2' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Most Used Classification</span>
              <span class="stat-value">{{ myStats.topClassification }}</span>
            </div>
          </div>
        </div>
        
        <div class="summary-card">
          <h3>Monthly Performance</h3>
          <div class="performance-chart">
            <div class="chart-bar" *ngFor="let month of monthlyData">
              <div class="bar" [style.height.%]="month.percentage"></div>
              <span class="bar-label">{{ month.month }}</span>
              <span class="bar-value">{{ month.count }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="entries-table">
        <h2>My Recent Entries</h2>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Payee</th>
                <th>Amount</th>
                <th>Classification</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of myEntries">
                <td>{{ entry.date | date:'short' }}</td>
                <td>{{ entry.payee }}</td>
                <td>₱{{ entry.amount | number:'1.2-2' }}</td>
                <td>
                  <span class="classification-badge" [class]="'class-' + entry.classification.toLowerCase()">
                    {{ entry.classification }}
                  </span>
                </td>
                <td>{{ entry.referenceNumber }}</td>
                <td>
                  <span class="status-badge" [class]="'status-' + entry.status.toLowerCase()">
                    {{ entry.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" (click)="viewEntry(entry)">
                      View
                    </button>
                    <button class="btn btn-sm btn-primary" (click)="editEntry(entry)" 
                            *ngIf="entry.status === 'Draft'">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-reports-container {
      padding: 2rem;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .header-stats {
      display: flex;
      gap: 2rem;
    }
    
    .header-stats .stat {
      background: #f3f4f6;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
    }
    
    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .filter-form .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .summary-card h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }
    
    .summary-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .stat-value {
      font-weight: 600;
      color: #1f2937;
    }
    
    .performance-chart {
      display: flex;
      align-items: end;
      gap: 0.5rem;
      height: 120px;
    }
    
    .chart-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    
    .bar {
      width: 100%;
      background: #2563eb;
      border-radius: 2px 2px 0 0;
      min-height: 4px;
      margin-bottom: 0.5rem;
    }
    
    .bar-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }
    
    .bar-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .entries-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .entries-table h2 {
      margin: 0;
      padding: 1.5rem;
      background: #f9fafb;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .table th,
    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    
    .classification-badge,
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .class-ps {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .class-mooe {
      background: #d1fae5;
      color: #065f46;
    }
    
    .class-co {
      background: #fef3c7;
      color: #92400e;
    }
    
    .class-tr {
      background: #fce7f3;
      color: #be185d;
    }
    
    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-draft {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-pending {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-size: 0.875rem;
    }
    
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .btn-success {
      background: #059669;
      color: white;
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  `]
})
export class MyReportsComponent implements OnInit {
  filterForm: FormGroup;
  totalEntries = 125;
  thisMonthEntries = 18;
  
  myStats = {
    totalAmount: 850000,
    averageAmount: 6800,
    topClassification: 'MOOE'
  };
  
  monthlyData = [
    { month: 'Jan', count: 15, percentage: 75 },
    { month: 'Feb', count: 12, percentage: 60 },
    { month: 'Mar', count: 20, percentage: 100 },
    { month: 'Apr', count: 18, percentage: 90 },
    { month: 'May', count: 22, percentage: 110 },
    { month: 'Jun', count: 16, percentage: 80 }
  ];
  
  myEntries = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      payee: 'ABC Supply Company',
      amount: 15000,
      classification: 'MOOE',
      referenceNumber: 'REF-2024-001',
      status: 'Approved'
    },
    {
      id: '2',
      date: new Date('2024-01-14'),
      payee: 'XYZ Services',
      amount: 8500,
      classification: 'PS',
      referenceNumber: 'REF-2024-002',
      status: 'Pending'
    },
    {
      id: '3',
      date: new Date('2024-01-13'),
      payee: 'Tech Solutions Inc.',
      amount: 25000,
      classification: 'CO',
      referenceNumber: 'REF-2024-003',
      status: 'Draft'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      classification: ['']
    });
  }

  ngOnInit() {
    this.loadMyReports();
  }

  applyFilters() {
    const filters = this.filterForm.value;
    console.log('Applying filters:', filters);
    // TODO: Implement actual filtering logic
  }

  resetFilters() {
    this.filterForm.reset();
    this.loadMyReports();
  }

  exportMyData() {
    console.log('Exporting my data...');
    // TODO: Implement export functionality
    alert('Export functionality will be implemented soon!');
  }

  viewEntry(entry: any) {
    console.log('Viewing entry:', entry.id);
    // TODO: Navigate to entry details
  }

  editEntry(entry: any) {
    console.log('Editing entry:', entry.id);
    // TODO: Navigate to edit form
  }

  private loadMyReports() {
    // TODO: Implement actual data loading from service
    console.log('Loading my reports data...');
  }
}