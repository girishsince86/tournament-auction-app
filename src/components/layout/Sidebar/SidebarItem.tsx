'use client'

import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItemProps {
  icon: React.ReactNode
  text: string
  href: string
}

export function SidebarItem({ icon, text, href }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        href={href}
        selected={isActive}
        sx={{
          '&.Mui-selected': {
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          },
        }}
      >
        <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  )
} 