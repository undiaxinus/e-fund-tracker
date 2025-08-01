import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-classifications',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="manage-classifications-container">
      <div class="header">
        <h1>Manage Expense Classifications</h1>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? 'Cancel' : 'Add Classification' }}
        </button>
      </div>
      
      <div class="add-form-section" *ngIf="showAddForm">
        <div class="form-card">
          <h2>Add New Classification</h2>
          <form [formGroup]="classificationForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="code">Classification Code *</label>
                <input type="text" id="code" formControlName="code" class="form-control" 
                       placeholder="e.g., PS, MOOE, CO, TR"
                       [class.error]="classificationForm.get('code')?.invalid && classificationForm.get('code')?.touched">
                <div class="error-message" *ngIf="classificationForm.get('code')?.invalid && classificationForm.get('code')?.touched">
                  Classification code is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input type="text" id="name" formControlName="name" class="form-control" 
                       placeholder="e.g., Personnel Services"
                       [class.error]="classificationForm.get('name')?.invalid && classificationForm.get('name')?.touched">
                <div class="error-message" *ngIf="classificationForm.get('name')?.invalid && classificationForm.get('name')?.touched">
                  Classification name is required
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" formControlName="description" class="form-control" rows="3"
                        placeholder="Brief description of this classification..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="isActive">Status</label>
              <div class="checkbox-group">
                <input type="checkbox" id="isActive" formControlName="isActive" class="checkbox">
                <label for="isActive" class="checkbox-label">Active Classification</label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="classificationForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Adding...' : 'Add Classification' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetForm()">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="classifications-section">
        <h2>Current Classifications</h2>
        <div class="classifications-grid">
          <div class="classification-card" *ngFor="let classification of classifications">
            <div class="classification-header">
              <div class="classification-code">{{ classification.code }}</div>
              <div class="classification-status" [class]="classification.isActive ? 'status-active' : 'status-inactive'">
                {{ classification.isActive ? 'Active' : 'Inactive' }}
              </div>
            </div>
            
            <div class="classification-content">
              <h3>{{ classification.name }}</h3>
              <p class="classification-description">{{ classification.description }}</p>
              
              <div class="classification-stats">
                <span class="stat">
                  <strong>{{ classification.usageCount }}</strong> disbursements
                </span>
                <span class="stat">
                  <strong>₱{{ classification.totalAmount | number:'1.2-2' }}</strong> total
                </span>
              </div>
            </div>
            
            <div class="classification-actions">
              <button class="btn btn-sm btn-outline" (click)="editClassification(classification)">
                Edit
              </button>
              <button class="btn btn-sm" 
                      [class]="classification.isActive ? 'btn-warning' : 'btn-success'"
                      (click)="toggleClassificationStatus(classification)">
                {{ classification.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-classifications-container {
      padding: 2rem;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .add-form-section {
      margin-bottom: 3rem;
    }
    
    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-card h2 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .form-control.error {
      border-color: #dc2626;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .checkbox {
      width: auto;
    }
    
    .checkbox-label {
      margin-bottom: 0;
      cursor: pointer;
    }
    
    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .classifications-section h2 {
      margin-bottom: 1.5rem;
      color: #1f2937;
    }
    
    .classifications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    .classification-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    
    .classification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .classification-code {
      background: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1.125rem;
    }
    
    .classification-status {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .status-active {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .classification-content h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }
    
    .classification-description {
      color: #6b7280;
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .classification-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat {
      background: #f3f4f6;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .classification-actions {
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
      font-weight: 500;
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
    
    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    .btn-warning {
      background: #f59e0b;
      color: white;
    }
    
    .btn-success {
      background: #059669;
      color: white;
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  `]
})
export class ManageClassificationsComponent implements OnInit {
  classificationForm: FormGroup;
  showAddForm = false;
  isSubmitting = false;
  
  classifications = [
    {
      id: '1',
      code: 'PS',
      name: 'Personnel Services',
      description: 'Salaries, wages, and other compensation for government personnel.',
      isActive: true,
      usageCount: 450,
      totalAmount: 2500000
    },
    {
      id: '2',
      code: 'MOOE',
      name: 'Maintenance and Other Operating Expenses',
      description: 'Operating expenses including utilities, supplies, and maintenance.',
      isActive: true,
      usageCount: 320,
      totalAmount: 1800000
    },
    {
      id: '3',
      code: 'CO',
      name: 'Capital Outlay',
      description: 'Expenditures for acquisition of assets and infrastructure.',
      isActive: true,
      usageCount: 180,
      totalAmount: 1200000
    },
    {
      id: '4',
      code: 'TR',
      name: 'Trust Receipts',
      description: 'Special funds and trust receipts for specific purposes.',
      isActive: true,
      usageCount: 75,
      totalAmount: 250000
    }
  ];

  constructor(private fb: FormBuilder) {
    this.classificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadClassifications();
  }

  onSubmit() {
    if (this.classificationForm.valid) {
      this.isSubmitting = true;
      const formData = this.classificationForm.value;
      
      console.log('Adding new classification:', formData);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.showAddForm = false;
        this.resetForm();
        alert('Classification added successfully!');
        // TODO: Refresh classifications list
      }, 2000);
    } else {
      Object.keys(this.classificationForm.controls).forEach(key => {
        this.classificationForm.get(key)?.markAsTouched();
      });
    }
  }

  resetForm() {
    this.classificationForm.reset({
      isActive: true
    });
  }

  editClassification(classification: any) {
    console.log('Editing classification:', classification.code);
    // TODO: Implement edit functionality
    alert(`Edit ${classification.code} classification`);
  }

  toggleClassificationStatus(classification: any) {
    classification.isActive = !classification.isActive;
    console.log(`Classification ${classification.code} ${classification.isActive ? 'activated' : 'deactivated'}`);
    // TODO: Implement actual API call to update status
  }

  private loadClassifications() {
    // TODO: Implement actual data loading from service
    console.log('Loading classifications...');
  }
}