import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import HomePage from './pages/Home';
import FundsPage from './pages/Funds';
import FundDetailPage from './pages/FundDetail';
import CompaniesPage from './pages/Companies';
import CompanyDetailPage from './pages/CompanyDetail';
import ComparePage from './pages/Compare';
import FavoritesPage from './pages/Favorites';
import Analyses from './pages/Analyses';

// Components
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ToastProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/funds" element={<FundsPage />} />
                                <Route path="/funds/:code" element={<FundDetailPage />} />
                                <Route path="/companies" element={<CompaniesPage />} />
                                <Route path="/companies/:code" element={<CompanyDetailPage />} />
                                <Route path="/compare" element={<ComparePage />} />
                                <Route path="/favorites" element={<FavoritesPage />} />
                                <Route path="/analyses" element={<Analyses />} />
                            </Routes>
                        </Layout>
                    </Router>
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
