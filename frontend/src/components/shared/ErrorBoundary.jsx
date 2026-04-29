import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-primary)'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'left',
              maxWidth: '100%',
              overflow: 'auto',
              color: 'var(--danger)'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
