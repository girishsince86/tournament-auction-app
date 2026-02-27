#!/usr/bin/env node
/**
 * Register Sreyas Nimmani for Throwball Under 12 (2026 tournament).
 *
 * Run:  node scripts/register-sreyas-tb-u12.js
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const registration = {
  first_name: 'Sreyas',
  last_name: 'Nimmani',
  phone_number: '7981865883',
  flat_number: 'M-1805',
  date_of_birth: '2017-02-28',
  registration_category: 'THROWBALL_8_12_MIXED',
  registration_type: 'INDIVIDUAL',
  tshirt_size: 'S',
  tshirt_name: 'Pandu',
  tshirt_number: '7',
  // Required fields - placeholders for late registration
  height: 1.30,
  playing_positions: ['ANY_POSITION'],
  skill_level: 'RECREATIONAL_C',
  payment_upi_id: 'N/A',
  payment_transaction_id: 'N/A',
  paid_to: 'N/A',
  // Auto-verify
  is_verified: true,
  verified_by: 'Admin - Late Registration',
  verified_at: new Date().toISOString(),
  verification_notes: 'Late registration - TB Under 12',
};

async function main() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey);

  console.log('Registering Sreyas Nimmani for TB Under 12...\n');

  const { data, error } = await supabase
    .from('tournament_registrations')
    .insert(registration)
    .select('id, first_name, last_name, registration_category, tshirt_name, tshirt_number')
    .single();

  if (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }

  console.log(`OK: ${data.first_name} ${data.last_name}`);
  console.log(`  Category: ${data.registration_category}`);
  console.log(`  Jersey: ${data.tshirt_name} #${data.tshirt_number}`);
  console.log(`  ID: ${data.id}`);
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
