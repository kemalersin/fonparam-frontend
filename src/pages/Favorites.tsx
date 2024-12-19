import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorites } from '../services/favorites';
import { formatPercent } from '../utils/format';
import { useFunds } from '../hooks/useApi';
import ComparisonButton from '../components/ComparisonButton';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import SortHeader from '../components/SortHeader';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useUrlSort } from '../hooks/useUrlSort';
import ExportButton from '../components/ExportButton';
import { Helmet } from 'react-helmet-async';

type SortableFields = 'code' | 'title' | 'yield_1m' | 'yield_3m' | 'yield_6m' | 'yield_ytd' | 'yield_1y' | 'yield_3y' | 'yield_5y';

export default function Favorites() {
    const navigate = useNavigate();
    const { search, setSearch, sort, order, handleSort } = useUrlSort<SortableFields>({
        defaultSort: 'code',
        defaultOrder: 'ASC'
    });

    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
    const { data: fundsData, isLoading: isFundsLoading } = useFunds(
        favoriteCodes.length > 0 
            ? { code: favoriteCodes.join(',') }
            : undefined
    );

    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            setIsFirstLoad(false);
        }
    }, [isLoading]);

    const loadFavorites = async () => {
        setIsLoading(true);
        try {
            const data = await getFavorites();
            setFavorites(data);
            setFavoriteCodes(data.map((f: any) => f.code));
        } catch (error) {
            console.error('Favoriler yüklenirken hata:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (event: React.MouseEvent, fundCode: string) => {
        if ((event.target as HTMLElement).closest('.company-logo')) {
            return;
        }
        navigate(`/funds/${fundCode}`);
    };

    const filteredFavorites = favorites
        .filter(fund => 
            search.trim() === '' || 
            fund.code.toLowerCase().includes(search.toLowerCase()) || 
            fund.title.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let aValue, bValue;

            if (sort === 'code') {
                aValue = a.code;
                bValue = b.code;
            } else if (sort === 'title') {
                aValue = a.title;
                bValue = b.title;
            } else {
                const aFund = fundsData?.data?.find(f => f.code === a.code);
                const bFund = fundsData?.data?.find(f => f.code === b.code);
                aValue = aFund?.[sort as keyof typeof aFund] ?? null;
                bValue = bFund?.[sort as keyof typeof bFund] ?? null;
            }

            if (aValue === null) return 1;
            if (bValue === null) return -1;

            const comparison = aValue < bValue ? -1 : 1;
            return order === 'ASC' ? comparison : -comparison;
        });

    const headerContent = (
        <div className="sm:flex sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Favori Fonlarım</h1>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Favori olarak işaretlediğiniz fonları görüntüleyin ve takip edin
                </p>
            </div>
            <ExportButton storeName="favorites" />
        </div>
    );

    if (isFirstLoad || isLoading || isFundsLoading) {
        return (
            <div>
                <Helmet>
                    <title>Favori Fonlarım | FonParam</title>
                    <meta name="description" content="Favori yatırım fonlarınızı görüntüleyin ve takip edin." />
                </Helmet>
                <LoadingOverlay isLoading={true} />
                {headerContent}
            </div>
        );
    }

    return (
        <div>
            <Helmet>
                <title>Favori Fonlarım | FonParam</title>
                <meta name="description" content="Favori yatırım fonlarınızı görüntüleyin ve takip edin." />
            </Helmet>
            <LoadingOverlay isLoading={isLoading} />
            {headerContent}

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
                {!isLoading && filteredFavorites.length === 0 ? (
                    <div className="flex items-center justify-center sm:min-h-[400px]">
                        <EmptyState
                            title={search.trim() ? "Arama sonucu bulunamadı" : "Favori Fon Bulunamadı"}
                            description={search.trim()
                                ? "Aramanızla eşleşen favori fon bulunamadı. Lütfen farklı bir arama yapmayı deneyin."
                                : "Henüz favori olarak işaretlediğiniz fon bulunmuyor. Fonlar sayfasından favori fonlarınızı ekleyebilirsiniz."
                            }
                            icon={<StarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                        />
                    </div>
                ) : (
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
                                                <th />
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
                                            {!isLoading && filteredFavorites.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="py-8">
                                                        <div className="flex items-center justify-center min-h-[400px]">
                                                            <EmptyState
                                                                title={search.trim() ? "Arama sonucu bulunamadı" : "Favori Fon Bulunamadı"}
                                                                description={search.trim()
                                                                    ? "Aramanızla eşleşen favori fon bulunamadı. Lütfen farklı bir arama yapmayı deneyin."
                                                                    : "Henüz favori olarak işaretlediğiniz fon bulunmuyor. Fonlar sayfasından favori fonlarınızı ekleyebilirsiniz."
                                                                }
                                                                icon={<StarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredFavorites.map((fund) => {
                                                    const currentFund = fundsData?.data?.find(f => f.code === fund.code);
                                                    return (
                                                        <tr
                                                            key={fund.code}
                                                            onClick={(e) => handleRowClick(e, fund.code)}
                                                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        >
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                                <div className="flex items-center">
                                                                    <Link
                                                                        to={`/companies/${fund.management_company_id}`}
                                                                        className="company-logo flex-shrink-0 hover:opacity-75 mr-3"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {fund.management_company_logo ? (
                                                                            <img
                                                                                src={fund.management_company_logo}
                                                                                alt={fund.management_company_title}
                                                                                className="h-6 w-6 object-contain"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                                {fund.management_company_title?.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                    </Link>
                                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{fund.code}</div>
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap py-4 pr-3 text-sm">
                                                                <div className="flex items-center justify-center gap-0.5">
                                                                    <FavoriteButton 
                                                                        fund={fund} 
                                                                        onRemove={() => {
                                                                            setFavorites(prev => prev.filter(f => f.code !== fund.code));
                                                                            setFavoriteCodes(prev => prev.filter(code => code !== fund.code));
                                                                        }}
                                                                    />
                                                                    <ComparisonButton fund={{
                                                                        code: fund.code,
                                                                        title: fund.title,
                                                                        management_company: {
                                                                            code: fund.management_company_id,
                                                                            title: fund.management_company_title,
                                                                            logo: fund.management_company_logo
                                                                        }
                                                                    }} />
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                                <div className="line-clamp-2 min-w-[200px] max-w-[400px] overflow-hidden text-ellipsis">{fund.title}</div>
                                                            </td>
                                                            {[
                                                                currentFund?.yield_1m,
                                                                currentFund?.yield_3m,
                                                                currentFund?.yield_6m,
                                                                currentFund?.yield_ytd,
                                                                currentFund?.yield_1y,
                                                                currentFund?.yield_3y,
                                                                currentFund?.yield_5y
                                                            ].map((value, index) => (
                                                                <td key={index} className='whitespace-nowrap px-3 py-4 text-sm text-right'>
                                                                    {value !== undefined && value !== null ? (
                                                                        <span className={value >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                                                                            {formatPercent(value)}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && filteredFavorites.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Toplam <span className="font-medium">{filteredFavorites.length}</span> favori fon gösteriliyor
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 