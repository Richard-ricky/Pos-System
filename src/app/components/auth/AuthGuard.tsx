// components/auth/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Wraps protected routes.
 * - While loading  → spinner (prevents flash to login)
 * - No session     → redirect to /login, preserving intended destination
 * - Has session    → render children normally
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-base, #080c14)' }}>
        <div className="size-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}