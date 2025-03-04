import { Box, Button, Divider, useTheme, alpha, useMediaQuery } from '@mui/material';
import { 
  Group as GroupIcon, 
  Person as PersonIcon, 
  SportsTennis as SportsIcon,
  Handshake as HandshakeIcon,
  SupervisorAccount as SupervisorAccountIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PublicNavigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const navItems = [
    { 
      label: 'Players', 
      path: '/players', 
      icon: <PersonIcon fontSize="small" /> 
    },
    { 
      label: 'Teams', 
      path: '/teams', 
      icon: <GroupIcon fontSize="small" /> 
    },
    { 
      label: 'Formats', 
      path: '/formats', 
      icon: <SportsIcon fontSize="small" /> 
    },
    { 
      label: 'Sponsors', 
      path: '/sponsors', 
      icon: <HandshakeIcon fontSize="small" /> 
    },
    { 
      label: 'Organizers', 
      path: '/organizers', 
      icon: <SupervisorAccountIcon fontSize="small" /> 
    }
  ];
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        width: '100%',
        overflowX: 'auto',
        py: 1,
        px: { xs: 1, sm: 2 },
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        
        return (
          <Button
            key={item.path}
            component={Link}
            href={item.path}
            startIcon={item.icon}
            variant={isActive ? "contained" : "text"}
            color={isActive ? "primary" : "inherit"}
            size="small"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: isActive 
                  ? alpha(theme.palette.primary.main, 0.9)
                  : alpha(theme.palette.action.hover, 0.1),
                transform: 'translateY(-2px)'
              }
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
} 