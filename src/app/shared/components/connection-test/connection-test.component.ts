import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { environment } from '../../../../environments/environment';

interface ConnectionStatus {
  supabaseConfigured: boolean;
  connectionWorking: boolean;
  error?: string;
  details: {
    url: string;
    hasKey: boolean;
    clientInitialized: boolean;
  };
}

@Component({
  selector: 'app-connection-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-test-container">
      <div class="card">
        <div class="card-header">
          <h3>🔗 Supabase Connection Test</h3>
        </div>
        <div class="card-body">
          <div class="status-item">
            <span class="label">Configuration Status:</span>
            <span class="status" [class]="status.supabaseConfigured ? 'success' : 'error'">
              {{ status.supabaseConfigured ? '✅ Configured' : '❌ Not Configured' }}
            </span>
          </div>
          
          <div class="status-item">
            <span class="label">Connection Status:</span>
            <span class="status" [class]="status.connectionWorking ? 'success' : 'error'">
              {{ status.connectionWorking ? '✅ Working' : '❌ Failed' }}
            </span>
          </div>
          
          <div class="details">
            <h4>Configuration Details:</h4>
            <ul>
              <li><strong>Supabase URL:</strong> {{ status.details.url }}</li>
              <li><strong>API Key Present:</strong> {{ status.details.hasKey ? 'Yes' : 'No' }}</li>
              <li><strong>Client Initialized:</strong> {{ status.details.clientInitialized ? 'Yes' : 'No' }}</li>
            </ul>
          </div>
          
          <div *ngIf="status.error" class="error-message">
            <h4>Error Details:</h4>
            <p>{{ status.error }}</p>
          </div>
          
          <div class="actions">
            <button (click)="testConnection()" class="btn btn-primary" [disabled]="testing">
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <button (click)="testAuth()" class="btn btn-secondary" [disabled]="testing">
              {{ testing ? 'Testing...' : 'Test Authentication' }}
            </button>
          </div>
          
          <div *ngIf="testResults.length > 0" class="test-results">
            <h4>Test Results:</h4>
            <div *ngFor="let result of testResults" class="test-result" [class]="result.success ? 'success' : 'error'">
              <strong>{{ result.test }}:</strong> {{ result.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connection-test-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card-header {
      background: #f8f9fa;
      padding: 15px 20px;
      border-bottom: 1px solid #ddd;
    }
    
    .card-header h3 {
      margin: 0;
      color: #333;
    }
    
    .card-body {
      padding: 20px;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .label {
      font-weight: 600;
      color: #555;
    }
    
    .status.success {
      color: #28a745;
      font-weight: 600;
    }
    
    .status.error {
      color: #dc3545;
      font-weight: 600;
    }
    
    .details {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .details h4 {
      margin-top: 0;
      color: #333;
    }
    
    .details ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .details li {
      margin-bottom: 5px;
    }
    
    .error-message {
      margin: 20px 0;
      padding: 15px;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      color: #721c24;
    }
    
    .actions {
      margin: 20px 0;
      display: flex;
      gap: 10px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }
    
    .test-results {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .test-result {
      padding: 8px 12px;
      margin: 5px 0;
      border-radius: 4px;
    }
    
    .test-result.success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
    
    .test-result.error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
  `]
})
export class ConnectionTestComponent implements OnInit {
  status: ConnectionStatus = {
    supabaseConfigured: false,
    connectionWorking: false,
    details: {
      url: '',
      hasKey: false,
      clientInitialized: false
    }
  };
  
  testing = false;
  testResults: Array<{test: string, success: boolean, message: string}> = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.checkConfiguration();
  }

  private checkConfiguration() {
    // Check if Supabase is configured
    const isConfigured = environment.supabaseUrl !== 'YOUR_SUPABASE_URL' && 
                        environment.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
                        environment.supabaseUrl.includes('supabase.co');
    
    this.status = {
      supabaseConfigured: isConfigured,
      connectionWorking: false,
      details: {
        url: environment.supabaseUrl,
        hasKey: environment.supabaseAnonKey.length > 20,
        clientInitialized: !!this.supabaseService.client
      }
    };
    
    if (!isConfigured) {
      this.status.error = 'Supabase URL or API key not properly configured. Please check your environment.ts file.';
    }
  }

  async testConnection() {
    this.testing = true;
    this.testResults = [];
    
    try {
      // Test 1: Check if client exists
      if (!this.supabaseService.client) {
        this.testResults.push({
          test: 'Client Initialization',
          success: false,
          message: 'Supabase client not initialized'
        });
        this.testing = false;
        return;
      }
      
      this.testResults.push({
        test: 'Client Initialization',
        success: true,
        message: 'Supabase client initialized successfully'
      });
      
      // Test 2: Try to fetch users (this will test database connection)
      const { data, error } = await this.supabaseService.getUsers();
      
      if (error) {
        this.testResults.push({
          test: 'Database Connection',
          success: false,
          message: `Database error: ${error.message}`
        });
        this.status.connectionWorking = false;
        this.status.error = error.message;
      } else {
        this.testResults.push({
          test: 'Database Connection',
          success: true,
          message: `Successfully connected to database. Found ${data?.length || 0} users.`
        });
        this.status.connectionWorking = true;
        this.status.error = undefined;
      }
      
    } catch (error: any) {
      this.testResults.push({
        test: 'Connection Test',
        success: false,
        message: `Unexpected error: ${error.message}`
      });
      this.status.connectionWorking = false;
      this.status.error = error.message;
    }
    
    this.testing = false;
  }

  async testAuth() {
    this.testing = true;
    
    try {
      // Test authentication with invalid credentials (should fail gracefully)
      const { data, error } = await this.supabaseService.signIn('test@test.com', 'invalid');
      
      if (error) {
        // This is expected - we're testing if auth endpoint is reachable
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          this.testResults.push({
            test: 'Authentication Endpoint',
            success: true,
            message: 'Authentication endpoint is reachable (expected auth failure with test credentials)'
          });
        } else {
          this.testResults.push({
            test: 'Authentication Endpoint',
            success: false,
            message: `Auth endpoint error: ${error.message}`
          });
        }
      } else {
        this.testResults.push({
          test: 'Authentication Endpoint',
          success: true,
          message: 'Authentication endpoint is working'
        });
      }
      
    } catch (error: any) {
      this.testResults.push({
        test: 'Authentication Test',
        success: false,
        message: `Auth test error: ${error.message}`
      });
    }
    
    this.testing = false;
  }
}