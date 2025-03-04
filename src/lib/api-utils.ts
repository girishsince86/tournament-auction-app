import { NextResponse } from 'next/server';

export function handleApiError(error: unknown, path: string) {
  console.error(`API Error in ${path}:`, error);
  
  // Extract error message
  let errorMessage = 'An unexpected error occurred';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as { message: unknown }).message);
  }
  
  // Create a structured error response
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: errorMessage,
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function handleValidationError(errors: Record<string, string>, path: string) {
  return NextResponse.json(
    {
      error: 'Validation Error',
      message: 'The request contains invalid data',
      details: errors,
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

export function handleAuthError(message = 'Authentication required', path: string) {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message,
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

export function handleForbiddenError(message = 'Access denied', path: string) {
  return NextResponse.json(
    {
      error: 'Forbidden',
      message,
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

export function handleNotFoundError(resource: string, path: string) {
  return NextResponse.json(
    {
      error: 'Not Found',
      message: `The requested ${resource} could not be found`,
      path,
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
} 