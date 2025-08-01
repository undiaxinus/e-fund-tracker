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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

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