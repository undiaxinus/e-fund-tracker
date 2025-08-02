import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  currentUser: any;
  totalDisbursements = 0;
  totalAmount = 0;
  thisMonthCount = 0;
  pendingCount = 0;
  canEdit = false;
  roleClass = '';
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  private loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.canEdit = (user?.role === 'USER' && user?.permission === 'ENCODER') || user?.role === 'ADMIN';
      this.roleClass = user?.permission || user?.role || '';
    });
  }

  private loadDashboardStats() {
    // Mock data for now - replace with actual service calls
    this.totalDisbursements = 156;
    this.totalAmount = 2450000;
    this.thisMonthCount = 23;
    this.pendingCount = 5;
  }

  private loadRecentActivities() {
    // Mock data for now - replace with actual service calls
    this.recentActivities = [
      {
        type: 'create',
        icon: '➕',
        description: 'New disbursement entry created for Office Supplies',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: 'update',
        icon: '✏️',
        description: 'Updated disbursement amount for Equipment Purchase',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        type: 'create',
        icon: '📊',
        description: 'Monthly report generated and exported',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];
  }
}