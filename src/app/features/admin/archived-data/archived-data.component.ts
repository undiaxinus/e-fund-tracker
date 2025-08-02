import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

interface ArchivedRecord {
  id: string;
  originalId: string;
  type: 'disbursement' | 'user' | 'classification' | 'session';
  title: string;
  description: string;
  originalData: any;
  archivedDate: Date;
  archivedBy: string;
  reason: string;
  retentionPeriod: number; // in days
  canRestore: boolean;
  size: number; // in bytes
}

interface ArchiveSummary {
  totalRecords: number;
  totalSize: number;
  byType: {
    disbursement: { count: number; size: number };
    user: { count: number; size: number };
    classification: { count: number; size: number };
    session: { count: number; size: number };
  };
  retentionStatus: {
    active: number;
    expiringSoon: number; // within 30 days
    expired: number;
  };
}

@Component({
  selector: 'app-archived-data',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './archived-data.component.html',
  styleUrls: ['./archived-data.component.css']
})
export class ArchivedDataComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  // Make Math available in template
  Math = Math;

  // Reactive state
  archivedRecords = signal<ArchivedRecord[]>([]);
  summary = signal<ArchiveSummary | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  selectedRecords = signal<Set<string>>(new Set());

  // Form controls
  searchControl = new FormControl('');
  typeFilter = new FormControl('');
  dateFromFilter = new FormControl('');
  dateToFilter = new FormControl('');
  retentionFilter = new FormControl('');

  // Computed properties
  filteredRecords = computed(() => {
    const records = this.archivedRecords();
    const search = this.searchControl.value?.toLowerCase() || '';
    const type = this.typeFilter.value || '';
    const dateFrom = this.dateFromFilter.value;
    const dateTo = this.dateToFilter.value;
    const retention = this.retentionFilter.value;

    return records.filter(record => {
      const matchesSearch = !search || 
        record.title.toLowerCase().includes(search) ||
        record.description.toLowerCase().includes(search) ||
        record.archivedBy.toLowerCase().includes(search);
      
      const matchesType = !type || record.type === type;
      
      const matchesDateRange = (!dateFrom || new Date(record.archivedDate) >= new Date(dateFrom)) &&
                              (!dateTo || new Date(record.archivedDate) <= new Date(dateTo));
      
      let matchesRetention = true;
      if (retention) {
        const now = new Date();
        const archiveDate = new Date(record.archivedDate);
        const daysSinceArchived = Math.floor((now.getTime() - archiveDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilExpiry = record.retentionPeriod - daysSinceArchived;
        
        switch (retention) {
          case 'active':
            matchesRetention = daysUntilExpiry > 30;
            break;
          case 'expiring':
            matchesRetention = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            break;
          case 'expired':
            matchesRetention = daysUntilExpiry <= 0;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesDateRange && matchesRetention;
    }).sort((a, b) => new Date(b.archivedDate).getTime() - new Date(a.archivedDate).getTime());
  });

  ngOnInit() {
    this.loadArchivedData();
    this.loadSummary();
  }

  async loadArchivedData() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Mock data for demonstration
      const mockRecords: ArchivedRecord[] = [
        {
          id: '1',
          originalId: 'disb_001',
          type: 'disbursement',
          title: 'Salary Payment - December 2023',
          description: 'Monthly salary disbursement for all personnel',
          originalData: { amount: 2500000, classification: 'PS', payee: 'All Personnel' },
          archivedDate: new Date('2024-01-15'),
          archivedBy: 'System Admin',
          reason: 'Automatic archival after 1 year retention period',
          retentionPeriod: 2555, // 7 years
          canRestore: true,
          size: 2048
        },
        {
          id: '2',
          originalId: 'user_456',
          type: 'user',
          title: 'Former Employee - John Smith',
          description: 'User account for terminated employee',
          originalData: { email: 'john.smith@example.com', role: 'encoder', department: 'Finance' },
          archivedDate: new Date('2024-06-30'),
          archivedBy: 'HR Manager',
          reason: 'Employee termination',
          retentionPeriod: 1095, // 3 years
          canRestore: false,
          size: 1024
        },
        {
          id: '3',
          originalId: 'class_789',
          type: 'classification',
          title: 'Deprecated Classification - OLD_PS',
          description: 'Old personnel services classification system',
          originalData: { code: 'OLD_PS', name: 'Old Personnel Services', active: false },
          archivedDate: new Date('2024-03-01'),
          archivedBy: 'System Admin',
          reason: 'Classification system update',
          retentionPeriod: 1825, // 5 years
          canRestore: true,
          size: 512
        },
        {
          id: '4',
          originalId: 'sess_abc123',
          type: 'session',
          title: 'Expired Session Data',
          description: 'User session logs from Q1 2024',
          originalData: { sessionCount: 1250, totalDuration: '450 hours' },
          archivedDate: new Date('2024-04-01'),
          archivedBy: 'System',
          reason: 'Automatic cleanup of old session data',
          retentionPeriod: 365, // 1 year
          canRestore: false,
          size: 4096
        },
        {
          id: '5',
          originalId: 'disb_002',
          type: 'disbursement',
          title: 'Equipment Purchase - 2023',
          description: 'Capital outlay for office equipment',
          originalData: { amount: 850000, classification: 'CO', payee: 'Office Supplies Inc.' },
          archivedDate: new Date('2024-12-01'),
          archivedBy: 'Finance Manager',
          reason: 'Manual archival for audit compliance',
          retentionPeriod: 2555, // 7 years
          canRestore: true,
          size: 1536
        }
      ];

      this.archivedRecords.set(mockRecords);
    } catch (err) {
      this.error.set('Failed to load archived data. Please try again.');
      console.error('Error loading archived data:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSummary() {
    try {
      const records = this.archivedRecords();
      const now = new Date();
      
      const summary: ArchiveSummary = {
        totalRecords: records.length,
        totalSize: records.reduce((sum, record) => sum + record.size, 0),
        byType: {
          disbursement: {
            count: records.filter(r => r.type === 'disbursement').length,
            size: records.filter(r => r.type === 'disbursement').reduce((sum, r) => sum + r.size, 0)
          },
          user: {
            count: records.filter(r => r.type === 'user').length,
            size: records.filter(r => r.type === 'user').reduce((sum, r) => sum + r.size, 0)
          },
          classification: {
            count: records.filter(r => r.type === 'classification').length,
            size: records.filter(r => r.type === 'classification').reduce((sum, r) => sum + r.size, 0)
          },
          session: {
            count: records.filter(r => r.type === 'session').length,
            size: records.filter(r => r.type === 'session').reduce((sum, r) => sum + r.size, 0)
          }
        },
        retentionStatus: {
          active: 0,
          expiringSoon: 0,
          expired: 0
        }
      };

      // Calculate retention status
      records.forEach(record => {
        const archiveDate = new Date(record.archivedDate);
        const daysSinceArchived = Math.floor((now.getTime() - archiveDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilExpiry = record.retentionPeriod - daysSinceArchived;
        
        if (daysUntilExpiry > 30) {
          summary.retentionStatus.active++;
        } else if (daysUntilExpiry > 0) {
          summary.retentionStatus.expiringSoon++;
        } else {
          summary.retentionStatus.expired++;
        }
      });

      this.summary.set(summary);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }

  toggleRecordSelection(recordId: string) {
    const selected = this.selectedRecords();
    const newSelected = new Set(selected);
    
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    
    this.selectedRecords.set(newSelected);
  }

  selectAllVisible() {
    const visibleIds = this.filteredRecords().map(r => r.id);
    this.selectedRecords.set(new Set(visibleIds));
  }

  clearSelection() {
    this.selectedRecords.set(new Set());
  }

  async restoreRecords() {
    const selectedIds = Array.from(this.selectedRecords());
    const restorableRecords = this.archivedRecords().filter(r => 
      selectedIds.includes(r.id) && r.canRestore
    );

    if (restorableRecords.length === 0) {
      alert('No restorable records selected.');
      return;
    }

    if (!confirm(`Are you sure you want to restore ${restorableRecords.length} record(s)?`)) {
      return;
    }

    this.isProcessing.set(true);
    
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove restored records from archived list
      const remainingRecords = this.archivedRecords().filter(r => 
        !selectedIds.includes(r.id) || !r.canRestore
      );
      
      this.archivedRecords.set(remainingRecords);
      this.clearSelection();
      this.loadSummary();
      
      alert(`Successfully restored ${restorableRecords.length} record(s).`);
    } catch (err) {
      alert('Failed to restore records. Please try again.');
      console.error('Error restoring records:', err);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async permanentlyDelete() {
    const selectedIds = Array.from(this.selectedRecords());
    
    if (selectedIds.length === 0) {
      alert('No records selected.');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} record(s)? This action cannot be undone.`)) {
      return;
    }

    this.isProcessing.set(true);
    
    try {
      // Simulate deletion process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove deleted records
      const remainingRecords = this.archivedRecords().filter(r => 
        !selectedIds.includes(r.id)
      );
      
      this.archivedRecords.set(remainingRecords);
      this.clearSelection();
      this.loadSummary();
      
      alert(`Successfully deleted ${selectedIds.length} record(s).`);
    } catch (err) {
      alert('Failed to delete records. Please try again.');
      console.error('Error deleting records:', err);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async exportArchive(format: 'csv' | 'json') {
    const records = this.filteredRecords();
    
    if (records.length === 0) {
      alert('No records to export.');
      return;
    }

    this.isProcessing.set(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filename = `archived-data-${new Date().toISOString().split('T')[0]}.${format}`;
      alert(`Exporting ${records.length} records to ${filename}`);
    } catch (err) {
      alert('Failed to export archive. Please try again.');
      console.error('Error exporting archive:', err);
    } finally {
      this.isProcessing.set(false);
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'disbursement': return '💰';
      case 'user': return '👤';
      case 'classification': return '🏷️';
      case 'session': return '🔐';
      default: return '📄';
    }
  }

  getRetentionStatus(record: ArchivedRecord): { status: string; daysRemaining: number; class: string } {
    const now = new Date();
    const archiveDate = new Date(record.archivedDate);
    const daysSinceArchived = Math.floor((now.getTime() - archiveDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = record.retentionPeriod - daysSinceArchived;
    
    if (daysRemaining > 30) {
      return { status: 'Active', daysRemaining, class: 'status-active' };
    } else if (daysRemaining > 0) {
      return { status: 'Expiring Soon', daysRemaining, class: 'status-warning' };
    } else {
      return { status: 'Expired', daysRemaining, class: 'status-expired' };
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}