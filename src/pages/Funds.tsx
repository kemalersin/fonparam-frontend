import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFunds } from '../hooks/useApi';
import { MagnifyingGlassIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import { addToComparison, removeFromComparison, isInComparison } from '../services/comparison';
import { useToast } from '../contexts/ToastContext';
import ComparisonButton from '../components/ComparisonButton';
import SortHeader from '../components/SortHeader';
import { formatPercent } from '../utils/format';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import { DEFAULT_PAGE_SIZE, FUND_TYPES } from '../constants';
import { Combobox } from '@headlessui/react';

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
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
    const [currentData, setCurrentData] = useState<typeof data>(null);
    const { showToast } = useToast();

    // İlk yüklemede URL parametrelerini al
    useEffect(() => {
        if (!isInitialized) {
            const searchFromUrl = searchParams.get('search');
            const pageFromUrl = searchParams.get('page');
            const sortFromUrl = searchParams.get('sort');
            const orderFromUrl = searchParams.get('order') as 'ASC' | 'DESC';
            const typeFromUrl = searchParams.get('type');

            if (searchFromUrl) {
                setSearchInput(searchFromUrl);
                setDebouncedSearch(searchFromUrl);
            }
            if (pageFromUrl) setPage(Number(pageFromUrl));
            if (sortFromUrl) setSort(sortFromUrl);
            if (orderFromUrl) setOrder(orderFromUrl);
            if (typeFromUrl) setSelectedType(typeFromUrl);

            setIsInitialized(true);
        }
    }, [searchParams, isInitialized]);

    // URL parametrelerini güncelle
    const updateUrlParams = () => {
        const params = new URLSearchParams(searchParams);
        if (searchInput) params.set('search', searchInput);
        else params.delete('search');
        if (page > 1) params.set('page', page.toString());
        if (sort !== 'code') params.set('sort', sort);
        else params.delete('sort');
        if (order !== 'ASC') params.set('order', order);
        else params.delete('order');
        if (selectedType) params.set('type', selectedType);
        else params.delete('type');
        setSearchParams(params, { replace: true });
    };

    // Debounced search için useEffect
    useEffect(() => {
        if (!isInitialized) return;

        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            updateUrlParams();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, page, sort, order, selectedType, isInitialized]);

    // Arama veya fon tipi değiştiğinde sayfa numarasını sıfırla
    useEffect(() => {
        if (isInitialized) {
            setPage(1);
        }
    }, [debouncedSearch, selectedType, isInitialized]);

    const { data, isLoading } = useFunds({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch,
        sort,
        order,
        type: selectedType || undefined,
        management_company: searchParams.get('company') || undefined
    });

    // Yeni veriler geldiğinde mevcut verileri güncelle
    useEffect(() => {
        if (data) {
            setCurrentData(data);
        }
    }, [data]);

    const handleSearch = (value: string) => {
        setSearchInput(value);
    };

    const handleSort = (field: string) => {
        const newOrder = sort === field ? (order === 'ASC' ? 'DESC' : 'ASC') : 'ASC';
        const newSort = field;

        // State'leri güncelle
        setSort(newSort);
        setOrder(newOrder);

        // URL parametrelerini güncelle
        const params = new URLSearchParams(searchParams);
        if (newSort !== 'code') params.set('sort', newSort);
        else params.delete('sort');
        if (newOrder !== 'ASC') params.set('order', newOrder);
        else params.delete('order');
        if (page > 1) params.set('page', page.toString());
        if (searchInput) params.set('search', searchInput);
        const company = searchParams.get('company');
        if (company) params.set('company', company);
        setSearchParams(params, { replace: true });
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
                showToast('Fon karşılaştırma listesinden kaldırıldı.', 'info');
            } else {
                await addToComparison({
                    code: fund.code,
                    title: fund.title,
                    management_company_id: fund.management_company_id || '',
                    management_company_title: fund.management_company?.title || '',
                    management_company_logo: fund.management_company?.logo
                });
                setFavoriteStates(prev => ({ ...prev, [fundCode]: true }));
                showToast('Fon karşılaştırma listesine eklendi.', 'success');
            }
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message, 'warning');
            } else {
                console.error('Karşılaştırma listesi işlemi başarısız:', error);
                showToast('Karşılaştırma listesi işlemi başarısız oldu.', 'error');
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
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Yatırım Fonları</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Tüm yatırım fonlarını görüntüleyin ve performanslarını karşılaştırın
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    {/* Search */}
                    <div className="relative sm:col-span-3">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            placeholder="Fon kodu veya adı ile arayın..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    {/* Fund Type Filter */}
                    <div>
                        <Combobox
                            as="div"
                            value={FUND_TYPES.find(type => type.value === selectedType)}
                            onChange={(type) => setSelectedType(type.value)}
                        >
                            <div className="relative">
                                <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    <span className="block truncate">
                                        {FUND_TYPES.find(type => type.value === selectedType)?.label || 'Tüm Fonlar'}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    </span>
                                </Combobox.Button>
                                <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {FUND_TYPES.map((type) => (
                                        <Combobox.Option
                                            key={type.value}
                                            value={type}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                    active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                }`
                                            }
                                        >
                                            {type.label}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            </div>
                        </Combobox>
                    </div>
                </div>

                <LoadingOverlay isLoading={isLoading} />

                {/* Table */}
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto scrollbar sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
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
                                                label="YBB"
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
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {!isLoading && currentData?.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-8">
                                                    <EmptyState
                                                        title={searchInput ? "Arama Sonucu Bulunamadı" : "Fon Bulunamadı"}
                                                        description={searchInput ? "Arama kriterlerinize uygun fon bulunamadı. Lütfen farklı bir arama yapmayı deneyin." : "Sistemde kayıtlı fon bulunmuyor."}
                                                        icon={<MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData?.data.map((fund) => (
                                                <tr 
                                                    key={fund.code}
                                                    onClick={(e) => handleRowClick(e, fund.code)}
                                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                to={`/companies/${fund.management_company?.code}`}
                                                                className="company-logo flex-shrink-0 hover:opacity-75"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {fund.management_company?.logo ? (
                                                                    <img
                                                                        src={fund.management_company.logo}
                                                                        alt={fund.management_company.title}
                                                                        className="h-6 w-6 object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                        {fund.management_company?.title?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{fund.code}</div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={(e) => handleFavoriteClick(e, fund)}
                                                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                                                    disabled={checkingFavorites[fund.code]}
                                                                >
                                                                    {favoriteStates[fund.code] ? (
                                                                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                                                                    ) : (
                                                                        <StarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                                    )}
                                                                </button>
                                                                <ComparisonButton fund={fund} />
                                                            </div>
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
                {currentData && currentData.data.length > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${
                                    page === 1 
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                Önceki
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page * DEFAULT_PAGE_SIZE >= currentData.total}
                                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${
                                    page * DEFAULT_PAGE_SIZE >= currentData.total
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                Sonraki
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Toplam <span className="font-medium">{currentData.total}</span> fondan{' '}
                                    <span className="font-medium">{(page - 1) * DEFAULT_PAGE_SIZE + 1}</span>-
                                    <span className="font-medium">
                                        {Math.min(page * DEFAULT_PAGE_SIZE, currentData.total)}
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
                                                : 'text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <span className="sr-only">Önceki</span>
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.min(Math.ceil(currentData?.total / DEFAULT_PAGE_SIZE), page + 1))}
                                        disabled={!currentData?.total || page >= Math.ceil(currentData.total / DEFAULT_PAGE_SIZE)}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${
                                            !currentData?.total || page >= Math.ceil(currentData.total / DEFAULT_PAGE_SIZE)
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : 'text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <span className="sr-only">Sonraki</span>
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
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