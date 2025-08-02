const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment configuration
const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
let envContent;

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Cannot read environment.ts file:', error.message);
  process.exit(1);
}

// Extract Supabase URL and key from environment file
const urlMatch = envContent.match(/supabaseUrl:\s*['"]([^'"]+)['"]/);;
const keyMatch = envContent.match(/supabaseAnonKey:\s*['"]([^'"]+)['"]/);;

if (!urlMatch || !keyMatch) {
  console.error('❌ Cannot find Supabase URL or key in environment.ts');
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

console.log('🔍 Supabase Connection Test');
console.log('=' .repeat(50));
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);
console.log('');

// Check if configuration looks valid
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('❌ Supabase not configured properly!');
  console.log('\n📝 To fix this:');
  console.log('1. Go to https://app.supabase.com');
  console.log('2. Create or select your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the Project URL and anon/public key');
  console.log('5. Update src/environments/environment.ts');
  process.exit(1);
}

if (!supabaseUrl.includes('supabase.co')) {
  console.warn('⚠️  URL doesn\'t look like a Supabase URL');
}

// Test connection
async function testConnection() {
  try {
    console.log('🔄 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client created successfully');
    
    console.log('\n🔄 Testing database connection...');
    const { data, error } = await supabase
      .from('User')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      
      if (error.message.includes('relation "User" does not exist')) {
        console.log('\n📝 Database schema not set up:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Run the SQL files in the sql/ folder:');
        console.log('   - database_schema.sql');
        console.log('   - create_admin_account.sql');
        console.log('   - fix_rls_auth.sql');
      } else if (error.message.includes('JWT')) {
        console.log('\n📝 Authentication issue:');
        console.log('1. Check if your API key is correct');
        console.log('2. Make sure RLS policies are set up properly');
        console.log('3. Run fix_rls_auth.sql in your Supabase SQL Editor');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Users table accessible (count query worked)`);
    
    console.log('\n🔄 Testing authentication endpoint...');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'invalid'
    });
    
    if (authError) {
      if (authError.message.includes('Invalid login credentials') || 
          authError.message.includes('Email not confirmed')) {
        console.log('✅ Authentication endpoint is working (expected failure with test credentials)');
      } else {
        console.warn('⚠️  Authentication endpoint issue:', authError.message);
      }
    } else {
      console.log('✅ Authentication endpoint is working');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n📝 Network issue:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the Supabase URL is correct');
      console.log('3. Check if there are any firewall restrictions');
    }
    
    return false;
  }
}

// Run the test
testConnection().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 Supabase connection test PASSED!');
    console.log('\n✅ Your configuration is working correctly.');
    console.log('\n🚀 You can now:');
    console.log('   • Start the Angular app: ng serve');
    console.log('   • Visit http://localhost:4200/connection-test for UI test');
    console.log('   • Try logging in with admin credentials');
  } else {
    console.log('💥 Supabase connection test FAILED!');
    console.log('\n📖 Check the error messages above for troubleshooting steps.');
    console.log('\n📚 Additional resources:');
    console.log('   • Supabase docs: https://supabase.com/docs');
    console.log('   • Setup guide: SUPABASE_SETUP.md');
  }
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});