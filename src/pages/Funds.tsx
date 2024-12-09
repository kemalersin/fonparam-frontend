import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFunds } from '../hooks/useApi';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, StarIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, ArrowsRightLeftIcon as ArrowsRightLeftIconSolid } from '@heroicons/react/24/solid';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import { addToComparison, removeFromComparison, isInComparison } from '../services/comparison';
import Toast from '../components/Toast';
import ComparisonButton from '../components/ComparisonButton';
import { formatPercent } from '../utils/format';

const SortHeader = ({ 
    label, 
    field, 
    currentSort, 
    currentOrder, 
    onSort 
}: { 
    label: string;
    field: string;
    currentSort: string;
    currentOrder: 'ASC' | 'DESC';
    onSort: (field: string) => void;
}) => {
    const isTextColumn = field === 'code' || field === 'title';
    return (
        <th
            scope="col"
            className={`px-3 py-3.5 text-sm font-semibold text-gray-900 cursor-pointer group ${
                field === 'code' ? 'w-24' : 
                field === 'title' ? 'w-48' : 
                'w-20'
            } ${isTextColumn ? 'text-left' : 'text-right'}`}
            onClick={() => onSort(field)}
        >
            <div className={`flex items-center gap-1 ${isTextColumn ? 'justify-start' : 'justify-end'}`}>
                <span>{label}</span>
                <span className="inline-flex flex-col">
                    {currentSort === field ? (
                        currentOrder === 'ASC' ? (
                            <ChevronUpIcon className="h-4 w-4 text-indigo-600" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 text-indigo-600" />
                        )
                    ) : (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                        </span>
                    )}
                </span>
            </div>
        </th>
    );
};

