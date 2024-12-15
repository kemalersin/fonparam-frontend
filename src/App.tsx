import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Funds from './pages/Funds';
import Companies from './pages/Companies';
import Compare from './pages/Compare';
import Favorites from './pages/Favorites';
import Analyses from './pages/Analyses';
import CompanyDetail from './pages/CompanyDetail';
import Static from './pages/Static';
import FundDetail from './pages/FundDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/funds', element: <Funds /> },
      { path: '/funds/:code', element: <FundDetail /> },
      { path: '/companies', element: <Companies /> },
      { path: '/companies/:code', element: <CompanyDetail /> },
      { path: '/compare', element: <Compare /> },
      { path: '/favorites', element: <Favorites /> },
      { path: '/analyses', element: <Analyses /> },
      { path: '/guides/:slug', element: <Static /> },
      { path: '/privacy', element: <Static /> },
      { path: '/terms', element: <Static /> },
      { path: '/about', element: <Static /> },
      { path: '/api', element: <Static /> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
