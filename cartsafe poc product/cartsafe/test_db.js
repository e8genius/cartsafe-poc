import pg from 'pg';
const { Client } = pg;

async function testConnection(connectionString) {
  console.log(`Testing: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log('SUCCESS!');
    const res = await client.query('SELECT version();');
    console.log(res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error('FAILED:', err.message);
    return false;
  }
}

async function run() {
  // Test direct connection via pooler host on port 5432
  await testConnection("postgres://postgres.umesnhzuglbgcvuvftwn:CartSafeSecurePass2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres");
  
  // Test pooler connection on port 6543
  await testConnection("postgres://postgres.umesnhzuglbgcvuvftwn:CartSafeSecurePass2026!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres");
}

run();
