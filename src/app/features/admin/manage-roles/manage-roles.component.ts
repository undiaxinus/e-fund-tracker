import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="manage-roles-container">
      <div class="header">
        <h1>Manage Roles & Permissions</h1>
      </div>
      
      <div class="roles-grid">
        <div class="role-card" *ngFor="let role of roles">
          <div class="role-header">
            <h3>{{ role.name | titlecase }}</h3>
            <span class="user-count">{{ role.userCount }} users</span>
          </div>
          
          <div class="role-description">
            <p>{{ role.description }}</p>
          </div>
          
          <div class="permissions-section">
            <h4>Permissions</h4>
            <div class="permissions-list">
              <div class="permission-item" *ngFor="let permission of role.permissions">
                <span class="permission-name">{{ permission.name }}</span>
                <span class="permission-status" [class]="permission.enabled ? 'enabled' : 'disabled'">
                  {{ permission.enabled ? 'Enabled' : 'Disabled' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="role-actions">
            <button class="btn btn-outline" (click)="editRole(role)">
              Edit Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-roles-container {
      padding: 2rem;
    }
    
    .header {
      margin-bottom: 2rem;
    }
    
    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    .role-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    
    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .role-header h3 {
      margin: 0;
      color: #1f2937;
    }
    
    .user-count {
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .role-description {
      margin-bottom: 1.5rem;
    }
    
    .role-description p {
      color: #6b7280;
      margin: 0;
    }
    
    .permissions-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }
    
    .permissions-list {
      margin-bottom: 1.5rem;
    }
    
    .permission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .permission-item:last-child {
      border-bottom: none;
    }
    
    .permission-name {
      font-size: 0.875rem;
      color: #374151;
    }
    
    .permission-status {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .permission-status.enabled {
      background: #d1fae5;
      color: #065f46;
    }
    
    .permission-status.disabled {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .role-actions {
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
    
    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    .btn-outline:hover {
      background: #f9fafb;
    }
  `]
})
export class ManageRolesComponent implements OnInit {
  roles = [
    {
      id: 'admin',
      name: 'administrator',
      description: 'Full system access with user management and configuration capabilities.',
      userCount: 2,
      permissions: [
        { name: 'Create Users', enabled: true },
        { name: 'Edit Users', enabled: true },
        { name: 'Delete Users', enabled: true },
        { name: 'View Reports', enabled: true },
        { name: 'Create Disbursements', enabled: true },
        { name: 'Edit Disbursements', enabled: true },
        { name: 'Delete Disbursements', enabled: true },
        { name: 'Manage Classifications', enabled: true },
        { name: 'System Configuration', enabled: true }
      ]
    },
    {
      id: 'encoder',
      name: 'encoder',
      description: 'Data entry role for disbursement records with editing capabilities.',
      userCount: 8,
      permissions: [
        { name: 'Create Users', enabled: false },
        { name: 'Edit Users', enabled: false },
        { name: 'Delete Users', enabled: false },
        { name: 'View Reports', enabled: true },
        { name: 'Create Disbursements', enabled: true },
        { name: 'Edit Disbursements', enabled: true },
        { name: 'Delete Disbursements', enabled: false },
        { name: 'Manage Classifications', enabled: false },
        { name: 'System Configuration', enabled: false }
      ]
    },
    {
      id: 'viewer',
      name: 'viewer',
      description: 'Read-only access for monitoring and auditing purposes.',
      userCount: 15,
      permissions: [
        { name: 'Create Users', enabled: false },
        { name: 'Edit Users', enabled: false },
        { name: 'Delete Users', enabled: false },
        { name: 'View Reports', enabled: true },
        { name: 'Create Disbursements', enabled: false },
        { name: 'Edit Disbursements', enabled: false },
        { name: 'Delete Disbursements', enabled: false },
        { name: 'Manage Classifications', enabled: false },
        { name: 'System Configuration', enabled: false }
      ]
    }
  ];

  ngOnInit() {
    this.loadRoles();
  }

  editRole(role: any) {
    console.log('Editing role:', role.name);
    // TODO: Implement role editing functionality
    alert(`Edit permissions for ${role.name} role`);
  }

  private loadRoles() {
    // TODO: Implement actual data loading from service
    console.log('Loading roles and permissions...');
  }
}