import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </ErrorBoundary>
  )
}

export default App