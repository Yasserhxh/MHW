import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './states';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) return <ErrorState message="Unexpected UI error. Please refresh." />;
    return this.props.children;
  }
}
