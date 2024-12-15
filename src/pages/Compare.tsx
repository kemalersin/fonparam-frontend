import { useState, useEffect, useRef } from 'react';
import { useCompareFunds, useFunds, useFundHistory } from '../hooks/useApi';
import { MagnifyingGlassIcon, XMarkIcon, ArrowsRightLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { addToComparison, removeFromComparison, getComparisonList } from '../services/comparison';
import { useToast } from '../contexts/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { formatPercent, formatCurrency } from '../utils/format';
import SortHeader from '../components/SortHeader';
import { Fund } from '../types/api';
import LoadingOverlay from '../components/LoadingOverlay';
import ExportButton from '../components/ExportButton';

const COLORS = [
    '#4f46e5', // indigo-600
    '#059669', // emerald-600
    '#dc2626', // red-600
    '#d97706', // amber-600
    '#7c3aed', // violet-600
    '#db2777', // pink-600
    '#2563eb', // blue-600
    '#ea580c', // orange-600
    '#16a34a', // green-600
    '#9333ea'  // purple-600
];

const getStartDate = (period: string): string => {
    const today = new Date();
    return new Date(today.setFullYear(today.getFullYear() - 5)).toISOString().split('T')[0];
};

export default function Compare() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const [selectedFunds, setSelectedFunds] = useState<Fund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [historicalData, setHistoricalData] = useState<{ [key: string]: any[] }>({});
    const [sortField, setSortField] = useState<string>('code');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const searchRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: searchResults, isLoading: isSearching } = useFunds(
        search ? {
            search,
            limit: 50,
            page: 1,
        } : undefined
    );

    const { data: comparisonData, isLoading: isComparing } = useCompareFunds(
        selectedCodes.length >= 2 ? selectedCodes : []
    );

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5);
    
    const fund1History = useFundHistory(selectedCodes[0] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund2History = useFundHistory(selectedCodes[1] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund3History = useFundHistory(selectedCodes[2] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund4History = useFundHistory(selectedCodes[3] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund5History = useFundHistory(selectedCodes[4] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund6History = useFundHistory(selectedCodes[5] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund7History = useFundHistory(selectedCodes[6] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund8History = useFundHistory(selectedCodes[7] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund9History = useFundHistory(selectedCodes[8] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fund10History = useFundHistory(selectedCodes[9] || '', {
        interval: 'monthly',
        sort: 'date',
        order: 'ASC',
        start_date: startDate.toISOString().split('T')[0]
    });

    const fundHistories = [
        fund1History,
        fund2History,
        fund3History,
        fund4History,
        fund5History,
        fund6History,
        fund7History,
        fund8History,
        fund9History,
        fund10History
    ];

    useEffect(() => {
        if (selectedCodes.length >= 2) {
            const newHistoricalData: { [key: string]: any[] } = {};
            
            selectedCodes.forEach((code, index) => {
                if (fundHistories[index].data) {
                    newHistoricalData[code] = fundHistories[index].data;
                }
            });
            
            if (Object.keys(newHistoricalData).length >= 2) {
                setHistoricalData(newHistoricalData);
            }
        }
    }, [selectedCodes, ...fundHistories.map(h => h.data)]);

    const getHistoricalChartData = () => {
        if (Object.keys(historicalData).length === 0) return [];

        const allDates = Array.from(
            new Set(
                Object.values(historicalData)
                    .flat()
                    .map(item => item.date)
            )
        ).sort();

        return allDates.map(date => {
            const point: any = { date };
            Object.entries(historicalData).forEach(([code, data]) => {
                const fundData = data.find(d => d.date === date);
                if (fundData) {
                    point[code] = fundData.value;
                }
            });
            return point;
        });
    };

    useEffect(() => {
        const loadComparisonList = async () => {
            try {
                setIsLoading(true);
                const funds = await getComparisonList();
                setSelectedCodes(funds.map(f => f.code));
                setSelectedFunds(funds.map(f => ({ code: f.code, title: f.title })));
            } catch (error) {
                console.error('Karşılaştırma listesi yüklenirken hata:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadComparisonList();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddFund = async (fund: { 
        code: string; 
        title: string; 
        management_company?: { 
            id?: string; 
            title?: string; 
            logo?: string;
        }; 
        management_company_id?: string;
    }) => {
        if (selectedCodes.length < 10 && !selectedCodes.includes(fund.code)) {
            try {
                await addToComparison({
                    code: fund.code,
                    title: fund.title,
                    management_company_id: fund.management_company?.id || fund.management_company_id || '',
                    management_company_title: fund.management_company?.title || '',
                    management_company_logo: fund.management_company?.logo
                });
                setSelectedCodes([...selectedCodes, fund.code]);
                setSelectedFunds([...selectedFunds, { code: fund.code, title: fund.title }]);
                showToast('Fon karşılaştırma listesine eklendi.', 'success');
            } catch (error) {
                if (error instanceof Error) {
                    showToast(error.message, 'warning');
                } else {
                    console.error('Fon karşılaştırma listesine eklenirken hata:', error);
                    showToast('Fon karşılaştırma listesine eklenirken bir hata oluştu.', 'error');
                }
            }
        }
        setSearch('');
    };

    const handleRemoveFund = async (code: string) => {
        try {
            await removeFromComparison(code);
            setSelectedCodes(selectedCodes.filter((c) => c !== code));
            setSelectedFunds(selectedFunds.filter((f) => f.code !== code));
            showToast('Fon karşılaştırma listesinden kaldırıldı.', 'info');
        } catch (error) {
            console.error('Fon karşılaştırma listesinden kaldırılırken hata:', error);
            showToast('Fon karşılaştırma listesinden kaldırılırken bir hata oluştu.', 'error');
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setShowResults(true);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedData = () => {
        if (!comparisonData || !sortField) return comparisonData;

        return [...comparisonData].sort((a, b) => {
            const aValue = a[sortField as keyof typeof a];
            const bValue = b[sortField as keyof typeof b];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const multiplier = sortDirection === 'asc' ? 1 : -1;

            // String sıralaması (code ve title için)
            if (sortField === 'code' || sortField === 'title') {
                return multiplier * String(aValue).localeCompare(String(bValue));
            }

            // Sayısal sıralama (getiriler için)
            return multiplier * (Number(aValue) - Number(bValue));
        });
    };

    return (
        <div>
            <LoadingOverlay isLoading={isLoading || isComparing} />
            
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Fon Karşılaştırma</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Seçtiğiniz fonların performanslarını karşılaştırın
                    </p>
                </div>
                <ExportButton storeName="comparison" />
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
                {/* Fund Selector */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <div>
                        {/* Search Input and Results */}
                        <div className="relative" ref={searchRef}>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6"
                                placeholder="Fon kodu veya adı ile arayın..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => setShowResults(true)}
                            />

                            {/* Search Results */}
                            {showResults && search && searchResults && (
                                <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    <div className="max-h-[400px] overflow-y-auto scrollbar">
                                        {searchResults.data.map((fund) => (
                                            <button
                                                key={fund.code}
                                                className={`relative cursor-pointer select-none py-2 pl-3 pr-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                    selectedCodes.includes(fund.code) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                onClick={() => handleAddFund(fund)}
                                                disabled={selectedCodes.includes(fund.code)}
                                            >
                                                <div className="flex items-center">
                                                    <span className="flex-shrink-0 font-semibold text-gray-900 dark:text-gray-100 w-20">{fund.code}</span>
                                                    <span className="ml-2 truncate text-gray-500 dark:text-gray-400">{fund.title}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Funds */}
                        {selectedFunds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedFunds.map((fund) => (
                                    <div
                                        key={fund.code}
                                        className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 py-1 pl-2.5 pr-1 truncate max-w-md"
                                    >
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {fund.code} - {fund.title}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFund(fund.code)}
                                            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
                                        >
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {isLoading || isComparing ? (
                    <div className="animate-pulse space-y-8">
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                            <div className="overflow-x-auto scrollbar">
                                <div className="min-w-full">
                                    <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-t-lg mb-4"></div>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-2"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                                    <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                            <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                            <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    </div>
                ) : comparisonData && comparisonData.length > 0 ? (
                    <div className="space-y-6">
                        {/* Comparison Table */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Detaylı Karşılaştırma</h2>
                            <div className="overflow-x-auto scrollbar">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <SortHeader
                                                label="Fon Kodu"
                                                field="code"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="Fon Adı"
                                                field="title"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="1 Aylık"
                                                field="yield_1m"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="3 Ay"
                                                field="yield_3m"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="6 Ay"
                                                field="yield_6m"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="YBB"
                                                field="yield_ytd"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="1 Yıl"
                                                field="yield_1y"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="3 Yıl"
                                                field="yield_3y"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="5 Yıl"
                                                field="yield_5y"
                                                currentSort={sortField}
                                                currentOrder={sortDirection.toUpperCase() as 'ASC' | 'DESC'}
                                                onSort={handleSort}
                                            />
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-10">
                                                <span className="sr-only">İşlemler</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {getSortedData()?.map((fund) => (
                                            <tr 
                                                key={fund.code}
                                                onClick={(e) => {
                                                    if (!(e.target as HTMLElement).closest('.company-logo, .delete-button')) {
                                                        navigate(`/funds/${fund.code}`);
                                                    }
                                                }}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="py-4 pl-4 pr-3 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            to={`/companies/${fund.management_company.code}`}
                                                            className="company-logo flex-shrink-0 hover:opacity-75"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {fund.management_company?.logo && (
                                                                <img
                                                                    src={fund.management_company.logo}
                                                                    alt={fund.management_company.title}
                                                                    className="h-6 w-6 object-contain"
                                                                />
                                                            )}
                                                            {!fund.management_company?.logo && (
                                                                <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    {fund.management_company?.title?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </Link>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{fund.code}</div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="line-clamp-2 min-w-[200px] max-w-[400px] overflow-hidden text-ellipsis">{fund.title}</div>
                                                </td>
                                                {[
                                                    fund.yield_1m,
                                                    fund.yield_3m,
                                                    fund.yield_6m,
                                                    fund.yield_ytd,
                                                    fund.yield_1y,
                                                    fund.yield_3y,
                                                    fund.yield_5y,
                                                ].map((value, index) => (
                                                    <td
                                                        key={index}
                                                        className="whitespace-nowrap px-3 py-4 text-sm text-right"
                                                    >
                                                        <span
                                                            className={
                                                                value != null ? (
                                                                    value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                                ) : 'text-gray-500 dark:text-gray-400'
                                                            }
                                                        >
                                                            {formatPercent(value)}
                                                        </span>
                                                    </td>
                                                ))}
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFund(fund.code);
                                                        }}
                                                        className="delete-button text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                    >
                                                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Portfolio Size Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                                    Portföy Büyüklüğü Karşılaştırması
                                </h2>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart className="pie-chart-container">
                                            <Pie
                                                data={comparisonData.map(fund => ({
                                                    name: fund.code,
                                                    value: fund.last_historical_value.aum
                                                }))}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                            >
                                                {comparisonData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => [formatCurrency(value), 'Portföy Büyüklüğü']}
                                                contentStyle={{
                                                    backgroundColor: 'var(--background)',
                                                    borderColor: 'var(--gray-200)',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.75rem',
                                                    color: 'var(--foreground)'
                                                }}
                                                itemStyle={{
                                                    color: 'var(--foreground)'
                                                }}
                                                labelStyle={{
                                                    color: 'var(--foreground)'
                                                }}
                                            />
                                            <Legend 
                                                formatter={(value) => {
                                                    const fund = comparisonData.find(f => f.code === value);
                                                    if (fund) {
                                                        const percent = (fund.last_historical_value.aum / comparisonData.reduce((sum, f) => sum + f.last_historical_value.aum, 0) * 100);
                                                        return `${value} (${formatPercent(percent)})`;
                                                    }
                                                    return value;
                                                }}
                                                layout={isMobile ? "horizontal" : "vertical"}
                                                align={isMobile ? "center" : "right"}
                                                verticalAlign={isMobile ? "bottom" : "middle"}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                                    Dolaşımdaki Pay Karşılaştırması
                                </h2>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart className="pie-chart-container">
                                            <Pie
                                                data={comparisonData.map(fund => ({
                                                    name: fund.code,
                                                    value: fund.last_historical_value.shares_active
                                                }))}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                            >
                                                {comparisonData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Dolaşımdaki Pay']}
                                                contentStyle={{
                                                    backgroundColor: 'var(--background)',
                                                    borderColor: 'var(--gray-200)',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.75rem',
                                                    color: 'var(--foreground)'
                                                }}
                                                itemStyle={{
                                                    color: 'var(--foreground)'
                                                }}
                                                labelStyle={{
                                                    color: 'var(--foreground)'
                                                }}
                                            />
                                            <Legend 
                                                formatter={(value) => {
                                                    const fund = comparisonData.find(f => f.code === value);
                                                    if (fund) {
                                                        const percent = (fund.last_historical_value.shares_active / comparisonData.reduce((sum, f) => sum + f.last_historical_value.shares_active, 0) * 100);
                                                        return `${value} (${formatPercent(percent)})`;
                                                    }
                                                    return value;
                                                }}
                                                layout={isMobile ? "horizontal" : "vertical"}
                                                align={isMobile ? "center" : "right"}
                                                verticalAlign={isMobile ? "bottom" : "middle"}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Period Performance Comparison */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                                Dönem Bazlı Getiri Karşılaştırması
                            </h2>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        barSize={20}
                                        className="dark:[&_.recharts-tooltip-cursor]:fill-gray-700"
                                        data={[
                                        { period: '1 Ay', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_1m }), {}) },
                                        { period: '3 Ay', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_3m }), {}) },
                                        { period: '6 Ay', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_6m }), {}) },
                                        { period: 'YBB', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_ytd }), {}) },
                                        { period: '1 Yıl', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_1y }), {}) },
                                        { period: '3 Yıl', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_3y }), {}) },
                                        { period: '5 Yıl', ...comparisonData.reduce((acc, fund) => ({ ...acc, [fund.code]: fund.yield_5y }), {}) }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-gray-700" />
                                        <XAxis 
                                            dataKey="period"
                                            className="text-gray-600 dark:text-gray-300"
                                        />
                                        <YAxis
                                            className="text-gray-600 dark:text-gray-300"
                                            tickFormatter={(value) => `${value}%`}
                                            domain={[
                                                (dataMin: number) => Math.floor(dataMin * 1.01),
                                                (dataMax: number) => Math.ceil(dataMax * 1.01)
                                            ]}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Getiri']}
                                            contentStyle={{
                                                backgroundColor: 'var(--background)',
                                                borderColor: 'var(--gray-200)',
                                                borderRadius: '0.5rem',
                                                padding: '0.75rem'
                                            }}
                                        />
                                        <Legend />
                                        {selectedCodes.map((code, index) => (
                                            <Bar
                                                key={code}
                                                dataKey={code}
                                                name={code}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 5 Yıllık Performans Grafiği */}
                        {Object.keys(historicalData).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                                    5 Yıllık Fiyat Karşılaştırması
                                </h2>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getHistoricalChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-gray-700" />
                                            <XAxis 
                                                dataKey="date" 
                                                className="text-gray-600 dark:text-gray-300"
                                                tickFormatter={(date) => {
                                                    return new Date(date).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'short'
                                                    });
                                                }}
                                                interval="preserveStartEnd"
                                                minTickGap={50}
                                            />
                                            <YAxis
                                                className="text-gray-600 dark:text-gray-300"
                                                tickFormatter={(value) => formatCurrency(value)}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [formatCurrency(value), 'Değer']}
                                                labelFormatter={(date) => {
                                                    return new Date(date).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'long'
                                                    });
                                                }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--background)',
                                                    borderColor: 'var(--gray-200)',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.75rem'
                                                }}
                                            />
                                            <Legend />
                                            {selectedCodes.map((code, index) => (
                                                <Line
                                                    key={code}
                                                    type="monotone"
                                                    dataKey={code}
                                                    stroke={COLORS[index % COLORS.length]}
                                                    dot={false}
                                                    strokeWidth={2}
                                                    name={code}
                                                    connectNulls
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                ) : selectedCodes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                        <EmptyState
                            title="Karşılaştırma Listesi Boş"
                            description="Karşılaştırmak istediğiniz fonları listeden ekleyin."
                            icon={<ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
} 