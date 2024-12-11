import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, StarIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { removeFavorite, getFavorites } from '../services/favorites';
import { useFunds } from '../hooks/useApi';
import ComparisonButton from '../components/ComparisonButton';
import { useToast } from '../contexts/ToastContext';
import SortHeader from '../components/SortHeader';
import { formatPercent } from '../utils/format';
import EmptyState from '../components/EmptyState';

interface FundWithDetails {
    code: string;
    title: string;
    management_company_id: string;
    management_company_title: string;
    management_company_logo?: string;
    yield_1m?: number;
    yield_3m?: number;
    yield_6m?: number;
    yield_ytd?: number;
    yield_1y?: number;
    yield_3y?: number;
    yield_5y?: number;
}

type SortableFields = 'code' | 'title' | 'yield_1m' | 'yield_3m' | 'yield_6m' | 'yield_ytd' | 'yield_1y' | 'yield_3y' | 'yield_5y';

export default function Favorites() {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortableFields>('code');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
    const [favorites, setFavorites] = useState<FundWithDetails[]>([]);
    const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Favori fonları yükle
    useEffect(() => {
        const loadFavorites = async () => {
            setIsLoading(true);
            try {
                const favoriteFunds = await getFavorites();
                const codes = favoriteFunds.map(f => f.code);
                setFavoriteCodes(codes);
            } catch (error) {
                console.error('Favoriler yüklenirken hata:', error);
                showToast('Favoriler yüklenirken bir hata oluştu.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadFavorites();
    }, []);

    // Favori fonların detaylarını çek
    const { data: fundsData } = useFunds(
        favoriteCodes.length > 0 
            ? { code: favoriteCodes.join(','), limit: favoriteCodes.length }
            : undefined
    );

    // Favori fonları ve detayları birleştir
    useEffect(() => {
        if (!fundsData?.data) return;

        const loadedFunds = fundsData.data;
        getFavorites().then(favoriteFunds => {
            const detailedFunds = favoriteFunds.map(favorite => {
                const fundDetails = loadedFunds.find(f => f.code === favorite.code);
                return {
                    ...favorite,
                    yield_1m: fundDetails?.yield_1m,
                    yield_3m: fundDetails?.yield_3m,
                    yield_6m: fundDetails?.yield_6m,
                    yield_ytd: fundDetails?.yield_ytd,
                    yield_1y: fundDetails?.yield_1y,
                    yield_3y: fundDetails?.yield_3y,
                    yield_5y: fundDetails?.yield_5y
                };
            });
            setFavorites(detailedFunds);
        });
    }, [fundsData]);

    const handleSort = (field: string) => {
        if (sort === field as SortableFields) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(field as SortableFields);
            setOrder('ASC');
        }
    };

    const handleRowClick = (event: React.MouseEvent, fundCode: string) => {
        if ((event.target as HTMLElement).closest('.company-logo')) {
            return;
        }
        window.location.href = `/funds/${fundCode}`;
    };

    const toggleFavorite = async (code: string) => {
        try {
            await removeFavorite(code);
            const newFavorites = await getFavorites();
            setFavoriteCodes(newFavorites.map(f => f.code));
            if (newFavorites.length === 0) {
                setFavorites([]);
            }
            showToast('Fon favorilerden kaldırıldı.', 'success');
        } catch (error) {
            console.error('Favori kaldırma işlemi başarısız:', error);
            showToast('Favori kaldırma işlemi başarısız oldu.', 'error');
        }
    };

    const filteredFunds = favorites
        .filter(fund => 
            search.trim() === '' || 
            fund.code.toLowerCase().includes(search.toLowerCase()) || 
            fund.title.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = sort === 'code' || sort === 'title' 
                ? (a[sort] || '').toLowerCase()
                : a[sort] ?? -Infinity;
            
            const bValue = sort === 'code' || sort === 'title'
                ? (b[sort] || '').toLowerCase()
                : b[sort] ?? -Infinity;

            if (aValue === bValue) return 0;
            const comparison = aValue < bValue ? -1 : 1;
            return order === 'ASC' ? comparison : -comparison;
        });

    return (
        <div>
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Favori Fonlarım</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Favori fonlarınızı görüntüleyin ve performanslarını takip edin
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
                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
                        placeholder="Fon kodu veya adı ile arayın..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto scrollbar sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg">
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
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                    Yükleniyor...
                                                </td>
                                            </tr>
                                        ) : filteredFunds.length === 0 ? (
                                            <tr>
                                                <td colSpan={9}>
                                                    <EmptyState
                                                        title="Favori fonunuz bulunmuyor"
                                                        description="Henüz favori fon eklemediniz. Fonlar sayfasından favori fonlarınızı ekleyebilirsiniz."
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFunds.map((fund) => (
                                                <tr
                                                    key={fund.code}
                                                    onClick={(e) => handleRowClick(e, fund.code)}
                                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                to={`/companies/${fund.management_company_id}`}
                                                                className="company-logo flex-shrink-0 hover:opacity-75"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {fund.management_company_logo ? (
                                                                    <img
                                                                        src={fund.management_company_logo}
                                                                        alt={fund.management_company_title}
                                                                        className="h-6 w-6 object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                        {fund.management_company_title.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <span>{fund.code}</span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleFavorite(fund.code);
                                                                    }}
                                                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                                                >
                                                                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                                                                </button>
                                                                <ComparisonButton fund={fund} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
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
                                                                    value >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                                                                ) : 'text-gray-500 dark:text-gray-400'}
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
            </div>
        </div>
    );
} 