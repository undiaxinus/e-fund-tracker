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

  // Form setup
  readonly loginForm: FormGroup = this.formBuilder.group({
    email: ['admin@efund.gov', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(3)]],
    rememberMe: [false]
  });

  // Computed properties
  readonly isFormValid = computed(() => {
    const valid = this.loginForm.valid;
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');
    console.log('Form valid:', valid);
    console.log('Email valid:', emailControl?.valid, 'Email errors:', emailControl?.errors);
    console.log('Password valid:', passwordControl?.valid, 'Password errors:', passwordControl?.errors);
    return valid;
  });
  readonly canSubmit = computed(() => {
    const canSubmit = this.isFormValid() && !this.isLoading();
    console.log('Can submit:', canSubmit, 'Form valid:', this.isFormValid(), 'Loading:', this.isLoading());
    return canSubmit;
  });

  ngOnInit(): void {
    // Get return url from route parameters or default to '/admin'
    this.returnUrl.set(this.route.snapshot.queryParams['returnUrl'] || '/admin');

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
        // Redirect to return URL or dashboard
        this.router.navigate([this.returnUrl()]);
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

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
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
}