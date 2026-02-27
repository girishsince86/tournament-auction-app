#!/usr/bin/env node
/**
 * Setup Team Owners for PBEL VB 2026
 *
 * This script:
 * 1. Creates Supabase auth users for all 10 team owners
 * 2. Updates team_owners table with correct names/emails
 * 3. Links auth users to team_owners (trigger handles this, but we also do it manually)
 * 4. Ensures teams are assigned
 *
 * Usage: node scripts/setup-team-owners-2026.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anmwnigeusoztcbqywaj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubXduaWdldXNvenRjYnF5d2FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMTUxMywiZXhwIjoyMDg1Njk3NTEzfQ.ZRbSHwS_n9JeM5UYGuidxbx1WY6vQrK3wu0M3wQEmVY';

const PASSWORD = 'pcvc2026';

const TEAM_OWNERS = [
  { name: 'Bhupinder Kumar', email: 'bhupinder@pbel.in', teamName: 'Team Bhupinder' },
  { name: 'Jawid Saj', email: 'jawid@pbel.in', teamName: 'Team Jawid' },
  { name: 'Surya Kiran Reddy Karri', email: 'surya@pbel.in', teamName: 'Team Surya' },
  { name: 'Romesh Binwani', email: 'romesh@pbel.in', teamName: 'Team Romesh' },
  { name: 'Shiva Kumar Reddy', email: 'shiva@pbel.in', teamName: 'Team Shiva' },
  { name: 'Shubhamitra', email: 'shubhamitra@pbel.in', teamName: 'Team Shubhamitra' },
  { name: 'Vikram Singh', email: 'vikram@pbel.in', teamName: 'Team Vikram' },
  { name: 'Rajendra Sharma', email: 'rajendra@pbel.in', teamName: 'Team Rajendra' },
  { name: 'Prateek Pandey', email: 'prateek@pbel.in', teamName: 'Team Prateek' },
  { name: 'Naveen Kuchipudi', email: 'naveen@pbel.in', teamName: 'Team Naveen' },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('=== PBEL VB 2026 Team Owner Setup ===\n');

  // Step 0: Show current state
  console.log('--- Current State ---');
  const { data: currentTeams } = await supabase.from('teams').select('id, name, owner_name');
  console.log('Current teams:', currentTeams?.length || 0);
  currentTeams?.forEach(t => console.log(`  - ${t.name} (owner: ${t.owner_name})`));

  const { data: currentOwners } = await supabase.from('team_owners').select('id, name, email, auth_user_id, team_id');
  console.log('\nCurrent team_owners:', currentOwners?.length || 0);
  currentOwners?.forEach(o => console.log(`  - ${o.name} <${o.email}> auth_linked=${!!o.auth_user_id} team_id=${o.team_id}`));

  const { data: { users: existingAuthUsers } } = await supabase.auth.admin.listUsers();
  console.log('\nExisting auth users:', existingAuthUsers?.length || 0);
  existingAuthUsers?.forEach(u => console.log(`  - ${u.email} (id: ${u.id})`));

  // Get the tournament ID
  const { data: tournaments } = await supabase.from('tournaments').select('id, name').order('created_at', { ascending: false }).limit(1);
  if (!tournaments?.length) {
    console.error('\nERROR: No tournament found!');
    process.exit(1);
  }
  const tournamentId = tournaments[0].id;
  console.log(`\nUsing tournament: ${tournaments[0].name} (${tournamentId})`);

  // Step 1: Create auth users
  console.log('\n--- Step 1: Creating Auth Users ---');
  const authUserMap = {}; // email -> user id

  for (const owner of TEAM_OWNERS) {
    // Check if auth user already exists
    const existing = existingAuthUsers?.find(u => u.email === owner.email);
    if (existing) {
      console.log(`  [EXISTS] ${owner.email} (id: ${existing.id})`);
      authUserMap[owner.email] = existing.id;

      // Update password for existing user
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: PASSWORD,
      });
      if (updateError) {
        console.log(`    [WARN] Could not update password: ${updateError.message}`);
      } else {
        console.log(`    [OK] Password updated to ${PASSWORD}`);
      }
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: owner.email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (error) {
      console.log(`  [ERROR] ${owner.email}: ${error.message}`);
    } else {
      console.log(`  [CREATED] ${owner.email} (id: ${data.user.id})`);
      authUserMap[owner.email] = data.user.id;
    }
  }

  // Step 2: Clear old team_owners and teams, then recreate
  console.log('\n--- Step 2: Setting up Teams and Team Owners ---');

  // Clear auction-related data first (to avoid FK constraints)
  console.log('  Clearing auction data...');
  await supabase.from('bids').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('auction_queue').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('auction_rounds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('preferred_players').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Clear old team_owners
  console.log('  Clearing old team_owners...');
  await supabase.from('team_owners').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Clear old teams
  console.log('  Clearing old teams...');
  await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create 10 new teams
  console.log('  Creating 10 new teams...');
  const teamsToInsert = TEAM_OWNERS.map(owner => ({
    name: owner.teamName,
    owner_name: owner.name,
    initial_budget: 1000000000,   // 100 crore points
    remaining_budget: 1000000000,
    min_players: 8,
    max_players: 9,
    tournament_id: tournamentId,
  }));

  const { data: insertedTeams, error: teamsError } = await supabase
    .from('teams')
    .insert(teamsToInsert)
    .select('id, name, owner_name');

  if (teamsError) {
    console.error('  [ERROR] Creating teams:', teamsError.message);
    process.exit(1);
  }

  console.log(`  Created ${insertedTeams.length} teams`);
  insertedTeams.forEach(t => console.log(`    - ${t.name} (${t.owner_name})`));

  // Create team_owners linked to teams and auth users
  console.log('\n  Creating team_owners...');
  const ownersToInsert = TEAM_OWNERS.map(owner => {
    const team = insertedTeams.find(t => t.owner_name === owner.name);
    return {
      email: owner.email,
      name: owner.name,
      team_id: team?.id || null,
      auth_user_id: authUserMap[owner.email] || null,
    };
  });

  const { data: insertedOwners, error: ownersError } = await supabase
    .from('team_owners')
    .insert(ownersToInsert)
    .select('id, name, email, auth_user_id, team_id');

  if (ownersError) {
    console.error('  [ERROR] Creating team_owners:', ownersError.message);
    process.exit(1);
  }

  console.log(`  Created ${insertedOwners.length} team_owners`);

  // Step 3: Verify linkage
  console.log('\n--- Step 3: Verification ---');
  const { data: finalOwners } = await supabase
    .from('team_owners')
    .select('name, email, auth_user_id, team_id');

  console.log('\nFinal team_owners:');
  finalOwners?.forEach(o => {
    const linked = o.auth_user_id ? 'LINKED' : 'NOT LINKED';
    const hasTeam = o.team_id ? 'HAS TEAM' : 'NO TEAM';
    console.log(`  ${o.name} <${o.email}> [${linked}] [${hasTeam}]`);
  });

  const allLinked = finalOwners?.every(o => o.auth_user_id && o.team_id);

  console.log('\n=== Summary ===');
  console.log(`Auth users created/updated: ${Object.keys(authUserMap).length}`);
  console.log(`Teams created: ${insertedTeams.length}`);
  console.log(`Team owners created: ${insertedOwners.length}`);
  console.log(`All linked: ${allLinked ? 'YES' : 'NO - check above'}`);
  console.log(`\nAll team owners can now log in at the app with:`);
  console.log(`  Email: <firstname>@pbel.in`);
  console.log(`  Password: ${PASSWORD}`);
  console.log('\nLogin emails:');
  TEAM_OWNERS.forEach(o => console.log(`  ${o.name}: ${o.email}`));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
