import { Suspense, lazy}  from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ErrorBoundary from './../components/ErrorBoundary';
import RouteErrorElement from '../components/RouterErrorElement';
import  {Navbar}  from '../components/home/Navbar';
import Footer from '../components/home/Footer';



const Home = lazy(() => import('../pages/Landing/Home'));
const Privacy = lazy(()=> import('../pages/Privacy/FirstPrivacypage'))

// const LoadingSpinner = () => (
//   <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//     <div className="flex flex-col items-center space-y-4">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       <p className="text-white/70 text-sm">Loading...</p>
//     </div>
//   </div>
// );

// const RootLayout = () =>{
//     return (
//     <div className={"min-h-screen transition-colors duration-300"}>
//       <div className="pt-0" id="main-content"> {/* Let individual components handle their own padding */}
//         <Suspense fallback={<LoadingSpinner />}>
//           <Outlet />
//         </Suspense>
//       </div>
//     </div>
//   );
// }

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
]
    },
]);