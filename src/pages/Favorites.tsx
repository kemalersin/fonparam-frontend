import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { ArrowsRightLeftIcon as ArrowsRightLeftIconSolid } from '@heroicons/react/24/solid';
import { getFavorites, removeFavorite } from '../services/favorites';
import { addToComparison, removeFromComparison, isInComparison } from '../services/comparison';
import { useFundDetails } from '../hooks/useApi';
import type { FavoriteFund } from '../services/favorites';
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
            className={`px-3 py-3.5 text-sm font-semibold text-gray-900 cursor-pointer group ${field === 'code' ? 'w-24' :
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

const FavoriteRow = ({
    fund,
    onRemove
}: {
    fund: FavoriteFund;
    onRemove: (event: React.MouseEvent, code: string) => void;
}) => {
    const { data: fundDetails } = useFundDetails(fund.code);
    const [isInComparisonList, setIsInComparisonList] = useState(false);
    const [checkingComparison, setCheckingComparison] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    useEffect(() => {
        const checkComparisonStatus = async () => {
            setCheckingComparison(true);
            try {
                const status = await isInComparison(fund.code);
                setIsInComparisonList(status);
            } catch (error) {
                console.error('Karşılaştırma durumu kontrol edilirken hata:', error);
            } finally {
                setCheckingComparison(false);
            }
        };
        checkComparisonStatus();
    }, [fund.code]);

    const handleComparisonClick = async (event: React.MouseEvent) => {
        event.stopPropagation();

        setCheckingComparison(true);
        try {
            if (isInComparisonList) {
                await removeFromComparison(fund.code);
                setIsInComparisonList(false);
                setToast({
                    show: true,
                    type: 'info',
                    message: 'Fon karşılaştırma listesinden kaldırıldı.'
                });
            } else {
                await addToComparison({
                    code: fund.code,
                    title: fund.title,
                    management_company_id: fund.management_company_id,
                    management_company_title: fund.management_company_title,
                    management_company_logo: fund.management_company_logo
                });
                setIsInComparisonList(true);
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
            setCheckingComparison(false);
        }
    };

    const handleRowClick = () => {
        window.location.href = `/funds/${fund.code}`;
    };

    return (
        <>
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
            <tr
                onClick={handleRowClick}
                className="cursor-pointer hover:bg-gray-50"
            >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/companies/${fund.management_company_id}`}
                            className="company-logo flex-shrink-0 hover:opacity-75"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {fund.management_company_logo && (
                                <img
                                    src={fund.management_company_logo}
                                    alt={fund.management_company_title}
                                    className="h-6 w-6 object-contain"
                                />
                            )}
                            {!fund.management_company_logo && (
                                <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                    {fund.management_company_title.charAt(0)}
                                </div>
                            )}
                        </Link>
                        <span>{fund.code}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={(e) => onRemove(e, fund.code)}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                <StarIcon className="h-4 w-4 text-yellow-400 hover:text-gray-400" />
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
                    fundDetails?.yield_1m,
                    fundDetails?.yield_3m,
                    fundDetails?.yield_6m,
                    fundDetails?.yield_ytd,
                    fundDetails?.yield_1y,
                    fundDetails?.yield_3y,
                    fundDetails?.yield_5y,
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
        </>
    );
};

export default function Favorites() {
    const [favorites, setFavorites] = useState<FavoriteFund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('added_at');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setIsLoading(true);
            const favs = await getFavorites();
            console.log('Yüklenen favoriler:', favs);
            setFavorites(favs);
        } catch (error) {
            console.error('Favoriler yüklenirken hata oluştu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavorite = async (event: React.MouseEvent, code: string) => {
        event.stopPropagation();
        try {
            await removeFavorite(code);
            setFavorites(favorites.filter(f => f.code !== code));
        } catch (error) {
            console.error('Favori kaldırılırken hata oluştu:', error);
        }
    };

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

    const filteredFavorites = favorites.filter(fund =>
        fund.code.toLowerCase().includes(search.toLowerCase()) ||
        fund.title.toLowerCase().includes(search.toLowerCase())
    );

    const sortedFavorites = [...filteredFavorites].sort((a, b) => {
        let comparison = 0;
        const getYield = (fund: any, field: string) => {
            const details = fund.details;
            return details ? details[field] : null;
        };

        if (sort === 'added_at') {
            comparison = new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        } else if (sort === 'code') {
            comparison = a.code.localeCompare(b.code);
        } else if (sort === 'title') {
            comparison = a.title.localeCompare(b.title);
        } else if (sort.startsWith('yield_')) {
            const aValue = getYield(a, sort) ?? -Infinity;
            const bValue = getYield(b, sort) ?? -Infinity;
            comparison = (aValue as number) - (bValue as number);
        }

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
                        Favori fonlarınızı görüntüleyin ve takip edin
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
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                        <span className="ml-2 text-sm text-gray-500">Favoriler yükleniyor...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : sortedFavorites.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-8">
                                                    <div className="text-sm text-gray-500">
                                                        {search ? (
                                                            <>Aramanızla eşleşen favori fon bulunamadı.</>
                                                        ) : (
                                                            <>
                                                                Henüz favori fon eklemediniz.{' '}
                                                                <Link to="/funds" className="text-indigo-600 hover:text-indigo-500">
                                                                    Fon listesine göz atın
                                                                </Link>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedFavorites.map((fund) => (
                                                <FavoriteRow
                                                    key={fund.code}
                                                    fund={fund}
                                                    onRemove={handleRemoveFavorite}
                                                />
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