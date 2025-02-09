'use client';

import { useState } from 'react';
import { TournamentRegistration } from '@/features/tournaments/types/registration';
import { RegistrationDetailModal } from './registration-detail-modal';
import { 
  DataGrid, 
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { 
  Chip, 
  IconButton, 
  Stack, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';

const REGISTRATION_CATEGORIES = [
  { value: 'VOLLEYBALL_OPEN_MEN', label: 'Volleyball - Open Men' },
  { value: 'THROWBALL_WOMEN', label: 'Throwball - Women' },
  { value: 'THROWBALL_13_17_MIXED', label: 'Throwball - 13-17 Mixed' },
  { value: 'THROWBALL_8_12_MIXED', label: 'Throwball - 8-12 Mixed' },
] as const;

interface RegistrationTableProps {
  registrations?: TournamentRegistration[];
  isLoading?: boolean;
  onUpdate?: (registration: TournamentRegistration) => Promise<void>;
  onDelete?: (registrationId: string) => Promise<void>;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const getCategoryLabel = (value: string) => {
  return REGISTRATION_CATEGORIES.find(cat => cat.value === value)?.label || value;
};

export function RegistrationTable({
  registrations = [],
  isLoading = false,
  onUpdate,
  onDelete,
}: RegistrationTableProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<TournamentRegistration | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null);
  const theme = useTheme();

  const handleDelete = async (registrationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setRegistrationToDelete(registrationId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (registrationToDelete && onDelete) {
      await onDelete(registrationToDelete);
      setDeleteConfirmOpen(false);
      setRegistrationToDelete(null);
    }
  };

  const columns: GridColDef<TournamentRegistration>[] = [
    {
      field: 'first_name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => 
        `${params.row.first_name || ''} ${params.row.last_name || ''}`,
    },
    {
      field: 'registration_category',
      headerName: 'Category',
      flex: 1,
      type: 'singleSelect',
      valueOptions: REGISTRATION_CATEGORIES.map(cat => ({
        value: cat.value,
        label: cat.label,
      })),
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => {
        const isVolleyball = params.row.registration_category.includes('VOLLEYBALL');
        return (
          <Box
            sx={{
              backgroundColor: isVolleyball ? 'primary.lighter' : 'secondary.lighter',
              color: isVolleyball ? 'primary.dark' : 'secondary.dark',
              py: 0.5,
              px: 1.5,
              borderRadius: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {getCategoryLabel(params.row.registration_category)}
          </Box>
        );
      },
    },
    {
      field: 'is_verified',
      headerName: 'Status',
      width: 120,
      type: 'boolean',
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => (
        <Chip
          label={params.row.is_verified ? 'Verified' : 'Pending'}
          color={params.row.is_verified ? 'success' : 'warning'}
          size="small"
          sx={{ 
            fontWeight: 500,
            minWidth: 80,
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      type: 'dateTime',
      valueGetter: (params: GridRenderCellParams<TournamentRegistration>) => new Date(params.row.created_at),
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => 
        formatDate(params.row.created_at),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => (
        <Stack 
          direction="row" 
          spacing={1}
          sx={{
            '& .MuiIconButton-root': {
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'primary.lighter',
                color: 'primary.main',
              },
            },
          }}
        >
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRegistration(params.row);
              }}
              sx={{ color: 'text.secondary' }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => handleDelete(params.row.id, e)}
              sx={{ 
                color: 'error.light',
                '&:hover': {
                  backgroundColor: 'error.lighter',
                  color: 'error.main',
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Box 
        sx={{ 
          width: '100%',
          '& .MuiDataGrid-root': {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            '& .MuiDataGrid-cell': {
              borderColor: theme.palette.divider,
            },
            '& .MuiDataGrid-columnHeaders': {
              borderColor: theme.palette.divider,
              bgcolor: 'background.paper',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                bgcolor: 'primary.lighter',
              },
            },
          },
        }}
      >
        <DataGrid<TournamentRegistration>
          rows={registrations}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          autoHeight
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
            sorting: {
              sortModel: [{ field: 'created_at', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
          }}
        />
      </Box>

      {selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          open={true}
          onClose={() => setSelectedRegistration(null)}
        />
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this registration?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 