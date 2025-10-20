import { Suspense, lazy}  from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ErrorBoundary from './../components/ErrorBoundary';
import RouteErrorElement from '../components/RouterErrorElement';
import  {Navbar}  from '../components/home/Navbar';
import Footer from '../components/home/Footer';



const Home = lazy(() => import('../pages/Landing/Home'));
const Privacy = lazy(()=> import('../pages/Privacy/FirstPrivacypage'))
const RegisterForm = lazy(() => import('../pages/Landing/Register'));
const Login = lazy(() => import('../pages/Landing/Login'));

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
        path: 'signup',
        element: <RegisterForm/>,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'signin',
        element: <Login/>,
        errorElement: <RouteErrorElement />
      },
]
    },
]);