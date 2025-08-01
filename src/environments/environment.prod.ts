export const environment = {
  production: true,
  supabaseUrl: 'YOUR_PRODUCTION_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_PRODUCTION_SUPABASE_ANON_KEY',
  apiUrl: 'https://your-api-domain.com/api',
  appName: 'E-Fund Tracker',
  appVersion: '1.0.0',
  maxFileSize: 10485760, // 10MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
};

// Note: For production deployment, replace the placeholder values above with actual environment variables
// or use a build-time replacement strategy.