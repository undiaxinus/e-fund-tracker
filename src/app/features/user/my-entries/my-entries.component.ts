import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MyEntry {
  id: string;
  payee: string;
  amount: number;
  date: Date;
  classification: 'MOOE' | 'PS' | 'CO' | 'RLIP';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  department: string;
  fundSource: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  comments?: string;
}

interface MyEntriesFilters {
  searchTerm: string;
  classification: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  department: string;
  fundSource: string;
}

interface MyEntriesStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  totalAmount: number;
  thisMonth: number;
}

@Component({
  selector: 'app-my-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-entries.component.html',
  styleUrls: ['./my-entries.component.css']
})
export class MyEntriesComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Data properties
  entries: MyEntry[] = [];
  filteredEntries: MyEntry[] = [];
  paginatedEntries: MyEntry[] = [];
  selectedEntry: MyEntry | null = null;
  
  // Filter and search properties
  filters: MyEntriesFilters = {
    searchTerm: '',
    classification: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    department: '',
    fundSource: ''
  };
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Sorting properties
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // UI state properties
  isLoading = false;
  isDeleting = false;
  
  // Statistics
  stats: MyEntriesStats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    totalAmount: 0,
    thisMonth: 0
  };
  
  // Reference data
  classifications = ['MOOE', 'PS', 'CO', 'RLIP'];
  statuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'];
  departments = ['Finance', 'HR', 'IT', 'Operations', 'Marketing'];
  fundSources = ['General Fund', 'Special Fund', 'Trust Fund', 'Revolving Fund'];
  
  // User permissions
  canEdit = false;
  canDelete = false;
  canSubmit = false;

  ngOnInit(): void {
    this.loadUserPermissions();
    this.initializeDateFilters();
    this.loadMyEntries();
  }

  private loadUserPermissions(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.canEdit = true; // Users can edit their own entries
      this.canDelete = true; // Users can delete their own draft entries
      this.canSubmit = true; // Users can submit their entries
    }
  }

  private initializeDateFilters(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filters.dateFrom = firstDayOfMonth.toISOString().split('T')[0];
    this.filters.dateTo = today.toISOString().split('T')[0];
  }

  private loadMyEntries(): void {
    this.isLoading = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.entries = this.generateMockEntries();
      this.applyFilters();
      this.calculateStats();
      this.isLoading = false;
    }, 1000);
  }

  private generateMockEntries(): MyEntry[] {
    const mockEntries: MyEntry[] = [];
    const currentUser = this.authService.getCurrentUser();
    
    for (let i = 1; i <= 25; i++) {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
      
      const status = this.statuses[Math.floor(Math.random() * this.statuses.length)] as MyEntry['status'];
      
      mockEntries.push({
        id: `ME${String(i).padStart(4, '0')}`,
        payee: `Payee ${i}`,
        amount: Math.floor(Math.random() * 50000) + 1000,
        date: createdDate,
        classification: this.classifications[Math.floor(Math.random() * this.classifications.length)] as MyEntry['classification'],
        status: status,
        department: this.departments[Math.floor(Math.random() * this.departments.length)],
        fundSource: this.fundSources[Math.floor(Math.random() * this.fundSources.length)],
        description: `Description for entry ${i} - ${status.toLowerCase()} disbursement`,
        createdAt: createdDate,
        updatedAt: createdDate,
        submittedAt: status !== 'DRAFT' ? createdDate : undefined,
        reviewedAt: ['APPROVED', 'REJECTED'].includes(status) ? createdDate : undefined,
        reviewedBy: ['APPROVED', 'REJECTED'].includes(status) ? 'Admin User' : undefined,
        comments: status === 'REJECTED' ? 'Please provide additional documentation' : undefined
      });
    }
    
    return mockEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  applyFilters(): void {
    let filtered = [...this.entries];
    
    // Search term filter
    if (this.filters.searchTerm) {
      const searchLower = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.id.toLowerCase().includes(searchLower) ||
        entry.payee.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Classification filter
    if (this.filters.classification) {
      filtered = filtered.filter(entry => entry.classification === this.filters.classification);
    }
    
    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter(entry => entry.status === this.filters.status);
    }
    
    // Department filter
    if (this.filters.department) {
      filtered = filtered.filter(entry => entry.department === this.filters.department);
    }
    
    // Fund source filter
    if (this.filters.fundSource) {
      filtered = filtered.filter(entry => entry.fundSource === this.filters.fundSource);
    }
    
    // Date range filter
    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter(entry => entry.date >= fromDate);
    }
    
    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => entry.date <= toDate);
    }
    
    this.filteredEntries = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedEntries();
  }

  private calculateStats(): void {
    this.stats = {
      total: this.entries.length,
      pending: this.entries.filter(e => e.status === 'PENDING').length,
      approved: this.entries.filter(e => e.status === 'APPROVED').length,
      rejected: this.entries.filter(e => e.status === 'REJECTED').length,
      draft: this.entries.filter(e => e.status === 'DRAFT').length,
      totalAmount: this.entries.reduce((sum, e) => sum + e.amount, 0),
      thisMonth: this.entries.filter(e => {
        const entryMonth = e.createdAt.getMonth();
        const currentMonth = new Date().getMonth();
        return entryMonth === currentMonth;
      }).length
    };
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      classification: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      department: '',
      fundSource: ''
    };
    this.initializeDateFilters();
    this.applyFilters();
  }

  sort(field: keyof MyEntry): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredEntries.sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return this.sortDirection === 'asc' ? 1 : -1;
      
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.updatePaginatedEntries();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedEntries();
    }
  }

  private updatePaginatedEntries(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, endIndex);
  }

  viewDetails(entry: MyEntry): void {
    this.selectedEntry = entry;
  }

  editEntry(entry: MyEntry): void {
    if (this.canEdit && (entry.status === 'DRAFT' || entry.status === 'REJECTED')) {
      this.router.navigate(['/user/entries/edit', entry.id]);
    }
  }

  duplicateEntry(entry: MyEntry): void {
    this.router.navigate(['/user/entries/new'], {
      queryParams: { duplicate: entry.id }
    });
  }

  submitEntry(entry: MyEntry): void {
    if (this.canSubmit && entry.status === 'DRAFT') {
      // Simulate API call
      entry.status = 'PENDING';
      entry.submittedAt = new Date();
      entry.updatedAt = new Date();
      this.calculateStats();
    }
  }

  deleteEntry(entry: MyEntry): void {
    if (this.canDelete && entry.status === 'DRAFT') {
      if (confirm(`Are you sure you want to delete entry ${entry.id}?`)) {
        this.isDeleting = true;
        
        // Simulate API call
        setTimeout(() => {
          this.entries = this.entries.filter(e => e.id !== entry.id);
          this.applyFilters();
          this.calculateStats();
          this.isDeleting = false;
        }, 500);
      }
    }
  }

  createNewEntry(): void {
    this.router.navigate(['/user/entries/new']);
  }

  exportEntries(): void {
    // Simulate export functionality
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-entries-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['ID', 'Payee', 'Amount', 'Date', 'Classification', 'Status', 'Department', 'Fund Source', 'Description'];
    const rows = this.filteredEntries.map(entry => [
      entry.id,
      entry.payee,
      entry.amount.toString(),
      this.formatDate(entry.date),
      entry.classification,
      entry.status,
      entry.department,
      entry.fundSource,
      `"${entry.description.replace(/"/g, '""')}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'DRAFT': '#64748b',
      'PENDING': '#f59e0b',
      'APPROVED': '#10b981',
      'REJECTED': '#ef4444'
    };
    return colors[status] || '#64748b';
  }

  canEditEntry(entry: MyEntry): boolean {
    return this.canEdit && (entry.status === 'DRAFT' || entry.status === 'REJECTED');
  }

  canSubmitEntry(entry: MyEntry): boolean {
    return this.canSubmit && entry.status === 'DRAFT';
  }

  canDeleteEntry(entry: MyEntry): boolean {
    return this.canDelete && entry.status === 'DRAFT';
  }
}