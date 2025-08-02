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
      email: 'admin2@efund.gov.ph',
      password: 'admin123456',
      user: {
        id: 'admin2-user-id',
        email: 'admin2@efund.gov.ph',
        username: 'admin2',
        firstName: 'Secondary',
        lastName: 'Administrator',
        role: 'ADMIN',
        department: 'Administration',
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
    // Check for saved session token on app start
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      try {
        // Validate session with database
        const { data: sessionData, error } = await this.supabaseService.validateSession(sessionToken);
        
        if (sessionData && !error && sessionData.User) {
          const userToSet = {
            id: sessionData.User.id,
            email: sessionData.User.email,
            username: sessionData.User.email.split('@')[0],
            firstName: sessionData.User.first_name,
            lastName: sessionData.User.last_name,
            role: sessionData.User.role,
            department: sessionData.User.department,
            isActive: sessionData.User.is_active
          };
          
          this.currentUserSubject.next(userToSet);
          this.isAuthenticatedSubject.next(true);
          console.log('Restored user session from database:', userToSet);
        } else {
          // Invalid or expired session
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('currentUser');
          this.isAuthenticatedSubject.next(false);
        }
      } catch (error) {
        console.error('Error validating session:', error);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        this.isAuthenticatedSubject.next(false);
      }
    } else {
      // No saved session, ensure we're not authenticated
      this.isAuthenticatedSubject.next(false);
    }

    // Cleanup expired sessions periodically
    this.setupSessionCleanup();
  }

  private setupSessionCleanup() {
    // Clean up expired sessions every hour
    setInterval(async () => {
      try {
        await this.supabaseService.cleanupExpiredSessions();
      } catch (error) {
        console.error('Error cleaning up expired sessions:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First try to get user from database
      const { data: dbUser, error: dbError } = await this.supabaseService.getUserByEmail(email);
      
      if (dbUser && !dbError) {
        // Verify password using bcrypt
        const isPasswordValid = await this.supabaseService.verifyPassword(password, dbUser.password_hash);
        
        if (isPasswordValid) {
          // Password is correct, create session
          const { data: sessionData, error: sessionError, sessionToken } = await this.supabaseService.createUserSession(dbUser.id);
          
          if (sessionError || !sessionToken) {
            console.error('Error creating session:', sessionError);
            return { success: false, error: 'Failed to create session' };
          }
          
          const userToSet = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.email.split('@')[0],
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            role: dbUser.role,
            department: dbUser.department,
            isActive: dbUser.is_active
          };
          
          this.currentUserSubject.next(userToSet);
          this.isAuthenticatedSubject.next(true);
          
          // Save session token and user data to localStorage
          localStorage.setItem('sessionToken', sessionToken);
          localStorage.setItem('currentUser', JSON.stringify(userToSet));
          
          // Update last login time
          await this.supabaseService.updateUser(dbUser.id, {
            last_login: new Date().toISOString()
          });
          
          // Navigate to appropriate dashboard based on role
          const dashboardRoute = this.getDashboardRouteForRole(userToSet.role);
          this.router.navigate([dashboardRoute]);
          
          return { success: true };
        } else {
          return { success: false, error: 'Invalid email or password' };
        }
      }
      
      // Fallback to mock users for demo purposes
      const mockUser = this.mockUsers.find(user => 
        user.email === email && user.password === password
      );
      
      if (mockUser) {
        // Use mock user data as fallback
        const userToSet = mockUser.user;
        // Simulate loading delay for mock users
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For mock users, create a mock session (fallback)
         const mockSessionToken = 'mock_' + crypto.randomUUID();
         
         // Set the authenticated user
         this.currentUserSubject.next(userToSet);
         this.isAuthenticatedSubject.next(true);
         
         // Save mock session token and user data to localStorage
         localStorage.setItem('sessionToken', mockSessionToken);
         localStorage.setItem('currentUser', JSON.stringify(userToSet));
         
         // Navigate to appropriate dashboard based on role
         const dashboardRoute = this.getDashboardRouteForRole(userToSet.role);
         this.router.navigate([dashboardRoute]);
         
         return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error?.message || 'An unexpected error occurred' };
    }
  }

  private getDashboardRouteForRole(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ENCODER':
        return '/user/entries';
      case 'VIEWER':
        return '/user/dashboard';
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
        return { success: false, error: (error as any)?.message || 'Registration failed' };
      }

      if (data?.user) {
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
          return { success: false, error: profileError?.message || 'Profile creation failed' };
        }

        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'An unexpected error occurred' };
    }
  }

  async signOut(): Promise<void> {
    const currentUser = this.currentUserSubject.value;
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (currentUser) {
      await this.logAuditAction('LOGOUT', 'User', currentUser.id);
    }
    
    // Delete session from database if it exists and is not a mock session
    if (sessionToken && !sessionToken.startsWith('mock_')) {
      try {
        await this.supabaseService.deleteSession(sessionToken);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
    
    await this.supabaseService.signOut();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Clear localStorage
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('currentUser');
    
    this.router.navigate(['/auth/login']);
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService.resetPassword(email);
      
      if (error) {
        return { success: false, error: (error as any)?.message || 'Password reset failed' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'An unexpected error occurred' };
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

  // Session management methods for admin use
  async getUserActiveSessions(userId: string) {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Only admins can view user sessions');
    }
    return await this.supabaseService.getUserActiveSessions(userId);
  }

  async forceLogoutUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Unauthorized: Only admins can force logout users' };
    }
    
    try {
      // Delete all sessions for the user
      const result = await this.supabaseService.deleteAllUserSessions(userId);
      
      if (result.error) {
        return { success: false, error: 'Failed to delete user sessions' };
      }
      
      // Log the action
      await this.logAuditAction('FORCE_LOGOUT', 'User', userId);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to force logout user' };
    }
  }

  async getCurrentSessionInfo() {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken || sessionToken.startsWith('mock_')) {
      return null;
    }
    
    try {
      const { data, error } = await this.supabaseService.validateSession(sessionToken);
      return error ? null : data;
    } catch (error) {
      return null;
    }
  }

  async extendCurrentSession(): Promise<{ success: boolean; error?: string }> {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken || sessionToken.startsWith('mock_')) {
      return { success: false, error: 'No valid session to extend' };
    }
    
    try {
      // Delete current session
      await this.supabaseService.deleteSession(sessionToken);
      
      // Create new session
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'No current user found' };
      }
      
      const { sessionToken: newToken, error } = await this.supabaseService.createUserSession(currentUser.id);
      
      if (error || !newToken) {
        return { success: false, error: 'Failed to create new session' };
      }
      
      // Update localStorage with new token
      localStorage.setItem('sessionToken', newToken);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to extend session' };
    }
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