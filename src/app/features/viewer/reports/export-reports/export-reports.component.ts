import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-export-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="export-container">
      <h1>Export Reports</h1>
      
      <div class="export-options">
        <div class="export-card">
          <h2>Export Configuration</h2>
          <form [formGroup]="exportForm" class="export-form">
            <div class="form-group">
              <label for="reportType">Report Type</label>
              <select id="reportType" formControlName="reportType" class="form-control">
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="by_classification">By Classification</option>
                <option value="by_department">By Department</option>
                <option value="by_fund_source">By Fund Source</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="format">Export Format</label>
              <select id="format" formControlName="format" class="form-control">
                <option value="pdf">PDF</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Start Date</label>
                <input type="date" id="startDate" formControlName="startDate" class="form-control">
              </div>
              <div class="form-group">
                <label for="endDate">End Date</label>
                <input type="date" id="endDate" formControlName="endDate" class="form-control">
              </div>
            </div>
            
            <div class="form-group">
              <label for="includeArchived">Include Archived Records</label>
              <input type="checkbox" id="includeArchived" formControlName="includeArchived" class="checkbox">
            </div>
            
            <div class="form-actions">
              <button type="button" (click)="generateExport()" class="btn btn-primary" [disabled]="isExporting">
                {{ isExporting ? 'Generating...' : 'Generate Export' }}
              </button>
              <button type="button" routerLink="../" class="btn btn-secondary">Back to Reports</button>
            </div>
          </form>
        </div>
        
        <div class="export-history">
          <h2>Recent Exports</h2>
          <div class="export-list">
            <div class="export-item" *ngFor="let export of recentExports">
              <div class="export-info">
                <span class="export-name">{{ export.name }}</span>
                <span class="export-date">{{ export.date | date:'short' }}</span>
              </div>
              <div class="export-actions">
                <button class="btn btn-sm btn-outline" (click)="downloadExport(export.id)">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="export-preview" *ngIf="previewData">
        <h2>Export Preview</h2>
        <div class="preview-stats">
          <span class="stat">Records: {{ previewData.recordCount }}</span>
          <span class="stat">Total Amount: ₱{{ previewData.totalAmount | number:'1.2-2' }}</span>
          <span class="stat">Date Range: {{ previewData.dateRange }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .export-container {
      padding: 2rem;
    }
    
    .export-options {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .export-card, .export-history {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .export-form .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    
    .checkbox {
      margin-left: 0.5rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    .export-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .export-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .export-item:last-child {
      border-bottom: none;
    }
    
    .export-info {
      display: flex;
      flex-direction: column;
    }
    
    .export-name {
      font-weight: 500;
    }
    
    .export-date {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .export-preview {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .preview-stats {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
    }
    
    .stat {
      background: #f3f4f6;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
    }
  `]
})
export class ExportReportsComponent implements OnInit {
  exportForm: FormGroup;
  isExporting = false;
  previewData: any = null;
  recentExports = [
    {
      id: '1',
      name: 'Monthly Summary - December 2024',
      date: new Date('2024-12-01')
    },
    {
      id: '2',
      name: 'Classification Report - Q4 2024',
      date: new Date('2024-11-15')
    },
    {
      id: '3',
      name: 'Department Breakdown - November 2024',
      date: new Date('2024-11-01')
    }
  ];

  constructor(private fb: FormBuilder) {
    this.exportForm = this.fb.group({
      reportType: ['summary'],
      format: ['pdf'],
      startDate: [''],
      endDate: [''],
      includeArchived: [false]
    });
  }

  ngOnInit() {
    this.updatePreview();
    
    // Watch for form changes to update preview
    this.exportForm.valueChanges.subscribe(() => {
      this.updatePreview();
    });
  }

  generateExport() {
    this.isExporting = true;
    const exportConfig = this.exportForm.value;
    
    console.log('Generating export with config:', exportConfig);
    
    // Simulate export generation
    setTimeout(() => {
      this.isExporting = false;
      alert(`Export generated successfully! Format: ${exportConfig.format.toUpperCase()}`);
      // TODO: Implement actual export generation and download
    }, 3000);
  }

  downloadExport(exportId: string) {
    console.log('Downloading export:', exportId);
    // TODO: Implement actual download functionality
    alert('Download started!');
  }

  private updatePreview() {
    const formValue = this.exportForm.value;
    
    // Simulate preview data calculation
    this.previewData = {
      recordCount: 1250,
      totalAmount: 5750000,
      dateRange: formValue.startDate && formValue.endDate 
        ? `${formValue.startDate} to ${formValue.endDate}`
        : 'All dates'
    };
  }
}