export default function Funds() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [sort, setSort] = useState(searchParams.get('sort') || 'code');
    const [order, setOrder] = useState<'ASC' | 'DESC'>((searchParams.get('order') as 'ASC' | 'DESC') || 'ASC');
    const [isInitialized, setIsInitialized] = useState(false);
    const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});
    const [checkingFavorites, setCheckingFavorites] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    // İlk yüklemede URL parametrelerini al
    useEffect(() => {
        if (!isInitialized) {
            const searchFromUrl = searchParams.get('search');
            const pageFromUrl = searchParams.get('page');
            const sortFromUrl = searchParams.get('sort');
            const orderFromUrl = searchParams.get('order') as 'ASC' | 'DESC';

            if (searchFromUrl) {
                setSearchInput(searchFromUrl);
                setDebouncedSearch(searchFromUrl);
            }
            if (pageFromUrl) setPage(Number(pageFromUrl));
            if (sortFromUrl) setSort(sortFromUrl);
            if (orderFromUrl) setOrder(orderFromUrl);

            setIsInitialized(true);
        }
    }, [searchParams, isInitialized]);

    // Debounced search için useEffect
    useEffect(() => {
        if (!isInitialized) return;

        // Arama kutusu boşsa hemen güncelle
        if (!searchInput) {
            setDebouncedSearch('');
            const params = new URLSearchParams(searchParams);
            params.delete('search');
            if (page > 1) params.set('page', page.toString());
            if (sort !== 'code') params.set('sort', sort);
            if (order !== 'ASC') params.set('order', order);
            setSearchParams(params, { replace: true });
            return;
        }

        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            const params = new URLSearchParams(searchParams);
            params.set('search', searchInput);
            if (page > 1) params.set('page', page.toString());
            if (sort !== 'code') params.set('sort', sort);
            if (order !== 'ASC') params.set('order', order);
            setSearchParams(params, { replace: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, page, sort, order, isInitialized]);

    // Arama değiştiğinde sayfa numarasını sıfırla
    useEffect(() => {
        if (isInitialized) {
            setPage(1);
        }
    }, [debouncedSearch, isInitialized]);

    const { data, isLoading } = useFunds({
        page,
        limit: 20,
        search: debouncedSearch,
        sort,
        order,
    });

    const handleSearch = (value: string) => {
        setSearchInput(value);
    };

    const handleSort = (field: string) => {
        if (sort === field) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(field);
            setOrder('ASC');
        }
    };

    const handleRowClick = (event: React.MouseEvent, fundCode: string) => {
        if ((event.target as HTMLElement).closest('.company-logo')) {
            return;
        }
        window.location.href = `/funds/${fundCode}`;
    };

    const handleFavoriteClick = async (event: React.MouseEvent, fund: any) => {
        event.stopPropagation();
        
        const fundCode = fund.code;
        setCheckingFavorites(prev => ({ ...prev, [fundCode]: true }));

        try {
            if (favoriteStates[fundCode]) {
                await removeFavorite(fundCode);
                setFavoriteStates(prev => ({ ...prev, [fundCode]: false }));
            } else {
                console.log('Favori eklenecek fon:', {
                    code: fund.code,
                    management_company: fund.management_company,
                    logo: fund.management_company?.logo
                });

                await addFavorite({
                    code: fund.code,
                    title: fund.title,
                    type: fund.type,
                    management_company_id: fund.management_company_id,
                    management_company_title: fund.management_company?.title ?? '',
                    management_company_logo: fund.management_company?.logo || null
                });
                setFavoriteStates(prev => ({ ...prev, [fundCode]: true }));
            }
        } catch (error) {
            console.error('Favori işlemi başarısız:', error);
        } finally {
            setCheckingFavorites(prev => ({ ...prev, [fundCode]: false }));
        }
    };

    const handleComparisonClick = async (event: React.MouseEvent, fund: any) => {
        event.stopPropagation();
        
        const fundCode = fund.code;
        setCheckingFavorites(prev => ({ ...prev, [fundCode]: true }));

        try {
            if (favoriteStates[fundCode]) {
                await removeFromComparison(fundCode);
                setFavoriteStates(prev => ({ ...prev, [fundCode]: false }));
                setToast({
                    show: true,
                    type: 'info',
                    message: 'Fon karşılaştırma listesinden kaldırıldı.'
                });
            } else {
                await addToComparison({
                    code: fund.code,
                    title: fund.title,
                    management_company_id: fund.management_company_id || '',
                    management_company_title: fund.management_company?.title || '',
                    management_company_logo: fund.management_company?.logo
                });
                setFavoriteStates(prev => ({ ...prev, [fundCode]: true }));
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Fon karşılaştırma listesine eklendi.'
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                setToast({
                    show: true,
                    type: 'warning',
                    message: error.message
                });
            } else {
                console.error('Karşılaştırma listesi işlemi başarısız:', error);
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Karşılaştırma listesi işlemi başarısız oldu.'
                });
            }
        } finally {
            setCheckingFavorites(prev => ({ ...prev, [fundCode]: false }));
        }
    };

    useEffect(() => {
        if (data?.data) {
            const checkStates = async () => {
                const favoriteResults: Record<string, boolean> = {};
                const comparisonResults: Record<string, boolean> = {};

                for (const fund of data.data) {
                    setCheckingFavorites(prev => ({ ...prev, [fund.code]: true }));

                    favoriteResults[fund.code] = await isFavorite(fund.code);
                    comparisonResults[fund.code] = await isInComparison(fund.code);

                    setCheckingFavorites(prev => ({ ...prev, [fund.code]: false }));
                }

                setFavoriteStates(favoriteResults);
            };
            checkStates();
        }
    }, [data?.data]);

    return (
        <div>
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Yatırım Fonları</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Tüm yatırım fonlarını görüntüleyin ve performanslarını karşılaştırın
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
                {/* Search */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Fon kodu veya adı ile arayın..."
                        value={searchInput}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <SortHeader
                                                label="Fon Kodu"
                                                field="code"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="Fon Adı"
                                                field="title"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="1 Ay"
                                                field="yield_1m"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="3 Ay"
                                                field="yield_3m"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="6 Ay"
                                                field="yield_6m"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="YTD"
                                                field="yield_ytd"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="1 Yıl"
                                                field="yield_1y"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="3 Yıl"
                                                field="yield_3y"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                            <SortHeader
                                                label="5 Yıl"
                                                field="yield_5y"
                                                currentSort={sort}
                                                currentOrder={order}
                                                onSort={handleSort}
                                            />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-4">
                                                    Yükleniyor...
                                                </td>
                                            </tr>
                                        ) : (
                                            data?.data.map((fund) => (
                                                <tr
                                                    key={fund.code}
                                                    onClick={(e) => handleRowClick(e, fund.code)}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                to={`/companies/${fund.management_company_id}`}
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
                                                                    <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                                                        {fund.management_company?.title.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <span>{fund.code}</span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={(e) => handleFavoriteClick(e, fund)}
                                                                    disabled={checkingFavorites[fund.code]}
                                                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                                                >
                                                                    {checkingFavorites[fund.code] ? (
                                                                        <div className="w-4 h-4 animate-pulse bg-gray-200 rounded-full" />
                                                                    ) : favoriteStates[fund.code] ? (
                                                                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                                                                    ) : (
                                                                        <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-400" />
                                                                    )}
                                                                </button>
                                                                <ComparisonButton fund={fund} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500">
                                                        <div className="line-clamp-2">
                                                            {fund.title}
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
                                                                className={value != null ? (
                                                                    value >= 0 ? 'text-green-600' : 'text-red-600'
                                                                ) : 'text-gray-500'}
                                                            >
                                                                {formatPercent(value)}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {data && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Önceki
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page * 20 >= data.total}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Sonraki
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Toplam <span className="font-medium">{data.total}</span> fondan{' '}
                                    <span className="font-medium">{(page - 1) * 20 + 1}</span>-
                                    <span className="font-medium">
                                        {Math.min(page * 20, data.total)}
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
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
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
                                        disabled={page * 20 >= data.total}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
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