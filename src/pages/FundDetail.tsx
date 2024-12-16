import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useFundDetails, useFundHistory, useAnalyzeFund } from '../hooks/useApi';
import { useSwipe } from '../hooks/useSwipe';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BanknotesIcon, InformationCircleIcon, ChevronUpDownIcon, CheckIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import ComparisonButton from '../components/ComparisonButton';
import FavoriteButton from '../components/FavoriteButton';
import { formatPercent, formatCurrency, formatNumber, formatDate } from '../utils/format';
import { saveAnalysis } from '../services/analysis';
import type { AnalysisParams, YearlyIncreaseType } from '../types/api';
import { useToast } from '../contexts/ToastContext';
import { 
    DEFAULT_INVESTMENT_PERIOD,
    DEFAULT_INITIAL_INVESTMENT,
    DEFAULT_MONTHLY_INVESTMENT,
    DEFAULT_INCREASE_TYPE,
    DEFAULT_INCREASE_VALUE
} from '../constants';
import { addToRecentlyViewed } from '../services/recentlyViewed';
import LoadingOverlay from '../components/LoadingOverlay';

const PERIODS = [
    { label: '1 Gün', value: 'last_1_day' },
    { label: '1 Hafta', value: 'last_1_week' },
    { label: '1 Ay', value: 'last_1_month' },
    { label: '3 Ay', value: 'last_3_months' },
    { label: '6 Ay', value: 'last_6_months' },
    { label: 'YBB', value: 'year_start' },
    { label: '1 Yıl', value: 'last_1_year' },
    { label: '3 Yıl', value: 'last_3_years' },
    { label: '5 Yıl', value: 'last_5_years' },
];

