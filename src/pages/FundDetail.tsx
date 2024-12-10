import { useState, useEffect, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFundDetails, useFundHistory, useAnalyzeFund } from '../hooks/useApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, BuildingOfficeIcon, CalendarIcon, BanknotesIcon, InformationCircleIcon, StarIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Combobox } from '@headlessui/react';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import ComparisonButton from '../components/ComparisonButton';
import { formatPercent, formatCurrency, formatNumber, formatDate } from '../utils/format';

const PERIODS = [
    { label: 'Son 1 Ay', value: 'last_1_month' },
    { label: 'Son 3 Ay', value: 'last_3_months' },
    { label: 'Son 6 Ay', value: 'last_6_months' },
    { label: 'YTD', value: 'year_start' },
    { label: 'Son 1 Yıl', value: 'last_1_year' },
    { label: 'Son 3 Yıl', value: 'last_3_years' },
    { label: 'Son 5 Yıl', value: 'last_5_years' },
];

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

const INCREASE_TYPES = [
    { id: 'percentage', name: 'Yüzde', symbol: '%' },
    { id: 'amount', name: 'Tutar', symbol: '₺' }
];

export default function FundDetail() {
    const { code } = useParams<{ code: string }>();
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        const saved = localStorage.getItem('selectedPeriod');
        return saved || 'last_1_year';
    });
    const [showMonthlyDetails, setShowMonthlyDetails] = useState(() => {
        const saved = localStorage.getItem('showMonthlyDetails');
        return saved ? JSON.parse(saved) : false;
    });
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

    const [debouncedAnalysisParams, setDebouncedAnalysisParams] = useState(analysisParams);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedAnalysisParams(analysisParams);
        }, 300);

        return () => clearTimeout(timer);
    }, [analysisParams]);

    const { data: currentFund, isLoading: isLoadingFund } = useFundDetails(code ?? '');
    const { data: history } = useFundHistory(code ?? '', {
        interval: 'daily',
        sort: 'date',
        order: 'ASC',
        start_date: getStartDate(selectedPeriod)
    });

    // Son değeri history'den al
    const lastValue = history?.length ? [history[history.length - 1]] : undefined;

    const { data: analysis } = useAnalyzeFund(code ?? '', debouncedAnalysisParams);

    useEffect(() => {
        localStorage.setItem('selectedPeriod', selectedPeriod);
    }, [selectedPeriod]);

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

    const handleMonthlyDetailsToggle = (checked: boolean) => {
        setShowMonthlyDetails(checked);
        localStorage.setItem('showMonthlyDetails', JSON.stringify(checked));

        if (checked) {
            setTimeout(() => {
                const element = document.getElementById('monthly-details-table');
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const absoluteTop = window.pageYOffset + rect.top - 24;
                    window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
                }
            }, 100);
        }
    };

    if (isLoadingFund) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Fon bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!currentFund) {
        return (
            <div className="text-center py-12">
                <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-500">404</h2>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Fon Bulunamadı</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Belirtilen fon koduna sahip bir fon bulunamadı.</p>
                <div className="mt-6">
                    <Link to="/funds" className="text-base font-medium text-indigo-600 dark:text-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400">
                        Fon Listesine Dön <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                            <Link
                                to={`/companies/${currentFund.management_company_id}`}
                                className="flex-shrink-0 hover:opacity-75"
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                    {currentFund.title}
                                </h1>
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
                                    {lastValue?.[0] && (
                                        <>
                                            <span className="hidden sm:inline">•</span>
                                            <div className="flex items-center">
                                                <BanknotesIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(lastValue[0].value)}</span>
                                                <span className="mx-1">•</span>
                                                <span>{formatDate(lastValue[0].date)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {currentFund.yield_1y ? (
                                <span
                                    className={currentFund.yield_1y >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                                >
                                    {formatPercent(currentFund.yield_1y)}
                                </span>
                            ) : (
                                '-'
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Yıllık Getiri</div>
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
                    <div key={item.label} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</dt>
                            <dd className="mt-1 text-3xl font-semibold">
                                {item.value != null ? (
                                    <span
                                        className={item.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                                    >
                                        {formatPercent(item.value)}
                                    </span>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">-</span>
                                )}
                            </dd>
                        </div>
                    </div>
                ))}
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
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--background))',
                                        borderColor: 'rgb(var(--border))',
                                        color: 'rgb(var(--foreground))'
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
                        <label className="flex items-center gap-2">
                            <div className="relative inline-block w-10 align-middle select-none">
                                <input
                                    type="checkbox"
                                    checked={showMonthlyDetails}
                                    onChange={(e) => handleMonthlyDetailsToggle(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="h-6 w-11 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
                                <div className="absolute left-0.5 top-0.5 h-5 w-5 transform cursor-pointer rounded-full bg-white shadow transition duration-200 ease-in-out peer-checked:translate-x-5"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aylık Detaylar</span>
                        </label>
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
                                    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    placeholder="0"
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
                                    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    placeholder="0"
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
                                        className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {analysis && (
                        <div className="lg:col-span-2">
                            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Toplam Yatırım
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(analysis.summary.totalInvestment)}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Güncel Değer
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(analysis.summary.currentValue)}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Toplam Kazanç
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-green-600 dark:text-green-400">
                                        {formatCurrency(analysis.summary.totalYield)}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:p-6 rounded-lg h-[115px] flex flex-col justify-center">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Getiri Oranı
                                    </dt>
                                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-green-600 dark:text-green-400">
                                        {formatPercent(analysis.summary.totalYieldPercentage)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            </div>

            {analysis && showMonthlyDetails && analysis.monthlyDetails && (
                <div 
                    id="monthly-details-table" 
                    className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6 scroll-mt-32"
                >
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Aylık Detaylar</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Tarih
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Aylık Yatırım
                                    </th>
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
                                        Aylık Değişim
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Aylık Getiri
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Toplam Getiri
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {analysis.monthlyDetails.map((detail, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(detail.date)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                            {formatCurrency(detail.investment)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                            {formatCurrency(detail.totalInvestment)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                            {formatCurrency(detail.unitPrice)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                            {formatNumber(detail.unitsBought)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                            {formatNumber(detail.totalUnits)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                            {formatCurrency(detail.portfolioValue)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                            <span className={detail.monthlyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                {formatCurrency(detail.monthlyChange)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                            <span className={detail.monthlyYield >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                {formatPercent(detail.monthlyYield)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                            <span className={detail.totalYield >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                {formatPercent(detail.totalYield)}
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