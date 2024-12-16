import { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { addToComparison, removeFromComparison, isInComparison } from '../services/comparison';
import { useToast } from '../contexts/ToastContext';
import type { Fund } from '../types/api';

interface ComparisonButtonProps {
    fund: Pick<Fund, 'code' | 'title' | 'management_company'>;
    className?: string;
}

export default function ComparisonButton({ fund, className = '' }: ComparisonButtonProps) {
    const [isInComparisonList, setIsInComparisonList] = useState(false);
    const [isCheckingComparison, setIsCheckingComparison] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        setIsCheckingComparison(true);
        isInComparison(fund.code)
            .then(setIsInComparisonList)
            .finally(() => setIsCheckingComparison(false));
    }, [fund.code]);

    const toggleComparison = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (isInComparisonList) {
                await removeFromComparison(fund.code);
                setIsInComparisonList(false);
                showToast('Fon karşılaştırma listesinden kaldırıldı.', 'info');
            } else {
                await addToComparison({
                    code: fund.code,
                    title: fund.title,
                    management_company_id: fund.management_company.code,
                    management_company_title: fund.management_company?.title ?? '',
                    management_company_logo: fund.management_company?.logo
                });
                setIsInComparisonList(true);
                showToast('Fon karşılaştırma listesine eklendi.', 'success');
            }
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message, 'warning');
            } else {
                console.error('Karşılaştırma listesi işlemi başarısız:', error);
                showToast('Karşılaştırma listesi işlemi başarısız oldu.', 'error');
            }
        }
    };

    return (
        <div className="group relative">
            <button
                onClick={toggleComparison}
                disabled={isCheckingComparison}
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${className}`}
            >
                {isCheckingComparison ? (
                    <div className="w-4 h-4 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
                ) : (
                    <ArrowsRightLeftIcon className={`h-4 w-4 ${
                        isInComparisonList 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`} />
                )}
            </button>
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded bg-gray-900 dark:bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {isInComparisonList ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırmaya Ekle'}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
            </div>
        </div>
    );
} 