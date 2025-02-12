import React from 'react'
import { Box, Button, Typography, Paper } from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  private isTimeoutError(error: Error): boolean {
    return (
      error.name === 'TimeoutError' ||
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('timed out') ||
      error.message.includes('FUNCTION_INVOCATION_TIMEOUT')
    )
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isTimeout = this.state.error && this.isTimeoutError(this.state.error)

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ErrorIcon
              color="error"
              sx={{ fontSize: 48, mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {isTimeout
                ? 'Request Timeout'
                : 'Something went wrong'}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {isTimeout
                ? 'The request took too long to complete. This might be due to high server load or network issues.'
                : 'An unexpected error occurred while processing your request.'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
} 