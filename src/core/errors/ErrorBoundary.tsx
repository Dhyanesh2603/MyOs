import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FlowOS ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-rose-500/20 bg-rose-950/20 text-content-primary">
          <AlertCircle className="h-8 w-8 text-rose-400 mb-2" />
          <h4 className="text-xs font-semibold text-rose-300">
            {this.props.fallbackTitle || 'Component Encountered an Issue'}
          </h4>
          <p className="text-[11px] text-content-tertiary mt-1 max-w-xs truncate">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs font-mono text-white hover:bg-white/20 transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Recover Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
