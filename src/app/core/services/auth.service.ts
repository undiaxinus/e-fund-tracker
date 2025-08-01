import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'ENCODER' | 'VIEWER';
  department?: string;
  isActive: boolean;
}

interface MockUser {
  email: string;
  password: string;
  user: AppUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock users for demo mode
  private mockUsers: MockUser[] = [
    {
      email: 'admin@efund.gov',
      password: 'password123',
      user: {
        id: 'admin-user-id',
        email: 'admin@efund.gov',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        department: 'IT Department',
        isActive: true
      }
    },
    {
      email: 'test@example.com',
      password: 'demo123',
      user: {
        id: 'encoder-user-id',
        email: 'test@example.com',
        username: 'encoder',
        firstName: 'Data',
        lastName: 'Encoder',
        role: 'ENCODER',
        department: 'Finance Department',
        isActive: true
      }
    },
    {
      email: 'user@test.com',
      password: '123456',
      user: {
        id: 'viewer-user-id',
        email: 'user@test.com',
        username: 'viewer',
        firstName: 'Report',
        lastName: 'Viewer',
        role: 'VIEWER',
        department: 'Audit Department',
        isActive: true
      }
    }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Listen for auth state changes
    this.supabaseService.currentUser$.subscribe(async (user: User | null) => {
      if (user) {
        // Get user profile from database
        const { data: userProfile } = await this.supabaseService.getUserById(user.id);
        if (userProfile) {
          this.currentUserSubject.next(userProfile as AppUser);
          this.isAuthenticatedSubject.next(true);
        }
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is configured
      if (!this.supabaseService.client) {
        // Demo mode - mock authentication
        if (!email || !password) {
          return { success: false, error: 'Please enter email and password' };
        }

        // Find matching mock user
        const mockUser = this.mockUsers.find(user => 
          user.email.toLowerCase() === email.toLowerCase() && 
          user.password === password
        );

        if (!mockUser) {
          return { success: false, error: 'Invalid email or password' };
        }

        // Set the authenticated user
        this.currentUserSubject.next(mockUser.user);
        this.isAuthenticatedSubject.next(true);
        
        // Navigate to appropriate dashboard based on role
        const dashboardRoute = this.getDashboardRouteForRole(mockUser.user.role);
        this.router.navigate([dashboardRoute]);
        
        return { success: true };
      }

      const { data, error } = await this.supabaseService.signIn(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Log audit trail
        await this.logAuditAction('LOGIN', 'User', data.user.id);
        
        // Update last login
        await this.supabaseService.updateUser(data.user.id, {
          lastLogin: new Date().toISOString()
        });

        this.router.navigate(['/dashboard']);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private getDashboardRouteForRole(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ENCODER':
        return '/encoder/entries';
      case 'VIEWER':
        return '/viewer/dashboard';
      default:
        return '/dashboard';
    }
  }

  async signUp(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    role: 'ADMIN' | 'ENCODER' | 'VIEWER';
    department?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.signUp(
        userData.email,
        userData.password,
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await this.supabaseService.createUser({
          id: data.user.id,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          department: userData.department,
          isActive: true
        });

        if (profileError) {
          return { success: false, error: profileError.message };
        }

        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut(): Promise<void> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      await this.logAuditAction('LOGOUT', 'User', currentUser.id);
    }
    
    await this.supabaseService.signOut();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService.resetPassword(email);
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isEncoder(): boolean {
    return this.hasRole('ENCODER');
  }

  isViewer(): boolean {
    return this.hasRole('VIEWER');
  }

  canEdit(): boolean {
    return this.hasAnyRole(['ADMIN', 'ENCODER']);
  }

  canView(): boolean {
    return this.hasAnyRole(['ADMIN', 'ENCODER', 'VIEWER']);
  }

  canManageUsers(): boolean {
    return this.isAdmin();
  }

  // Method to get available demo users for testing
  getDemoUsers(): { email: string; role: string; name: string }[] {
    return this.mockUsers.map(mockUser => ({
      email: mockUser.email,
      role: mockUser.user.role,
      name: `${mockUser.user.firstName} ${mockUser.user.lastName}`
    }));
  }

  // Method to test authentication for all demo users
  async testAllDemoUsers(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const mockUser of this.mockUsers) {
      try {
        const result = await this.signIn(mockUser.email, mockUser.password);
        results[mockUser.email] = result.success;
        
        // Sign out after each test
        if (result.success) {
          await this.signOut();
        }
      } catch (error) {
        results[mockUser.email] = false;
      }
    }
    
    return results;
  }

  private async logAuditAction(action: string, entityType: string, entityId?: string) {
    const user = this.getCurrentUser();
    if (user) {
      await this.supabaseService.createAuditLog({
        userId: user.id,
        action,
        entityType,
        entityId,
        timestamp: new Date().toISOString()
      });
    }
  }
}