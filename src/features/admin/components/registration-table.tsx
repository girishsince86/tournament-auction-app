'use client';

import { useState } from 'react';
import { Registration } from '../types/registration-admin';
import { RegistrationDetailModal } from './registration-detail-modal';
import { 
  DataGrid, 
  GridColDef,
  GridRenderCellParams,
  GridValueGetter,
} from '@mui/x-data-grid';
import { 
  Chip, 
  IconButton, 
  Switch, 
  Stack, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Visibility, Delete, Edit } from '@mui/icons-material';

const REGISTRATION_CATEGORIES = [
  { value: 'VOLLEYBALL_OPEN_MEN', label: 'Volleyball - Open Men' },
  { value: 'THROWBALL_WOMEN', label: 'Throwball - Women' },
  { value: 'THROWBALL_13_17_MIXED', label: 'Throwball - 13-17 Mixed' },
  { value: 'THROWBALL_8_12_MIXED', label: 'Throwball - 8-12 Mixed' },
] as const;

interface RegistrationTableProps {
  registrations?: Registration[];
  isLoading?: boolean;
  onUpdate?: (registration: Registration) => Promise<void>;
  onDelete?: (registrationId: string) => Promise<void>;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const getCategoryLabel = (value: string) => {
  return REGISTRATION_CATEGORIES.find(cat => cat.value === value)?.label || value;
};

interface RegistrationWithDateObject extends Omit<Registration, 'created_at'> {
  created_at: Date | null;
}

export function RegistrationTable({
  registrations = [],
  isLoading = false,
  onUpdate,
  onDelete,
}: RegistrationTableProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [updatingVerification, setUpdatingVerification] = useState<string | null>(null);

  // Transform registrations to include Date objects for created_at
  const rows: RegistrationWithDateObject[] = registrations.map(reg => ({
    ...reg,
    created_at: reg.created_at ? new Date(reg.created_at) : null,
  }));

  const handleVerificationToggle = async (registration: Registration, event: React.MouseEvent | React.ChangeEvent) => {
    // Stop event propagation
    event.stopPropagation();
    event.preventDefault();

    if (!onUpdate) {
      console.error('onUpdate function is not provided');
      return;
    }
    
    if (updatingVerification) {
      console.log('Already updating another registration');
      return;
    }
    
    try {
      console.log('Current verification status:', registration.is_verified);
      setUpdatingVerification(registration.id);
      
      // Create a complete copy of the registration with the toggled status
      const updatedRegistration: Registration = {
        ...registration,
        is_verified: !registration.is_verified,
      };
      
      console.log('Updating registration with new status:', updatedRegistration.is_verified);
      await onUpdate(updatedRegistration);
      
      console.log('Update successful');
    } catch (error) {
      console.error('Error updating verification status:', error);
    } finally {
      setUpdatingVerification(null);
    }
  };

  const columns: GridColDef<RegistrationWithDateObject>[] = [
    {
      field: 'first_name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params: GridRenderCellParams<RegistrationWithDateObject>) => 
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
      renderCell: (params: GridRenderCellParams<RegistrationWithDateObject>) => 
        getCategoryLabel(params.row.registration_category),
    },
    {
      field: 'is_verified',
      headerName: 'Status',
      width: 120,
      type: 'boolean',
      renderCell: (params: GridRenderCellParams<RegistrationWithDateObject>) => (
        <Chip
          label={params.row.is_verified ? 'Verified' : 'Pending'}
          color={params.row.is_verified ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Registered On',
      flex: 1,
      type: 'date',
      renderCell: (params: GridRenderCellParams<RegistrationWithDateObject>) => 
        formatDate(params.row.created_at?.toISOString()),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<RegistrationWithDateObject>) => {
        const registration = {
          ...params.row,
          created_at: params.row.created_at?.toISOString() || '',
        };

        return (
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Tooltip title="View Details">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegistration(registration);
                }}
                color="primary"
                size="small"
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title={registration.is_verified ? 'Mark as Pending' : 'Mark as Verified'}>
              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  size="small"
                  checked={registration.is_verified || false}
                  onChange={(e) => handleVerificationToggle(registration, e)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={updatingVerification === registration.id}
                  color="success"
                />
              </div>
            </Tooltip>
          </Stack>
        );
      }
    },
  ];

  return (
    <>
      <div style={{ width: '100%' }}>
        <DataGrid<RegistrationWithDateObject>
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          autoHeight
          getRowId={(row) => row.id}
          initialState={{
            sorting: {
              sortModel: [{ field: 'created_at', sort: 'desc' }],
            },
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            filter: {
              filterModel: {
                items: [],
              },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          filterMode="server"
        />
      </div>

      <RegistrationDetailModal
        registration={selectedRegistration}
        isOpen={!!selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        onSave={onUpdate || (() => Promise.resolve())}
        onDelete={onDelete || (() => Promise.resolve())}
      />
    </>
  );
} 