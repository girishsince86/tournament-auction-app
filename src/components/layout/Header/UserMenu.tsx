'use client'

import { useState } from 'react'
import { Avatar, Menu, MenuItem, IconButton, Divider } from '@mui/material'
import { useAuth } from '@/features/auth/context/auth-context'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      handleClose()
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleNavigateToProfile = () => {
    handleClose()
    router.push('/profile')
  }

  const handleNavigateToChangePassword = () => {
    handleClose()
    router.push('/profile/change-password')
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        disabled={isSigningOut}
      >
        <Avatar sx={{ width: 32, height: 32 }}>
          {user?.email?.[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleNavigateToProfile} disabled={isSigningOut}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleNavigateToChangePassword} disabled={isSigningOut}>
          <LockIcon fontSize="small" sx={{ mr: 1 }} />
          Change Password
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </MenuItem>
      </Menu>
    </>
  )
} 