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
  // Registration counts by category
  const { data: regs } = await supabase
    .from('tournament_registrations')
    .select('registration_category, is_verified')
    .eq('is_verified', true);

  const regCounts = {};
  for (const r of regs) {
    regCounts[r.registration_category] = (regCounts[r.registration_category] || 0) + 1;
  }
  console.log('Verified registrations by category:');
  console.log(JSON.stringify(regCounts, null, 2));

  // Players table counts by sport_category
  const { data: players } = await supabase
    .from('players')
    .select('sport_category');

  const playerCounts = {};
  for (const p of players) {
    const cat = p.sport_category || 'NULL';
    playerCounts[cat] = (playerCounts[cat] || 0) + 1;
  }
  console.log('\nPlayers table by sport_category:');
  console.log(JSON.stringify(playerCounts, null, 2));

  // Consent data for all TB categories
  const { data: consents } = await supabase
    .from('auction_consent')
    .select('consent_choice, registration_id');

  // Match consents to registrations
  const regMap = {};
  for (const r of regs) {
    // We need registration IDs too
  }

  const consentCounts = {};
  for (const c of consents) {
    consentCounts[c.consent_choice] = (consentCounts[c.consent_choice] || 0) + 1;
  }
  console.log('\nAuction consent breakdown:');
  console.log(JSON.stringify(consentCounts, null, 2));
  console.log('Total consent records:', consents.length);

  // Check consent by category
  const { data: consentWithReg } = await supabase
    .from('auction_consent')
    .select('consent_choice, registration_id');

  const regIds = new Set((consentWithReg || []).map(c => c.registration_id));

  // Get categories for consented registrations
  const { data: consentedRegs } = await supabase
    .from('tournament_registrations')
    .select('id, registration_category')
    .in('id', Array.from(regIds));

  const consentByCategory = {};
  for (const r of (consentedRegs || [])) {
    const consent = (consentWithReg || []).find(c => c.registration_id === r.id);
    const key = r.registration_category + ' / ' + (consent ? consent.consent_choice : 'UNKNOWN');
    consentByCategory[key] = (consentByCategory[key] || 0) + 1;
  }
  console.log('\nConsent by category:');
  console.log(JSON.stringify(consentByCategory, null, 2));
})();
