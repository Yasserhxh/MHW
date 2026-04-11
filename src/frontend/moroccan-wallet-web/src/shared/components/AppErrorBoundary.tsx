import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './states';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.hasError) return <ErrorState message="Unexpected UI error. Please refresh." />;
    return this.props.children;
  }
}
