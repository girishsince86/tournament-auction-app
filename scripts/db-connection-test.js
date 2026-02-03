#!/usr/bin/env node
/**
 * Database connection test for Supabase.
 * Loads .env.local and runs a simple query. Run from project root:
 *   node scripts/db-connection-test.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local from project root
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) {
      const value = match[2].replace(/^["']|["']$/g, '').trim();
      process.env[match[1]] = value;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('Set them in .env.local or the environment.');
  process.exit(1);
}

async function testConnection() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, anonKey);

  console.log('Testing Supabase connection...');
  const start = Date.now();

  try {
    const { data, error } = await supabase.from('tournaments').select('id').limit(1);
    const ms = Date.now() - start;

    if (error) {
      console.error('Connection failed:', error.message);
      if (error.code) console.error('Code:', error.code);
      process.exit(1);
    }

    console.log('OK – connected in', ms, 'ms');
    console.log('Sample query (tournaments):', data?.length !== undefined ? `${data.length} row(s)` : 'ok');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testConnection();
