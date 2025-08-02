import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DisbursementService } from '../../../../core/services/disbursement.service';
import { AuthService } from '../../../../core/services/auth.service';

interface Disbursement {
  id: string;
  payee: string;
  amount: number;
  date: Date;
  fundSource: string;
  classification: 'PS' | 'MOOE' | 'CO' | 'TR';
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: Date;
}

@Component({
  selector: 'app-disbursement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './disbursement-list.component.html',
  styleUrls: ['./disbursement-list.component.css']
})
export class DisbursementListComponent implements OnInit {
  disbursements: Disbursement[] = [];
  filteredDisbursements: Disbursement[] = [];
  canEdit = false;
  
  // Filter properties
  searchTerm = '';
  selectedClassification = '';
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';
  
  // Sorting properties
  sortField = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private disbursementService: DisbursementService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserPermissions();
    this.loadDisbursements();
  }

  private loadUserPermissions() {
    this.authService.currentUser$.subscribe(user => {
      this.canEdit = (user?.role === 'USER' && user?.permission === 'ENCODER') || user?.role === 'ADMIN';
    });
  }

  private loadDisbursements() {
    // Mock data for now - replace with actual service call
    this.disbursements = [
      {
        id: '1',
        payee: 'ABC Office Supplies',
        amount: 15000,
        date: new Date('2024-01-15'),
        fundSource: 'General Fund',
        classification: 'MOOE',
        description: 'Office supplies and materials',
        status: 'APPROVED',
        createdBy: 'encoder@gov.ph',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        payee: 'XYZ Construction',
        amount: 250000,
        date: new Date('2024-01-20'),
        fundSource: 'Infrastructure Fund',
        classification: 'CO',
        description: 'Building renovation project',
        status: 'PENDING',
        createdBy: 'encoder@gov.ph',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '3',
        payee: 'John Doe',
        amount: 45000,
        date: new Date('2024-01-25'),
        fundSource: 'Payroll Fund',
        classification: 'PS',
        description: 'Monthly salary payment',
        status: 'APPROVED',
        createdBy: 'encoder@gov.ph',
        createdAt: new Date('2024-01-25')
      }
    ];
    
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.disbursements];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.payee.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term)
      );
    }

    // Classification filter
    if (this.selectedClassification) {
      filtered = filtered.filter(d => d.classification === this.selectedClassification);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(d => d.status === this.selectedStatus);
    }

    // Date range filter
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(d => d.date >= fromDate);
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(d => d.date <= toDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof Disbursement];
      let bValue: any = b[this.sortField as keyof Disbursement];

      if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredDisbursements = filtered;
    this.updatePagination();
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
    if (this.sortField !== field) return '';
    return this.sortDirection;
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.filteredDisbursements.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteDisbursement(id: string) {
    if (confirm('Are you sure you want to delete this disbursement?')) {
      // Replace with actual service call
      this.disbursements = this.disbursements.filter(d => d.id !== id);
      this.applyFilters();
    }
  }
}