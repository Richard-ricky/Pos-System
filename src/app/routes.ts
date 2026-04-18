import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layouts/MainLayout";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: WalletDashboard },
      { path: "wallet", Component: WalletDashboard },
      { path: "pos", Component: POSScreen },
      { path: "transactions", Component: TransactionsScreen },
      { path: "accounts", Component: LinkedAccountsScreen },
      { path: "send-money", Component: SendMoneyScreen },
      { path: "add-money", Component: AddMoneyScreen },
      { path: "link-card", Component: LinkCardScreen },
      { path: "link-momo", Component: LinkMobileMoneyScreen },
      { path: "analytics", Component: AnalyticsScreen },
      { path: "products", Component: ProductsScreen },
    ],
  },
]);