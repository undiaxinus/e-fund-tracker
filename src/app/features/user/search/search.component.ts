import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

interface SearchFilters {
  searchTerm: string;
  classification: string;
  department: string;
  fundSource: string;
  dateFrom: string;
  dateTo: string;
  amountMin: number | null;
  amountMax: number | null;
  status: string;
}

interface DisbursementEntry {
  id: string;
  payee: string;
  amount: number;
  date: string;
  classification: string;
  department: string;
  fundSource: string;
  description: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  canEdit = false;
  
  // Search filters
  filters: SearchFilters = {
    searchTerm: '',
    classification: '',
    department: '',
    fundSource: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
    status: ''
  };
  
  // Search results
  searchResults: DisbursementEntry[] = [];
  filteredResults: DisbursementEntry[] = [];
  isLoading = false;
  hasSearched = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Sort
  sortField = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
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
  statuses = ['Active', 'Pending', 'Approved', 'Rejected', 'Archived'];

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserPermissions();
    this.initializeDateFilters();
  }

  private loadUserPermissions() {
    this.authService.currentUser$.subscribe(user => {
      this.canEdit = user?.permission === 'ENCODER' || false;
    });
  }

  private initializeDateFilters() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    this.filters.dateFrom = firstDay.toISOString().split('T')[0];
    this.filters.dateTo = now.toISOString().split('T')[0];
  }

  performSearch() {
    this.isLoading = true;
    this.hasSearched = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.searchResults = this.getMockSearchResults();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  private getMockSearchResults(): DisbursementEntry[] {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        payee: 'ABC Construction Corp.',
        amount: 150000,
        date: '2024-01-15',
        classification: 'CO',
        department: 'Infrastructure',
        fundSource: 'Infrastructure Fund',
        description: 'Road construction materials',
        status: 'Approved',
        createdBy: 'encoder@gov.ph',
        createdAt: '2024-01-15T08:30:00Z'
      },
      {
        id: '2',
        payee: 'Office Supplies Inc.',
        amount: 25000,
        date: '2024-01-14',
        classification: 'MOOE',
        department: 'Finance Department',
        fundSource: 'General Fund',
        description: 'Office supplies and materials',
        status: 'Active',
        createdBy: 'encoder@gov.ph',
        createdAt: '2024-01-14T10:15:00Z'
      },
      {
        id: '3',
        payee: 'John Doe',
        amount: 45000,
        date: '2024-01-13',
        classification: 'PS',
        department: 'Human Resources',
        fundSource: 'Payroll Fund',
        description: 'Monthly salary payment',
        status: 'Approved',
        createdBy: 'encoder@gov.ph',
        createdAt: '2024-01-13T09:00:00Z'
      }
    ];
  }

  applyFilters() {
    let results = [...this.searchResults];
    
    // Apply search term filter
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      results = results.filter(item => 
        item.payee.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term)
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
    
    // Apply date range filter
    if (this.filters.dateFrom) {
      results = results.filter(item => item.date >= this.filters.dateFrom);
    }
    if (this.filters.dateTo) {
      results = results.filter(item => item.date <= this.filters.dateTo);
    }
    
    // Apply amount range filter
    if (this.filters.amountMin !== null) {
      results = results.filter(item => item.amount >= this.filters.amountMin!);
    }
    if (this.filters.amountMax !== null) {
      results = results.filter(item => item.amount <= this.filters.amountMax!);
    }
    
    // Apply status filter
    if (this.filters.status) {
      results = results.filter(item => item.status === this.filters.status);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof DisbursementEntry];
      let bValue: any = b[this.sortField as keyof DisbursementEntry];
      
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
    
    this.filteredResults = results;
    this.totalItems = results.length;
    this.currentPage = 1;
  }

  clearFilters() {
    this.filters = {
      searchTerm: '',
      classification: '',
      department: '',
      fundSource: '',
      dateFrom: '',
      dateTo: '',
      amountMin: null,
      amountMax: null,
      status: ''
    };
    this.initializeDateFilters();
    if (this.hasSearched) {
      this.applyFilters();
    }
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

  get paginatedResults(): DisbursementEntry[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredResults.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportResults() {
    // TODO: Implement export functionality
    console.log('Exporting search results...', this.filteredResults);
  }

  viewDetails(entry: DisbursementEntry) {
    // TODO: Navigate to details view
    console.log('Viewing details for:', entry);
  }

  editEntry(entry: DisbursementEntry) {
    // TODO: Navigate to edit form
    console.log('Editing entry:', entry);
  }
}