import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentlyViewed, type RecentlyViewedFund } from '../services/recentlyViewed';

export default function RecentlyViewedFunds() {
    const [funds, setFunds] = useState<RecentlyViewedFund[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFunds = async () => {
            try {
                const recentFunds = await getRecentlyViewed();
                setFunds(recentFunds);
            } catch (error) {
                console.error('Son görüntülenen fonlar yüklenemedi:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFunds();
    }, []);

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (funds.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {funds.map((fund) => (
                <Link
                    key={fund.id}
                    to={`/funds/${fund.code}`}
                    className="block bg-white dark:bg-gray-800 shadow-sm hover:shadow-md rounded-lg p-4 transition-shadow duration-200"
                >
                    <div className="flex items-center gap-3">
                        {fund.management_company_logo ? (
                            <img
                                src={fund.management_company_logo}
                                alt={fund.management_company_title}
                                className="h-8 w-8 object-contain"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                {fund.management_company_title.charAt(0)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {fund.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{fund.code}</span>
                                <span>•</span>
                                <span>{fund.management_company_title}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
} 