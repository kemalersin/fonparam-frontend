import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentlyViewed } from '../services/recentlyViewed';

export default function RecentlyViewedFunds() {
    const [funds, setFunds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRecentlyViewed = async () => {
            try {
                setIsLoading(true);
                const recentFunds = await getRecentlyViewed();
                setFunds(recentFunds);
            } catch (error) {
                console.error('Son görüntülenen fonlar yüklenirken hata:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRecentlyViewed();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Son Görüntülenen Fonlar</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (funds.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Son Görüntülenen Fonlar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {funds.map((fund) => (
                    <Link
                        key={fund.code}
                        to={`/funds/${fund.code}`}
                        className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="flex-shrink-0 hover:opacity-75 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/companies/${fund.management_company.code}`;
                                }}
                            >
                                {fund.management_company?.logo ? (
                                    <img
                                        src={fund.management_company.logo}
                                        alt={fund.management_company.title}
                                        className="h-9 w-9 object-contain"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-base font-medium text-gray-500 dark:text-gray-400">
                                        {fund.management_company?.title.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{fund.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{fund.code}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
} 