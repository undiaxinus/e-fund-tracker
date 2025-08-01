export const environment = {
  production: true,
  supabaseUrl: process.env['SUPABASE_URL'] || 'YOUR_PRODUCTION_SUPABASE_URL',
  supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || 'YOUR_PRODUCTION_SUPABASE_ANON_KEY',
  apiUrl: process.env['API_URL'] || 'https://your-api-domain.com/api',
  appName: process.env['APP_NAME'] || 'E-Fund Tracker',
  appVersion: process.env['APP_VERSION'] || '1.0.0',
  maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'),
  allowedFileTypes: process.env['ALLOWED_FILE_TYPES']?.split(',') || ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
};