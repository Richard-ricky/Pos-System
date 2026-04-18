import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "./components/layouts/MainLayout";
import { LoginScreen } from "./components/auth/LoginScreen";
import { AuthGuard } from "./components/auth/authguard";
import { WalletDashboard } from "./components/wallet/WalletDashboard";
import { POSScreen } from "./components/pos/POSScreen";
import { TransactionsScreen } from "./components/transactions/TransactionsScreen";
import { LinkedAccountsScreen } from "./components/accounts/LinkedAccountsScreen";
import { SendMoneyScreen } from "./components/transfers/SendMoneyScreen";
import { AddMoneyScreen } from "./components/funding/AddMoneyScreen";
import { LinkCardScreen } from "./components/accounts/LinkCardScreen";
import { LinkMobileMoneyScreen } from "./components/accounts/LinkMobileMoneyScreen";
import { AnalyticsScreen } from "./components/analytics/AnalyticsScreen";
import { ProductsScreen } from "./components/product/productsscreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

/**
 * Wraps every route with ThemeProvider + AuthProvider.
 * Must live INSIDE the router so that useNavigate (used in AuthContext)
 * works correctly.
 */
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Protected shell — AuthGuard checks session, then renders MainLayout.
 */
function ProtectedShell() {
  return (
    <Providers>
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    </Providers>
  );
}

/**
 * Public shell — just wraps with providers (no guard needed for login).
 */
function PublicShell({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

export const router = createBrowserRouter([
  // ── Login (public) ────────────────────────────────────────────────
  {
    path: "/login",
    element: (
      <PublicShell>
        <LoginScreen />
      </PublicShell>
    ),
  },

  // ── Protected app routes ──────────────────────────────────────────
  {
    path: "/",
    Component: ProtectedShell,
    children: [
      { index: true,              element: <Navigate to="/wallet" replace /> },
      { path: "wallet",           Component: WalletDashboard },
      { path: "pos",              Component: POSScreen },
      { path: "products",         Component: ProductsScreen },
      { path: "transactions",     Component: TransactionsScreen },
      { path: "accounts",         Component: LinkedAccountsScreen },
      { path: "send-money",       Component: SendMoneyScreen },
      { path: "add-money",        Component: AddMoneyScreen },
      { path: "link-card",        Component: LinkCardScreen },
      { path: "link-momo",        Component: LinkMobileMoneyScreen },
      { path: "analytics",        Component: AnalyticsScreen },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────────────
  { path: "*", element: <Navigate to="/wallet" replace /> },
]);