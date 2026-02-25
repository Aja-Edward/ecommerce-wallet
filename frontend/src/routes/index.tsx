import { Suspense, lazy } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { WalletProvider } from '../context/WalletContext';
import ErrorBoundary from './../components/ErrorBoundary';
import RouteErrorElement from '../components/RouterErrorElement';
import { Navbar } from '../components/home/Navbar';
import Footer from '../components/home/Footer';

const Home = lazy(() => import('../pages/Landing/Home'));
const Dashboard = lazy(() => import('../pages/dashboard/Wallet'));
const Privacy = lazy(() => import('../pages/Privacy/FirstPrivacypage'));
const RegisterForm = lazy(() => import('../pages/Landing/Register'));
const Login = lazy(() => import('../pages/Landing/Login'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
  </div>
);

// Public layout — has Navbar + Footer
const MainLayout = () => (
  <>
    <Navbar />
    <Suspense fallback={<LoadingFallback />}>
      <Outlet />
    </Suspense>
    <Footer />
  </>
);

// Protected layout — no Navbar/Footer, has WalletProvider
const DashboardLayout = () => (
  <WalletProvider>
    <Suspense fallback={<LoadingFallback />}>
      <Outlet />
    </Suspense>
  </WalletProvider>
);

export const router = createBrowserRouter([
  // ── Public routes (with Navbar + Footer) ──────────────────────────────────
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      { index: true, element: <Home />, errorElement: <RouteErrorElement /> },
      { path: 'privacy', element: <Privacy />, errorElement: <RouteErrorElement /> },
      { path: 'signup', element: <RegisterForm />, errorElement: <RouteErrorElement /> },
      { path: 'signin', element: <Login />, errorElement: <RouteErrorElement /> },
    ],
  },

  // ── Protected routes (with WalletProvider, no Navbar/Footer) ─────────────
  {
    element: (
      <ErrorBoundary>
        <DashboardLayout />
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      { path: 'dashboard', element: <Dashboard />, errorElement: <RouteErrorElement /> },
      // future protected pages go here (orders, profile, etc.)
    ],
  },
]);