const getStartDate = (period: string): string => {
    const today = new Date();
    switch (period) {
        case 'last_1_day':
            return new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];
        case 'last_1_week':
            return new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
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

const INCREASE_TYPES: { id: YearlyIncreaseType; name: string; symbol: string }[] = [
    { id: 'percentage', name: 'Yüzde', symbol: '%' },
    { id: 'amount', name: 'Tutar', symbol: '₺' }
];

export default function FundDetail() {
    const { code } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [performanceSlide, setPerformanceSlide] = useState(0);
    const swipeHandlers = useSwipe({
        onSwipeLeft: () => performanceSlide < 1 && setPerformanceSlide(1),
        onSwipeRight: () => performanceSlide > 0 && setPerformanceSlide(0)
    });
    
    const [selectedPeriod, setSelectedPeriod] = useState(() => 
        searchParams.get('period') || DEFAULT_INVESTMENT_PERIOD
    );
    
    const [showMonthlyDetails, setShowMonthlyDetails] = useState(() => {
        const stored = localStorage.getItem('showMonthlyDetails');
        return stored ? JSON.parse(stored) : false;
    });

    const [analysisParams, setAnalysisParams] = useState<AnalysisParams>(() => {
        const increaseType = searchParams.get('increaseType');
        return {
            initialInvestment: Number(searchParams.get('initial')) || DEFAULT_INITIAL_INVESTMENT,
            monthlyInvestment: Number(searchParams.get('monthly')) || DEFAULT_MONTHLY_INVESTMENT,
            yearlyIncrease: {
                type: (increaseType === 'percentage' || increaseType === 'amount') ? increaseType : DEFAULT_INCREASE_TYPE,
                value: Number(searchParams.get('increaseValue')) || DEFAULT_INCREASE_VALUE
            },
            startDate: selectedPeriod
        };
    });

    const [debouncedAnalysisParams, setDebouncedAnalysisParams] = useState(analysisParams);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedAnalysisParams(analysisParams);
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [analysisParams]);

    const { data: currentFund, isLoading: isLoadingFund } = useFundDetails(code ?? '');
    const { data: history } = useFundHistory(code ?? '', {
        interval: 'daily',
        sort: 'date',
        order: 'ASC',
        start_date: getStartDate(selectedPeriod)
    });

    const [analysisData, setAnalysisData] = useState<typeof analysis>(undefined);
    const { data: analysis, isLoading: isAnalysisLoading, error: analysisError } = useAnalyzeFund(code ?? '', {
        ...debouncedAnalysisParams,
        includeMonthlyDetails: showMonthlyDetails
    });

    const { showToast } = useToast();

    useEffect(() => {
        if (analysis && !analysisError) {
            setAnalysisData(analysis);
        }
    }, [analysis, analysisError]);

    useEffect(() => {
        setAnalysisParams(prev => ({
            ...prev,
            startDate: selectedPeriod
        }));
    }, [selectedPeriod]);

    const handleMonthlyDetailsToggle = (checked: boolean) => {
        setShowMonthlyDetails(checked);
        localStorage.setItem('showMonthlyDetails', JSON.stringify(checked));
    };

    // URL'i güncelle
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        
        if (selectedPeriod !== DEFAULT_INVESTMENT_PERIOD) {
            params.set('period', selectedPeriod);
        } else {
            params.delete('period');
        }
        
        if (analysisParams.initialInvestment !== DEFAULT_INITIAL_INVESTMENT) {
            params.set('initial', analysisParams.initialInvestment.toString());
        } else {
            params.delete('initial');
        }
        
        if (analysisParams.monthlyInvestment !== DEFAULT_MONTHLY_INVESTMENT) {
            params.set('monthly', analysisParams.monthlyInvestment.toString());
        } else {
            params.delete('monthly');
        }
        
        if (analysisParams.yearlyIncrease.type !== DEFAULT_INCREASE_TYPE) {
            params.set('increaseType', analysisParams.yearlyIncrease.type);
        } else {
            params.delete('increaseType');
        }

        if (analysisParams.yearlyIncrease.value !== DEFAULT_INCREASE_VALUE) {
            params.set('increaseValue', analysisParams.yearlyIncrease.value.toString());
        } else {
            params.delete('increaseValue');
        }
        
        setSearchParams(params, { replace: true });
    }, [selectedPeriod, analysisParams]);

    const handleSaveAnalysis = async () => {
        if (!currentFund || !analysis) {
            showToast('Analiz verisi henüz yüklenmedi', 'error');
            return;
        }

        try {
            const record = {
                fund: {
                    code: currentFund.code,
                    title: currentFund.title,
                    management_company: currentFund.management_company
                },
                parameters: {
                    initialInvestment: analysisParams.initialInvestment,
                    monthlyInvestment: analysisParams.monthlyInvestment,
                    yearlyIncrease: analysisParams.yearlyIncrease,
                    startDate: analysisParams.startDate
                },
                summary: {
                    totalInvestment: analysis.summary.totalInvestment,
                    totalYield: analysis.summary.totalYield,
                    currentValue: analysis.summary.currentValue,
                    totalYieldPercentage: analysis.summary.totalYieldPercentage
                }
            };

            await saveAnalysis(record);
            showToast('Analiz kaydedildi', 'success');
        } catch (error) {
            showToast('Analiz kaydedilemedi. Lütfen tekrar deneyin.', 'error');
        }
    };

    useEffect(() => {
        if (currentFund) {
            addToRecentlyViewed({
                code: currentFund.code,
                title: currentFund.title,
                management_company: currentFund.management_company
            }).catch(console.error);
        }
    }, [currentFund]);

    const getDetailsTitle = (period: string) => {
        switch (period) {
            case 'last_1_day':
                return 'Günlük';
            case 'last_1_week':
                return 'Haftalık';
            default:
                return 'Aylık';
        }
    };

    useEffect(() => {
        if (!isLoadingFund && currentFund) {
            const timer = setInterval(() => {
                setPerformanceSlide(current => (current + 1) % 2);
            }, 5000); // Her 5 saniyede bir geçiş yap

            return () => clearInterval(timer);
        }
    }, [isLoadingFund, currentFund]);

    return (
        <div>
            <LoadingOverlay isLoading={isLoadingFund} />
            
            {!isLoadingFund && !currentFund && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Fon Bulunamadı
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Aradığınız fon bulunamadı veya erişilemedi. Lütfen daha sonra tekrar deneyin.
                        </p>
                    </div>
                </div>
            )}
            
            {currentFund && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start lg:items-center gap-4">
                                    <Link
                                        to={`/companies/${currentFund.management_company.code}`}
                                        className="flex-shrink-0 hover:opacity-75 mt-1 sm:mt-2 lg:mt-0"
                                    >
                                        {currentFund.management_company?.logo ? (
                                            <img
                                                src={currentFund.management_company.logo}
                                                alt={currentFund.management_company.title}
                                                className="h-12 w-12 object-contain"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-base font-medium text-gray-500 dark:text-gray-400">
                                                {currentFund.management_company?.title.charAt(0)}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="min-w-0">
                                        <div className="flex lg:items-center gap-4">
                                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {currentFund.title}
                                            </h1>
                                            <div className="hidden sm:flex gap-1">
                                                <FavoriteButton fund={currentFund} />
                                                <ComparisonButton fund={currentFund} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span>{currentFund.code}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>{currentFund.type}</span>
                                            {currentFund.tefas && (
                                                <>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30">
                                                        TEFAS
                                                    </span>
                                                </>
                                            )}
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
                                                    <span>{formatDate(currentFund.last_historical_value?.date)}</span>
                                                    <span className="mx-1">•</span>
                                                    <BanknotesIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(currentFund.last_historical_value?.value, 10)}
                                                    </span>
                                                </div>
                                            </>
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
                                                    <ChartBarIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(currentFund.last_historical_value?.aum)}
                                                    </span>
                                                </div>
                                            </>
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
                                                    <UsersIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {formatNumber(currentFund.last_historical_value?.investor_count)} yatırımcı
                                                    </span>
                                                </div>
                                            </>
                                            <>
                                            <div className="flex w-full justify-end sm:hidden">
                                                <FavoriteButton fund={currentFund} />
                                                <ComparisonButton fund={currentFund} />
                                            </div>
                                            </>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {currentFund.yield_1d ? (
                                        <span
                                            className={currentFund.yield_1d! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                                        >
                                            {formatPercent(currentFund.yield_1d)}
                                        </span>
                                    ) : (
                                        '-'
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Günlük Getiri</div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Cards */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
                        <div className="relative overflow-hidden">
                            <div 
                                className="flex transition-transform duration-500 ease-in-out" 
                                style={{ transform: `translateX(-${performanceSlide * 100}%)` }}
                                {...swipeHandlers}
                            >
                                <div className="w-full flex-shrink-0">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: '1 Haftalık', value: currentFund.yield_1w },
                                            { label: '1 Aylık', value: currentFund.yield_1m },
                                            { label: '3 Aylık', value: currentFund.yield_3m },
                                            { label: '6 Aylık', value: currentFund.yield_6m },
                                        ].map((item) => (
                                            <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center sm:text-left">{item.label}</dt>
                                                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-center sm:text-left">
                                                    {item.value != null ? (
                                                        <span className={item.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                            {formatPercent(item.value)}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </dd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full flex-shrink-0">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'YBB', value: currentFund.yield_ytd },
                                            { label: '1 Yıllık', value: currentFund.yield_1y },
                                            { label: '3 Yıllık', value: currentFund.yield_3y },
                                            { label: '5 Yıllık', value: currentFund.yield_5y },
                                        ].map((item) => (
                                            <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center sm:text-left">{item.label}</dt>
                                                <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-center sm:text-left">
                                                    {item.value != null ? (
                                                        <span className={item.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                            {formatPercent(item.value)}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </dd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    onClick={() => setPerformanceSlide(0)}
                                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                                        performanceSlide === 0
                                            ? 'bg-indigo-600 dark:bg-indigo-500'
                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                />
                                <button
                                    onClick={() => setPerformanceSlide(1)}
                                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                                        performanceSlide === 1
                                            ? 'bg-indigo-600 dark:bg-indigo-500'
                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Geçmiş Performans</h2>
                            <div className="flex flex-wrap gap-2">
                                {PERIODS.map((period) => (
                                    <button
                                        key={period.value}
                                        onClick={() => setSelectedPeriod(period.value)}
                                        className={`px-3 py-1 text-sm rounded-full ${
                                            selectedPeriod === period.value
                                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                                        <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-gray-700" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) =>
                                                new Date(date).toLocaleDateString('tr-TR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                            }
                                            className="text-gray-600 dark:text-gray-300"
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => 
                                                value.toLocaleString('tr-TR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })
                                            }
                                            className="text-gray-600 dark:text-gray-300"
                                            domain={['auto', 'auto']}
                                            padding={{ top: 20, bottom: 20 }}
                                        />
                                        <Tooltip
                                            formatter={(value: number, _: string, props: any) => {
                                                const previousValue = props.payload.length > 1 ? props.payload[0].value : value;
                                                const isProfit = value >= previousValue;
                                                const textColor = isProfit ? 'var(--green-600)' : 'var(--red-600)';
                                                return [
                                                    <span style={{ color: textColor }}>
                                                        {formatCurrency(value)}
                                                    </span>, 
                                                    <span style={{ color: textColor }}>Değer</span>
                                                ];
                                            }}
                                            labelFormatter={(date) => {
                                                const formattedDate = new Date(date).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                });
                                                return formattedDate;
                                            }}
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
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Yatırım Analizi</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {getDetailsTitle(analysisParams.startDate)} Detaylar
                                </span>
                                <button
                                    type="button"
                                    className={`${
                                        showMonthlyDetails ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800`}
                                    role="switch"
                                    aria-checked={showMonthlyDetails}
                                    onClick={() => handleMonthlyDetailsToggle(!showMonthlyDetails)}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`${
                                            showMonthlyDetails ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Başlangıç Yatırımı
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₺</span>
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
                                            placeholder={DEFAULT_INITIAL_INVESTMENT.toString()}
                                            className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Aylık Yatırım
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₺</span>
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
                                            placeholder={DEFAULT_MONTHLY_INVESTMENT.toString()}
                                            className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        Yıllık Artış
                                        <div className="group relative">
                                            <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400" />
                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded bg-gray-900 dark:bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                Aylık yatırım tutarına yılda bir kez uygulanacak artış miktarı. Yüzde veya sabit tutar olarak belirlenebilir.
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <div className="mt-1 grid grid-cols-2 gap-2">
                                        <Combobox
                                            as="div"
                                            value={INCREASE_TYPES.find(type => type.id === analysisParams.yearlyIncrease.type)}
                                            onChange={(type) =>
                                                setAnalysisParams({
                                                    ...analysisParams,
                                                    yearlyIncrease: {
                                                        ...analysisParams.yearlyIncrease,
                                                        type: type?.id as 'percentage' | 'amount'
                                                    }
                                                })
                                            }
                                        >
                                            <div className="relative">
                                                <Combobox.Input
                                                    className="w-full rounded-md border-0 bg-white dark:bg-gray-800 py-2.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                                    onChange={(event) => event.preventDefault()}
                                                    displayValue={(type: any) => type?.name}
                                                />
                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                                </Combobox.Button>

                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {INCREASE_TYPES.map((type) => (
                                                        <Combobox.Option
                                                            key={type.id}
                                                            value={type}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                                    active ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                                                }`
                                                            }
                                                        >
                                                            {({ active, selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                                                                        {type.name}
                                                                    </span>

                                                                    {selected && (
                                                                        <span
                                                                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                                                                active ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                                                                            }`}
                                                                        >
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Combobox.Option>
                                                    ))}
                                                </Combobox.Options>
                                            </div>
                                        </Combobox>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                                                    {INCREASE_TYPES.find(type => type.id === analysisParams.yearlyIncrease.type)?.symbol}
                                                </span>
                                            </div>
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
                                                placeholder={DEFAULT_INCREASE_VALUE.toString()}
                                                className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {analysisData && !analysisError && (
                                <div className="lg:col-span-2">
                                    <dl className={`grid sm:grid-cols-2 gap-6 ${isAnalysisLoading ? 'opacity-50' : ''}`}>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Toplam Yatırım
                                            </dt>
                                            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(analysisData.summary.totalInvestment)}
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Güncel Değer
                                            </dt>
                                            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(analysisData.summary.currentValue)}
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Toplam Kazanç
                                            </dt>
                                            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(analysisData.summary.totalYield)}
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Getiri Oranı
                                            </dt>
                                            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-green-600 dark:text-green-400">
                                                {formatPercent(analysisData.summary.totalYieldPercentage)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            )}

                            {analysisError && (
                                <div className="lg:col-span-2">
                                    <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Analiz hesaplanamadı. Lütfen daha sonra tekrar deneyin.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {analysisData && showMonthlyDetails && analysisData.periodDetails && (
                        <div 
                            id="monthly-details-table" 
                            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6 scroll-mt-32"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{getDetailsTitle(analysisParams.startDate)} Detaylar</h2>
                                <button
                                    onClick={handleSaveAnalysis}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                    </svg>
                                    Kaydet
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Tarih
                                            </th>
                                            {analysisParams.startDate !== 'last_1_day' && analysisParams.startDate !== 'last_1_week' && (
                                                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    Aylık Yatırım
                                                </th>
                                            )}
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Toplam Yatırım
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Birim Fiyat
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Alınan Pay
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Toplam Pay
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Portföy Değeri
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {getDetailsTitle(analysisParams.startDate)} Değişim
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {getDetailsTitle(analysisParams.startDate)} Getiri
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Toplam Getiri
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {analysisData.periodDetails.map((detail, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-100">
                                                    {formatDate(detail.date)}
                                                </td>
                                                {analysisParams.startDate !== 'last_1_day' && analysisParams.startDate !== 'last_1_week' && (
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(detail.investment)}
                                                    </td>
                                                )}
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(detail.totalInvestment)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(detail.unitPrice)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                    {formatNumber(detail.units)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                    {formatNumber(detail.totalUnits)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(detail.value)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <span className={detail.periodChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                        {formatCurrency(detail.periodChange)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <span className={detail.periodChangePercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                        {formatPercent(detail.periodChangePercentage)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <span className={detail.totalYieldPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                        {formatPercent(detail.totalYieldPercentage)}
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
            )}
        </div>
    );
} 