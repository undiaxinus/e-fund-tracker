import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

interface SystemSettings {
  general: {
    systemName: string;
    organizationName: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    fiscalYearStart: string;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorEnabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    auditAlerts: boolean;
    reportGeneration: boolean;
    maintenanceMode: boolean;
  };
  dataRetention: {
    disbursementRetention: number;
    userDataRetention: number;
    sessionLogRetention: number;
    auditLogRetention: number;
    autoArchiveEnabled: boolean;
  };
  backup: {
    autoBackupEnabled: boolean;
    backupFrequency: string;
    backupRetention: number;
    lastBackup: Date | null;
    nextBackup: Date | null;
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);

  // Reactive state
  settings = signal<SystemSettings | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  activeTab = signal<string>('general');

  // Forms
  generalForm!: FormGroup;
  securityForm!: FormGroup;
  notificationsForm!: FormGroup;
  dataRetentionForm!: FormGroup;
  backupForm!: FormGroup;

  ngOnInit() {
    this.initializeForms();
    this.loadSettings();
  }

  initializeForms() {
    this.generalForm = this.fb.group({
      systemName: ['E-Fund Tracker', Validators.required],
      organizationName: ['Government Agency', Validators.required],
      timezone: ['Asia/Manila', Validators.required],
      dateFormat: ['MM/dd/yyyy', Validators.required],
      currency: ['PHP', Validators.required],
      fiscalYearStart: ['January', Validators.required]
    });

    this.securityForm = this.fb.group({
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(32)]],
      passwordRequireSpecialChars: [true],
      maxLoginAttempts: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      lockoutDuration: [15, [Validators.required, Validators.min(1), Validators.max(1440)]],
      twoFactorEnabled: [false]
    });

    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      systemAlerts: [true],
      auditAlerts: [true],
      reportGeneration: [true],
      maintenanceMode: [false]
    });

    this.dataRetentionForm = this.fb.group({
      disbursementRetention: [2555, [Validators.required, Validators.min(365)]], // 7 years
      userDataRetention: [1095, [Validators.required, Validators.min(365)]], // 3 years
      sessionLogRetention: [365, [Validators.required, Validators.min(30)]], // 1 year
      auditLogRetention: [1825, [Validators.required, Validators.min(365)]], // 5 years
      autoArchiveEnabled: [true]
    });

    this.backupForm = this.fb.group({
      autoBackupEnabled: [true],
      backupFrequency: ['daily', Validators.required],
      backupRetention: [30, [Validators.required, Validators.min(7), Validators.max(365)]]
    });
  }

  async loadSettings() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Mock settings data
      const mockSettings: SystemSettings = {
        general: {
          systemName: 'E-Fund Tracker',
          organizationName: 'Department of Budget and Management',
          timezone: 'Asia/Manila',
          dateFormat: 'MM/dd/yyyy',
          currency: 'PHP',
          fiscalYearStart: 'January'
        },
        security: {
          sessionTimeout: 30,
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          maxLoginAttempts: 3,
          lockoutDuration: 15,
          twoFactorEnabled: false
        },
        notifications: {
          emailNotifications: true,
          systemAlerts: true,
          auditAlerts: true,
          reportGeneration: true,
          maintenanceMode: false
        },
        dataRetention: {
          disbursementRetention: 2555,
          userDataRetention: 1095,
          sessionLogRetention: 365,
          auditLogRetention: 1825,
          autoArchiveEnabled: true
        },
        backup: {
          autoBackupEnabled: true,
          backupFrequency: 'daily',
          backupRetention: 30,
          lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
          nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };

      this.settings.set(mockSettings);
      this.populateForms(mockSettings);
    } catch (err) {
      this.error.set('Failed to load settings. Please try again.');
      console.error('Error loading settings:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  populateForms(settings: SystemSettings) {
    this.generalForm.patchValue(settings.general);
    this.securityForm.patchValue(settings.security);
    this.notificationsForm.patchValue(settings.notifications);
    this.dataRetentionForm.patchValue(settings.dataRetention);
    this.backupForm.patchValue({
      autoBackupEnabled: settings.backup.autoBackupEnabled,
      backupFrequency: settings.backup.backupFrequency,
      backupRetention: settings.backup.backupRetention
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  async saveSettings(category: string) {
    this.isSaving.set(true);
    this.clearMessages();

    try {
      let form: FormGroup;
      switch (category) {
        case 'general':
          form = this.generalForm;
          break;
        case 'security':
          form = this.securityForm;
          break;
        case 'notifications':
          form = this.notificationsForm;
          break;
        case 'dataRetention':
          form = this.dataRetentionForm;
          break;
        case 'backup':
          form = this.backupForm;
          break;
        default:
          throw new Error('Invalid category');
      }

      if (form.invalid) {
        this.error.set('Please fix the validation errors before saving.');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local settings
      const currentSettings = this.settings()!;
      const updatedSettings = {
        ...currentSettings,
        [category]: form.value
      };
      this.settings.set(updatedSettings);

      this.successMessage.set(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (err) {
      this.error.set('Failed to save settings. Please try again.');
      console.error('Error saving settings:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  async performBackup() {
    this.isSaving.set(true);
    this.clearMessages();

    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update backup timestamps
      const currentSettings = this.settings()!;
      const updatedSettings = {
        ...currentSettings,
        backup: {
          ...currentSettings.backup,
          lastBackup: new Date(),
          nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };
      this.settings.set(updatedSettings);

      this.successMessage.set('Backup completed successfully!');
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (err) {
      this.error.set('Failed to perform backup. Please try again.');
      console.error('Error performing backup:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  async testEmailSettings() {
    this.isSaving.set(true);
    this.clearMessages();

    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.successMessage.set('Test email sent successfully!');
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (err) {
      this.error.set('Failed to send test email. Please check your email configuration.');
      console.error('Error testing email:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  async resetToDefaults(category: string) {
    if (!confirm(`Are you sure you want to reset ${category} settings to defaults? This action cannot be undone.`)) {
      return;
    }

    this.clearMessages();

    try {
      // Reset form to default values
      switch (category) {
        case 'general':
          this.generalForm.reset({
            systemName: 'E-Fund Tracker',
            organizationName: 'Government Agency',
            timezone: 'Asia/Manila',
            dateFormat: 'MM/dd/yyyy',
            currency: 'PHP',
            fiscalYearStart: 'January'
          });
          break;
        case 'security':
          this.securityForm.reset({
            sessionTimeout: 30,
            passwordMinLength: 8,
            passwordRequireSpecialChars: true,
            maxLoginAttempts: 3,
            lockoutDuration: 15,
            twoFactorEnabled: false
          });
          break;
        case 'notifications':
          this.notificationsForm.reset({
            emailNotifications: true,
            systemAlerts: true,
            auditAlerts: true,
            reportGeneration: true,
            maintenanceMode: false
          });
          break;
        case 'dataRetention':
          this.dataRetentionForm.reset({
            disbursementRetention: 2555,
            userDataRetention: 1095,
            sessionLogRetention: 365,
            auditLogRetention: 1825,
            autoArchiveEnabled: true
          });
          break;
        case 'backup':
          this.backupForm.reset({
            autoBackupEnabled: true,
            backupFrequency: 'daily',
            backupRetention: 30
          });
          break;
      }

      this.successMessage.set(`${category.charAt(0).toUpperCase() + category.slice(1)} settings reset to defaults.`);
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (err) {
      this.error.set('Failed to reset settings.');
      console.error('Error resetting settings:', err);
    }
  }

  clearMessages() {
    this.error.set(null);
    this.successMessage.set(null);
  }

  getFormErrors(form: FormGroup): string[] {
    const errors: string[] = [];
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.invalid && control.touched) {
        if (control.errors?.['required']) {
          errors.push(`${key} is required`);
        }
        if (control.errors?.['min']) {
          errors.push(`${key} must be at least ${control.errors['min'].min}`);
        }
        if (control.errors?.['max']) {
          errors.push(`${key} must be at most ${control.errors['max'].max}`);
        }
      }
    });
    return errors;
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  getDaysInWords(days: number): string {
    if (days < 365) {
      return `${days} days`;
    } else {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      if (remainingDays === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${years} year${years > 1 ? 's' : ''} and ${remainingDays} days`;
      }
    }
  }
}