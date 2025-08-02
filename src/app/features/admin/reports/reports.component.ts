import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'disbursement' | 'classification' | 'audit';
  dateRange: string;
  generatedBy: string;
  generatedAt: Date;
  status: 'generated' | 'pending' | 'error';
  downloadUrl?: string;
}

interface ReportSummary {
  totalDisbursements: number;
  totalAmount: number;
  byClassification: {
    PS: { count: number; amount: number };
    MOOE: { count: number; amount: number };
    CO: { count: number; amount: number };
    TR: { count: number; amount: number };
  };
  byDepartment: { [key: string]: { count: number; amount: number } };
  monthlyTrends: { month: string; amount: number; count: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  // Reactive state
  reports = signal<ReportData[]>([]);
  summary = signal<ReportSummary | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isGenerating = signal(false);

  // Form controls
  searchControl = new FormControl('');
  typeFilter = new FormControl('');
  dateFromFilter = new FormControl('');
  dateToFilter = new FormControl('');

  // Computed properties
  filteredReports = computed(() => {
    const reports = this.reports();
    const search = this.searchControl.value?.toLowerCase() || '';
    const type = this.typeFilter.value || '';
    const dateFrom = this.dateFromFilter.value;
    const dateTo = this.dateToFilter.value;

    return reports.filter(report => {
      const matchesSearch = !search || 
        report.title.toLowerCase().includes(search) ||
        report.description.toLowerCase().includes(search) ||
        report.generatedBy.toLowerCase().includes(search);
      
      const matchesType = !type || report.type === type;
      
      const matchesDateRange = (!dateFrom || new Date(report.generatedAt) >= new Date(dateFrom)) &&
                              (!dateTo || new Date(report.generatedAt) <= new Date(dateTo));
      
      return matchesSearch && matchesType && matchesDateRange;
    });
  });

  ngOnInit() {
    this.loadReports();
    this.loadSummary();
  }

  async loadReports() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Mock data for demonstration
      const mockReports: ReportData[] = [
        {
          id: '1',
          title: 'Monthly Financial Summary - December 2024',
          description: 'Comprehensive financial report covering all disbursements for December 2024',
          type: 'financial',
          dateRange: 'Dec 1-31, 2024',
          generatedBy: 'Admin User',
          generatedAt: new Date('2024-12-30'),
          status: 'generated',
          downloadUrl: '/reports/monthly-dec-2024.pdf'
        },
        {
          id: '2',
          title: 'Personnel Services Disbursement Report',
          description: 'Detailed breakdown of all PS-related disbursements',
          type: 'classification',
          dateRange: 'Q4 2024',
          generatedBy: 'Finance Manager',
          generatedAt: new Date('2024-12-28'),
          status: 'generated',
          downloadUrl: '/reports/ps-q4-2024.xlsx'
        },
        {
          id: '3',
          title: 'Audit Trail Report',
          description: 'Complete audit trail of all system activities and changes',
          type: 'audit',
          dateRange: 'Nov 1-30, 2024',
          generatedBy: 'System Admin',
          generatedAt: new Date('2024-12-01'),
          status: 'generated',
          downloadUrl: '/reports/audit-nov-2024.pdf'
        },
        {
          id: '4',
          title: 'Quarterly Disbursement Analysis',
          description: 'Analysis of disbursement patterns and trends for Q4 2024',
          type: 'disbursement',
          dateRange: 'Q4 2024',
          generatedBy: 'Data Analyst',
          generatedAt: new Date('2024-12-25'),
          status: 'pending'
        }
      ];

      this.reports.set(mockReports);
    } catch (err) {
      this.error.set('Failed to load reports. Please try again.');
      console.error('Error loading reports:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSummary() {
    try {
      // Mock summary data
      const mockSummary: ReportSummary = {
        totalDisbursements: 1247,
        totalAmount: 15750000,
        byClassification: {
          PS: { count: 456, amount: 8500000 },
          MOOE: { count: 321, amount: 3200000 },
          CO: { count: 89, amount: 2800000 },
          TR: { count: 381, amount: 1250000 }
        },
        byDepartment: {
          'Administration': { count: 234, amount: 3200000 },
          'Finance': { count: 189, amount: 2800000 },
          'Engineering': { count: 156, amount: 4500000 },
          'Human Resources': { count: 145, amount: 2100000 },
          'Operations': { count: 523, amount: 3150000 }
        },
        monthlyTrends: [
          { month: 'Jul 2024', amount: 2100000, count: 156 },
          { month: 'Aug 2024', amount: 2350000, count: 178 },
          { month: 'Sep 2024', amount: 1980000, count: 142 },
          { month: 'Oct 2024', amount: 2650000, count: 189 },
          { month: 'Nov 2024', amount: 3200000, count: 234 },
          { month: 'Dec 2024', amount: 3470000, count: 248 }
        ]
      };

      this.summary.set(mockSummary);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }

  async generateReport(type: string) {
    this.isGenerating.set(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        description: `Generated ${type} report for current period`,
        type: type as any,
        dateRange: 'Current Period',
        generatedBy: 'Current User',
        generatedAt: new Date(),
        status: 'generated',
        downloadUrl: `/reports/${type}-${Date.now()}.pdf`
      };

      this.reports.update(reports => [newReport, ...reports]);
      alert('Report generated successfully!');
    } catch (err) {
      alert('Failed to generate report. Please try again.');
      console.error('Error generating report:', err);
    } finally {
      this.isGenerating.set(false);
    }
  }

  downloadReport(report: ReportData) {
    if (report.downloadUrl) {
      // Simulate download
      alert(`Downloading: ${report.title}`);
      // In a real app, this would trigger an actual download
      // window.open(report.downloadUrl, '_blank');
    }
  }

  deleteReport(reportId: string) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reports.update(reports => reports.filter(r => r.id !== reportId));
    }
  }

  exportSummary(format: 'pdf' | 'excel') {
    alert(`Exporting summary as ${format.toUpperCase()}...`);
    // Implement actual export logic here
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'generated': return '✅';
      case 'pending': return '⏳';
      case 'error': return '❌';
      default: return '📄';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'financial': return '💰';
      case 'disbursement': return '📊';
      case 'classification': return '🏷️';
      case 'audit': return '🔍';
      default: return '📄';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }
}