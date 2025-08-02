import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DisbursementService } from '../../../../core/services/disbursement.service';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
}

@Component({
  selector: 'app-export-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="export-container">
      <div class="export-header">
        <h1>Export Reports</h1>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to Reports
        </button>
      </div>

      <form [formGroup]="exportForm" (ngSubmit)="onExport()" class="export-form">
        <!-- Export Format Selection -->
        <div class="form-section">
          <h2>Export Format</h2>
          <div class="format-grid">
            <div 
              *ngFor="let format of exportFormats" 
              class="format-card"
              [class.selected]="exportForm.get('format')?.value === format.id"
              (click)="selectFormat(format.id)"
            >
              <div class="format-icon">{{ format.icon }}</div>
              <h3>{{ format.name }}</h3>
              <p>{{ format.description }}</p>
            </div>
          </div>
        </div>

        <!-- Template Selection -->
        <div class="form-section">
          <h2>Report Template</h2>
          <div class="template-grid">
            <div 
              *ngFor="let template of exportTemplates" 
              class="template-card"
              [class.selected]="exportForm.get('template')?.value === template.id"
              (click)="selectTemplate(template.id)"
            >
              <h3>{{ template.name }}</h3>
              <p>{{ template.description }}</p>
              <div class="template-fields">
                <span *ngFor="let field of template.fields" class="field-tag">
                  {{ field }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Options -->
        <div class="form-section">
          <h2>Filter Options</h2>
          <div class="filters-grid">
            <div class="form-group">
              <label for="dateFrom">Date From</label>
              <input 
                id="dateFrom"
                type="date" 
                formControlName="dateFrom"
                [class.error]="isFieldInvalid('dateFrom')"
              >
              <div *ngIf="isFieldInvalid('dateFrom')" class="error-message">
                Start date is required
              </div>
            </div>

            <div class="form-group">
              <label for="dateTo">Date To</label>
              <input 
                id="dateTo"
                type="date" 
                formControlName="dateTo"
                [class.error]="isFieldInvalid('dateTo')"
              >
              <div *ngIf="isFieldInvalid('dateTo')" class="error-message">
                End date is required
              </div>
            </div>

            <div class="form-group">
              <label for="classification">Classification</label>
              <select id="classification" formControlName="classification">
                <option value="">All Classifications</option>
                <option value="PS">PS - Personal Services</option>
                <option value="MOOE">MOOE - Maintenance & Operating Expenses</option>
                <option value="CO">CO - Capital Outlay</option>
                <option value="TR">TR - Trust Receipts</option>
              </select>
            </div>

            <div class="form-group">
              <label for="department">Department</label>
              <select id="department" formControlName="department">
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

            <div class="form-group">
              <label for="fundSource">Fund Source</label>
              <select id="fundSource" formControlName="fundSource">
                <option value="">All Fund Sources</option>
                <option value="General Fund">General Fund</option>
                <option value="Special Education Fund">Special Education Fund</option>
                <option value="Infrastructure Fund">Infrastructure Fund</option>
                <option value="Payroll Fund">Payroll Fund</option>
                <option value="Trust Fund">Trust Fund</option>
                <option value="Development Fund">Development Fund</option>
              </select>
            </div>

            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" formControlName="status">
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="form-section">
          <h2>Export Options</h2>
          <div class="options-grid">
            <div class="form-group">
              <label for="fileName">File Name</label>
              <input 
                id="fileName"
                type="text" 
                formControlName="fileName"
                placeholder="Enter file name"
                [class.error]="isFieldInvalid('fileName')"
              >
              <div *ngIf="isFieldInvalid('fileName')" class="error-message">
                File name is required
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="includeSummary"
                >
                <span class="checkmark"></span>
                Include Summary Statistics
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="includeCharts"
                >
                <span class="checkmark"></span>
                Include Charts and Graphs
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="groupByClassification"
                >
                <span class="checkmark"></span>
                Group by Classification
              </label>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="form-section" *ngIf="previewData">
          <h2>Export Preview</h2>
          <div class="preview-card">
            <div class="preview-header">
              <h3>{{ previewData.title }}</h3>
              <div class="preview-meta">
                <span>{{ previewData.recordCount }} records</span>
                <span>{{ previewData.dateRange }}</span>
                <span>{{ previewData.totalAmount | currency:'PHP':'symbol':'1.2-2' }}</span>
              </div>
            </div>
            
            <div class="preview-table">
              <table>
                <thead>
                  <tr>
                    <th *ngFor="let column of previewData.columns">{{ column }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of previewData.sampleRows">
                    <td *ngFor="let cell of row">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="preview-note">
                <em>Showing first 3 rows of {{ previewData.recordCount }} total records</em>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="generatePreview()">
            <span class="icon">👁️</span>
            Generate Preview
          </button>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="exportForm.invalid || isExporting"
          >
            <span *ngIf="isExporting" class="spinner">⏳</span>
            <span class="icon">📥</span>
            Export Report
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .export-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .export-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .export-header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .export-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-section h2 {
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
      font-size: 1.2rem;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }

    .format-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .format-card {
      padding: 1.5rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .format-card:hover {
      border-color: #3498db;
      transform: translateY(-2px);
    }

    .format-card.selected {
      border-color: #3498db;
      background: #f8f9fa;
    }

    .format-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .format-card h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .format-card p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .template-card {
      padding: 1.5rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .template-card:hover {
      border-color: #3498db;
      transform: translateY(-2px);
    }

    .template-card.selected {
      border-color: #3498db;
      background: #f8f9fa;
    }

    .template-card h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .template-card p {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .template-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .field-tag {
      padding: 0.25rem 0.5rem;
      background: #e9ecef;
      border-radius: 12px;
      font-size: 0.8rem;
      color: #495057;
    }

    .filters-grid,
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-group input.error,
    .form-group select.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      color: #2c3e50;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .preview-card {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-header {
      background: #f8f9fa;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .preview-header h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .preview-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .preview-table {
      padding: 1rem;
    }

    .preview-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .preview-table th,
    .preview-table td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .preview-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    .preview-note {
      margin-top: 1rem;
      text-align: center;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
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

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .export-container {
        padding: 1rem;
      }

      .export-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .format-grid,
      .template-grid,
      .filters-grid,
      .options-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        justify-content: center;
      }

      .preview-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class ExportReportsComponent implements OnInit {
  exportForm: FormGroup;
  isExporting = false;
  previewData: any = null;

  exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable Document Format - Best for printing and sharing',
      icon: '📄'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format - Best for data analysis',
      icon: '📊'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values - Best for data import/export',
      icon: '📋'
    }
  ];

  exportTemplates: ExportTemplate[] = [
    {
      id: 'detailed',
      name: 'Detailed Report',
      description: 'Complete disbursement details with all fields',
      fields: ['Date', 'Payee', 'Amount', 'Classification', 'Fund Source', 'Department', 'Description', 'Status']
    },
    {
      id: 'summary',
      name: 'Summary Report',
      description: 'Condensed view with key information only',
      fields: ['Date', 'Payee', 'Amount', 'Classification', 'Status']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Focus on amounts and fund sources for financial analysis',
      fields: ['Date', 'Amount', 'Classification', 'Fund Source', 'Department']
    },
    {
      id: 'audit',
      name: 'Audit Trail',
      description: 'Complete audit information including user actions',
      fields: ['Date', 'Payee', 'Amount', 'Classification', 'Created By', 'Created Date', 'Status', 'Reference']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {
    this.exportForm = this.createForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      format: ['pdf', [Validators.required]],
      template: ['detailed', [Validators.required]],
      dateFrom: ['', [Validators.required]],
      dateTo: ['', [Validators.required]],
      classification: [''],
      department: [''],
      fundSource: [''],
      status: [''],
      fileName: ['', [Validators.required]],
      includeSummary: [true],
      includeCharts: [false],
      groupByClassification: [false]
    });
  }

  private initializeForm() {
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.exportForm.patchValue({
      dateFrom: firstDay.toISOString().split('T')[0],
      dateTo: lastDay.toISOString().split('T')[0],
      fileName: `disbursement-report-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    });
  }

  selectFormat(formatId: string) {
    this.exportForm.patchValue({ format: formatId });
  }

  selectTemplate(templateId: string) {
    this.exportForm.patchValue({ template: templateId });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.exportForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  generatePreview() {
    if (this.exportForm.valid) {
      // Mock preview data - replace with actual service call
      const formValue = this.exportForm.value;
      const template = this.exportTemplates.find(t => t.id === formValue.template);
      
      this.previewData = {
        title: `${template?.name} - ${formValue.dateFrom} to ${formValue.dateTo}`,
        recordCount: 45,
        dateRange: `${formValue.dateFrom} to ${formValue.dateTo}`,
        totalAmount: 1250000,
        columns: template?.fields || [],
        sampleRows: [
          ['2024-01-15', 'ABC Office Supplies', '₱15,000.00', 'MOOE', 'APPROVED'],
          ['2024-01-20', 'XYZ Construction', '₱250,000.00', 'CO', 'PENDING'],
          ['2024-01-25', 'John Doe', '₱45,000.00', 'PS', 'APPROVED']
        ]
      };
    }
  }

  onExport() {
    if (this.exportForm.valid) {
      this.isExporting = true;
      
      const exportData = this.exportForm.value;
      
      // Mock export process - replace with actual service call
      setTimeout(() => {
        console.log('Exporting report:', exportData);
        
        // Simulate file download
        const fileName = `${exportData.fileName}.${exportData.format}`;
        console.log(`Report exported as: ${fileName}`);
        
        this.isExporting = false;
        
        // Show success message or redirect
        alert(`Report exported successfully as ${fileName}`);
      }, 3000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.exportForm.controls).forEach(key => {
        this.exportForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack() {
    this.router.navigate(['/user/reports']);
  }
}