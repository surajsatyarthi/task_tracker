import RealDataTaskTracker from './real-data-page';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Page() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <RealDataTaskTracker />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
