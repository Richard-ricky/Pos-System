import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { NotificationTestProvider } from './utils/notification-test';
import { useEffect } from 'react';

function AppContent() {
  const { user, loading } = useAuth();

  // Enable dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="glass-card rounded-2xl p-12 text-center relative z-10">
          <div className="size-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="glass-text text-lg">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <NotificationTestProvider />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" theme="dark" />
    </AuthProvider>
  );
}