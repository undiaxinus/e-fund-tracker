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
  templateUrl: './disbursement-form.component.html',
  styleUrls: ['./disbursement-form.component.css']
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