'use client';

import { useState } from 'react';
import { RegistrationCategory, RegistrationFilters as FilterType } from '../types/registration-admin';

interface RegistrationFiltersProps {
  onFilterChange?: (filters: FilterType) => void;
}

export function RegistrationFilters({ onFilterChange }: RegistrationFiltersProps) {
  const [filters, setFilters] = useState<FilterType>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  return (
    <div className="bg-white shadow-sm sm:rounded-lg">
      <div className="border-b border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>Filters</span>
          <span className="ml-6 flex items-center">
            {Object.keys(filters).length > 0 && (
              <span className="mr-2 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                {Object.keys(filters).length}
              </span>
            )}
            <svg
              className={`h-5 w-5 transform text-gray-500 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {/* Search */}
            <div className="col-span-2">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="Search name, phone, flat..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="sr-only">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                value={filters.category || ''}
                onChange={(e) =>
                  handleFilterChange({
                    category: e.target.value as RegistrationCategory,
                  })
                }
              >
                <option value="">All Categories</option>
                <option value="RESIDENT">Resident</option>
                <option value="TENANT">Tenant</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="sr-only">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                value={filters.status === undefined ? '' : filters.status.toString()}
                onChange={(e) =>
                  handleFilterChange({
                    status: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label htmlFor="startDate" className="sr-only">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 