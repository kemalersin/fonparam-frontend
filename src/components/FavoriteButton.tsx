import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import type { Fund } from '../types/api';

interface FavoriteButtonProps {
    fund: Pick<Fund, 'code' | 'title' | 'management_company'>;
    className?: string;
    onRemove?: () => void;
}

export default function FavoriteButton({ fund, className = '', onRemove }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);

    useEffect(() => {
        setIsCheckingFavorite(true);
        isFavorite(fund.code)
            .then(setIsFavorited)
            .finally(() => setIsCheckingFavorite(false));
    }, [fund.code]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (isFavorited) {
                await removeFavorite(fund.code);
                setIsFavorited(false);
                onRemove?.();
            } else {
                await addFavorite({
                    code: fund.code,
                    title: fund.title,
                    management_company_id: fund.management_company.id,
                    management_company_title: fund.management_company?.title ?? '',
                    management_company_logo: fund.management_company?.logo
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Favori işlemi başarısız:', error);
        }
    };

    return (
        <div className="group relative">
            <button
                onClick={toggleFavorite}
                disabled={isCheckingFavorite}
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${className}`}
            >
                {isCheckingFavorite ? (
                    <div className="w-4 h-4 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
                ) : isFavorited ? (
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                ) : (
                    <StarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-yellow-400" />
                )}
            </button>
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-gray-900 dark:bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
            </div>
        </div>
    );
} 