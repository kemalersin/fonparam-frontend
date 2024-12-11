import { useState, useEffect, useRef } from 'react';
import { useCompareFunds, useFunds } from '../hooks/useApi';
import { MagnifyingGlassIcon, XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { addToComparison, removeFromComparison, getComparisonList } from '../services/comparison';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { formatPercent, formatCurrency } from '../utils/format';

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

interface SelectedFund {
    code: string;
    title: string;
}

export default function Compare() {
    const [search, setSearch] = useState('');
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const [selectedFunds, setSelectedFunds] = useState<SelectedFund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    const { data: searchResults, isLoading: isSearching } = useFunds(
        search ? {
            search,
            limit: 20,
            page: 1,
        } : undefined
    );

    const { data: comparisonData, isLoading: isComparing } = useCompareFunds(
        selectedCodes.length >= 2 ? selectedCodes : []
    );

    const chartPoints = comparisonData?.map((fund) => ({
        code: fund.code,
        data: [
            { period: '1A', value: fund.yield_1m },
            { period: '3A', value: fund.yield_3m },
            { period: '6A', value: fund.yield_6m },
            { period: 'YTD', value: fund.yield_ytd },
            { period: '1Y', value: fund.yield_1y },
            { period: '3Y', value: fund.yield_3y },
            { period: '5Y', value: fund.yield_5y },
        ]
    })) || [];

    const chartData = chartPoints[0]?.data.map((item, i) => {
        const point: any = { period: item.period };
        chartPoints.forEach(fund => {
            point[fund.code] = fund.data[i].value;
        });
        return point;
    }) || [];

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

    return (
        <div>
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Fon Karşılaştırma</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Seçtiğiniz fonların performanslarını karşılaştırın
                    </p>
                </div>
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

                {isLoading ? (
                    <div className="animate-pulse space-y-8">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                ) : comparisonData && comparisonData.length > 0 ? (
                    <div className="space-y-6">
                        {/* Performance Chart */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Performans Karşılaştırması</h2>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-gray-700" />
                                        <XAxis dataKey="period" className="text-gray-600 dark:text-gray-300" />
                                        <YAxis 
                                            tickFormatter={(value) => value.toFixed(0) + '%'} 
                                            className="text-gray-600 dark:text-gray-300"
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                const fundIndex = selectedFunds.findIndex(f => f.code === name);
                                                return [
                                                    <span style={{ color: COLORS[fundIndex % COLORS.length] }}>
                                                        {"Getiri: " + formatCurrency(value)}
                                                    </span>, 
                                                    <span style={{ color: COLORS[fundIndex % COLORS.length] }}>
                                                        {name}
                                                    </span>
                                                ];
                                            }}
                                            labelFormatter={(value) => value}
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
                                            wrapperStyle={{
                                                outline: 'none',
                                            }}
                                        />
                                        <Legend />
                                        {selectedFunds.map((fund, index) => (
                                            <Line
                                                key={fund.code}
                                                type="monotone"
                                                dataKey={fund.code}
                                                stroke={COLORS[index % COLORS.length]}
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Detaylı Karşılaştırma</h2>
                            <div className="overflow-x-auto scrollbar">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Fon
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                1 Aylık
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                3 Aylık
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                6 Aylık
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                YTD
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                1 Yıllık
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                3 Yıllık
                                            </th>
                                            <th className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                5 Yıllık
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {comparisonData.map((fund) => (
                                            <tr key={fund.code}>
                                                <td className="py-4 pl-4 pr-3 text-sm">
                                                    <div className="flex items-start gap-3">
                                                        <Link
                                                            to={`/companies/${fund.management_company_id}`}
                                                            className="company-logo flex-shrink-0 hover:opacity-75 mt-1"
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
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{fund.code}</div>
                                                            <div className="text-gray-500 dark:text-gray-400 line-clamp-2 min-w-[200px] max-w-[400px] overflow-hidden text-ellipsis">{fund.title}</div>
                                                        </div>
                                                    </div>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                        <EmptyState
                            title="Karşılaştırma Listesi Boş"
                            description="Karşılaştırmak istediğiniz fonları listeden ekleyin."
                            icon={<ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 