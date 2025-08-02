import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

interface ArchivedEntry {
  id: string;
  payee: string;
  amount: number;
  date: string;
  classification: string;
  department: string;
  fundSource: string;
  description: string;
  status: string;
  archivedDate: string;
  archivedBy: string;
  archivedReason: string;
  originalCreatedBy: string;
  originalCreatedAt: string;
}

interface ArchiveFilters {
  searchTerm: string;
  classification: string;
  department: string;
  fundSource: string;
  dateFrom: string;
  dateTo: string;
  archivedDateFrom: string;
  archivedDateTo: string;
  archivedBy: string;
}

@Component({
  selector: 'app-archived',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.css']
})
export class ArchivedComponent implements OnInit {
  canEdit = false;
  canRestore = false;
  
  // Archived entries
  archivedEntries: ArchivedEntry[] = [];
  filteredEntries: ArchivedEntry[] = [];
  selectedEntry: ArchivedEntry | null = null;
  
  // Filters
  filters: ArchiveFilters = {
    searchTerm: '',
    classification: '',
    department: '',
    fundSource: '',
    dateFrom: '',
    dateTo: '',
    archivedDateFrom: '',
    archivedDateTo: '',
    archivedBy: ''
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Sort
  sortField = 'archivedDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Loading states
  isLoading = false;
  isRestoring = false;
  
  // Filter options
  classifications = ['PS', 'MOOE', 'CO', 'TR'];
  departments = [
    'Finance Department',
    'Human Resources',
    'Information Technology',
    'Operations',
    'Procurement',
    'Legal Affairs',
    'Planning & Development'
  ];
  fundSources = [
    'General Fund',
    'Special Education Fund',
    'Infrastructure Fund',
    'Payroll Fund',
    'Trust Fund',
    'Development Fund'
  ];
  
  // Archive statistics
  archiveStats = {
    totalArchived: 0,
    thisMonth: 0,
    thisYear: 0,
    byClassification: {} as { [key: string]: number },
    byDepartment: {} as { [key: string]: number }
  };

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserPermissions();
    this.initializeDateFilters();
    this.loadArchivedEntries();
  }

  private loadUserPermissions() {
    this.authService.currentUser$.subscribe(user => {
      this.canEdit = user?.permission === 'ENCODER' || false;
      this.canRestore = user?.role === 'ADMIN' || user?.permission === 'ENCODER' || false;
    });
  }

  private initializeDateFilters() {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    
    this.filters.dateFrom = firstDayOfYear.toISOString().split('T')[0];
    this.filters.dateTo = now.toISOString().split('T')[0];
    this.filters.archivedDateFrom = firstDayOfYear.toISOString().split('T')[0];
    this.filters.archivedDateTo = now.toISOString().split('T')[0];
  }

