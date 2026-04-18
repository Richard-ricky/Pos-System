import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

// ThemeProvider and AuthProvider now live inside routes.tsx (in ProvidersLayout)
// so that MainLayout and all child routes are in the same React context tree.

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}