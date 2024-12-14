import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites } from '../services/favorites';
import { formatPercent } from '../utils/format';
import { useFunds } from '../hooks/useApi';
import ComparisonButton from '../components/ComparisonButton';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadFavorites = async () => {
            setIsLoading(true);
            try {
                const favoritesData = await getFavorites();
                setFavorites(favoritesData);
                setFavoriteCodes(favoritesData.map(f => f.code));
            } catch (error) {
                console.error('Favoriler yüklenirken hata oluştu:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, []);

    const { data: fundsData } = useFunds(
        favoriteCodes.length > 0 
            ? { code: favoriteCodes.join(','), limit: favoriteCodes.length }
            : undefined
    );

    const handleRowClick = (event: React.MouseEvent, fundCode: string) => {
        if ((event.target as HTMLElement).closest('.company-logo')) {
            return;
        }
        window.location.href = `/funds/${fundCode}`;
    };

    const filteredFavorites = favorites.filter(fund => 
        search.trim() === '' || 
        fund.code.toLowerCase().includes(search.toLowerCase()) || 
        fund.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <LoadingOverlay isLoading={isLoading} />
            
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Favori Fonlarım</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Favori olarak işaretlediğiniz fonları görüntüleyin ve takip edin
                    </p>
                </div>
            </div>

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

                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto scrollbar sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Fon Kodu
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                Fon Adı
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                1 Ay
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                3 Ay
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                6 Ay
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                YBB
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                1 Yıl
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                3 Yıl
                                            </th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                5 Yıl
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {!isLoading && filteredFavorites.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-8">
                                                    <EmptyState
                                                        title={search.trim() ? "Arama sonucu bulunamadı" : "Favori Fon Bulunamadı"}
                                                        description={search.trim() 
                                                            ? "Aramanızla eşleşen favori fon bulunamadı. Lütfen farklı bir arama yapmayı deneyin."
                                                            : "Henüz favori olarak işaretlediğiniz fon bulunmuyor. Fonlar sayfasından favori fonlarınızı ekleyebilirsiniz."
                                                        }
                                                        icon={<StarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                                                    />
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
                                                                        <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                            {fund.management_company_title?.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </Link>
                                                                <div className="font-medium text-gray-900 dark:text-gray-100">{fund.code}</div>
                                                                <div className="flex gap-1">
                                                                    <FavoriteButton 
                                                                        fund={fund} 
                                                                        onRemove={() => {
                                                                            setFavorites(prev => prev.filter(f => f.code !== fund.code));
                                                                            setFavoriteCodes(prev => prev.filter(code => code !== fund.code));
                                                                        }}
                                                                    />
                                                                    <ComparisonButton fund={fund} />
                                                                </div>
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
                                                            currentFund?.yield_5y,
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
                                                );
                                            })
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