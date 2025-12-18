import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="card bg-red-50 border-l-4 border-red-500">
              <h1 className="text-2xl font-bold text-red-800 mb-4">
                Something went wrong
              </h1>
              <p className="text-red-600 mb-4">
                The application encountered an unexpected error. Please refresh the page.
              </p>
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-red-700 font-semibold">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary w-full"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
