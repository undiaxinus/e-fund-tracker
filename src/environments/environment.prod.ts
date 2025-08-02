export const environment = {
  production: true,
  supabaseUrl: 'https://xyzcompany.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0ODAwMCwiZXhwIjoxOTU4MTI0MDAwfQ.demo-key-for-development',
  apiUrl: 'https://your-api-domain.com/api',
  appName: 'E-Fund Tracker',
  appVersion: '1.0.0',
  maxFileSize: 10485760, // 10MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
};

// Note: For production deployment, replace the placeholder values above with actual environment variables
// or use a build-time replacement strategy.