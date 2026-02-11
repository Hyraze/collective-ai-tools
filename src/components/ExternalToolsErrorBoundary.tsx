/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * Specialized Error Boundary for External Tools section
 * Provides specific error handling and recovery options for external tools functionality
 */
class ExternalToolsErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * Log error information when an error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ExternalTools ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You could send this to an error tracking service like Sentry
      console.error('External Tools Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle retry attempt
   */
  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }));

      // Call the onRetry callback if provided
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  /**
   * Reload the page
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Navigate to built-in tools as fallback
   */
  private handleGoToBuiltInTools = () => {
    window.location.href = '/built-in-tools';
  };

  render() {
    if (this.state.hasError) {
      const { retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                External Tools Unavailable
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We're having trouble loading the external tools directory. This might be due to a network issue or temporary service disruption.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-orange-50 dark:bg-orange-900/20 p-4">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                    Error Details (Development Only):
                  </h4>
                  <pre className="text-xs text-orange-700 dark:text-orange-300 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                  {retryCount > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      Retry attempt: {retryCount}/{this.maxRetries}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">What you can try:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>Use our built-in tools instead</li>
                    <li>Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - retryCount} left)
                  </Button>
                )}
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoToBuiltInTools}
                  variant="secondary"
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  AI Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ExternalToolsErrorBoundary;
