'use client';

import { useAuth } from '@/features/auth/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Button,
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  Settings as SettingsIcon,
  Groups as TeamIcon,
  AccountBalance as BudgetIcon,
  SportsVolleyball as PlayerIcon,
} from '@mui/icons-material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

// Create a client
const queryClient = new QueryClient();

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user?.email?.endsWith('@pbel.in')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user?.email?.endsWith('@pbel.in')) {
    return null;
  }

  const navItems = [
    { 
      label: 'Tournaments', 
      href: '/admin/tournaments',
      icon: <TournamentIcon />,
      description: 'Create and list tournaments'
    },
    { 
      label: 'Tournament Management', 
      href: '/admin/tournament-management',
      icon: <SettingsIcon />,
      description: 'Manage active tournament settings'
    },
    { 
      label: 'Team Management', 
      href: '/admin/teams',
      icon: <TeamIcon />,
      description: 'Create and manage teams'
    },
    { 
      label: 'Budget Control', 
      href: '/admin/team-budgets',
      icon: <BudgetIcon />,
      description: 'Monitor and adjust team budgets'
    },
    { 
      label: 'Player Database', 
      href: '/manage-players',
      icon: <PlayerIcon />,
      description: 'Manage player profiles and categories'
    }
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Admin Dashboard nav bar - commented out, will be re-enabled later
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color={pathname === item.href ? 'primary' : 'inherit'}
                  variant={pathname === item.href ? 'contained' : 'text'}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </AppBar>
        */}
        <Box sx={{ flex: 1, px: { xs: 1, sm: 2 }, py: 1 }}>
          {children}
        </Box>
      </Box>
    </QueryClientProvider>
  );
} 