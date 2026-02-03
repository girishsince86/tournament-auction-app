'use client'

import {
  Card,
  CardContent,
  TextField,
  FormControl,
  Button,
  Chip,
  Paper,
  Avatar,
  IconButton,
  IconButtonProps,
} from '@mui/material'
import { styled, alpha } from '@mui/material/styles'

export const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}))

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white,
}))

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white,
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300],
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
  },
}))

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white,
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
  },
}))

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

export const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))

export const StatusChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  '&.completed': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  '&.incomplete': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}))

export const CategoryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${theme.palette.divider}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.5),
    '& .category-icon': {
      transform: 'scale(1.05)',
      backgroundColor: alpha(theme.palette.primary.main, 0.9),
    },
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    '& .category-icon': {
      backgroundColor: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
    '& .MuiTypography-subtitle1': {
      color: theme.palette.primary.main,
    },
  },
}))

export const CategoryIcon = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: alpha(theme.palette.primary.main, 0.7),
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  className: 'category-icon',
  '& svg': {
    fontSize: '32px',
    transition: 'all 0.3s ease',
  },
}))

export const PrintStyles = styled('style')({
  '@media print': {
    '@page': { size: 'A4', margin: '20mm' },
    '.no-print': { display: 'none !important' },
    '.MuiDialog-paper': { boxShadow: 'none !important' },
    '.MuiDialogTitle-root, .MuiTypography-root': { color: 'black !important' },
    '.MuiSvgIcon-root': { color: 'black !important' },
    '.print-content': { padding: '0 !important' },
    '.info-box': { backgroundColor: 'transparent !important', border: '1px solid black', padding: '16px' },
  },
})
