import Link from 'next/link'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tournament Registration App</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Public Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Public Routes</h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Protected Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Protected Routes</h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/tournaments/register" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Tournament Registration
                </Link>
              </li>
              <li>
                <Link 
                  href="/registration-summary" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Registration Summary
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Routes</h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/admin/registrations" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Manage Registrations
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Auth Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Auth Routes</h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/verify-email" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Verify Email
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/confirm-email" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Confirm Email
                </Link>
              </li>
            </ul>
          </div>

          {/* API Documentation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Routes</h2>
            <ul className="space-y-3">
              <li className="text-gray-600">POST /api/tournaments/register</li>
              <li className="text-gray-600">GET /api/tournaments/register/status</li>
              <li className="text-gray-600">GET /api/tournaments/register/check-jersey</li>
              <li className="text-gray-600">GET /api/admin/registrations</li>
              <li className="text-gray-600">PUT /api/admin/registrations</li>
              <li className="text-gray-600">GET /api/admin/registrations/[id]</li>
              <li className="text-gray-600">PUT /api/admin/registrations/[id]</li>
              <li className="text-gray-600">DELETE /api/admin/registrations/[id]</li>
              <li className="text-gray-600">POST /api/admin/create-admin</li>
              <li className="text-gray-600">GET /api/tournaments</li>
              <li className="text-gray-600">POST /api/tournaments</li>
            </ul>
          </div>

          {/* Development Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Development Routes</h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/test-form" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Test Form
                </Link>
              </li>
              <li>
                <Link 
                  href="/theme-test" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Theme Test
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Environment Info */}
        <ErrorBoundary
          fallback={
            <div className="mt-8 bg-red-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-red-700 mb-4">Environment Information Error</h2>
              <p className="text-red-600">There was an error loading environment information.</p>
            </div>
          }
        >
          <Suspense fallback={
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Information</h2>
              <p className="text-gray-600">Loading environment information...</p>
            </div>
          }>
            <EnvironmentInfo />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

function EnvironmentInfo() {
  // Safely get environment variables with fallbacks
  const nodeEnv = process.env.NODE_ENV || 'development';
  const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured';
  
  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">
            <span className="font-medium">Node Version:</span> {process.version || 'Unknown'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Next.js Version:</span> 14.2.23
          </p>
        </div>
        <div>
          <p className="text-gray-600">
            <span className="font-medium">Environment:</span> {nodeEnv}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">API URL:</span> {apiUrl}
          </p>
        </div>
      </div>
    </div>
  );
} 