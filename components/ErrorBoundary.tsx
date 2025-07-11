'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { ReactNode } from 'react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

// Default fallback component for root-level errors
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-neutral-text-primary">
          Something went wrong
        </h2>
        <p className="text-neutral-text-secondary">
          We're sorry, but something unexpected happened.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
        >
          Try again
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-neutral-text-muted">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Chat-specific error fallback
export function ChatErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-4">🤖💥</div>
      <h3 className="text-lg font-medium text-neutral-text-primary mb-2">
        Chat Error
      </h3>
      <p className="text-neutral-text-secondary mb-4">
        Something went wrong with the chat. Your conversation will restart fresh.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
      >
        Restart Chat
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-neutral-text-muted">
            Error details (dev only)
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  )
}

// Feed-specific error fallback
export function FeedErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-4">📚💥</div>
      <h3 className="text-lg font-medium text-neutral-text-primary mb-2">
        Feed Loading Error
      </h3>
      <p className="text-neutral-text-secondary mb-4">
        Unable to load your scraps. Let's try refreshing the feed.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
      >
        Refresh Feed
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-neutral-text-muted">
            Error details (dev only)
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  )
}

// Modal-specific error fallback
export function ModalErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-neutral-text-primary mb-2">
        Modal Error
      </h3>
      <p className="text-neutral-text-secondary mb-4">
        Something went wrong with this form. Please try again.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
      >
        Reset Form
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-neutral-text-muted">
            Error details (dev only)
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>
}

export default function ErrorBoundary({ children, FallbackComponent = ErrorFallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => {
        // Log to your error tracking service (like Sentry) here
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}