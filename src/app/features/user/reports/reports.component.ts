import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

interface ReportSummary {
  classification: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  canEdit = false;
  
  // Filter properties
  dateFrom = '';
  dateTo = '';
  selectedDepartment = '';
  selectedFundSource = '';
  
  // Summary data
  totalAmount = 0;
  totalCount = 0;
  averageAmount = 0;
  monthlyGrowth = 0;
  
  // Chart data
  classificationSummary: ReportSummary[] = [];
  monthlyTrend: MonthlyData[] = [];
  maxMonthlyAmount = 0;
  
  // Activity data
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserPermissions();
    this.initializeDateFilters();
    this.loadReportsData();
  }

  private loadUserPermissions() {
    this.authService.currentUser$.subscribe(user => {
      this.canEdit = (user?.role === 'USER' && user?.permission === 'ENCODER') || user?.role === 'ADMIN';
    });
  }

  private initializeDateFilters() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.dateFrom = firstDay.toISOString().split('T')[0];
    this.dateTo = lastDay.toISOString().split('T')[0];
  }

  private loadReportsData() {
    // Mock data - replace with actual service calls
    this.totalAmount = 2450000;
    this.totalCount = 156;
    this.averageAmount = this.totalAmount / this.totalCount;
    this.monthlyGrowth = 12.5;
    
    this.classificationSummary = [
      { classification: 'PS', count: 45, totalAmount: 980000, percentage: 40 },
      { classification: 'MOOE', count: 67, totalAmount: 735000, percentage: 30 },
      { classification: 'CO', count: 32, totalAmount: 588000, percentage: 24 },
      { classification: 'TR', count: 12, totalAmount: 147000, percentage: 6 }
    ];
    
    this.monthlyTrend = [
      { month: 'Jan', amount: 180000, count: 12 },
      { month: 'Feb', amount: 220000, count: 15 },
      { month: 'Mar', amount: 195000, count: 13 },
      { month: 'Apr', amount: 245000, count: 18 },
      { month: 'May', amount: 280000, count: 21 },
      { month: 'Jun', amount: 315000, count: 24 }
    ];
    
    this.maxMonthlyAmount = Math.max(...this.monthlyTrend.map(d => d.amount));
    
    this.recentActivities = [
      {
        type: 'create',
        icon: '➕',
        description: 'New disbursement entry created',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'encoder@gov.ph',
        amount: 15000
      },
      {
        type: 'export',
        icon: '📊',
        description: 'Monthly report exported to PDF',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        user: 'viewer@gov.ph'
      },
      {
        type: 'update',
        icon: '✏️',
        description: 'Disbursement amount updated',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        user: 'encoder@gov.ph',
        amount: 25000
      }
    ];
  }

  updateReports() {
    // Reload data based on filters
    this.loadReportsData();
  }
}