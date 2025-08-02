import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';

interface SessionInfo {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  User?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-management-container">
      <div class="header">
        <h2>🔐 Active User Sessions</h2>
        <div class="actions">
          <button (click)="refreshSessions()" class="btn btn-secondary" [disabled]="isLoading()">
            {{ isLoading() ? 'Loading...' : '🔄 Refresh' }}
          </button>
          <button (click)="cleanupExpiredSessions()" class="btn btn-warning" [disabled]="isLoading()">
            🧹 Cleanup Expired
          </button>
        </div>
      </div>

      <div class="current-session" *ngIf="currentSessionInfo()">
        <h3>📱 Your Current Session</h3>
        <div class="session-card current">
          <div class="session-info">
            <p><strong>Session ID:</strong> {{ currentSessionInfo()?.id }}</p>
            <p><strong>Created:</strong> {{ currentSessionInfo()?.created_at ? formatDate(currentSessionInfo()!.created_at) : 'N/A' }}</p>
            <p><strong>Expires:</strong> {{ currentSessionInfo()?.expires_at ? formatDate(currentSessionInfo()!.expires_at) : 'N/A' }}</p>
          </div>
          <div class="session-actions">
            <button (click)="extendSession()" class="btn btn-primary">
              ⏰ Extend Session
            </button>
          </div>
        </div>
      </div>

      <div class="all-sessions">
        <h3>👥 All Active Sessions ({{ activeSessions().length }})</h3>
        
        <div class="sessions-grid" *ngIf="activeSessions().length > 0; else noSessions">
          <div class="session-card" *ngFor="let session of activeSessions()">
            <div class="session-header">
              <div class="user-info">
                <h4>{{ session.User?.first_name }} {{ session.User?.last_name }}</h4>
                <p class="email">{{ session.User?.email }}</p>
                <span class="role-badge" [class]="'role-' + session.User?.role?.toLowerCase()">
                  {{ session.User?.role }}
                </span>
              </div>
              <div class="session-status">
                <span class="status-badge active">🟢 Active</span>
              </div>
            </div>
            
            <div class="session-details">
              <div class="detail-row">
                <span class="label">Session ID:</span>
                <span class="value">{{ session.id.substring(0, 8) }}...</span>
              </div>
              <div class="detail-row">
                <span class="label">Created:</span>
                <span class="value">{{ formatDate(session.created_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Expires:</span>
                <span class="value">{{ formatDate(session.expires_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">{{ getSessionDuration(session.created_at) }}</span>
              </div>
            </div>
            
            <div class="session-actions">
              <button 
                (click)="forceLogoutUser(session.user_id, session.User?.email || 'Unknown')"
                class="btn btn-danger"
                [disabled]="isLoading()">
                🚪 Force Logout
              </button>
            </div>
          </div>
        </div>
        
        <ng-template #noSessions>
          <div class="no-sessions">
            <p>📭 No active sessions found</p>
          </div>
        </ng-template>
      </div>

      <div class="session-stats">
        <h3>📊 Session Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ activeSessions().length }}</div>
            <div class="stat-label">Active Sessions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getUniqueUsersCount() }}</div>
            <div class="stat-label">Unique Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getExpiringSoonCount() }}</div>
            <div class="stat-label">Expiring Soon</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-management-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .current-session {
      margin-bottom: 2rem;
    }

    .current-session h3 {
      color: #2196F3;
      margin-bottom: 1rem;
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .session-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .session-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .session-card.current {
      border: 2px solid #2196F3;
      background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .user-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .user-info .email {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.role-admin {
      background: #ff5722;
      color: white;
    }

    .role-badge.role-user {
      background: #4caf50;
      color: white;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .session-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0;
    }

    .detail-row .label {
      font-weight: 600;
      color: #555;
    }

    .detail-row .value {
      color: #333;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .session-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2196F3;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1976D2;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .btn-warning {
      background: #ff9800;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background: #f57c00;
    }

    .btn-danger {
      background: #f44336;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #d32f2f;
    }

    .no-sessions {
      text-align: center;
      padding: 3rem;
      color: #666;
      font-size: 1.1rem;
    }

    .session-stats {
      margin-top: 2rem;
    }

    .session-stats h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2196F3;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .session-management-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .sessions-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class SessionManagementComponent implements OnInit {
  activeSessions = signal<SessionInfo[]>([]);
  currentSessionInfo = signal<SessionInfo | null>(null);
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadCurrentSessionInfo();
    await this.loadAllActiveSessions();
  }

  async loadCurrentSessionInfo() {
    try {
      const sessionInfo = await this.authService.getCurrentSessionInfo();
      this.currentSessionInfo.set(sessionInfo);
    } catch (error) {
      console.error('Error loading current session info:', error);
    }
  }

  async loadAllActiveSessions() {
    this.isLoading.set(true);
    try {
      // Get all active sessions from database
      const { data, error } = await this.supabaseService.client
        .from('UserSession')
        .select(`
          *,
          User (
            first_name,
            last_name,
            email,
            role
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      this.activeSessions.set(data || []);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshSessions() {
    await this.loadAllActiveSessions();
    await this.loadCurrentSessionInfo();
  }

  async cleanupExpiredSessions() {
    this.isLoading.set(true);
    try {
      await this.supabaseService.cleanupExpiredSessions();
      await this.loadAllActiveSessions();
      alert('✅ Expired sessions cleaned up successfully!');
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      alert('❌ Error cleaning up expired sessions');
    } finally {
      this.isLoading.set(false);
    }
  }

  async forceLogoutUser(userId: string, userEmail: string) {
    if (!confirm(`Are you sure you want to force logout ${userEmail}? This will end all their active sessions.`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const result = await this.authService.forceLogoutUser(userId);
      
      if (result.success) {
        alert(`✅ ${userEmail} has been logged out successfully!`);
        await this.loadAllActiveSessions();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error forcing logout:', error);
      alert('❌ Error forcing user logout');
    } finally {
      this.isLoading.set(false);
    }
  }

  async extendSession() {
    this.isLoading.set(true);
    try {
      const result = await this.authService.extendCurrentSession();
      
      if (result.success) {
        alert('✅ Session extended successfully!');
        await this.loadCurrentSessionInfo();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error extending session:', error);
      alert('❌ Error extending session');
    } finally {
      this.isLoading.set(false);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSessionDuration(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getUniqueUsersCount(): number {
    const uniqueUsers = new Set(this.activeSessions().map(s => s.user_id));
    return uniqueUsers.size;
  }

  getExpiringSoonCount(): number {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return this.activeSessions().filter(s => 
      new Date(s.expires_at) <= oneHourFromNow
    ).length;
  }
}