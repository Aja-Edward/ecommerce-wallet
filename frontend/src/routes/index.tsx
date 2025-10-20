import { Suspense, lazy}  from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ErrorBoundary from './../components/ErrorBoundary';
import RouteErrorElement from '../components/RouterErrorElement';
import  {Navbar}  from '../components/home/Navbar';
import Footer from '../components/home/Footer';



const Home = lazy(() => import('../pages/Landing/Home'));
const Privacy = lazy(()=> import('../pages/Privacy/FirstPrivacypage'))
const AboutPage = lazy(() => import('../pages/aboutus/AboutUS'))
const WalletPage = lazy(() => import('../pages/wallet/WalletPage'));



const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);



export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ErrorBoundary>
              <MainLayout />
            </ErrorBoundary>
        ),
          errorElement: <RouteErrorElement />,
          children: [
            {
              index: true,  
                element: <Home />,   
                 errorElement: <RouteErrorElement />        
            },

            {
        path: 'privacy',
        element: <Privacy/>,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'about',
        element: <AboutPage/>,
        errorElement: <RouteErrorElement />
      },
      {
         path: 'wallet',            
        element: <WalletPage />,
        errorElement: <RouteErrorElement />
      }
]
    },
]);