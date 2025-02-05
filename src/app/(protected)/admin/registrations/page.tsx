'use client';

import { RegistrationTable } from '@/features/admin/components/registration-table';
import { RegistrationFilters } from '@/features/admin/components/registration-filters';
import { RegistrationFilters as FilterType, Registration, RegistrationResponse } from '@/features/admin/types/registration-admin';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';
import { IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

export default function RegistrationsPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<RegistrationResponse | null>(null);
  const [filters, setFilters] = useState<FilterType>({});

  const fetchRegistrations = useCallback(async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams();
      
      if (filters.category) {
        searchParams.append('category', filters.category);
      }
      if (filters.status !== undefined) {
        searchParams.append('status', filters.status.toString());
      }
      if (filters.search) {
        searchParams.append('search', filters.search);
      }

      const response = await fetch(`/api/admin/registrations?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleUpdate = async (registration: Registration) => {
    try {
      setIsLoading(true);
      console.log('Updating registration:', registration);
      
      const response = await fetch(`/api/admin/registrations/${registration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registration),
      });

      if (!response.ok) {
        throw new Error('Failed to update registration');
      }

      // Update local state
      if (data) {
        const updatedRegistrations = data.registrations.map(reg =>
          reg.id === registration.id ? registration : reg
        );
        setData({
          ...data,
          registrations: updatedRegistrations,
        });
      }

      // Then refresh the full list
      await fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Registrations</h1>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchRegistrations}
              disabled={isLoading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
        <RegistrationFilters onFilterChange={setFilters} />
      </div>

      <RegistrationTable
        registrations={data?.registrations || []}
        isLoading={isLoading}
        onUpdate={handleUpdate}
      />
    </div>
  );
} 