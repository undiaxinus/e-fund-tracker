import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Disbursement {
  id: string;
  payee: string;
  amount: number;
  date: Date;
  fundSource: string;
  classification: 'PS' | 'MOOE' | 'CO' | 'TR';
  description: string;
  department: string;
  referenceNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface DisbursementFilter {
  classification?: string;
  department?: string;
  fundSource?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  createdBy?: string;
}

export interface DisbursementStats {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  monthlyCount: number;
  monthlyAmount: number;
  classificationBreakdown: {
    PS: { count: number; amount: number };
    MOOE: { count: number; amount: number };
    CO: { count: number; amount: number };
    TR: { count: number; amount: number };
  };
}

export interface CreateDisbursementRequest {
  payee: string;
  amount: number;
  date: string;
  fundSource: string;
  classification: 'PS' | 'MOOE' | 'CO' | 'TR';
  description: string;
  department: string;
  referenceNumber?: string;
}

export interface UpdateDisbursementRequest extends CreateDisbursementRequest {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class DisbursementService {
  private disbursementsSubject = new BehaviorSubject<Disbursement[]>([]);
  public disbursements$ = this.disbursementsSubject.asObservable();

  private statsSubject = new BehaviorSubject<DisbursementStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      await this.refreshDisbursements();
      await this.refreshStats();
    } catch (error) {
      console.error('Error loading initial disbursement data:', error);
    }
  }

  // Get all disbursements with optional filtering
  async getDisbursements(filter?: DisbursementFilter): Promise<Disbursement[]> {
    try {
      // For now, return mock data - replace with actual Supabase call
      const mockDisbursements: Disbursement[] = [
        {
          id: '1',
          payee: 'ABC Office Supplies',
          amount: 15000,
          date: new Date('2024-01-15'),
          fundSource: 'General Fund',
          classification: 'MOOE',
          description: 'Office supplies and materials for Q1 operations',
          department: 'Finance',
          referenceNumber: 'REF-2024-001',
          status: 'APPROVED',
          createdBy: 'encoder@gov.ph',
          createdAt: new Date('2024-01-15'),
          approvedBy: 'admin@gov.ph',
          approvedAt: new Date('2024-01-16')
        },
        {
          id: '2',
          payee: 'XYZ Construction',
          amount: 250000,
          date: new Date('2024-01-20'),
          fundSource: 'Infrastructure Fund',
          classification: 'CO',
          description: 'Building renovation project - Phase 1',
          department: 'Operations',
          referenceNumber: 'REF-2024-002',
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
          description: 'Monthly salary payment - January 2024',
          department: 'HR',
          referenceNumber: 'REF-2024-003',
          status: 'APPROVED',
          createdBy: 'encoder@gov.ph',
          createdAt: new Date('2024-01-25'),
          approvedBy: 'admin@gov.ph',
          approvedAt: new Date('2024-01-26')
        },
        {
          id: '4',
          payee: 'Tech Solutions Inc',
          amount: 85000,
          date: new Date('2024-01-28'),
          fundSource: 'Development Fund',
          classification: 'MOOE',
          description: 'Software licensing and maintenance',
          department: 'IT',
          referenceNumber: 'REF-2024-004',
          status: 'REJECTED',
          createdBy: 'encoder@gov.ph',
          createdAt: new Date('2024-01-28'),
          rejectedBy: 'admin@gov.ph',
          rejectedAt: new Date('2024-01-29'),
          rejectionReason: 'Insufficient budget allocation'
        },
        {
          id: '5',
          payee: 'Municipal Trust Fund',
          amount: 120000,
          date: new Date('2024-02-01'),
          fundSource: 'Trust Fund',
          classification: 'TR',
          description: 'Trust fund disbursement for community project',
          department: 'Planning',
          referenceNumber: 'REF-2024-005',
          status: 'PENDING',
          createdBy: 'encoder@gov.ph',
          createdAt: new Date('2024-02-01')
        }
      ];

      let filteredDisbursements = [...mockDisbursements];

      if (filter) {
        if (filter.classification) {
          filteredDisbursements = filteredDisbursements.filter(d => d.classification === filter.classification);
        }
        if (filter.department) {
          filteredDisbursements = filteredDisbursements.filter(d => d.department === filter.department);
        }
        if (filter.fundSource) {
          filteredDisbursements = filteredDisbursements.filter(d => d.fundSource === filter.fundSource);
        }
        if (filter.status) {
          filteredDisbursements = filteredDisbursements.filter(d => d.status === filter.status);
        }
        if (filter.dateFrom) {
          const fromDate = new Date(filter.dateFrom);
          filteredDisbursements = filteredDisbursements.filter(d => d.date >= fromDate);
        }
        if (filter.dateTo) {
          const toDate = new Date(filter.dateTo);
          filteredDisbursements = filteredDisbursements.filter(d => d.date <= toDate);
        }
        if (filter.search) {
          const searchTerm = filter.search.toLowerCase();
          filteredDisbursements = filteredDisbursements.filter(d => 
            d.payee.toLowerCase().includes(searchTerm) ||
            d.description.toLowerCase().includes(searchTerm) ||
            d.referenceNumber?.toLowerCase().includes(searchTerm)
          );
        }
        if (filter.createdBy) {
          filteredDisbursements = filteredDisbursements.filter(d => d.createdBy === filter.createdBy);
        }
      }

      this.disbursementsSubject.next(filteredDisbursements);
      return filteredDisbursements;
    } catch (error) {
      console.error('Error fetching disbursements:', error);
      throw error;
    }
  }

  // Get disbursement by ID
  async getDisbursementById(id: string): Promise<Disbursement | null> {
    try {
      const disbursements = await this.getDisbursements();
      return disbursements.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error fetching disbursement by ID:', error);
      throw error;
    }
  }

  // Create new disbursement
  async createDisbursement(request: CreateDisbursementRequest): Promise<Disbursement> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const newDisbursement: Disbursement = {
        id: this.generateId(),
        ...request,
        date: new Date(request.date),
        status: 'PENDING',
        createdBy: currentUser.email,
        createdAt: new Date()
      };

      // In a real implementation, this would be a Supabase call
      // const { data, error } = await this.supabaseService.createDisbursement(newDisbursement);
      
      // For now, add to mock data
      const currentDisbursements = this.disbursementsSubject.value;
      const updatedDisbursements = [...currentDisbursements, newDisbursement];
      this.disbursementsSubject.next(updatedDisbursements);
      
      await this.refreshStats();
      return newDisbursement;
    } catch (error) {
      console.error('Error creating disbursement:', error);
      throw error;
    }
  }

  // Update existing disbursement
  async updateDisbursement(request: UpdateDisbursementRequest): Promise<Disbursement> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const currentDisbursements = this.disbursementsSubject.value;
      const existingIndex = currentDisbursements.findIndex(d => d.id === request.id);
      
      if (existingIndex === -1) {
        throw new Error('Disbursement not found');
      }

      const existing = currentDisbursements[existingIndex];
      const updatedDisbursement: Disbursement = {
        ...existing,
        ...request,
        date: new Date(request.date),
        updatedAt: new Date()
      };

      // In a real implementation, this would be a Supabase call
      // const { data, error } = await this.supabaseService.updateDisbursement(updatedDisbursement);
      
      // For now, update mock data
      const updatedDisbursements = [...currentDisbursements];
      updatedDisbursements[existingIndex] = updatedDisbursement;
      this.disbursementsSubject.next(updatedDisbursements);
      
      await this.refreshStats();
      return updatedDisbursement;
    } catch (error) {
      console.error('Error updating disbursement:', error);
      throw error;
    }
  }

  // Delete disbursement
  async deleteDisbursement(id: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, this would be a Supabase call
      // const { error } = await this.supabaseService.deleteDisbursement(id);
      
      // For now, remove from mock data
      const currentDisbursements = this.disbursementsSubject.value;
      const updatedDisbursements = currentDisbursements.filter(d => d.id !== id);
      this.disbursementsSubject.next(updatedDisbursements);
      
      await this.refreshStats();
    } catch (error) {
      console.error('Error deleting disbursement:', error);
      throw error;
    }
  }

  // Approve disbursement (Admin only)
  async approveDisbursement(id: string): Promise<Disbursement> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !this.authService.isAdmin()) {
        throw new Error('Insufficient permissions');
      }

      const currentDisbursements = this.disbursementsSubject.value;
      const existingIndex = currentDisbursements.findIndex(d => d.id === id);
      
      if (existingIndex === -1) {
        throw new Error('Disbursement not found');
      }

      const updatedDisbursement: Disbursement = {
        ...currentDisbursements[existingIndex],
        status: 'APPROVED',
        approvedBy: currentUser.email,
        approvedAt: new Date(),
        updatedAt: new Date()
      };

      const updatedDisbursements = [...currentDisbursements];
      updatedDisbursements[existingIndex] = updatedDisbursement;
      this.disbursementsSubject.next(updatedDisbursements);
      
      await this.refreshStats();
      return updatedDisbursement;
    } catch (error) {
      console.error('Error approving disbursement:', error);
      throw error;
    }
  }

  // Reject disbursement (Admin only)
  async rejectDisbursement(id: string, reason: string): Promise<Disbursement> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !this.authService.isAdmin()) {
        throw new Error('Insufficient permissions');
      }

      const currentDisbursements = this.disbursementsSubject.value;
      const existingIndex = currentDisbursements.findIndex(d => d.id === id);
      
      if (existingIndex === -1) {
        throw new Error('Disbursement not found');
      }

      const updatedDisbursement: Disbursement = {
        ...currentDisbursements[existingIndex],
        status: 'REJECTED',
        rejectedBy: currentUser.email,
        rejectedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date()
      };

      const updatedDisbursements = [...currentDisbursements];
      updatedDisbursements[existingIndex] = updatedDisbursement;
      this.disbursementsSubject.next(updatedDisbursements);
      
      await this.refreshStats();
      return updatedDisbursement;
    } catch (error) {
      console.error('Error rejecting disbursement:', error);
      throw error;
    }
  }

  // Get disbursement statistics
  async getStats(filter?: DisbursementFilter): Promise<DisbursementStats> {
    try {
      const disbursements = await this.getDisbursements(filter);
      
      const stats: DisbursementStats = {
        totalCount: disbursements.length,
        totalAmount: disbursements.reduce((sum, d) => sum + d.amount, 0),
        pendingCount: disbursements.filter(d => d.status === 'PENDING').length,
        approvedCount: disbursements.filter(d => d.status === 'APPROVED').length,
        rejectedCount: disbursements.filter(d => d.status === 'REJECTED').length,
        monthlyCount: 0,
        monthlyAmount: 0,
        classificationBreakdown: {
          PS: { count: 0, amount: 0 },
          MOOE: { count: 0, amount: 0 },
          CO: { count: 0, amount: 0 },
          TR: { count: 0, amount: 0 }
        }
      };

      // Calculate monthly stats (current month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyDisbursements = disbursements.filter(d => {
        const disbursementDate = new Date(d.date);
        return disbursementDate.getMonth() === currentMonth && 
               disbursementDate.getFullYear() === currentYear;
      });
      
      stats.monthlyCount = monthlyDisbursements.length;
      stats.monthlyAmount = monthlyDisbursements.reduce((sum, d) => sum + d.amount, 0);

      // Calculate classification breakdown
      disbursements.forEach(d => {
        if (stats.classificationBreakdown[d.classification]) {
          stats.classificationBreakdown[d.classification].count++;
          stats.classificationBreakdown[d.classification].amount += d.amount;
        }
      });

      this.statsSubject.next(stats);
      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      throw error;
    }
  }

  // Get user's disbursements (for encoders)
  async getUserDisbursements(userId?: string): Promise<Disbursement[]> {
    try {
      const currentUser = this.authService.getCurrentUser();
      const targetUserId = userId || currentUser?.email;
      
      if (!targetUserId) {
        throw new Error('User not specified');
      }

      const filter: DisbursementFilter = {
        createdBy: targetUserId
      };

      return await this.getDisbursements(filter);
    } catch (error) {
      console.error('Error fetching user disbursements:', error);
      throw error;
    }
  }

  // Refresh data
  async refreshDisbursements(): Promise<void> {
    await this.getDisbursements();
  }

  async refreshStats(): Promise<void> {
    await this.getStats();
  }

  // Utility methods
  private generateId(): string {
    return 'disbursement_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get classification options
  getClassificationOptions() {
    return [
      { value: 'PS', label: 'PS - Personal Services', description: 'Salaries, wages, and other compensation' },
      { value: 'MOOE', label: 'MOOE - Maintenance and Other Operating Expenses', description: 'Operating expenses including supplies and utilities' },
      { value: 'CO', label: 'CO - Capital Outlay', description: 'Infrastructure, equipment, and capital assets' },
      { value: 'TR', label: 'TR - Trust Receipts', description: 'Funds held in trust for specific purposes' }
    ];
  }

  // Get fund source options
  getFundSourceOptions() {
    return [
      'General Fund',
      'Special Education Fund',
      'Infrastructure Fund',
      'Payroll Fund',
      'Trust Fund',
      'Development Fund'
    ];
  }

  // Get department options
  getDepartmentOptions() {
    return [
      'Finance',
      'Human Resources',
      'Information Technology',
      'Operations',
      'Procurement',
      'Legal Affairs',
      'Planning & Development'
    ];
  }

  // Export methods (for reports)
  async exportToPDF(filter?: DisbursementFilter): Promise<Blob> {
    // Mock implementation - replace with actual PDF generation
    const disbursements = await this.getDisbursements(filter);
    console.log('Exporting to PDF:', disbursements.length, 'records');
    
    // Return mock blob
    return new Blob(['Mock PDF content'], { type: 'application/pdf' });
  }

  async exportToExcel(filter?: DisbursementFilter): Promise<Blob> {
    // Mock implementation - replace with actual Excel generation
    const disbursements = await this.getDisbursements(filter);
    console.log('Exporting to Excel:', disbursements.length, 'records');
    
    // Return mock blob
    return new Blob(['Mock Excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async exportToCSV(filter?: DisbursementFilter): Promise<Blob> {
    // Mock implementation - replace with actual CSV generation
    const disbursements = await this.getDisbursements(filter);
    console.log('Exporting to CSV:', disbursements.length, 'records');
    
    // Create basic CSV content
    const headers = ['ID', 'Date', 'Payee', 'Amount', 'Classification', 'Fund Source', 'Department', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...disbursements.map(d => [
        d.id,
        d.date.toISOString().split('T')[0],
        `"${d.payee}"`,
        d.amount,
        d.classification,
        `"${d.fundSource}"`,
        `"${d.department}"`,
        d.status,
        `"${d.description}"`
      ].join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  }
}