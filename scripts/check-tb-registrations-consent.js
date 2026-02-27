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
  // Get all TB women registrations
  const { data: regs, error } = await supabase
    .from('tournament_registrations')
    .select('id, first_name, last_name, registration_category, is_verified')
    .eq('registration_category', 'THROWBALL_WOMEN');

  if (error) { console.error(error.message); return; }

  // Get TB women in players table
  const { data: players } = await supabase
    .from('players')
    .select('id, name, sport_category')
    .eq('sport_category', 'THROWBALL_WOMEN');

  const playerIds = new Set((players || []).map(p => p.id));

  console.log('TB Women registrations: ' + regs.length);
  console.log('TB Women in players table: ' + (players || []).length);

  const notInPlayers = regs.filter(r => !playerIds.has(r.id));
  if (notInPlayers.length) {
    console.log('\nRegistered but NOT in players table (' + notInPlayers.length + '):');
    notInPlayers.forEach(r => console.log('  ' + r.first_name + ' ' + r.last_name + ' | verified: ' + r.is_verified));
  } else {
    console.log('\nAll registered TB women are in the players table.');
  }
})();
