import { Component, type ErrorInfo, type ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Insurance UI rendering error', error, errorInfo);
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <EmptyState
            icon="⚠️"
            title={this.props.title ?? 'Something went wrong'}
            description="This part of the application could not be displayed. Try again or reload the page."
            action={{ label: 'Try again', onClick: this.retry }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
