import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCompanies } from '../hooks/useApi';
import { MagnifyingGlassIcon, ArrowTrendingUpIcon, ChartBarIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import { formatPercent, formatNumber } from '../utils/format';
import { DEFAULT_PAGE_SIZE } from '../constants';
import LoadingOverlay from '../components/LoadingOverlay';

const SORT_OPTIONS = [
    { id: 'code', name: 'Şirket Kodu', order: 'ASC' },
    { id: 'title', name: 'Şirket Adı', order: 'ASC' },
    { id: 'total_funds', name: 'Fon Sayısı', order: 'DESC' },
    { id: 'avg_yield_1m', name: '1 Aylık Getiri', order: 'DESC' },
    { id: 'avg_yield_3m', name: '3 Aylık Getiri', order: 'DESC' },
    { id: 'avg_yield_6m', name: '6 Aylık Getiri', order: 'DESC' },
    { id: 'avg_yield_ytd', name: 'YBB Getiri', order: 'DESC' },
    { id: 'avg_yield_1y', name: '1 Yıllık Getiri', order: 'DESC' },
    { id: 'avg_yield_3y', name: '3 Yıllık Getiri', order: 'DESC' },
    { id: 'avg_yield_5y', name: '5 Yıllık Getiri', order: 'DESC' }
];

const formatPercentage = (value: number | null | undefined): string => {
    if (value == null) return '-';
    return `%${value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export default function Companies() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
    const [minFundsInput, setMinFundsInput] = useState<string>(searchParams.get('min_funds') || '');
    const [debouncedMinFunds, setDebouncedMinFunds] = useState<number | undefined>(
        searchParams.get('min_funds') ? Number(searchParams.get('min_funds')) : undefined
    );
    const [sort, setSort] = useState(searchParams.get('sort') || 'code');
    const [order, setOrder] = useState<'ASC' | 'DESC'>((searchParams.get('order') as 'ASC' | 'DESC') || 'ASC');
    const [page, setPage] = useState(searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1);

    // İlk yüklemede URL parametrelerini al
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        const minFundsFromUrl = searchParams.get('min_funds');
        const pageFromUrl = searchParams.get('page');
        const sortFromUrl = searchParams.get('sort');
        const orderFromUrl = searchParams.get('order') as 'ASC' | 'DESC';

        if (searchFromUrl) {
            setSearchInput(searchFromUrl);
            setDebouncedSearch(searchFromUrl);
        }
        if (minFundsFromUrl) {
            setMinFundsInput(minFundsFromUrl);
            setDebouncedMinFunds(Number(minFundsFromUrl));
        }
        if (pageFromUrl) {
            const pageNumber = parseInt(pageFromUrl, 10);
            if (!isNaN(pageNumber) && pageNumber > 0) {
                setPage(pageNumber);
            }
        }
        if (sortFromUrl) setSort(sortFromUrl);
        if (orderFromUrl) setOrder(orderFromUrl);
    }, []);

    // Debounced search için useEffect
    useEffect(() => {
        // Arama kutusu boşsa hemen güncelle
        if (!searchInput) {
            setDebouncedSearch('');
            updateUrlParams('', debouncedMinFunds);
            return;
        }

        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            updateUrlParams(searchInput, debouncedMinFunds);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Debounced min funds için useEffect
    useEffect(() => {
        // Minimum fon sayısı boşsa hemen güncelle
        if (!minFundsInput) {
            setDebouncedMinFunds(undefined);
            updateUrlParams(debouncedSearch, undefined);
            return;
        }

        const numValue = Number(minFundsInput);
        if (isNaN(numValue) || numValue < 0) return;

        const timer = setTimeout(() => {
            setDebouncedMinFunds(numValue);
            updateUrlParams(debouncedSearch, numValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [minFundsInput]);

    // URL parametrelerini güncelle
    const updateUrlParams = (search: string, minFunds: number | undefined) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (minFunds !== undefined) params.set('min_funds', minFunds.toString());
        if (page > 1) params.set('page', page.toString());
        if (sort !== 'code') params.set('sort', sort);
        if (order !== 'ASC') params.set('order', order);
        setSearchParams(params, { replace: true });
    };

    // Sayfa değiştiğinde URL'i güncelle
    useEffect(() => {
        updateUrlParams(debouncedSearch, debouncedMinFunds);
    }, [page, sort, order]);

    // Arama veya minimum fon sayısı değiştiğinde sayfa numarasını sıfırla
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, debouncedMinFunds]);

    const { data, isLoading } = useCompanies({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch,
        sort,
        order,
        min_total_funds: debouncedMinFunds,
    });

    const handleSearch = (value: string) => {
        setSearchInput(value);
    };

    const handleMinFundsChange = (value: string) => {
        setMinFundsInput(value);
    };

    return (
        <div>
            <LoadingOverlay isLoading={isLoading} />
            
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Portföy Yönetim Şirketleri</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Tüm portföy yönetim şirketlerini görüntüleyin ve performanslarını karşılaştırın
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Search */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Arama
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            </div>
                            <input
                                id="search"
                                type="text"
                                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6"
                                placeholder="Şirket adı veya kodu ile arayın..."
                                value={searchInput}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sıralama
                        </label>
                        <div className="flex items-center gap-2">
                            <Combobox
                                as="div"
                                className="flex-1"
                                value={SORT_OPTIONS.find(option => option.id === sort)}
                                onChange={(option) => {
                                    if (option) {
                                        setSort(option.id);
                                        setOrder(option.order as 'ASC' | 'DESC');
                                    }
                                }}
                            >
                                <div className="relative">
                                    <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                        <span className="block truncate">{SORT_OPTIONS.find((option) => option.id === sort)?.name}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                        </span>
                                    </Combobox.Button>
                                    <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {SORT_OPTIONS.map((option) => (
                                            <Combobox.Option
                                                key={option.id}
                                                value={option}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                    }`
                                                }
                                            >
                                                {option.name}
                                            </Combobox.Option>
                                        ))}
                                    </Combobox.Options>
                                </div>
                            </Combobox>
                            <button
                                onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
                                className="p-1.5 rounded-md border-0 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                                title={order === 'ASC' ? 'Artan Sıralama' : 'Azalan Sıralama'}
                            >
                                <svg
                                    className={`h-5 w-5 transition-transform ${order === 'DESC' ? 'rotate-180' : ''}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Min Funds */}
                    <div>
                        <label htmlFor="min-funds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Minimum Fon Sayısı
                        </label>
                        <div className="relative">
                            <input
                                id="min-funds"
                                type="number"
                                min="0"
                                step="1"
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6"
                                placeholder="Örn: 5"
                                value={minFundsInput}
                                onChange={(e) => handleMinFundsChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Company Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-2">
                                    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[...Array(3)].map((_, j) => (
                                            <div key={j} className="bg-white dark:bg-gray-800 rounded-lg p-2 space-y-2">
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        data?.data.map((company) => (
                            <Link
                                key={company.code}
                                to={`/companies/${company.code}`}
                                className="group bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {company.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem] mt-1">
                                            {company.code}
                                        </p>
                                    </div>
                                    {company.logo && (
                                        <img
                                            src={company.logo}
                                            alt={company.title}
                                            className="h-12 w-12 object-contain flex-shrink-0 rounded-lg bg-gray-50 dark:bg-gray-700 p-1"
                                        />
                                    )}
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            <ChartBarIcon className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                                            Fon Sayısı
                                        </div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {formatNumber(company.total_funds)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                                            Yıllık Ort. Getiri
                                        </div>
                                        <p className={`text-lg font-medium ${
                                            company.avg_yield_1y && company.avg_yield_1y >= 0
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {formatPercentage(company.avg_yield_1y)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Performans</div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                            <div className="text-gray-600 dark:text-gray-400 mb-1">1A</div>
                                            <div className={`font-medium ${
                                                company.avg_yield_1m && company.avg_yield_1m >= 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {formatPercentage(company.avg_yield_1m)}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                            <div className="text-gray-600 dark:text-gray-400 mb-1">6A</div>
                                            <div className={`font-medium ${
                                                company.avg_yield_6m && company.avg_yield_6m >= 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {formatPercentage(company.avg_yield_6m)}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                            <div className="text-gray-600 dark:text-gray-400 mb-1">3Y</div>
                                            <div className={`font-medium ${
                                                company.avg_yield_3y && company.avg_yield_3y >= 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {formatPercentage(company.avg_yield_3y)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {data && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${
                                    page === 1 
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                Önceki
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page * 20 >= (data.total || 0)}
                                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${
                                    page * 20 >= (data.total || 0)
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                Sonraki
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Toplam <span className="font-medium">{data.total}</span> şirketten{' '}
                                    <span className="font-medium">{(page - 1) * DEFAULT_PAGE_SIZE + 1}</span>-
                                    <span className="font-medium">
                                        {Math.min(page * DEFAULT_PAGE_SIZE, data.total)}
                                    </span>{' '}
                                    arası gösteriliyor
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                            page === 1
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <span className="sr-only">Önceki</span>
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page * 20 >= (data.total || 0)}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                            page * 20 >= (data.total || 0)
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <span className="sr-only">Sonraki</span>
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 