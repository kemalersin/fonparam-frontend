import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { HelmetProvider, Helmet } from 'react-helmet-async';
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
          <HelmetProvider>
            <Helmet defaultTitle="FonParam - Yatırım Fonu Karşılaştırma ve Analiz Platformu" titleTemplate="%s | FonParam">
              <meta name="description" content="Türkiye'nin en kapsamlı yatırım fonu karşılaştırma ve analiz platformu. Tüm yatırım fonlarını detaylı inceleyin, karşılaştırın ve en iyi yatırım kararını verin." />
            </Helmet>
            <RouterProvider router={router} />
          </HelmetProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
