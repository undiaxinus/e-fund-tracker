import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock data for demo purposes
  private mockDisbursements = [
    {
      id: '1',
      disbursement_no: 'DSB-2024-0001',
      payee: 'ABC Construction Corp.',
      amount: 150000.00,
      disbursement_date: '2024-01-15',
      description: 'Construction materials for building renovation',
      fund_source: 'General Fund',
      classification: 'CO',
      sub_classification: 'Infrastructure',
      department: 'Engineering',
      check_no: 'CHK-001',
      voucher_no: 'VCH-001',
      remarks: 'Approved by department head',
      status: 'ACTIVE',
      is_archived: false,
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T08:00:00Z',
      created_by: { first_name: 'John', last_name: 'Doe' },
      updated_by: { first_name: 'John', last_name: 'Doe' }
    },
    {
      id: '2',
      disbursement_no: 'DSB-2024-0002',
      payee: 'Office Supplies Inc.',
      amount: 25000.00,
      disbursement_date: '2024-01-16',
      description: 'Office supplies and equipment',
      fund_source: 'Operating Fund',
      classification: 'MOOE',
      sub_classification: 'Office Supplies',
      department: 'Administration',
      check_no: 'CHK-002',
      voucher_no: 'VCH-002',
      remarks: 'Monthly office supplies',
      status: 'ACTIVE',
      is_archived: false,
      created_at: '2024-01-16T09:00:00Z',
      updated_at: '2024-01-16T09:00:00Z',
      created_by: { first_name: 'Jane', last_name: 'Smith' },
      updated_by: { first_name: 'Jane', last_name: 'Smith' }
    },
    {
      id: '3',
      disbursement_no: 'DSB-2024-0003',
      payee: 'John A. Dela Cruz',
      amount: 45000.00,
      disbursement_date: '2024-01-17',
      description: 'Salary payment for January 2024',
      fund_source: 'Personnel Fund',
      classification: 'PS',
      sub_classification: 'Regular Salary',
      department: 'Finance',
      check_no: 'CHK-003',
      voucher_no: 'VCH-003',
      remarks: 'Regular monthly salary',
      status: 'ACTIVE',
      is_archived: false,
      created_at: '2024-01-17T10:00:00Z',
      updated_at: '2024-01-17T10:00:00Z',
      created_by: { first_name: 'Admin', last_name: 'User' },
      updated_by: { first_name: 'Admin', last_name: 'User' }
    }
  ];

  constructor() {
    // Initialize Supabase client
    if (environment.supabaseUrl !== 'YOUR_SUPABASE_URL' && environment.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
      );

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.currentUserSubject.next(session?.user ?? null);
      });
      
      console.log('Supabase client initialized successfully');
    } else {
      console.warn('Supabase not configured - please update environment variables');
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get user(): User | null {
    return this.currentUserSubject.value;
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    if (!this.supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signUp(email: string, password: string, userData: any) {
    if (!this.supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  }

  async signOut() {
    if (!this.supabase) {
      return { error: { message: 'Supabase not configured' } };
    }
    
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async resetPassword(email: string) {
    if (!this.supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }

  // Database operations for Users
  async getUsers() {
    const { data, error } = await this.supabase
      .from('User')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('User')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  async createUser(userData: any) {
    // Hash the password before saving
    if (userData.password_hash) {
      const saltRounds = 10;
      userData.password_hash = await bcrypt.hash(userData.password_hash, saltRounds);
    }
    
    const { data, error } = await this.supabase
      .from('User')
      .insert([userData])
      .select()
      .single();
    return { data, error };
  }

  async updateUser(id: string, userData: any) {
    // Hash the password if it's being updated
    if (userData.password_hash) {
      const saltRounds = 10;
      userData.password_hash = await bcrypt.hash(userData.password_hash, saltRounds);
    }
    
    const { data, error } = await this.supabase
      .from('User')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async deleteUser(id: string) {
    const { data, error } = await this.supabase
      .from('User')
      .delete()
      .eq('id', id);
    return { data, error };
  }

  // Password verification method
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user by email for authentication
  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }

  // UserSession management methods
  async createUserSession(userId: string): Promise<{ data: any; error: any; sessionToken?: string }> {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const { data, error } = await this.supabase
      .from('UserSession')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    return { data, error, sessionToken };
  }

  async validateSession(sessionToken: string) {
    const { data, error } = await this.supabase
      .from('UserSession')
      .select(`
        *,
        User (
          id,
          email,
          first_name,
          last_name,
          role,
          permission,
          department,
          is_active
        )
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    return { data, error };
  }

  async deleteSession(sessionToken: string) {
    const { data, error } = await this.supabase
      .from('UserSession')
      .delete()
      .eq('session_token', sessionToken);
    
    return { data, error };
  }

  async deleteAllUserSessions(userId: string) {
    const { error } = await this.supabase
      .from('UserSession')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting user sessions:', error);
      throw error;
    }
    
    return { error };
  }

  async cleanupExpiredSessions() {
    const { error } = await this.supabase
      .from('UserSession')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
    
    return { error };
  }

  async getUserActiveSessions(userId: string) {
    const { data, error } = await this.supabase
      .from('UserSession')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  // Database operations for Disbursements
  async getDisbursements(filters?: any) {
    if (!this.supabase) {
      // Fallback to mock data if Supabase not configured
      let filteredData = [...this.mockDisbursements];
      
      if (filters) {
        if (filters.classification) {
          filteredData = filteredData.filter(d => d.classification === filters.classification);
        }
        if (filters.department) {
          filteredData = filteredData.filter(d => d.department === filters.department);
        }
        if (filters.dateFrom) {
          filteredData = filteredData.filter(d => d.disbursement_date >= filters.dateFrom);
        }
        if (filters.dateTo) {
          filteredData = filteredData.filter(d => d.disbursement_date <= filters.dateTo);
        }
        if (filters.status) {
          filteredData = filteredData.filter(d => d.status === filters.status);
        }
        if (filters.limit) {
          filteredData = filteredData.slice(0, filters.limit);
        }
      }
      
      filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { data: filteredData, error: null };
    }
    
    let query = this.supabase
      .from('disbursements')
      .select(`
        *,
        created_by:users!disbursements_created_by_id_fkey(first_name, last_name),
        updated_by:users!disbursements_updated_by_id_fkey(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.classification) {
        query = query.eq('classification', filters.classification);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.dateFrom) {
        query = query.gte('disbursement_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('disbursement_date', filters.dateTo);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    const { data, error } = await query;
    return { data, error };
  }

  async getDisbursementById(id: string) {
    const { data, error } = await this.supabase
      .from('disbursements')
      .select(`
        *,
        created_by:users!disbursements_created_by_id_fkey(first_name, last_name),
        updated_by:users!disbursements_updated_by_id_fkey(first_name, last_name),
        attachments:disbursement_attachments(*)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  }

  async createDisbursement(disbursementData: any) {
    const { data, error } = await this.supabase
      .from('disbursements')
      .insert([disbursementData])
      .select()
      .single();
    return { data, error };
  }

  async updateDisbursement(id: string, disbursementData: any) {
    const { data, error } = await this.supabase
      .from('disbursements')
      .update(disbursementData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async deleteDisbursement(id: string) {
    const { data, error } = await this.supabase
      .from('disbursements')
      .delete()
      .eq('id', id);
    return { data, error };
  }

  // Audit Log operations
  async createAuditLog(auditData: any) {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .insert([auditData]);
    return { data, error };
  }

  async getAuditLogs(filters?: any) {
    let query = this.supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(first_name, last_name, email)
      `)
      .order('timestamp', { ascending: false });

    if (filters) {
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
    }

    const { data, error } = await query;
    return { data, error };
  }

  // Report operations
  async createReport(reportData: any) {
    const { data, error } = await this.supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
    return { data, error };
  }

  async getReports() {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Dashboard statistics
  async getDashboardStats() {
    if (!this.supabase) {
      // Fallback to mock data if Supabase not configured
      const activeDisbursements = this.mockDisbursements.filter(d => d.status === 'ACTIVE');
      
      const totalDisbursements = activeDisbursements.map(d => ({ amount: d.amount }));
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyDisbursements = activeDisbursements
        .filter(d => {
          const disbursementDate = new Date(d.disbursement_date);
          return disbursementDate.getMonth() === currentMonth && disbursementDate.getFullYear() === currentYear;
        })
        .map(d => ({ amount: d.amount }));
      
      const classificationStats = activeDisbursements.map(d => ({
        classification: d.classification,
        amount: d.amount
      }));
      
      return {
        totalDisbursements,
        monthlyDisbursements,
        classificationStats,
        errors: { totalError: null, monthlyError: null, classError: null }
      };
    }
    
    const { data: totalDisbursements, error: totalError } = await this.supabase
      .from('disbursements')
      .select('amount', { count: 'exact' })
      .eq('status', 'ACTIVE');

    const { data: monthlyDisbursements, error: monthlyError } = await this.supabase
      .from('disbursements')
      .select('amount')
      .eq('status', 'ACTIVE')
      .gte('disbursement_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const { data: classificationStats, error: classError } = await this.supabase
      .from('disbursements')
      .select('classification, amount')
      .eq('status', 'ACTIVE');

    return {
      totalDisbursements,
      monthlyDisbursements,
      classificationStats,
      errors: { totalError, monthlyError, classError }
    };
  }

  // File upload operations
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  }

  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  }

  async deleteFile(bucket: string, path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  }

  getFileUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
}