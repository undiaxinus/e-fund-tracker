import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="manage-users-container">
      <div class="header">
        <div class="header-content">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage system users, roles, and permissions</p>
        </div>
        <div class="header-actions">
          <button routerLink="new" class="btn btn-primary">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New User
          </button>
        </div>
      </div>
      
      <div class="filters-section">
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            class="search-input"
            [formControl]="searchControl"
          >
        </div>
        <div class="filter-controls">
          <select class="filter-select" [formControl]="roleFilter">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select class="filter-select" [formControl]="statusFilter">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3>Error Loading Users</h3>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="loadUsers()">Try Again</button>
        </div>
      } @else {
        <div class="users-table-container">
          <div class="table-header">
            <h2>Users ({{ filteredUsers().length }})</h2>
          </div>
          
          @if (filteredUsers().length === 0) {
            <div class="empty-state">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h3>No Users Found</h3>
              <p>No users match your current filters.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="sortable" (click)="sortBy('name')">
                      Name
                      <svg class="sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                      </svg>
                    </th>
                    <th class="sortable" (click)="sortBy('email')">
                      Email
                      <svg class="sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                      </svg>
                    </th>
                    <th>Role</th>
                    <th>Permission</th>
                    <th>Status</th>
                    <th class="sortable" (click)="sortBy('lastLogin')">
                      Last Login
                      <svg class="sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                      </svg>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr class="user-row">
                      <td class="user-name">
                        <div class="user-avatar">
                          {{ getInitials(user.first_name, user.last_name) }}
                        </div>
                        <div class="name-info">
                          <span class="full-name">{{ user.first_name }} {{ user.last_name }}</span>
                          <span class="user-id">ID: {{ user.id.slice(0, 8) }}...</span>
                        </div>
                      </td>
                      <td class="user-email">{{ user.email }}</td>
                      <td>
                        <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                          {{ user.role | titlecase }}
                        </span>
                      </td>
                      <td>
                        @if (user.role.toLowerCase() === 'user' && user.permission) {
                          <span class="permission-badge" [class]="'permission-' + user.permission.toLowerCase()">
                            {{ user.permission | titlecase }}
                          </span>
                        } @else if (user.role.toLowerCase() === 'admin') {
                          <span class="permission-badge permission-all">
                            All Permissions
                          </span>
                        } @else {
                          <span class="permission-badge permission-none">
                            None
                          </span>
                        }
                      </td>
                      <td>
                        <span class="status-badge" [class]="user.is_active ? 'status-active' : 'status-inactive'">
                          <div class="status-indicator" [class]="user.is_active ? 'active' : 'inactive'"></div>
                          {{ user.is_active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="last-login">
                        {{ user.last_login_at ? (user.last_login_at | date:'short') : 'Never' }}
                      </td>
                       <td>
                         <div class="action-buttons">
                           <button 
                             [routerLink]="['edit', user.id]" 
                             class="btn btn-sm btn-outline"
                             title="Edit user"
                           >
                             <svg class="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                             </svg>
                             Edit
                           </button>
                           <button 
                             (click)="toggleUserStatus(user)" 
                             class="btn btn-sm" 
                             [class]="user.is_active ? 'btn-warning' : 'btn-success'"
                             [title]="user.is_active ? 'Deactivate user' : 'Activate user'"
                             [disabled]="isUpdatingUser() === user.id"
                           >
                             @if (isUpdatingUser() === user.id) {
                               <div class="btn-spinner"></div>
                             } @else {
                               <svg class="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 @if (user.is_active) {
                                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                                 } @else {
                                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                 }
                               </svg>
                             }
                             {{ user.is_active ? 'Deactivate' : 'Activate' }}
                           </button>
                         </div>
                       </td>
                     </tr>
                   }
                 </tbody>
               </table>
             </div>
           }
         </div>
       }
    </div>
  `,
  styles: [`
    .manage-users-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      background: #f8fafc;
      min-height: 100vh;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }
    
    .header-content {
      flex: 1;
    }
    
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
    }
    
    .page-subtitle {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }
    
    .header-actions {
      display: flex;
      gap: 1rem;
    }
    
    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .search-box {
      position: relative;
      flex: 1;
      min-width: 300px;
    }
    
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.25rem;
      height: 1.25rem;
      color: #6b7280;
      pointer-events: none;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
      background: #f9fafb;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: white;
    }
    
    .filter-controls {
      display: flex;
      gap: 1rem;
    }
    
    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      background: #f9fafb;
      transition: all 0.2s;
      min-width: 140px;
    }
    
    .filter-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: white;
    }
    
    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #f3f4f6;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-icon,
    .empty-icon {
      width: 4rem;
      height: 4rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }
    
    .error-state h3,
    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }
    
    .error-state p,
    .empty-state p {
      color: #6b7280;
      margin: 0 0 1.5rem 0;
    }
    
    .users-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      background: #f9fafb;
    }
    
    .table-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }
    
    .table-wrapper {
      overflow-x: auto;
    }
    
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .users-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .users-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
      position: relative;
    }
    
    .users-table th.sortable:hover {
      background: #f3f4f6;
    }
    
    .sort-icon {
      width: 1rem;
      height: 1rem;
      margin-left: 0.5rem;
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    
    .users-table th.sortable:hover .sort-icon {
      opacity: 1;
    }
    
    .user-row {
      transition: background-color 0.2s;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .user-row:hover {
      background: #f9fafb;
    }
    
    .user-row:last-child {
      border-bottom: none;
    }
    
    .users-table td {
      padding: 1rem 1.5rem;
      vertical-align: middle;
    }
    
    .user-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    
    .name-info {
      display: flex;
      flex-direction: column;
    }
    
    .full-name {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }
    
    .user-id {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.125rem;
    }
    
    .user-email {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .role-badge,
    .status-badge,
    .permission-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .role-admin {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      border: 1px solid #f59e0b;
    }
    
    .role-user {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1e40af;
      border: 1px solid #3b82f6;
    }
    
    .permission-encoder {
      background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
      color: #0277bd;
      border: 1px solid #0288d1;
    }
    
    .permission-viewer {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
      color: #7b1fa2;
      border: 1px solid #9c27b0;
    }
    
    .permission-all {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      color: #f57c00;
      border: 1px solid #ff9800;
    }
    
    .permission-none {
      background: #f3f4f6;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }
    
    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status-indicator {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .status-indicator.active {
      background: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    
    .status-indicator.inactive {
      background: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
    
    .status-active {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #065f46;
      border: 1px solid #10b981;
    }
    
    .status-inactive {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #991b1b;
      border: 1px solid #ef4444;
    }
    
    .last-login {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .btn-icon-sm {
      width: 1rem;
      height: 1rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .btn-outline {
      background: white;
      border: 1px solid #e5e7eb;
      color: #374151;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .btn-outline:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-1px);
    }
    
    .btn-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
    }
    
    .btn-warning:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }
    
    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    
    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      gap: 0.375rem;
    }
    
    .btn-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @media (max-width: 768px) {
      .manage-users-container {
        padding: 1rem;
      }
      
      .header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-box {
        min-width: auto;
      }
      
      .filter-controls {
        flex-direction: column;
      }
      
      .filter-select {
        min-width: auto;
      }
      
      .table-wrapper {
        overflow-x: scroll;
      }
      
      .users-table {
        min-width: 800px;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.625rem;
      }
    }
  `]
})
export class ManageUsersComponent implements OnInit {
  // Signals for reactive state management
  users = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isUpdatingUser = signal<string | null>(null);
  sortField = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Form controls for filtering
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  statusFilter = new FormControl('');

  // Computed signals for filtered and sorted data
  filteredUsers = computed(() => {
    let filtered = this.users();
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply role filter
    const roleFilter = this.roleFilter.value;
    if (roleFilter) {
      filtered = filtered.filter(user => user.role.toLowerCase() === roleFilter);
    }
    
    // Apply status filter
    const statusFilter = this.statusFilter.value;
    if (statusFilter !== '') {
      const isActive = statusFilter === 'true';
      filtered = filtered.filter(user => user.is_active === isActive);
    }
    
    // Apply sorting
    const sortField = this.sortField();
    const sortDirection = this.sortDirection();
    
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'name':
            aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
            bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'lastLogin':
            aValue = a.last_login_at ? new Date(a.last_login_at).getTime() : 0;
            bValue = b.last_login_at ? new Date(b.last_login_at).getTime() : 0;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  });

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const { data, error } = await this.supabaseService.getUsers();
      
      if (error) {
        this.error.set(error.message || 'Failed to load users');
        console.error('Error loading users:', error);
      } else {
        this.users.set(data || []);
      }
    } catch (err: any) {
      this.error.set('An unexpected error occurred while loading users');
      console.error('Unexpected error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleUserStatus(user: any) {
    this.isUpdatingUser.set(user.id);
    
    try {
      const updatedData = {
        is_active: !user.is_active
      };
      
      const { data, error } = await this.supabaseService.updateUser(user.id, updatedData);
      
      if (error) {
        console.error('Error updating user status:', error);
        alert('Failed to update user status: ' + error.message);
      } else {
        // Update the local state
        const currentUsers = this.users();
        const updatedUsers = currentUsers.map(u => 
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        );
        this.users.set(updatedUsers);
        
        const action = user.is_active ? 'deactivated' : 'activated';
        console.log(`User ${user.email} ${action} successfully`);
      }
    } catch (err: any) {
      console.error('Unexpected error updating user:', err);
      alert('An unexpected error occurred while updating the user');
    } finally {
      this.isUpdatingUser.set(null);
    }
  }

  sortBy(field: string) {
    if (this.sortField() === field) {
      // Toggle direction if same field
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }
}