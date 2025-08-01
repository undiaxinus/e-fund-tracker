import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals for reactive state management
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly returnUrl = signal('');
  readonly focusedFields = signal<Set<string>>(new Set());
  readonly showDemoUsers = signal(false);

  // Form setup
  readonly loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    rememberMe: [false]
  });

  // Demo users for quick login
  readonly demoUsers = this.authService.getDemoUsers();

  // Computed properties
  readonly isFormValid = computed(() => {
    const valid = this.loginForm.valid;
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');
    return valid;
  });
  
  readonly canSubmit = computed(() => {
    const canSubmit = this.isFormValid() && !this.isLoading();
    return canSubmit;
  });

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl.set(this.route.snapshot.queryParams['returnUrl'] || '/dashboard');

    // Check if user is already authenticated
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate([this.returnUrl()]);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.signIn(email, password);
      
      if (result.success) {
        // The AuthService will handle navigation based on user role
        // No need to navigate here as it's handled in the service
      } else {
        this.errorMessage.set(result.error || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Quick login with demo user
  async quickLogin(demoUser: { email: string; role: string; name: string }): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Find the password for this demo user
      const password = this.getPasswordForDemoUser(demoUser.email);
      const result = await this.authService.signIn(demoUser.email, password);
      
      if (result.success) {
        // Success - AuthService will handle navigation
      } else {
        this.errorMessage.set(result.error || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
      console.error('Quick login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getPasswordForDemoUser(email: string): string {
    const passwordMap: { [key: string]: string } = {
      'admin@efund.gov': 'password123',
      'test@example.com': 'demo123',
      'user@test.com': '123456'
    };
    return passwordMap[email] || '';
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleDemoUsers(): void {
    this.showDemoUsers.set(!this.showDemoUsers());
  }

  onForgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.resetPassword(email);
    } else {
      // Navigate to forgot password page or show email input
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const result = await this.authService.resetPassword(email);
      if (result.success) {
        alert('Password reset email sent. Please check your inbox.');
      } else {
        alert(result.error || 'Failed to send reset email.');
      }
    } catch (error) {
      alert('An error occurred while sending reset email.');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  // Focus tracking methods
  onFieldFocus(fieldName: string): void {
    const currentFocused = this.focusedFields();
    const newFocused = new Set(currentFocused);
    newFocused.add(fieldName);
    this.focusedFields.set(newFocused);
  }

  onFieldBlur(fieldName: string): void {
    const currentFocused = this.focusedFields();
    const newFocused = new Set(currentFocused);
    newFocused.delete(fieldName);
    this.focusedFields.set(newFocused);
  }

  isFieldFocused(fieldName: string): boolean {
    return this.focusedFields().has(fieldName);
  }

  // Get role badge class
  getRoleBadgeClass(role: string): string {
    const roleClasses: { [key: string]: string } = {
      'ADMIN': 'bg-red-100 text-red-800',
      'ENCODER': 'bg-blue-100 text-blue-800',
      'VIEWER': 'bg-green-100 text-green-800'
    };
    return roleClasses[role] || 'bg-gray-100 text-gray-800';
  }

  // Generate user initials
  getUserInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}