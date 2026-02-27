#!/usr/bin/env node
/**
 * Load 2025 profile data for the 3 returning team owners:
 *   1. Romesh Binwani (romesh@pbel.in)
 *   2. Subhamitra Chatterjee (shubhamitra@pbel.in)
 *   3. Rajendra Sharma (rajendra@pbel.in)
 *
 * Looks up their auth user IDs and upserts into team_owner_profiles.
 *
 * Usage: node scripts/load-returning-owner-profiles.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://anmwnigeusoztcbqywaj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubXduaWdldXNvenRjYnF5d2FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMTUxMywiZXhwIjoyMDg1Njk3NTEzfQ.ZRbSHwS_n9JeM5UYGuidxbx1WY6vQrK3wu0M3wQEmVY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 2025 profile data for the 3 returning owners
const RETURNING_OWNERS = [
  {
    auth_email: 'romesh@pbel.in',
    profile: {
      first_name: 'Romesh',
      last_name: 'Binwani',
      sports_background: 'Competed in cricket at district and divisional levels. Enjoyed playing table tennis and basketball during his youth. Transitioned to long-distance running; completed his first full marathon in under five hours.',
      notable_achievements: [],
      team_role: 'Owner',
      contact_email: 'romesh@pbel.in',
      social_media: {
        linkedin: 'https://linkedin.com/in/romesh-binwani',
        instagram: 'https://instagram.com/romesh_runs',
      },
      bio: 'IT Engineer with a lifelong enthusiasm for sports. Romesh combines his technical expertise with his passion for sports. He serves as the race director for the PBEL Winter Marathon, continually chasing new goals.',
    },
  },
  {
    auth_email: 'shubhamitra@pbel.in',
    profile: {
      first_name: 'Subhamitra',
      last_name: 'Chatterjee',
      sports_background: 'NIS Certified & World Athletic Level-1 Coach. Medalist at state, national, and international levels. Focuses on combining her athletic experience with a passion for developing emerging talent.',
      notable_achievements: [
        'NIS Certified Coach',
        'World Athletic Level-1 Coach',
        'Medalist at state, national, and international levels',
      ],
      team_role: 'Owner',
      contact_email: 'shubhamitra@pbel.in',
      social_media: {},
      bio: 'Subhamitra brings her extensive experience as an international athlete to mentor and guide young talent. Her coaching philosophy emphasizes dedication, perseverance, and continuous improvement in sports and life.',
    },
  },
  {
    auth_email: 'rajendra@pbel.in',
    profile: {
      first_name: 'Rajendra',
      last_name: 'Sharma',
      sports_background: 'Former banker and former bank union president, bringing strong leadership experience. Active table tennis player with a passion for the game.',
      notable_achievements: [
        'Secured second place in a recent doubles tournament',
      ],
      team_role: 'Owner',
      contact_email: 'rajendra@pbel.in',
      social_media: {},
      bio: 'Rajendra (Raju) brings his leadership experience from banking to sports management. He is committed to mentoring and building a balanced team to nurture young talent and new entrants.',
    },
  },
];

async function main() {
  console.log('=== Loading Returning Owner Profiles ===\n');

  // Look up auth user IDs
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  for (const owner of RETURNING_OWNERS) {
    const authUser = users.find(u => u.email === owner.auth_email);
    if (!authUser) {
      console.error(`[SKIP] No auth user found for ${owner.auth_email}`);
      continue;
    }

    console.log(`Processing ${owner.profile.first_name} ${owner.profile.last_name} (${owner.auth_email}, user_id: ${authUser.id})`);

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('team_owner_profiles')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    const now = new Date().toISOString();
    const profileData = {
      ...owner.profile,
      user_id: authUser.id,
      updated_at: now,
    };

    if (existing) {
      // Update existing profile
      const { error } = await supabase
        .from('team_owner_profiles')
        .update(profileData)
        .eq('user_id', authUser.id);

      if (error) {
        console.error(`  [ERROR] Update failed: ${error.message}`);
      } else {
        console.log(`  [UPDATED] Profile updated for ${owner.profile.first_name}`);
      }
    } else {
      // Insert new profile
      profileData.created_at = now;
      const { error } = await supabase
        .from('team_owner_profiles')
        .insert(profileData);

      if (error) {
        console.error(`  [ERROR] Insert failed: ${error.message}`);
      } else {
        console.log(`  [CREATED] Profile created for ${owner.profile.first_name}`);
      }
    }
  }

  // Verify
  console.log('\n--- Verification ---');
  const { data: profiles } = await supabase
    .from('team_owner_profiles')
    .select('user_id, first_name, last_name, contact_email, team_role')
    .order('created_at', { ascending: false });

  console.log(`Total profiles in DB: ${profiles?.length || 0}`);
  profiles?.forEach(p => {
    console.log(`  - ${p.first_name} ${p.last_name} (${p.contact_email}) [${p.team_role}]`);
  });

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
