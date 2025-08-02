import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="user-form-container">
      <div class="form-header">
        <h1>{{ isEditMode ? 'Edit User' : 'Add New User' }}</h1>
        <button routerLink="../" class="btn btn-secondary">Back to Users</button>
      </div>
      
      <div class="form-card">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input type="text" id="firstName" formControlName="firstName" class="form-control"
                     [class.error]="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched">
              <div class="error-message" *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched">
                First name is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input type="text" id="lastName" formControlName="lastName" class="form-control"
                     [class.error]="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched">
              <div class="error-message" *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched">
                Last name is required
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" formControlName="email" class="form-control"
                   [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
            <div class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
              <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="role">Role *</label>
              <select id="role" formControlName="role" class="form-control"
                      (change)="onRoleChange()"
                      [class.error]="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                <option value="">Select a role</option>
                <option value="admin">Administrator</option>
                <option value="user">User</option>
              </select>
              <div class="error-message" *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                Role is required
              </div>
            </div>
            
            <div class="form-group" *ngIf="userForm.get('role')?.value === 'user'">
              <label for="permission">Permission *</label>
              <select id="permission" formControlName="permission" class="form-control"
                      [class.error]="userForm.get('permission')?.invalid && userForm.get('permission')?.touched">
                <option value="">Select permission</option>
                <option value="encoder">Encoder (Can create and edit entries)</option>
                <option value="viewer">Viewer (Read-only access)</option>
              </select>
              <div class="error-message" *ngIf="userForm.get('permission')?.invalid && userForm.get('permission')?.touched">
                Permission is required for user role
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="isActive">Status</label>
            <div class="checkbox-group">
              <input type="checkbox" id="isActive" formControlName="isActive" class="checkbox">
              <label for="isActive" class="checkbox-label">Active User</label>
            </div>
          </div>
          
          <div class="form-group" *ngIf="!isEditMode">
            <label for="password">Password *</label>
            <input type="password" id="password" formControlName="password" class="form-control"
                   [class.error]="userForm.get('password')?.invalid && userForm.get('password')?.touched">
            <div class="error-message" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
              <span *ngIf="userForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="userForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
            </div>
          </div>
          
          <div class="form-group" *ngIf="!isEditMode">
            <label for="confirmPassword">Confirm Password *</label>
            <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-control"
                   [class.error]="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched">
            <div class="error-message" *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched">
              <span *ngIf="userForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
              <span *ngIf="userForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
            </button>
            <button type="button" routerLink="../" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .user-form-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
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
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f3f4f6;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #4b5563;
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      permission: [''],
      isActive: [true],
      password: [''],
      confirmPassword: ['']
    });
    
    // Set up conditional validation for permission field
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      const permissionControl = this.userForm.get('permission');
      if (role === 'user') {
        permissionControl?.setValidators([Validators.required]);
      } else {
        permissionControl?.clearValidators();
        permissionControl?.setValue('');
      }
      permissionControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;
    
    if (!this.isEditMode) {
      // Add password validators for new users
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required, this.passwordMatchValidator.bind(this)]);
    }
    
    if (this.isEditMode) {
      this.loadUser();
    }
  }

  passwordMatchValidator(control: any) {
    const password = this.userForm?.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
  
  onRoleChange() {
    // This method is called when role changes in the template
    // The actual logic is handled by the valueChanges subscription in the constructor
    const role = this.userForm.get('role')?.value;
    if (role !== 'user') {
      this.userForm.get('permission')?.setValue('');
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      const formData = this.userForm.value;
      
      console.log('Submitting user data:', formData);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        alert(`User ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.router.navigate(['../'], { relativeTo: this.route });
      }, 2000);
      
      // TODO: Implement actual API call
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  private loadUser() {
    // TODO: Load user data from service
    console.log('Loading user:', this.userId);
    
    // Simulate loading user data
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      isActive: true
    };
    
    this.userForm.patchValue(mockUser);
  }
}