import { PlayerRegistrationManager } from '@/features/admin/components/PlayerRegistrationManager';

export const metadata = {
  title: 'Player Registrations Management',
  description: 'Manage player registrations and load players from tournament registrations',
};

export default function PlayerRegistrationsPage() {
  return <PlayerRegistrationManager />;
} 