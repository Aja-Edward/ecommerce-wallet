// router/index.tsx
import { Suspense, lazy } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { WalletProvider } from '../context/WalletContext';
import { CardProvider } from '../context/CardContext';
import ErrorBoundary from './../components/ErrorBoundary';
import RouteErrorElement from '../components/RouterErrorElement';
import { Navbar } from '../components/home/Navbar';
import Footer from '../components/home/Footer';

const Home            = lazy(() => import('../pages/Landing/Home'));
const DashboardShell  = lazy(() => import('../pages/dashboard/DashboardShell'));
const DashboardOverview = lazy(() => import('../pages/dashboard/Dashboard'));
const TransactionsPage  = lazy(() => import('../pages/dashboard/TransactionsPage'));
const WalletPage        = lazy(() => import('../pages/dashboard/WalletPage'));
const CardsPage         = lazy(() => import('../pages/dashboard/CardsPage'));
const InvoicesPage      = lazy(() => import('../pages/dashboard/InvoicesPage'));
const AnalyticsPage     = lazy(() => import('../pages/dashboard/Analyticspage'));
const SettingsPage      = lazy(() => import('../pages/dashboard/SettingsPage'));
const Privacy           = lazy(() => import('../pages/Privacy/FirstPrivacypage'));
const RegisterForm      = lazy(() => import('../pages/Landing/Register'));
const Login             = lazy(() => import('../pages/Landing/Login'));
const AboutUs           = lazy(() => import('../pages/aboutus/AboutUS'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400" />
  </div>
);

// Public layout — Navbar + Footer
const MainLayout = () => (
  <>
    <Navbar />
    <Suspense fallback={<LoadingFallback />}>
      <Outlet />
    </Suspense>
    <Footer />
  </>
);

// Dashboard layout — WalletProvider wraps the shell + all child routes
const DashboardLayout = () => (
  <WalletProvider>
    <CardProvider>
    <Suspense fallback={<LoadingFallback />}>
      <Outlet />   {/* DashboardShell renders here */}
    </Suspense>
     </CardProvider>
  </WalletProvider>
);

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      { index: true,        element: <Home />,         errorElement: <RouteErrorElement /> },
      { path: 'privacy',    element: <Privacy />,      errorElement: <RouteErrorElement /> },
      { path: 'signup',     element: <RegisterForm />, errorElement: <RouteErrorElement /> },
      { path: 'signin',     element: <Login />,        errorElement: <RouteErrorElement /> },
    ],
  },

  // ── Protected / dashboard routes ───────────────────────────────────────────
  {
    element: (
      <ErrorBoundary>
        <DashboardLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        element: <DashboardShell />,   // sidebar + header live here; <Outlet /> renders pages
        children: [
          { path: 'dashboard',                element: <DashboardOverview /> },
          { path: 'dashboard/transactions',   element: <TransactionsPage /> },
          { path: 'dashboard/wallets',        element: <WalletPage /> },
          { path: 'dashboard/cards',          element: <CardsPage /> },
          { path: 'dashboard/invoices',       element: <InvoicesPage /> },
          { path: 'dashboard/analytics',      element: <AnalyticsPage /> },
          { path: 'dashboard/settings',       element: <SettingsPage /> },
        ],
      },
    ],
  },
]);