  private loadArchivedEntries() {
    this.isLoading = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.archivedEntries = this.getMockArchivedEntries();
      this.applyFilters();
      this.calculateStatistics();
      this.isLoading = false;
    }, 1000);
  }

  private getMockArchivedEntries(): ArchivedEntry[] {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        payee: 'Old Supplier Corp.',
        amount: 75000,
        date: '2023-12-15',
        classification: 'MOOE',
        department: 'Finance Department',
        fundSource: 'General Fund',
        description: 'Office supplies for Q4 2023',
        status: 'Completed',
        archivedDate: '2024-01-15',
        archivedBy: 'admin@gov.ph',
        archivedReason: 'End of fiscal year archival',
        originalCreatedBy: 'encoder@gov.ph',
        originalCreatedAt: '2023-12-15T10:30:00Z'
      },
      {
        id: '2',
        payee: 'Former Employee',
        amount: 35000,
        date: '2023-11-30',
        classification: 'PS',
        department: 'Human Resources',
        fundSource: 'Payroll Fund',
        description: 'Final salary payment',
        status: 'Completed',
        archivedDate: '2024-01-10',
        archivedBy: 'admin@gov.ph',
        archivedReason: 'Employee separation',
        originalCreatedBy: 'hr@gov.ph',
        originalCreatedAt: '2023-11-30T14:20:00Z'
      },
      {
        id: '3',
        payee: 'Legacy Systems Inc.',
        amount: 200000,
        date: '2023-10-20',
        classification: 'CO',
        department: 'Information Technology',
        fundSource: 'Infrastructure Fund',
        description: 'Server equipment (replaced)',
        status: 'Completed',
        archivedDate: '2024-01-05',
        archivedBy: 'admin@gov.ph',
        archivedReason: 'Equipment replacement',
        originalCreatedBy: 'it@gov.ph',
        originalCreatedAt: '2023-10-20T09:15:00Z'
      },
      {
        id: '4',
        payee: 'Cancelled Project Contractor',
        amount: 500000,
        date: '2023-09-15',
        classification: 'CO',
        department: 'Operations',
        fundSource: 'Development Fund',
        description: 'Construction project (cancelled)',
        status: 'Cancelled',
        archivedDate: '2023-12-20',
        archivedBy: 'admin@gov.ph',
        archivedReason: 'Project cancellation',
        originalCreatedBy: 'ops@gov.ph',
        originalCreatedAt: '2023-09-15T11:45:00Z'
      },
      {
        id: '5',
        payee: 'Training Provider Ltd.',
        amount: 120000,
        date: '2023-08-10',
        classification: 'TR',
        department: 'Human Resources',
        fundSource: 'General Fund',
        description: 'Employee training program',
        status: 'Completed',
        archivedDate: '2023-12-15',
        archivedBy: 'admin@gov.ph',
        archivedReason: 'Training program completed',
        originalCreatedBy: 'hr@gov.ph',
        originalCreatedAt: '2023-08-10T13:30:00Z'
      }
    ];
  }

  applyFilters() {
    let results = [...this.archivedEntries];
    
    // Apply search term filter
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      results = results.filter(item => 
        item.payee.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.archivedReason.toLowerCase().includes(term)
      );
    }
    
    // Apply classification filter
    if (this.filters.classification) {
      results = results.filter(item => item.classification === this.filters.classification);
    }
    
    // Apply department filter
    if (this.filters.department) {
      results = results.filter(item => item.department === this.filters.department);
    }
    
    // Apply fund source filter
    if (this.filters.fundSource) {
      results = results.filter(item => item.fundSource === this.filters.fundSource);
    }
    
    // Apply original date range filter
    if (this.filters.dateFrom) {
      results = results.filter(item => item.date >= this.filters.dateFrom);
    }
    if (this.filters.dateTo) {
      results = results.filter(item => item.date <= this.filters.dateTo);
    }
    
    // Apply archived date range filter
    if (this.filters.archivedDateFrom) {
      results = results.filter(item => item.archivedDate >= this.filters.archivedDateFrom);
    }
    if (this.filters.archivedDateTo) {
      results = results.filter(item => item.archivedDate <= this.filters.archivedDateTo);
    }
    
    // Apply archived by filter
    if (this.filters.archivedBy) {
      results = results.filter(item => item.archivedBy.toLowerCase().includes(this.filters.archivedBy.toLowerCase()));
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof ArchivedEntry];
      let bValue: any = b[this.sortField as keyof ArchivedEntry];
      
      if (this.sortField === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    this.filteredEntries = results;
    this.totalItems = results.length;
    this.currentPage = 1;
  }

  private calculateStatistics() {
    this.archiveStats.totalArchived = this.archivedEntries.length;
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    this.archiveStats.thisMonth = this.archivedEntries.filter(entry => {
      const archivedDate = new Date(entry.archivedDate);
      return archivedDate.getMonth() === thisMonth && archivedDate.getFullYear() === thisYear;
    }).length;
    
    this.archiveStats.thisYear = this.archivedEntries.filter(entry => {
      const archivedDate = new Date(entry.archivedDate);
      return archivedDate.getFullYear() === thisYear;
    }).length;
    
    // Count by classification
    this.archiveStats.byClassification = {};
    this.archivedEntries.forEach(entry => {
      this.archiveStats.byClassification[entry.classification] = 
        (this.archiveStats.byClassification[entry.classification] || 0) + 1;
    });
    
    // Count by department
    this.archiveStats.byDepartment = {};
    this.archivedEntries.forEach(entry => {
      this.archiveStats.byDepartment[entry.department] = 
        (this.archiveStats.byDepartment[entry.department] || 0) + 1;
    });
  }

  clearFilters() {
    this.filters = {
      searchTerm: '',
      classification: '',
      department: '',
      fundSource: '',
      dateFrom: '',
      dateTo: '',
      archivedDateFrom: '',
      archivedDateTo: '',
      archivedBy: ''
    };
    this.initializeDateFilters();
    this.applyFilters();
  }

  sort(field: string) {
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
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  get paginatedEntries(): ArchivedEntry[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEntries.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewDetails(entry: ArchivedEntry) {
    this.selectedEntry = entry;
  }

  restoreEntry(entry: ArchivedEntry) {
    if (!this.canRestore) return;
    
    if (confirm(`Are you sure you want to restore the entry for "${entry.payee}"?`)) {
      this.isRestoring = true;
      
      // Simulate restore process
      setTimeout(() => {
        // Remove from archived entries
        this.archivedEntries = this.archivedEntries.filter(e => e.id !== entry.id);
        this.applyFilters();
        this.calculateStatistics();
        this.isRestoring = false;
        
        // TODO: Call actual restore API
        console.log('Restored entry:', entry.id);
      }, 1000);
    }
  }

  permanentlyDelete(entry: ArchivedEntry) {
    if (!this.canRestore) return;
    
    if (confirm(`Are you sure you want to permanently delete the entry for "${entry.payee}"? This action cannot be undone.`)) {
      // Simulate delete process
      this.archivedEntries = this.archivedEntries.filter(e => e.id !== entry.id);
      this.applyFilters();
      this.calculateStatistics();
      
      // TODO: Call actual delete API
      console.log('Permanently deleted entry:', entry.id);
    }
  }

  exportArchive() {
    // TODO: Implement export functionality
    console.log('Exporting archive data...', this.filteredEntries);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#6c757d';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}