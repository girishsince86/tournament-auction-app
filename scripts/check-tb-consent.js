const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase
    .from('players')
    .select('name, registration_data, sport_category')
    .eq('sport_category', 'THROWBALL_WOMEN');

  if (error) { console.error(error.message); return; }

  const counts = {};
  const noConsent = [];
  for (const r of data) {
    const consent = r.registration_data?.consent_choice || 'NONE';
    counts[consent] = (counts[consent] || 0) + 1;
    if (consent !== 'AUCTION_POOL') {
      noConsent.push(r.name + ' -> ' + consent);
    }
  }
  console.log('Consent breakdown for TB Women (' + data.length + ' total):');
  console.log(JSON.stringify(counts, null, 2));
  if (noConsent.length) {
    console.log('\nPlayers WITHOUT auction consent:');
    noConsent.forEach(n => console.log('  ' + n));
  } else {
    console.log('\nAll TB women have AUCTION_POOL consent.');
  }
})();
