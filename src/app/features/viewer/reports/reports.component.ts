import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="reports-container">
      <h1>Reports & Analytics</h1>
      
      <div class="filters-section">
        <h2>Filter Reports</h2>
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
            <div class="form-group">
              <label for="department">Department</label>
              <select id="department" formControlName="department" class="form-control">
                <option value="">All Departments</option>
                <option value="HR">Human Resources</option>
                <option value="IT">Information Technology</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" (click)="applyFilters()" class="btn btn-primary">Apply Filters</button>
            <button type="button" (click)="resetFilters()" class="btn btn-secondary">Reset</button>
            <button type="button" routerLink="export" class="btn btn-success">Export Reports</button>
          </div>
        </form>
      </div>
      
      <div class="reports-grid">
        <div class="report-card">
          <h3>Summary Report</h3>
          <p>Overview of all disbursements with totals by classification</p>
          <div class="report-stats">
            <span class="stat">Total: ₱{{ summaryStats.total | number:'1.2-2' }}</span>
            <span class="stat">Count: {{ summaryStats.count }}</span>
          </div>
        </div>
        
        <div class="report-card">
          <h3>By Classification</h3>
          <div class="classification-breakdown">
            <div class="breakdown-item" *ngFor="let item of classificationBreakdown">
              <span class="label">{{ item.classification }}</span>
              <span class="amount">₱{{ item.amount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
        
        <div class="report-card">
          <h3>By Department</h3>
          <div class="department-breakdown">
            <div class="breakdown-item" *ngFor="let item of departmentBreakdown">
              <span class="label">{{ item.department }}</span>
              <span class="amount">₱{{ item.amount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
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
    
    .btn-success {
      background: #059669;
      color: white;
    }
    
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .report-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .report-stats {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .stat {
      background: #f3f4f6;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .breakdown-item:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 500;
    }
    
    .amount {
      color: #2563eb;
      font-weight: 600;
    }
  `]
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  summaryStats = { total: 5750000, count: 1250 };
  classificationBreakdown = [
    { classification: 'PS', amount: 2500000 },
    { classification: 'MOOE', amount: 1800000 },
    { classification: 'CO', amount: 1200000 },
    { classification: 'TR', amount: 250000 }
  ];
  departmentBreakdown = [
    { department: 'HR', amount: 1500000 },
    { department: 'IT', amount: 1200000 },
    { department: 'Finance', amount: 1800000 },
    { department: 'Operations', amount: 1250000 }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      classification: [''],
      department: ['']
    });
  }

  ngOnInit() {
    this.loadReportsData();
  }

  applyFilters() {
    const filters = this.filterForm.value;
    console.log('Applying filters:', filters);
    // TODO: Implement actual filtering logic
  }

  resetFilters() {
    this.filterForm.reset();
    this.loadReportsData();
  }

  private loadReportsData() {
    // TODO: Implement actual data loading from service
    console.log('Loading reports data...');
  }
}