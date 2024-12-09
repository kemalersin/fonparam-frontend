import { useState, useEffect } from 'react';
import { useCompareFunds, useFunds } from '../hooks/useApi';
import { MagnifyingGlassIcon, XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { addToComparison, removeFromComparison, getComparisonList } from '../services/comparison';
import Toast from '../components/Toast';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const COLORS = ['#4f46e5', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777'];

interface SelectedFund {
    code: string;
    title: string;
}

const formatNumber = (value: number | undefined | null): string => {
    if (value == null) return '-';
    return `%${value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export default function Compare() {
    const [search, setSearch] = useState('');
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const [selectedFunds, setSelectedFunds] = useState<SelectedFund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    const { data: searchResults, isLoading: isSearching } = useFunds({
        search,
        limit: 5,
        page: 1,
    });

    const { data: comparisonData, isLoading: isComparing } = useCompareFunds(
        selectedCodes.length >= 2 ? selectedCodes : []
    );

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
        if (selectedCodes.length < 6 && !selectedCodes.includes(fund.code)) {
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
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Fon karşılaştırma listesine eklendi.'
                });
            } catch (error) {
                if (error instanceof Error) {
                    setToast({
                        show: true,
                        type: 'warning',
                        message: error.message
                    });
                } else {
                    console.error('Fon karşılaştırma listesine eklenirken hata:', error);
                    setToast({
                        show: true,
                        type: 'error',
                        message: 'Fon karşılaştırma listesine eklenirken bir hata oluştu.'
                    });
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
            setToast({
                show: true,
                type: 'info',
                message: 'Fon karşılaştırma listesinden kaldırıldı.'
            });
        } catch (error) {
            console.error('Fon karşılaştırma listesinden kaldırılırken hata:', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Fon karşılaştırma listesinden kaldırılırken bir hata oluştu.'
            });
        }
    };

    return (
        <div className="space-y-6">
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fon Karşılaştırma</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Seçtiğiniz fonların performanslarını karşılaştırın
                    </p>
                </div>
            </div>

            {/* Fund Selector */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div>
                    {/* Search Input and Results */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Fon kodu veya adı ile arayın..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* Search Results */}
                        {search && searchResults && (
                            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {searchResults.data.map((fund) => (
                                    <button
                                        key={fund.code}
                                        className="relative cursor-pointer select-none py-2 pl-3 pr-3 w-full text-left hover:bg-gray-50"
                                        onClick={() => handleAddFund(fund)}
                                        disabled={selectedCodes.includes(fund.code)}
                                    >
                                        <div className="flex items-center">
                                            <span className="flex-shrink-0 font-semibold text-gray-900 w-20">{fund.code}</span>
                                            <span className="ml-2 truncate text-gray-500">{fund.title}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Funds */}
                    {selectedFunds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {selectedFunds.map((fund) => (
                                <div
                                    key={fund.code}
                                    className="inline-flex items-center rounded-full bg-gray-100 py-1 pl-2.5 pr-1"
                                >
                                    <span className="text-sm font-medium text-gray-900 truncate max-w-md">
                                        {fund.code} - {fund.title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFund(fund.code)}
                                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
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
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            ) : comparisonData && comparisonData.length > 0 ? (
                <div className="space-y-6">
                    {/* Performance Chart */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Performans Karşılaştırması</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        type="category"
                                        allowDuplicatedCategory={false}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => 
                                            value.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                        }
                                    />
                                    <Tooltip 
                                        formatter={(value: number) => [
                                            value.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }) + '%',
                                            'Getiri'
                                        ]}
                                    />
                                    <Legend />
                                    {comparisonData.map((fund, index) => (
                                        <Line
                                            key={fund.code}
                                            type="monotone"
                                            data={[
                                                { date: '1A', value: fund.yield_1m },
                                                { date: '3A', value: fund.yield_3m },
                                                { date: '6A', value: fund.yield_6m },
                                                { date: 'YTD', value: fund.yield_ytd },
                                                { date: '1Y', value: fund.yield_1y },
                                                { date: '3Y', value: fund.yield_3y },
                                                { date: '5Y', value: fund.yield_5y },
                                            ]}
                                            name={fund.code}
                                            dataKey="value"
                                            stroke={COLORS[index]}
                                            dot={true}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Detaylı Karşılaştırma</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                            Fon
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            1 Aylık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            3 Aylık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            6 Aylık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            YTD
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            1 Yıllık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            3 Yıllık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                            5 Yıllık
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
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
                                                            <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                                                {fund.management_company?.title?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{fund.code}</div>
                                                        <div className="text-gray-500 line-clamp-2 min-w-[200px] max-w-[400px] overflow-hidden text-ellipsis">{fund.title}</div>
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
                                                                value >= 0 ? 'text-green-600' : 'text-red-600'
                                                            ) : 'text-gray-500'
                                                        }
                                                    >
                                                        {formatNumber(value)}
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
                <div className="bg-white shadow-sm rounded-lg">
                    <EmptyState
                        title="Karşılaştırma Listesi Boş"
                        description="Karşılaştırmak istediğiniz fonları listeden ekleyin."
                        icon={<ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400" />}
                    />
                </div>
            )}
        </div>
    );
} 