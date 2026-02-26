#!/usr/bin/env node
/**
 * Add late registrations for 2026 tournament.
 * These players have relaxed age restrictions and some missing fields use placeholders.
 *
 * Run:  node scripts/add-late-registrations-2026.js
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

const registrations = [
  {
    // Yashika Namburi - Volleyball (age restriction relaxed, age 12)
    first_name: 'Yashika',
    last_name: 'Namburi',
    date_of_birth: '2013-08-16',
    registration_category: 'VOLLEYBALL_OPEN_MEN',
    registration_type: 'INDIVIDUAL',
    flat_number: 'H-204',
    paid_to: 'Vasu Chepuru',
    // Placeholders for missing required fields
    phone_number: 'N/A',
    height: 1.50,
    playing_positions: ['ANY_POSITION'],
    skill_level: 'RECREATIONAL_C',
    tshirt_number: 'TBD',
    tshirt_name: 'TBD',
    payment_upi_id: 'N/A',
    payment_transaction_id: 'N/A',
    is_verified: true,
    verified_by: 'Admin - Late Registration',
    verified_at: new Date().toISOString(),
    verification_notes: 'Late registration - age restriction relaxed, some fields pending',
  },
  {
    // Srilaya Bhagavatula - Throwball Women (age restriction relaxed, age 18)
    first_name: 'Srilaya',
    last_name: 'Bhagavatula',
    date_of_birth: '2007-04-29',
    registration_category: 'THROWBALL_WOMEN',
    registration_type: 'INDIVIDUAL',
    flat_number: 'C-1801',
    paid_to: 'Vasu Chepuru',
    tshirt_size: 'XL',
    tshirt_name: 'Laya',
    tshirt_number: '7',
    // Placeholders for missing required fields
    phone_number: 'N/A',
    height: 1.60,
    playing_positions: [],
    skill_level: 'RECREATIONAL_C',
    payment_upi_id: 'N/A',
    payment_transaction_id: 'N/A',
    is_verified: true,
    verified_by: 'Admin - Late Registration',
    verified_at: new Date().toISOString(),
    verification_notes: 'Late registration - age restriction relaxed, some fields pending',
  },
  {
    // Aarushi Kumari - Volleyball (age 17, qualifies normally)
    first_name: 'Aarushi',
    last_name: 'Kumari',
    date_of_birth: '2008-09-27',
    registration_category: 'VOLLEYBALL_OPEN_MEN',
    registration_type: 'INDIVIDUAL',
    flat_number: 'D-1706',
    phone_number: '7330652424',
    height: 1.70,
    last_played_date: 'NOT_PLAYED_SINCE_LAST_YEAR',
    skill_level: 'INTERMEDIATE_B',
    tshirt_size: 'XL',
    tshirt_name: 'Aarushi',
    tshirt_number: '9',
    paid_to: 'Vasu Chepuru',
    playing_positions: ['ANY_POSITION'],
    payment_upi_id: 'N/A',
    payment_transaction_id: 'N/A',
    is_verified: true,
    verified_by: 'Admin - Late Registration',
    verified_at: new Date().toISOString(),
    verification_notes: 'Late registration - payment received to Vasu',
  },
];

async function main() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey);

  console.log('Adding 3 late registrations to 2026 tournament...\n');

  for (const reg of registrations) {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert(reg)
      .select('id, first_name, last_name, registration_category')
      .single();

    if (error) {
      console.error(`FAILED: ${reg.first_name} ${reg.last_name} -`, error.message);
    } else {
      console.log(`OK: ${data.first_name} ${data.last_name} (${data.registration_category}) → id: ${data.id}`);
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
