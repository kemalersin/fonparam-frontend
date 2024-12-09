import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFundDetails, useFundHistory, useAnalyzeFund } from '../hooks/useApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, BuildingOfficeIcon, CalendarIcon, BanknotesIcon, InformationCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import ComparisonButton from '../components/ComparisonButton';

const PERIODS = [
    { label: 'Son 1 Ay', value: 'last_1_month' },
    { label: 'Son 3 Ay', value: 'last_3_months' },
    { label: 'Son 6 Ay', value: 'last_6_months' },
    { label: 'YTD', value: 'year_start' },
    { label: 'Son 1 Yıl', value: 'last_1_year' },
    { label: 'Son 3 Yıl', value: 'last_3_years' },
    { label: 'Son 5 Yıl', value: 'last_5_years' },
];

const formatPercentage = (value: number | undefined | null): string => {
    if (value == null) return '-';
    return `%${value.toLocaleString('tr-TR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const getStartDate = (period: string): string => {
    const today = new Date();
    switch (period) {
        case 'last_1_month':
            return new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
        case 'last_3_months':
            return new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0];
        case 'last_6_months':
            return new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
        case 'year_start':
            return `${today.getFullYear()}-01-01`;
        case 'last_1_year':
            return new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
        case 'last_3_years':
            return new Date(today.setFullYear(today.getFullYear() - 3)).toISOString().split('T')[0];
        case 'last_5_years':
            return new Date(today.setFullYear(today.getFullYear() - 5)).toISOString().split('T')[0];
        default:
            return new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
    }
};

const formatCurrency = (value: number | undefined | null): string => {
    if (value == null) return '-';
    return `₺${value.toLocaleString('tr-TR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export default function FundDetail() {
    const { code } = useParams<{ code: string }>();
    const [selectedPeriod, setSelectedPeriod] = useState('last_1_year');
    const [showMonthlyDetails, setShowMonthlyDetails] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);
    const [analysisParams, setAnalysisParams] = useState({
        startDate: selectedPeriod,
        initialInvestment: 10000,
        monthlyInvestment: 1000,
        includeMonthlyDetails: true,
        yearlyIncrease: {
            type: 'percentage' as 'percentage' | 'amount',
            value: 10 as number
        }
    });

    const { data: currentFund, isLoading: isLoadingFund } = useFundDetails(code ?? '');
    const { data: history } = useFundHistory(code ?? '', {
        interval: 'daily',
        sort: 'date',
        order: 'ASC',
        start_date: getStartDate(selectedPeriod)
    });
    const { data: analysis } = useAnalyzeFund(code ?? '', analysisParams);

    useEffect(() => {
        setAnalysisParams(prev => ({
            ...prev,
            startDate: selectedPeriod
        }));
    }, [selectedPeriod]);

    useEffect(() => {
        if (code && currentFund) {
            setIsCheckingFavorite(true);
            isFavorite(code)
                .then(setIsFavorited)
                .finally(() => setIsCheckingFavorite(false));
        }
    }, [code, currentFund]);

    const handleFavoriteClick = async () => {
        if (!currentFund) return;

        try {
            if (isFavorited) {
                await removeFavorite(code ?? '');
                setIsFavorited(false);
            } else {
                await addFavorite({
                    code: currentFund.code,
                    title: currentFund.title,
                    type: currentFund.type,
                    management_company_id: currentFund.management_company_id,
                    management_company_title: currentFund.management_company?.title ?? '',
                    management_company_logo: currentFund.management_company?.logo
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Favori işlemi başarısız:', error);
        }
    };

    if (isLoadingFund) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Fon bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!currentFund) {
        return (
            <div className="text-center py-12">
                <h2 className="text-base font-semibold text-indigo-600">404</h2>
                <p className="mt-2 text-3xl font-bold text-gray-900">Fon Bulunamadı</p>
                <p className="mt-2 text-sm text-gray-500">Belirtilen fon koduna sahip bir fon bulunamadı.</p>
                <div className="mt-6">
                    <Link to="/funds" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
                        Fon Listesine Dön <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex gap-4">
                            <Link
                                to={`/companies/${currentFund.management_company_id}`}
                                className="flex-shrink-0 hover:opacity-75 self-center"
                            >
                                {currentFund.management_company?.logo ? (
                                    <img
                                        src={currentFund.management_company.logo}
                                        alt={currentFund.management_company.title}
                                        className="h-12 w-12 object-contain"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xl font-medium text-gray-500">
                                        {currentFund.management_company?.title.charAt(0)}
                                    </div>
                                )}
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{currentFund.title}</h1>
                                    <span className="text-sm text-gray-500">({currentFund.code})</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleFavoriteClick}
                                            disabled={isCheckingFavorite}
                                            className="p-1 w-7 h-7 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                                        >
                                            {isCheckingFavorite ? (
                                                <div className="w-5 h-5 animate-pulse bg-gray-200 rounded-full" />
                                            ) : isFavorited ? (
                                                <StarIconSolid className="h-5 w-5 text-yellow-400" />
                                            ) : (
                                                <StarIcon className="h-5 w-5 text-gray-400 hover:text-yellow-400" />
                                            )}
                                        </button>
                                        <ComparisonButton 
                                            fund={{
                                                code: currentFund.code,
                                                title: currentFund.title,
                                                management_company_id: currentFund.management_company_id,
                                                management_company_title: currentFund.management_company?.title || '',
                                                management_company_logo: currentFund.management_company?.logo
                                            }}
                                            className="w-7 h-7 [&_svg]:w-5 [&_svg]:h-5 [&_div]:w-5 [&_div]:h-5"
                                        />
                                    </div>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-2">
                                    <div className="flex items-center">
                                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                        <Link
                                            to={`/companies/${currentFund.management_company_id}`}
                                            className="hover:text-indigo-600"
                                        >
                                            {currentFund.management_company?.title}
                                        </Link>
                                    </div>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{currentFund.type}</span>
                                    {currentFund.tefas && (
                                        <>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                TEFAS
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            {currentFund.yield_1y ? (
                                <span
                                    className={currentFund.yield_1y >= 0 ? 'text-green-600' : 'text-red-600'}
                                >
                                    {formatPercentage(currentFund.yield_1y)}
                                </span>
                            ) : (
                                '-'
                            )}
                        </div>
                        <div className="text-sm text-gray-500">Yıllık Getiri</div>
                    </div>
                </div>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: '1 Aylık', value: currentFund.yield_1m },
                    { label: '6 Aylık', value: currentFund.yield_6m },
                    { label: 'YTD', value: currentFund.yield_ytd },
                    { label: '3 Yıllık', value: currentFund.yield_3y },
                ].map((item) => (
                    <div key={item.label} className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {item.value && item.value >= 0 ? (
                                        <ArrowUpIcon className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <ArrowDownIcon className="h-6 w-6 text-red-500" />
                                    )}
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {item.label} Getiri
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div
                                                className={`text-2xl font-semibold ${
                                                    item.value && item.value >= 0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {formatPercentage(item.value)}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-medium text-gray-900">Geçmiş Performans</h2>
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                                className={`px-3 py-1 text-sm rounded-full ${
                                    selectedPeriod === period.value
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-80 mt-6">
                    {history && (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) =>
                                        new Date(date).toLocaleDateString('tr-TR', {
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                    }
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
                                    formatter={(value: number) => [formatCurrency(value), 'Değer']}
                                    labelFormatter={(date) =>
                                        new Date(date).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                    }
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4f46e5"
                                    dot={false}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Investment Analysis */}
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Yatırım Analizi</h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Başlangıç Yatırımı
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₺</span>
                                </div>
                                <input
                                    type="number"
                                    value={analysisParams.initialInvestment}
                                    onChange={(e) =>
                                        setAnalysisParams({
                                            ...analysisParams,
                                            initialInvestment: Number(e.target.value),
                                        })
                                    }
                                    className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Aylık Yatırım
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₺</span>
                                </div>
                                <input
                                    type="number"
                                    value={analysisParams.monthlyInvestment}
                                    onChange={(e) =>
                                        setAnalysisParams({
                                            ...analysisParams,
                                            monthlyInvestment: Number(e.target.value),
                                        })
                                    }
                                    className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                Yıllık Artış
                                <div className="group relative">
                                    <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        Aylık yatırım tutarına her yıl uygulanacak artış miktarı. Yüzde veya sabit tutar olarak belirlenebilir.
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                            </label>
                            <div className="mt-1 grid grid-cols-2 gap-2">
                                <select
                                    value={analysisParams.yearlyIncrease.type}
                                    onChange={(e) =>
                                        setAnalysisParams({
                                            ...analysisParams,
                                            yearlyIncrease: {
                                                ...analysisParams.yearlyIncrease,
                                                type: e.target.value as 'percentage' | 'amount'
                                            }
                                        })
                                    }
                                    className="block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                    <option value="percentage">Yüzde</option>
                                    <option value="amount">Tutar</option>
                                </select>
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        value={analysisParams.yearlyIncrease.value}
                                        onChange={(e) =>
                                            setAnalysisParams({
                                                ...analysisParams,
                                                yearlyIncrease: {
                                                    ...analysisParams.yearlyIncrease,
                                                    value: Number(e.target.value)
                                                }
                                            })
                                        }
                                        className="block w-full pr-8 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">
                                            {analysisParams.yearlyIncrease.type === 'percentage' ? '%' : '₺'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2">
                                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                    <input
                                        type="checkbox"
                                        checked={showMonthlyDetails}
                                        onChange={(e) => setShowMonthlyDetails(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-indigo-600"></div>
                                    <div className="absolute left-0.5 top-0.5 h-5 w-5 transform cursor-pointer rounded-full bg-white shadow transition duration-200 ease-in-out peer-checked:translate-x-5"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Aylık Detaylar</span>
                            </label>
                        </div>
                    </div>

                    {analysis && (
                        <div className="lg:col-span-2">
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Toplam Yatırım
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                                        ₺{analysis.summary.totalInvestment.toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Güncel Değer
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                                        ₺{analysis.summary.currentValue.toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Toplam Getiri
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-green-600">
                                        ₺{analysis.summary.totalYield.toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Getiri Oranı
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-green-600">
                                        {formatPercentage(analysis.summary.totalYieldPercentage)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Details */}
            {analysis && showMonthlyDetails && analysis.monthlyDetails && (
                <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Aylık Detaylar</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                        Tarih
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Aylık Yatırım
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Toplam Yatırım
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Birim Fiyat
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Alınan Pay
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Toplam Pay
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Portföy Değeri
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Aylık Değişim
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Aylık Getiri
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        Toplam Getiri
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {analysis.monthlyDetails.map((detail, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                            {new Date(detail.date).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long'
                                            })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                            {formatCurrency(detail.investment)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                            {formatCurrency(detail.totalInvestment)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                            {formatCurrency(detail.unitPrice)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                            {detail.units.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                            {detail.totalUnits.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                            {formatCurrency(detail.value)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                            <span className={detail.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(detail.monthlyChange)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                            <span className={detail.monthlyChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatPercentage(detail.monthlyChangePercentage)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                            <span className={detail.totalYieldPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatPercentage(detail.totalYieldPercentage)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 