#!/usr/bin/env node
/**
 * Fix VB player base prices:
 *   Marquee  = 5 Cr (50,000,000)
 *   Capped   = 3 Cr (30,000,000)
 *   Uncapped = 1 Cr (10,000,000)
 *
 * Run: node scripts/fix-vb-base-prices.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
  }
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const CATS = {
  'b9be303c-dc13-4c27-9633-8297c1980ab5': 'Capped',
  '2a83f3f1-4d4f-4882-911e-ffd8d0350c54': 'Marquee',
  '5c9b7688-25fd-4bba-a36b-869ea948b023': 'Uncapped',
};

const TARGET = {
  Marquee:  50000000,  // 5 Cr
  Capped:   30000000,  // 3 Cr
  Uncapped: 10000000,  // 1 Cr
};

async function main() {
  // 1. Audit current state
  const { data: players, error } = await supabase
    .from('players')
    .select('id, name, base_price, category_id')
    .eq('sport_category', 'VOLLEYBALL_OPEN_MEN')
    .order('name');

  if (error) { console.error(error.message); process.exit(1); }

  console.log('VB Players: ' + players.length + ' total\n');

  let totalWrong = 0;

  for (const cat of ['Marquee', 'Capped', 'Uncapped']) {
    const catId = Object.entries(CATS).find(([, v]) => v === cat)[0];
    const inCat = players.filter(p => p.category_id === catId);
    const wrong = inCat.filter(p => p.base_price !== TARGET[cat]);
    const prices = [...new Set(inCat.map(p => p.base_price))];

    console.log(cat + ': ' + inCat.length + ' players, prices: ' + prices.map(p => (p / 10000000) + ' Cr').join(', '));

    if (wrong.length > 0) {
      totalWrong += wrong.length;
      wrong.forEach(p => {
        console.log('  FIX: ' + p.name + ' ' + (p.base_price / 10000000) + ' Cr -> ' + (TARGET[cat] / 10000000) + ' Cr');
      });
    }
  }

  if (totalWrong === 0) {
    console.log('\nAll base prices are correct. Nothing to update.');
    return;
  }

  // 2. Update each category
  console.log('\nUpdating ' + totalWrong + ' players...\n');

  for (const cat of ['Marquee', 'Capped', 'Uncapped']) {
    const catId = Object.entries(CATS).find(([, v]) => v === cat)[0];

    const { data, error: upErr } = await supabase
      .from('players')
      .update({ base_price: TARGET[cat] })
      .eq('sport_category', 'VOLLEYBALL_OPEN_MEN')
      .eq('category_id', catId)
      .neq('base_price', TARGET[cat])
      .select('id, name, base_price');

    if (upErr) {
      console.error('Error updating ' + cat + ':', upErr.message);
      continue;
    }

    if (data.length > 0) {
      console.log(cat + ': updated ' + data.length + ' players to ' + (TARGET[cat] / 10000000) + ' Cr');
      data.forEach(p => console.log('  ' + p.name));
    }
  }

  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
