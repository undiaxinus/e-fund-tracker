import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface Disbursement {
  id: string;
  disbursementNo: string;
  payee: string;
  amount: number;
  disbursementDate: string;
  description: string;
  fundSource: string;
  classification: 'PS' | 'MOOE' | 'CO' | 'TR';
  subClassification?: string;
  department: string;
  checkNo?: string;
  voucherNo?: string;
  remarks?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'ARCHIVED';
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface FilterOptions {
  classification?: string;
  department?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

@Component({
  selector: 'app-disbursement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './disbursement-list.component.html',
  styleUrls: ['./disbursement-list.component.css']
})
export class DisbursementListComponent implements OnInit {
  disbursements: Disbursement[] = [];
  filteredDisbursements: Disbursement[] = [];
  isLoading = true;
  error = '';
  
  // Make Math available in template
  Math = Math;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  filterForm: FormGroup;
  showFilters = false;
  
  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Selection
  selectedItems: string[] = [];
  selectAll = false;
  
  // Constants
  classifications = [
    { value: 'PS', label: 'Personnel Services', icon: '👥' },
    { value: 'MOOE', label: 'Maintenance and Other Operating Expenses', icon: '🔧' },
    { value: 'CO', label: 'Capital Outlay', icon: '🏗️' },
    { value: 'TR', label: 'Trust Receipts', icon: '📋' }
  ];
  
  statuses = [
    { value: 'ACTIVE', label: 'Active', class: 'status-active' },
    { value: 'CANCELLED', label: 'Cancelled', class: 'status-cancelled' },
    { value: 'ARCHIVED', label: 'Archived', class: 'status-archived' }
  ];
  
  departments = [
    'Finance',
    'Human Resources',
    'Operations',
    'Administration',
    'IT Department',
    'Procurement'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    this.filterForm = this.formBuilder.group({
      classification: [''],
      department: [''],
      status: [''],
      dateFrom: [''],
      dateTo: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadDisbursements();
    this.setupFilterSubscription();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  async loadDisbursements(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = '';
      
      const { data, error } = await this.supabaseService.getDisbursements();
      
      if (error) {
        this.error = 'Failed to load disbursements: ' + ((error as any)?.message || 'Unknown error');
        return;
      }
      
      this.disbursements = data?.map((item: any) => ({
        id: item.id,
        disbursementNo: item.disbursement_no,
        payee: item.payee,
        amount: parseFloat(item.amount),
        disbursementDate: item.disbursement_date,
        description: item.description,
        fundSource: item.fund_source,
        classification: item.classification,
        subClassification: item.sub_classification,
        department: item.department,
        checkNo: item.check_no,
        voucherNo: item.voucher_no,
        remarks: item.remarks,
        status: item.status,
        isArchived: item.is_archived,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
        updatedBy: item.updated_by
      })) || [];
      
      this.applyFilters();
      
    } catch (error: any) {
      this.error = 'An unexpected error occurred: ' + error.message;
      console.error('Error loading disbursements:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.disbursements];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.disbursementNo.toLowerCase().includes(searchTerm) ||
        item.payee.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.department.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply classification filter
    if (filters.classification) {
      filtered = filtered.filter(item => item.classification === filters.classification);
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(item => item.department === filters.department);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.disbursementDate) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.disbursementDate) <= new Date(filters.dateTo)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = this.getFieldValue(a, this.sortField);
      const bValue = this.getFieldValue(b, this.sortField);
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.filteredDisbursements = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
  }

  private getFieldValue(item: any, field: string): any {
    switch (field) {
      case 'amount':
        return item.amount;
      case 'disbursementDate':
        return new Date(item.disbursementDate);
      case 'createdAt':
        return new Date(item.createdAt);
      default:
        return item[field] || '';
    }
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '⬆️' : '⬇️';
  }

  getPaginatedItems(): Disbursement[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDisbursements.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedItems = this.getPaginatedItems().map(item => item.id);
    } else {
      this.selectedItems = [];
    }
  }

  toggleSelectItem(id: string): void {
    const index = this.selectedItems.indexOf(id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(id);
    }
    this.selectAll = this.selectedItems.length === this.getPaginatedItems().length;
  }

  isSelected(id: string): boolean {
    return this.selectedItems.includes(id);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.showFilters = false;
  }

  exportSelected(): void {
    if (this.selectedItems.length === 0) {
      alert('Please select items to export');
      return;
    }
    // TODO: Implement export functionality
    console.log('Exporting items:', this.selectedItems);
  }

  async deleteSelected(): Promise<void> {
    if (this.selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${this.selectedItems.length} item(s)?`)) {
      return;
    }
    
    try {
      // TODO: Implement bulk delete
      console.log('Deleting items:', this.selectedItems);
      await this.loadDisbursements();
      this.selectedItems = [];
      this.selectAll = false;
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Failed to delete items');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getClassificationInfo(classification: string) {
    return this.classifications.find(c => c.value === classification) || 
           { value: classification, label: classification, icon: '📄' };
  }

  getStatusInfo(status: string) {
    return this.statuses.find(s => s.value === status) || 
           { value: status, label: status, class: 'status-default' };
  }

  canEdit(): boolean {
    return this.authService.canEdit();
  }

  canDelete(): boolean {
    return this.authService.canEdit();
  }

  async refreshData(): Promise<void> {
    await this.loadDisbursements();
  }
}