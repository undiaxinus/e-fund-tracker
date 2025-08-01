import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent {
  readonly currentYear = new Date().getFullYear();
  
  readonly features = [
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'Role-based access control with encrypted data transmission'
    },
    {
      icon: '💰',
      title: 'Financial Tracking',
      description: 'Comprehensive disbursement management and reporting'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Dashboard insights and customizable reports'
    },
    {
      icon: '🏛️',
      title: 'Government Compliant',
      description: 'Built for government financial management standards'
    }
  ];
}