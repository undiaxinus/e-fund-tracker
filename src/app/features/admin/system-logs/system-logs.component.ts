import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'auth' | 'data' | 'system' | 'user' | 'security';
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  sessionId?: string;
}

interface LogSummary {
  totalLogs: number;
  byLevel: {
    info: number;
    warning: number;
    error: number;
    debug: number;
  };
  byCategory: {
    auth: number;
    data: number;
    system: number;
    user: number;
    security: number;
  };
  recentActivity: {
    lastHour: number;
    last24Hours: number;
    lastWeek: number;
  };
}

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.css']
})
export class SystemLogsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  // Reactive state
  logs = signal<SystemLog[]>([]);
  summary = signal<LogSummary | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isExporting = signal(false);
  selectedLog = signal<SystemLog | null>(null);

  // Form controls
  searchControl = new FormControl('');
  levelFilter = new FormControl('');
  categoryFilter = new FormControl('');
  dateFromFilter = new FormControl('');
  dateToFilter = new FormControl('');
  userFilter = new FormControl('');

  // Computed properties
  filteredLogs = computed(() => {
    const logs = this.logs();
    const search = this.searchControl.value?.toLowerCase() || '';
    const level = this.levelFilter.value || '';
    const category = this.categoryFilter.value || '';
    const dateFrom = this.dateFromFilter.value;
    const dateTo = this.dateToFilter.value;
    const user = this.userFilter.value?.toLowerCase() || '';

    return logs.filter(log => {
      const matchesSearch = !search || 
        log.action.toLowerCase().includes(search) ||
        log.description.toLowerCase().includes(search) ||
        (log.userName && log.userName.toLowerCase().includes(search));
      
      const matchesLevel = !level || log.level === level;
      const matchesCategory = !category || log.category === category;
      const matchesUser = !user || (log.userName && log.userName.toLowerCase().includes(user));
      
      const matchesDateRange = (!dateFrom || new Date(log.timestamp) >= new Date(dateFrom)) &&
                              (!dateTo || new Date(log.timestamp) <= new Date(dateTo));
      
      return matchesSearch && matchesLevel && matchesCategory && matchesUser && matchesDateRange;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  ngOnInit() {
    this.loadLogs();
    this.loadSummary();
  }

  async loadLogs() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Mock data for demonstration
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          level: 'info',
          category: 'auth',
          action: 'User Login',
          description: 'User successfully logged into the system',
          userId: 'user123',
          userName: 'John Doe',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_abc123'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          level: 'warning',
          category: 'security',
          action: 'Failed Login Attempt',
          description: 'Multiple failed login attempts detected',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { attempts: 3, lastAttempt: '2024-12-30T10:30:00Z' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          level: 'info',
          category: 'data',
          action: 'Disbursement Created',
          description: 'New disbursement record created',
          userId: 'user456',
          userName: 'Jane Smith',
          ipAddress: '192.168.1.102',
          details: { disbursementId: 'disb_789', amount: 50000, classification: 'PS' }
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          level: 'error',
          category: 'system',
          action: 'Database Connection Error',
          description: 'Failed to connect to database server',
          details: { error: 'Connection timeout', duration: '30s', retries: 3 }
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          level: 'info',
          category: 'user',
          action: 'User Profile Updated',
          description: 'User profile information was updated',
          userId: 'user789',
          userName: 'Mike Johnson',
          ipAddress: '192.168.1.103',
          details: { fields: ['email', 'department'], previousEmail: 'old@example.com' }
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          level: 'warning',
          category: 'data',
          action: 'Data Validation Warning',
          description: 'Invalid data format detected during import',
          userId: 'user456',
          userName: 'Jane Smith',
          details: { file: 'disbursements_dec.csv', line: 45, issue: 'Invalid date format' }
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          level: 'info',
          category: 'auth',
          action: 'User Logout',
          description: 'User logged out of the system',
          userId: 'user123',
          userName: 'John Doe',
          sessionId: 'sess_abc123'
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          level: 'error',
          category: 'security',
          action: 'Unauthorized Access Attempt',
          description: 'Attempt to access restricted resource without proper permissions',
          userId: 'user999',
          userName: 'Unknown User',
          ipAddress: '192.168.1.200',
          details: { resource: '/admin/users', method: 'GET', status: 403 }
        }
      ];

      this.logs.set(mockLogs);
    } catch (err) {
      this.error.set('Failed to load system logs. Please try again.');
      console.error('Error loading logs:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSummary() {
    try {
      const logs = this.logs();
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const summary: LogSummary = {
        totalLogs: logs.length,
        byLevel: {
          info: logs.filter(l => l.level === 'info').length,
          warning: logs.filter(l => l.level === 'warning').length,
          error: logs.filter(l => l.level === 'error').length,
          debug: logs.filter(l => l.level === 'debug').length
        },
        byCategory: {
          auth: logs.filter(l => l.category === 'auth').length,
          data: logs.filter(l => l.category === 'data').length,
          system: logs.filter(l => l.category === 'system').length,
          user: logs.filter(l => l.category === 'user').length,
          security: logs.filter(l => l.category === 'security').length
        },
        recentActivity: {
          lastHour: logs.filter(l => new Date(l.timestamp) >= oneHourAgo).length,
          last24Hours: logs.filter(l => new Date(l.timestamp) >= oneDayAgo).length,
          lastWeek: logs.filter(l => new Date(l.timestamp) >= oneWeekAgo).length
        }
      };

      this.summary.set(summary);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }

  viewLogDetails(log: SystemLog) {
    this.selectedLog.set(log);
  }

  closeLogDetails() {
    this.selectedLog.set(null);
  }

  async exportLogs(format: 'csv' | 'json') {
    this.isExporting.set(true);
    
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const logs = this.filteredLogs();
      const filename = `system-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'csv') {
        // In a real app, generate CSV content
        alert(`Exporting ${logs.length} logs to ${filename}`);
      } else {
        // In a real app, generate JSON content
        alert(`Exporting ${logs.length} logs to ${filename}`);
      }
    } catch (err) {
      alert('Failed to export logs. Please try again.');
      console.error('Error exporting logs:', err);
    } finally {
      this.isExporting.set(false);
    }
  }

  clearOldLogs() {
    if (confirm('Are you sure you want to clear logs older than 30 days? This action cannot be undone.')) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const filteredLogs = this.logs().filter(log => new Date(log.timestamp) >= thirtyDaysAgo);
      this.logs.set(filteredLogs);
      this.loadSummary();
      alert('Old logs have been cleared successfully.');
    }
  }

  refreshLogs() {
    this.loadLogs();
    this.loadSummary();
  }

  getLevelIcon(level: string): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🐛';
      default: return '📝';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'auth': return '🔐';
      case 'data': return '📊';
      case 'system': return '⚙️';
      case 'user': return '👤';
      case 'security': return '🛡️';
      default: return '📄';
    }
  }

  getLevelClass(level: string): string {
    return `level-${level}`;
  }

  getCategoryClass(category: string): string {
    return `category-${category}`;
  }

  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString();
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}