'use client'

import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItemProps {
  icon: React.ReactNode
  text: string
  href: string
  onClick?: () => void
}

export function SidebarItem({ icon, text, href, onClick }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        href={href}
        selected={isActive}
        onClick={onClick}
        sx={{
          '&.Mui-selected': {
            backgroundColor: 'rgba(14, 165, 233, 0.12)',
            borderLeft: '3px solid #0ea5e9',
            '&:hover': {
              backgroundColor: 'rgba(14, 165, 233, 0.18)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? '#0ea5e9' : '#94a3b8',
            filter: isActive ? 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.4))' : 'none',
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          sx={{
            '& .MuiListItemText-primary': {
              color: isActive ? '#ffffff' : '#94a3b8',
              fontWeight: isActive ? 600 : 400,
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}
