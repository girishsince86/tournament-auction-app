'use client';

import { RegistrationTable } from '@/features/admin/components/registration-table';
import { RegistrationFilters } from '@/features/admin/components/registration-filters';
import { RegistrationFilters as FilterType, Registration, RegistrationResponse } from '@/features/admin/types/registration-admin';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';

export default function RegistrationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegistrationResponse | null>(null);
  const [filters, setFilters] = useState<FilterType>({});
  const [page, setPage] = useState(1);

  const fetchRegistrations = useCallback(async () => {
    if (!user?.email?.endsWith('@pbel.in')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const searchParams = new URLSearchParams();
      
      // Add filters to search params
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.status !== undefined) searchParams.set('status', filters.status.toString());
      if (filters.startDate) searchParams.set('startDate', filters.startDate);
      if (filters.endDate) searchParams.set('endDate', filters.endDate);
      
      // Add pagination
      searchParams.set('page', page.toString());
      searchParams.set('limit', '10');

      console.log('Fetching registrations:', `/api/admin/registrations?${searchParams.toString()}`);
      
      const response = await fetch(`/api/admin/registrations?${searchParams.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch registrations');
      }
      
      const result = await response.json();
      console.log('Fetched registrations:', result);
      setData(result);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching registrations');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, user]);

  useEffect(() => {
    if (!isAuthLoading && user?.email?.endsWith('@pbel.in')) {
      fetchRegistrations();
    }
  }, [fetchRegistrations, isAuthLoading, user]);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleRefresh = () => {
    fetchRegistrations();
  };

  const handleUpdate = async (updatedRegistration: Registration) => {
    try {
      setIsLoading(true);
      console.log('Updating registration:', updatedRegistration);
      
      const response = await fetch(`/api/admin/registrations/${updatedRegistration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRegistration),
      });

      const responseText = await response.text();
      console.log('Update response:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to update registration');
      }

      let updatedData;
      try {
        updatedData = JSON.parse(responseText);
        console.log('Update successful:', updatedData);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format');
      }

      // Update the local state immediately
      if (data) {
        const updatedRegistrations = data.registrations.map(reg => 
          reg.id === updatedRegistration.id ? updatedData : reg
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

  const handleDelete = async (registrationId: string) => {
    try {
      setIsLoading(true);
      console.log('Deleting registration:', registrationId);
      
      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'DELETE',
      });

      const responseText = await response.text();
      console.log('Delete response:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to delete registration');
      }

      // Update local state to remove the deleted registration
      if (data) {
        const updatedRegistrations = data.registrations.filter(reg => reg.id !== registrationId);
        setData({
          ...data,
          registrations: updatedRegistrations,
          total: data.total - 1,
        });
      }

      // Then refresh the full list
      await fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
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

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          League Registrations
          {data && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.total} total)
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      <RegistrationFilters onFilterChange={handleFilterChange} />

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">Loading registrations...</div>
            <div className="mt-2 text-sm text-gray-500">This may take a moment</div>
          </div>
        </div>
      ) : (
        <RegistrationTable
          registrations={data?.registrations}
          isLoading={isLoading}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isLoading}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data || page * 10 >= data.total || isLoading}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * 10, data.total)}
                </span>{' '}
                of <span className="font-medium">{data.total}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || isLoading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!data || page * 10 >= data.total || isLoading}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 