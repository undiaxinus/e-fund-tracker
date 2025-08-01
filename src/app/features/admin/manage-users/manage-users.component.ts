import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="manage-users-container">
      <div class="header">
        <h1>Manage Users</h1>
        <button routerLink="new" class="btn btn-primary">Add New User</button>
      </div>
      
      <div class="users-table">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role">{{ user.role | titlecase }}</span>
              </td>
              <td>
                <span class="status-badge" [class]="user.isActive ? 'status-active' : 'status-inactive'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.lastLoginAt ? (user.lastLoginAt | date:'short') : 'Never' }}</td>
              <td>
                <div class="action-buttons">
                  <button [routerLink]="['edit', user.id]" class="btn btn-sm btn-outline">Edit</button>
                  <button (click)="toggleUserStatus(user)" class="btn btn-sm" 
                          [class]="user.isActive ? 'btn-warning' : 'btn-success'">
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .manage-users-container {
      padding: 2rem;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .users-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .table th,
    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .table th {
      background: #f9fafb;
      font-weight: 600;
    }
    
    .role-badge,
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .role-admin {
      background: #fef3c7;
      color: #92400e;
    }
    
    .role-encoder {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .role-viewer {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-active {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-size: 0.875rem;
    }
    
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    .btn-warning {
      background: #f59e0b;
      color: white;
    }
    
    .btn-success {
      background: #059669;
      color: white;
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  `]
})
export class ManageUsersComponent implements OnInit {
  users = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      isActive: true,
      lastLoginAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'encoder',
      isActive: true,
      lastLoginAt: new Date('2024-01-14T14:20:00')
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      role: 'viewer',
      isActive: false,
      lastLoginAt: null
    }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  toggleUserStatus(user: any) {
    user.isActive = !user.isActive;
    console.log(`User ${user.email} ${user.isActive ? 'activated' : 'deactivated'}`);
    // TODO: Implement actual API call to update user status
  }

  private loadUsers() {
    // TODO: Implement actual data loading from service
    console.log('Loading users...');
  }
}