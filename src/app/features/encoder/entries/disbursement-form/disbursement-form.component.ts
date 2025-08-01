import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-disbursement-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './disbursement-form.component.html',
  styleUrls: ['./disbursement-form.component.css']
})
export class DisbursementFormComponent implements OnInit {
  disbursementForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  error = '';
  successMessage = '';
  isEditMode = false;
  disbursementId: string | null = null;
  currentUser: any;

  // Form options
  classifications = [
    { value: 'PS', label: 'Personnel Services', icon: '👥', description: 'Salaries, wages, and employee benefits' },
    { value: 'MOOE', label: 'Maintenance and Other Operating Expenses', icon: '🔧', description: 'Office supplies, utilities, maintenance' },
    { value: 'CO', label: 'Capital Outlay', icon: '🏗️', description: 'Equipment, infrastructure, and assets' },
    { value: 'TR', label: 'Trust Receipts', icon: '📋', description: 'Trust funds and special accounts' }
  ];

  departments = [
    'Finance',
    'Human Resources',
    'Operations',
    'Administration',
    'IT Department',
    'Procurement',
    'Legal',
    'Audit',
    'Planning'
  ];

  fundSources = [
    'General Fund',
    'Special Education Fund',
    'Trust Fund',
    'Development Fund',
    'Calamity Fund',
    'Infrastructure Fund',
    'Health Fund'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    this.disbursementForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.checkEditMode();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private checkEditMode(): void {
    this.disbursementId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.disbursementId;
    
    if (this.isEditMode && this.disbursementId) {
      this.loadDisbursement(this.disbursementId);
    } else {
      this.generateDisbursementNumber();
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      disbursementNo: ['', [Validators.required]],
      payee: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      disbursementDate: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      fundSource: ['', [Validators.required]],
      classification: ['', [Validators.required]],
      subClassification: [''],
      department: ['', [Validators.required]],
      checkNo: [''],
      voucherNo: [''],
      remarks: ['']
    });
  }

  private async generateDisbursementNumber(): Promise<void> {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      // Get count of disbursements for current month
      const { data } = await this.supabaseService.getDisbursements({
        dateFrom: `${year}-${month}-01`,
        dateTo: `${year}-${month}-31`
      });
      
      const count = (data?.length || 0) + 1;
      const disbursementNo = `DSB-${year}${month}-${String(count).padStart(4, '0')}`;
      
      this.disbursementForm.patchValue({ disbursementNo });
    } catch (error) {
      console.error('Error generating disbursement number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-6);
      this.disbursementForm.patchValue({ disbursementNo: `DSB-${timestamp}` });
    }
  }

  private async loadDisbursement(id: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = '';
      
      const { data, error } = await this.supabaseService.getDisbursementById(id);
      
      if (error) {
        this.error = 'Failed to load disbursement: ' + error.message;
        return;
      }
      
      if (data) {
        this.disbursementForm.patchValue({
          disbursementNo: data.disbursement_no,
          payee: data.payee,
          amount: data.amount,
          disbursementDate: data.disbursement_date?.split('T')[0], // Format for date input
          description: data.description,
          fundSource: data.fund_source,
          classification: data.classification,
          subClassification: data.sub_classification,
          department: data.department,
          checkNo: data.check_no,
          voucherNo: data.voucher_no,
          remarks: data.remarks
        });
      }
    } catch (error: any) {
      this.error = 'An unexpected error occurred: ' + error.message;
      console.error('Error loading disbursement:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.disbursementForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.successMessage = '';

    try {
      const formData = this.disbursementForm.value;
      
      // Prepare data for submission
      const disbursementData: any = {
        disbursement_no: formData.disbursementNo,
        payee: formData.payee,
        amount: parseFloat(formData.amount),
        disbursement_date: formData.disbursementDate,
        description: formData.description,
        fund_source: formData.fundSource,
        classification: formData.classification,
        sub_classification: formData.subClassification || null,
        department: formData.department,
        check_no: formData.checkNo || null,
        voucher_no: formData.voucherNo || null,
        remarks: formData.remarks || null,
        status: 'ACTIVE',
        is_archived: false
      };

      let result;
      if (this.isEditMode && this.disbursementId) {
        // Update existing disbursement
        disbursementData.updated_by_id = this.currentUser?.id;
        result = await this.supabaseService.updateDisbursement(this.disbursementId, disbursementData);
      } else {
        // Create new disbursement
        disbursementData.created_by_id = this.currentUser?.id;
        result = await this.supabaseService.createDisbursement(disbursementData);
      }

      if (result.error) {
        this.error = result.error.message;
        return;
      }

      // Log audit trail
      await this.logAuditAction(
        this.isEditMode ? 'UPDATE' : 'CREATE',
        'Disbursement',
        result.data?.id || this.disbursementId
      );

      this.successMessage = this.isEditMode 
        ? 'Disbursement updated successfully!' 
        : 'Disbursement created successfully!';

      // Redirect after success
      setTimeout(() => {
        this.router.navigate(['/disbursements']);
      }, 2000);

    } catch (error: any) {
      this.error = 'An unexpected error occurred: ' + error.message;
      console.error('Error submitting form:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async logAuditAction(action: string, entityType: string, entityId?: string): Promise<void> {
    if (this.currentUser && entityId) {
      try {
        await this.supabaseService.createAuditLog({
          user_id: this.currentUser.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error logging audit action:', error);
      }
    }
  }

  onCancel(): void {
    if (this.disbursementForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/disbursements']);
      }
    } else {
      this.router.navigate(['/disbursements']);
    }
  }

  onReset(): void {
    if (confirm('Are you sure you want to reset the form? All changes will be lost.')) {
      this.disbursementForm.reset();
      if (!this.isEditMode) {
        this.generateDisbursementNumber();
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.disbursementForm.controls).forEach(key => {
      const control = this.disbursementForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.disbursementForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.disbursementForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be greater than ${field.errors['min'].min}`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      disbursementNo: 'Disbursement Number',
      payee: 'Payee',
      amount: 'Amount',
      disbursementDate: 'Disbursement Date',
      description: 'Description',
      fundSource: 'Fund Source',
      classification: 'Classification',
      subClassification: 'Sub-classification',
      department: 'Department',
      checkNo: 'Check Number',
      voucherNo: 'Voucher Number',
      remarks: 'Remarks'
    };
    return labels[fieldName] || fieldName;
  }

  getClassificationInfo(value: string) {
    return this.classifications.find(c => c.value === value);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  canEdit(): boolean {
    return this.authService.canEdit();
  }
}