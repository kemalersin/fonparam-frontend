import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, StarIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { removeFavorite, getFavorites } from '../services/favorites';
import { useFunds } from '../hooks/useApi';
import ComparisonButton from '../components/ComparisonButton';
import Toast from '../components/Toast';
import { formatPercent } from '../utils/format';
import EmptyState from '../components/EmptyState';

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
            className={`whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 cursor-pointer group ${
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
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

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
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Favoriler yüklenirken bir hata oluştu.'
                });
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
            setToast({
                show: true,
                type: 'success',
                message: 'Fon favorilerden kaldırıldı.'
            });
        } catch (error) {
            console.error('Favori kaldırma işlemi başarısız:', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Favori kaldırma işlemi başarısız oldu.'
            });
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
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Favori Fonlarım</h1>
                    <p className="mt-2 text-sm text-gray-700">
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
                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Fon kodu veya adı ile arayın..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
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
                                                                    <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
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
                                                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                                                >
                                                                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
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
            </div>
        </div>
    );
} 