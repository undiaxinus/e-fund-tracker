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
  template: `
    <div class="disbursement-list-container">
      <div class="header">
        <h1>Disbursement Entries</h1>
        <button 
          *ngIf="canEdit" 
          class="btn btn-primary" 
          routerLink="/user/entries/new"
        >
          <span class="icon">➕</span>
          New Entry
        </button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label for="search">Search:</label>
          <input 
            id="search" 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="applyFilters()"
            placeholder="Search by payee or description..."
          >
        </div>

        <div class="filter-group">
          <label for="classification">Classification:</label>
          <select 
            id="classification" 
            [(ngModel)]="selectedClassification" 
            (change)="applyFilters()"
          >
            <option value="">All Classifications</option>
            <option value="PS">PS - Personal Services</option>
            <option value="MOOE">MOOE - Maintenance & Operating Expenses</option>
            <option value="CO">CO - Capital Outlay</option>
            <option value="TR">TR - Trust Receipts</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="status">Status:</label>
          <select 
            id="status" 
            [(ngModel)]="selectedStatus" 
            (change)="applyFilters()"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="dateFrom">Date From:</label>
          <input 
            id="dateFrom" 
            type="date" 
            [(ngModel)]="dateFrom" 
            (change)="applyFilters()"
          >
        </div>

        <div class="filter-group">
          <label for="dateTo">Date To:</label>
          <input 
            id="dateTo" 
            type="date" 
            [(ngModel)]="dateTo" 
            (change)="applyFilters()"
          >
        </div>
      </div>

      <div class="table-container">
        <table class="disbursement-table">
          <thead>
            <tr>
              <th (click)="sort('date')" class="sortable">
                Date 
                <span class="sort-icon" [ngClass]="getSortIcon('date')">↕️</span>
              </th>
              <th (click)="sort('payee')" class="sortable">
                Payee 
                <span class="sort-icon" [ngClass]="getSortIcon('payee')">↕️</span>
              </th>
              <th (click)="sort('amount')" class="sortable">
                Amount 
                <span class="sort-icon" [ngClass]="getSortIcon('amount')">↕️</span>
              </th>
              <th>Classification</th>
              <th>Fund Source</th>
              <th>Status</th>
              <th *ngIf="canEdit">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let disbursement of filteredDisbursements" class="table-row">
              <td>{{ disbursement.date | date:'shortDate' }}</td>
              <td>
                <div class="payee-cell">
                  <strong>{{ disbursement.payee }}</strong>
                  <small>{{ disbursement.description }}</small>
                </div>
              </td>
              <td class="amount-cell">₱{{ disbursement.amount | number:'1.2-2' }}</td>
              <td>
                <span class="classification-badge" [ngClass]="disbursement.classification">
                  {{ disbursement.classification }}
                </span>
              </td>
              <td>{{ disbursement.fundSource }}</td>
              <td>
                <span class="status-badge" [ngClass]="disbursement.status.toLowerCase()">
                  {{ disbursement.status }}
                </span>
              </td>
              <td *ngIf="canEdit" class="actions-cell">
                <button 
                  class="btn btn-sm btn-secondary" 
                  [routerLink]="['/user/entries/edit', disbursement.id]"
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  (click)="deleteDisbursement(disbursement.id)"
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredDisbursements.length === 0" class="no-data">
          <div class="no-data-icon">📋</div>
          <h3>No disbursements found</h3>
          <p>Try adjusting your filters or create a new entry.</p>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          class="btn btn-sm" 
          [disabled]="currentPage === 1" 
          (click)="goToPage(currentPage - 1)"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          class="btn btn-sm" 
          [disabled]="currentPage === totalPages" 
          (click)="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .disbursement-list-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .filter-group input,
    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .disbursement-table {
      width: 100%;
      border-collapse: collapse;
    }

    .disbursement-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #e9ecef;
    }

    .disbursement-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .disbursement-table th.sortable:hover {
      background: #e9ecef;
    }

    .sort-icon {
      margin-left: 0.5rem;
      opacity: 0.5;
    }

    .sort-icon.asc::before {
      content: '↑';
    }

    .sort-icon.desc::before {
      content: '↓';
    }

    .disbursement-table td {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .payee-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .payee-cell small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .amount-cell {
      font-weight: 600;
      color: #27ae60;
    }

    .classification-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .classification-badge.PS {
      background: #e3f2fd;
      color: #1976d2;
    }

    .classification-badge.MOOE {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .classification-badge.CO {
      background: #e8f5e8;
      color: #388e3c;
    }

    .classification-badge.TR {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.approved {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-data-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-info {
      color: #6c757d;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .disbursement-list-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .table-container {
        overflow-x: auto;
      }

      .disbursement-table {
        min-width: 800px;
      }
    }
  `]
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
      this.canEdit = user?.role === 'ENCODER' || user?.role === 'ADMIN';
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