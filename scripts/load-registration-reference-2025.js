#!/usr/bin/env node
/**
 * Load tournament-registrations-2025-02-28.csv into registration_reference_2025 table.
 * Run migration 20250203000000 first, then:
 *   node scripts/load-registration-reference-2025.js
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local for inserts.
 */

const fs = require('fs');
const path = require('path');

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

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ',') {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function normalizePhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits || raw;
}

function parseDate(val) {
  if (!val) return null;
  const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

const csvPath = path.join(__dirname, '..', 'tournament-registrations-2025-02-28.csv');
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath);
  process.exit(1);
}

const csvText = fs.readFileSync(csvPath, 'utf8');
const lines = csvText.split(/\r?\n/).filter(l => l.trim());
const header = parseCsvLine(lines[0]);
const rows = lines.slice(1).map(l => parseCsvLine(l));

const col = (arr, name) => {
  const i = header.indexOf(name);
  return i >= 0 ? (arr[i] || '').trim() : '';
};

async function main() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey);

  const records = [];
  for (const row of rows) {
    const first_name = col(row, 'First Name');
    const last_name = col(row, 'Last Name');
    const email = col(row, 'Email');
    const phone_raw = col(row, 'Phone');
    const phone_number = normalizePhone(phone_raw) || phone_raw;
    if (!first_name && !last_name && !phone_number) continue;

    const category = col(row, 'Category');
    const jersey_size = col(row, 'Jersey Size');
    const jersey_number = col(row, 'Jersey #');
    const dob = parseDate(col(row, 'Date of Birth'));

    records.push({
      source_year: 2025,
      first_name: first_name || '—',
      last_name: last_name || '—',
      email: email || null,
      phone_number: phone_number || '—',
      date_of_birth: dob || null,
      category: category || 'VOLLEYBALL_OPEN_MEN',
      jersey_size: jersey_size || null,
      jersey_number: jersey_number || null,
    });
  }

  console.log('Inserting', records.length, 'reference rows...');
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const chunk = records.slice(i, i + BATCH);
    const { error } = await supabase.from('registration_reference_2025').insert(chunk);
    if (error) {
      console.error('Insert error:', error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    process.stdout.write('\r' + inserted + '/' + records.length);
  }
  console.log('\nDone. Loaded', inserted, 'rows into registration_reference_2025.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
