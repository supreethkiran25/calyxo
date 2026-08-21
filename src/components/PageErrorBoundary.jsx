import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

/**
 * PageErrorBoundary — catches errors within a single page render tree.
 *
 * A crash in Nutrition must NOT destroy the Workout timer or the surrounding
 * navigation layout. This boundary intercepts the error at the page level and
 * shows a minimal recovery UI while keeping the UserLayout shell intact.
 */
export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Structured log — category driven, no raw stack to users
    console.error('[CALYXO-UI] Page render exception:', {
      message: error?.message,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      component: info?.componentStack?.split('\n')[1]?.trim() || 'unknown',
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/user/dashboard';
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-1">
          Something went wrong
        </h2>
        <p className="text-xs text-muted max-w-xs leading-relaxed mb-6">
          This section encountered a problem. Your data is safe — try refreshing or returning home.
        </p>

        <div className="flex gap-3">
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-accent-foreground text-xs font-bold cursor-pointer border-none active:scale-95 transition-transform"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
          <button
            onClick={this.handleGoHome}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-card-border text-muted hover:text-foreground text-xs font-bold cursor-pointer active:scale-95 transition-transform"
          >
            <Home className="w-3.5 h-3.5" />
            Go Home
          </button>
        </div>
      </div>
    );
  }
}
