import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Avoid logging sensitive information in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Scancalai caught render error:', error, errorInfo);
    }
  }

  private handleRefresh = () => {
    try {
      window.location.reload();
    } catch {
      // Fallback
    }
  };

  private handleResetStorage = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f7f8] text-[#09090b] flex items-center justify-center p-6 selection:bg-neutral-900 selection:text-white font-['Inter',system-ui,-apple-system,sans-serif]">
          <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-[28px] p-8 shadow-xl text-center space-y-6 overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-neutral-950 tracking-tight">
                Something went wrong, please refresh
              </h1>
              <p className="text-xs text-neutral-500 leading-relaxed">
                An unexpected display issue occurred. Refreshing the browser will safely restore your tracker session without losing your profile.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleRefresh}
                style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                className="w-full bg-[#000000] text-[#FFFFFF] font-bold py-3.5 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-sm shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 underline transition"
              >
                Clear cached data and reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
