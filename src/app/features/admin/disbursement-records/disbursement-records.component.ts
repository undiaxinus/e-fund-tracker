import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-disbursement-records',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './disbursement-records.component.html',
  styleUrls: ['./disbursement-records.component.css']
})
export class DisbursementRecordsComponent implements OnInit {
  // Signals for reactive state management
  disbursements = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showArchived = signal(false);
  sortField = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Form controls for filtering
  searchControl = new FormControl('');
  classificationFilter = new FormControl('');
  departmentFilter = new FormControl('');
  statusFilter = new FormControl('');
  dateFromFilter = new FormControl('');
  dateToFilter = new FormControl('');

  // Computed signals for filtered and sorted data
  filteredDisbursements = computed(() => {
    let filtered = this.disbursements();
    
    // Filter by archived status
    if (!this.showArchived()) {
      filtered = filtered.filter(d => !d.is_archived);
    }
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.payee.toLowerCase().includes(searchTerm) ||
        d.disbursement_no.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply classification filter
    const classificationFilter = this.classificationFilter.value;
    if (classificationFilter) {
      filtered = filtered.filter(d => d.classification === classificationFilter);
    }
    
    // Apply department filter
    const departmentFilter = this.departmentFilter.value;
    if (departmentFilter) {
      filtered = filtered.filter(d => d.department === departmentFilter);
    }
    
    // Apply status filter
    const statusFilter = this.statusFilter.value;
    if (statusFilter) {
      const isArchived = statusFilter === 'ARCHIVED';
      filtered = filtered.filter(d => d.is_archived === isArchived);
    }
    
    // Apply date filters
    const dateFrom = this.dateFromFilter.value;
    const dateTo = this.dateToFilter.value;
    if (dateFrom) {
      filtered = filtered.filter(d => new Date(d.disbursement_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(d => new Date(d.disbursement_date) <= new Date(dateTo));
    }
    
    // Apply sorting
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();
    
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'disbursement_no':
            aValue = a.disbursement_no;
            bValue = b.disbursement_no;
            break;
          case 'disbursement_date':
            aValue = new Date(a.disbursement_date).getTime();
            bValue = new Date(b.disbursement_date).getTime();
            break;
          case 'amount':
            aValue = parseFloat(a.amount);
            bValue = parseFloat(b.amount);
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  });

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadDisbursements();
  }

  async loadDisbursements() {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      // For now, use mock data from SupabaseService
      // In a real implementation, this would call a getDisbursements method
      const mockData = this.supabaseService['mockDisbursements'] || [];
      this.disbursements.set(mockData);
    } catch (err: any) {
      this.error.set('An unexpected error occurred while loading disbursement records');
      console.error('Unexpected error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  sortBy(field: string) {
    if (this.sortField() === field) {
      // Toggle direction if same field
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  toggleArchived() {
    this.showArchived.set(!this.showArchived());
  }

  getSummaryByClassification(classification: string) {
    const records = this.disbursements().filter(d => d.classification === classification && !d.is_archived);
    const amount = records.reduce((sum, record) => sum + parseFloat(record.amount), 0);
    return {
      amount,
      count: records.length
    };
  }

  async toggleArchiveStatus(record: any) {
    try {
      // Update local state immediately for better UX
      const currentRecords = this.disbursements();
      const updatedRecords = currentRecords.map(r => 
        r.id === record.id ? { ...r, is_archived: !r.is_archived } : r
      );
      this.disbursements.set(updatedRecords);
      
      // In a real implementation, this would call the API
      console.log(`Record ${record.disbursement_no} ${record.is_archived ? 'restored' : 'archived'}`);
    } catch (err: any) {
      console.error('Error updating record status:', err);
      // Revert the change if API call fails
      this.loadDisbursements();
    }
  }

  exportRecords() {
    // In a real implementation, this would generate and download a report
    console.log('Exporting disbursement records...');
    alert('Export functionality will be implemented in a future update.');
  }
}