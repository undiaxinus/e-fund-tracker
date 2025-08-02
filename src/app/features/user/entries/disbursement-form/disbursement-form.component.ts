import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DisbursementService } from '../../../../core/services/disbursement.service';
import { AuthService } from '../../../../core/services/auth.service';

interface DisbursementFormData {
  id?: string;
  payee: string;
  amount: number;
  date: string;
  fundSource: string;
  classification: 'PS' | 'MOOE' | 'CO' | 'TR';
  description: string;
  department: string;
  referenceNumber: string;
  approvedBy?: string;
}

@Component({
  selector: 'app-disbursement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode ? 'Edit' : 'New' }} Disbursement Entry</h1>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to List
        </button>
      </div>

      <form [formGroup]="disbursementForm" (ngSubmit)="onSubmit()" class="disbursement-form">
        <div class="form-grid">
          <!-- Basic Information Section -->
          <div class="form-section">
            <h2>Basic Information</h2>
            
            <div class="form-group">
              <label for="payee">Payee *</label>
              <input 
                id="payee"
                type="text" 
                formControlName="payee"
                placeholder="Enter payee name"
                [class.error]="isFieldInvalid('payee')"
              >
              <div *ngIf="isFieldInvalid('payee')" class="error-message">
                Payee is required
              </div>
            </div>

            <div class="form-group">
              <label for="amount">Amount *</label>
              <div class="input-with-prefix">
                <span class="prefix">₱</span>
                <input 
                  id="amount"
                  type="number" 
                  formControlName="amount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  [class.error]="isFieldInvalid('amount')"
                >
              </div>
              <div *ngIf="isFieldInvalid('amount')" class="error-message">
                <span *ngIf="disbursementForm.get('amount')?.errors?.['required']">Amount is required</span>
                <span *ngIf="disbursementForm.get('amount')?.errors?.['min']">Amount must be greater than 0</span>
              </div>
            </div>

            <div class="form-group">
              <label for="date">Date *</label>
              <input 
                id="date"
                type="date" 
                formControlName="date"
                [class.error]="isFieldInvalid('date')"
              >
              <div *ngIf="isFieldInvalid('date')" class="error-message">
                Date is required
              </div>
            </div>

            <div class="form-group">
              <label for="referenceNumber">Reference Number</label>
              <input 
                id="referenceNumber"
                type="text" 
                formControlName="referenceNumber"
                placeholder="Enter reference number"
              >
            </div>
          </div>

          <!-- Classification Section -->
          <div class="form-section">
            <h2>Classification & Source</h2>
            
            <div class="form-group">
              <label for="classification">Classification *</label>
              <select 
                id="classification"
                formControlName="classification"
                [class.error]="isFieldInvalid('classification')"
              >
                <option value="">Select Classification</option>
                <option value="PS">PS - Personal Services</option>
                <option value="MOOE">MOOE - Maintenance and Other Operating Expenses</option>
                <option value="CO">CO - Capital Outlay</option>
                <option value="TR">TR - Trust Receipts</option>
              </select>
              <div *ngIf="isFieldInvalid('classification')" class="error-message">
                Classification is required
              </div>
              
              <!-- Classification Info -->
              <div *ngIf="disbursementForm.get('classification')?.value" class="classification-info">
                <div class="info-card" [ngClass]="disbursementForm.get('classification')?.value">
                  <h4>{{ getClassificationTitle() }}</h4>
                  <p>{{ getClassificationDescription() }}</p>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="fundSource">Fund Source *</label>
              <select 
                id="fundSource"
                formControlName="fundSource"
                [class.error]="isFieldInvalid('fundSource')"
              >
                <option value="">Select Fund Source</option>
                <option value="General Fund">General Fund</option>
                <option value="Special Education Fund">Special Education Fund</option>
                <option value="Infrastructure Fund">Infrastructure Fund</option>
                <option value="Payroll Fund">Payroll Fund</option>
                <option value="Trust Fund">Trust Fund</option>
                <option value="Development Fund">Development Fund</option>
              </select>
              <div *ngIf="isFieldInvalid('fundSource')" class="error-message">
                Fund source is required
              </div>
            </div>

            <div class="form-group">
              <label for="department">Department *</label>
              <select 
                id="department"
                formControlName="department"
                [class.error]="isFieldInvalid('department')"
              >
                <option value="">Select Department</option>
                <option value="Finance">Finance Department</option>
                <option value="HR">Human Resources</option>
                <option value="IT">Information Technology</option>
                <option value="Operations">Operations</option>
                <option value="Procurement">Procurement</option>
                <option value="Legal">Legal Affairs</option>
                <option value="Planning">Planning & Development</option>
              </select>
              <div *ngIf="isFieldInvalid('department')" class="error-message">
                Department is required
              </div>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="form-section full-width">
          <h2>Description</h2>
          <div class="form-group">
            <label for="description">Description *</label>
            <textarea 
              id="description"
              formControlName="description"
              rows="4"
              placeholder="Enter detailed description of the disbursement..."
              [class.error]="isFieldInvalid('description')"
            ></textarea>
            <div *ngIf="isFieldInvalid('description')" class="error-message">
              Description is required
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="disbursementForm.invalid || isSubmitting"
          >
            <span *ngIf="isSubmitting" class="spinner">⏳</span>
            {{ isEditMode ? 'Update' : 'Create' }} Entry
          </button>
        </div>
      </form>

      <!-- Summary Card -->
      <div class="summary-card" *ngIf="disbursementForm.valid">
        <h3>Entry Summary</h3>
        <div class="summary-item">
          <span class="label">Payee:</span>
          <span class="value">{{ disbursementForm.get('payee')?.value }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Amount:</span>
          <span class="value amount">₱{{ disbursementForm.get('amount')?.value | number:'1.2-2' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Classification:</span>
          <span class="value classification" [ngClass]="disbursementForm.get('classification')?.value">
            {{ disbursementForm.get('classification')?.value }}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Fund Source:</span>
          <span class="value">{{ disbursementForm.get('fundSource')?.value }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .form-header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .disbursement-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section.full-width {
      grid-column: 1 / -1;
    }

    .form-section h2 {
      color: #2c3e50;
      margin: 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #3498db;
      font-size: 1.2rem;
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
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: #e74c3c;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .prefix {
      position: absolute;
      left: 0.75rem;
      color: #6c757d;
      font-weight: 600;
      z-index: 1;
    }

    .input-with-prefix input {
      padding-left: 2rem;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .classification-info {
      margin-top: 0.5rem;
    }

    .info-card {
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .info-card.PS {
      background: #e3f2fd;
      border-color: #1976d2;
    }

    .info-card.MOOE {
      background: #f3e5f5;
      border-color: #7b1fa2;
    }

    .info-card.CO {
      background: #e8f5e8;
      border-color: #388e3c;
    }

    .info-card.TR {
      background: #fff3e0;
      border-color: #f57c00;
    }

    .info-card h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .info-card p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
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

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3498db;
    }

    .summary-card h3 {
      color: #2c3e50;
      margin: 0 0 1rem 0;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item .label {
      font-weight: 600;
      color: #6c757d;
    }

    .summary-item .value {
      font-weight: 600;
      color: #2c3e50;
    }

    .summary-item .value.amount {
      color: #27ae60;
      font-size: 1.1rem;
    }

    .summary-item .value.classification {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    .summary-item .value.classification.PS {
      background: #e3f2fd;
      color: #1976d2;
    }

    .summary-item .value.classification.MOOE {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .summary-item .value.classification.CO {
      background: #e8f5e8;
      color: #388e3c;
    }

    .summary-item .value.classification.TR {
      background: #fff3e0;
      color: #f57c00;
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 1rem;
      }

      .form-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        justify-content: center;
      }
    }
  `]
})
export class DisbursementFormComponent implements OnInit {
  disbursementForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  disbursementId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private disbursementService: DisbursementService,
    private authService: AuthService
  ) {
    this.disbursementForm = this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.disbursementId = params['id'];
        this.loadDisbursement(params['id']);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      payee: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', [Validators.required]],
      fundSource: ['', [Validators.required]],
      classification: ['', [Validators.required]],
      description: ['', [Validators.required]],
      department: ['', [Validators.required]],
      referenceNumber: ['']
    });
  }

  private loadDisbursement(id: string) {
    // Mock data for now - replace with actual service call
    const mockDisbursement = {
      id: '1',
      payee: 'ABC Office Supplies',
      amount: 15000,
      date: '2024-01-15',
      fundSource: 'General Fund',
      classification: 'MOOE',
      description: 'Office supplies and materials for Q1 operations',
      department: 'Finance',
      referenceNumber: 'REF-2024-001'
    };

    this.disbursementForm.patchValue(mockDisbursement);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.disbursementForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getClassificationTitle(): string {
    const classification = this.disbursementForm.get('classification')?.value;
    const titles = {
      'PS': 'Personal Services',
      'MOOE': 'Maintenance and Other Operating Expenses',
      'CO': 'Capital Outlay',
      'TR': 'Trust Receipts'
    };
    return titles[classification as keyof typeof titles] || '';
  }

  getClassificationDescription(): string {
    const classification = this.disbursementForm.get('classification')?.value;
    const descriptions = {
      'PS': 'Salaries, wages, and other compensation for government personnel.',
      'MOOE': 'Operating expenses including supplies, utilities, and maintenance costs.',
      'CO': 'Expenditures for infrastructure, equipment, and other capital assets.',
      'TR': 'Funds held in trust for specific purposes or beneficiaries.'
    };
    return descriptions[classification as keyof typeof descriptions] || '';
  }

  onSubmit() {
    if (this.disbursementForm.valid) {
      this.isSubmitting = true;
      
      const formData: DisbursementFormData = {
        ...this.disbursementForm.value,
        id: this.disbursementId
      };

      // Mock submission - replace with actual service call
      setTimeout(() => {
        console.log('Submitting disbursement:', formData);
        this.isSubmitting = false;
        this.router.navigate(['/user/entries']);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.disbursementForm.controls).forEach(key => {
        this.disbursementForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack() {
    this.router.navigate(['/user/entries']);
  }
}