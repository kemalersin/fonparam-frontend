import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCompanies } from '../hooks/useApi';
import { MagnifyingGlassIcon, ArrowTrendingUpIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
    { label: 'Şirket Kodu', value: 'code' },
    { label: 'Şirket Adı', value: 'title' },
    { label: 'Fon Sayısı', value: 'total_funds' },
    { label: '1 Aylık Getiri', value: 'avg_yield_1m' },
    { label: '6 Aylık Getiri', value: 'avg_yield_6m' },
    { label: 'YTD Getiri', value: 'avg_yield_ytd' },
    { label: '1 Yıllık Getiri', value: 'avg_yield_1y' },
    { label: '3 Yıllık Getiri', value: 'avg_yield_3y' },
    { label: '5 Yıllık Getiri', value: 'avg_yield_5y' },
];

const formatPercentage = (value: number | null | undefined): string => {
    if (value == null) return '-';
    return `%${value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const formatNumber = (value: number | null | undefined): string => {
    if (value == null) return '-';
    return value.toLocaleString('tr-TR');
};

export default function Companies() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'code');
    const [order, setOrder] = useState<'ASC' | 'DESC'>((searchParams.get('order') as 'ASC' | 'DESC') || 'ASC');
    const [page, setPage] = useState(searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1);
    const [minTotalFunds, setMinTotalFunds] = useState<number | undefined>(
        searchParams.get('min_funds') ? Number(searchParams.get('min_funds')) : undefined
    );

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (search) params.set('search', search);
        if (sort !== 'code') params.set('sort', sort);
        if (order !== 'ASC') params.set('order', order);
        if (page !== 1) params.set('page', page.toString());
        if (minTotalFunds !== undefined) params.set('min_funds', minTotalFunds.toString());

        if (!search) params.delete('search');
        if (sort === 'code') params.delete('sort');
        if (order === 'ASC') params.delete('order');
        if (page === 1) params.delete('page');
        if (minTotalFunds === undefined) params.delete('min_funds');

        setSearchParams(params);
    }, [search, sort, order, page, minTotalFunds, setSearchParams, searchParams]);

    useEffect(() => {
        setPage(1);
    }, [search, sort, order, minTotalFunds]);

    useEffect(() => {
        const pageFromUrl = searchParams.get('page');
        if (pageFromUrl) {
            const pageNumber = parseInt(pageFromUrl, 10);
            if (!isNaN(pageNumber) && pageNumber > 0) {
                setPage(pageNumber);
            }
        }
    }, [searchParams]);

    const { data, isLoading } = useCompanies({
        page,
        limit: 20,
        search,
        sort,
        order,
        min_total_funds: minTotalFunds,
    });

    const handleSort = (field: string) => {
        if (sort === field) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(field);
            setOrder('ASC');
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleMinFundsChange = (value: string) => {
        const numValue = value ? Number(value) : undefined;
        if (numValue === undefined || numValue >= 0) {
            setMinTotalFunds(numValue);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Portföy Yönetim Şirketleri</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Tüm portföy yönetim şirketlerini görüntüleyin ve performanslarını karşılaştırın
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Arama
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            id="search"
                            type="text"
                            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Şirket adı veya kodu ile arayın..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sort */}
                <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                        Sıralama
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <select
                                id="sort"
                                value={sort}
                                onChange={(e) => handleSort(e.target.value)}
                                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 appearance-none"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
                            className="p-2 rounded-md border-0 text-gray-400 hover:text-gray-500 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
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
                    <label htmlFor="min-funds" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Fon Sayısı
                    </label>
                    <div className="relative">
                        <input
                            id="min-funds"
                            type="number"
                            min="0"
                            step="1"
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Örn: 5"
                            value={minTotalFunds || ''}
                            onChange={(e) => handleMinFundsChange(e.target.value)}
                        />
                        {minTotalFunds !== undefined && (
                            <button
                                onClick={() => handleMinFundsChange('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Company Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse bg-white shadow-sm rounded-lg p-6 space-y-4"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    data?.data.map((company) => (
                        <Link
                            key={company.code}
                            to={`/companies/${company.code}`}
                            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                                        {company.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                                        {company.code}
                                    </p>
                                </div>
                                {company.logo && (
                                    <img
                                        src={company.logo}
                                        alt={company.title}
                                        className="h-12 w-12 object-contain flex-shrink-0"
                                    />
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <ChartBarIcon className="h-4 w-4 mr-1" />
                                        Fon Sayısı
                                    </div>
                                    <p className="text-lg font-medium text-gray-900">
                                        {formatNumber(company.total_funds)}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                        Yıllık Ort. Getiri
                                    </div>
                                    <p className={`text-lg font-medium ${
                                        company.avg_yield_1y && company.avg_yield_1y >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}>
                                        {formatPercentage(company.avg_yield_1y)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-sm text-gray-500 mb-1">Performans</div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <div className="text-gray-500">1A</div>
                                        <div className={
                                            company.avg_yield_1m && company.avg_yield_1m >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }>
                                            {formatPercentage(company.avg_yield_1m)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">6A</div>
                                        <div className={
                                            company.avg_yield_6m && company.avg_yield_6m >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }>
                                            {formatPercentage(company.avg_yield_6m)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">3Y</div>
                                        <div className={
                                            company.avg_yield_3y && company.avg_yield_3y >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }>
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
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                                page === 1 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Önceki
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page * 20 >= (data.total || 0)}
                            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                                page * 20 >= (data.total || 0)
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Sonraki
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Toplam <span className="font-medium">{data.total}</span> şirketten{' '}
                                <span className="font-medium">{Math.min((page - 1) * 20 + 1, data.total || 0)}</span>-
                                <span className="font-medium">
                                    {Math.min(page * 20, data.total || 0)}
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
                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                                        page === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:bg-gray-50'
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
                                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                                        page * 20 >= (data.total || 0)
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:bg-gray-50'
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
    );
} 