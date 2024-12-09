import { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { ArrowsRightLeftIcon as ArrowsRightLeftIconSolid } from '@heroicons/react/24/solid';
import { addToComparison, removeFromComparison, isInComparison } from '../services/comparison';
import Toast from './Toast';

interface ComparisonButtonProps {
    fund: {
        code: string;
        title: string;
        management_company_id: string;
        management_company_title: string;
        management_company_logo?: string;
    };
    className?: string;
}

export default function ComparisonButton({ fund, className }: ComparisonButtonProps) {
    const [isInList, setIsInList] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    useEffect(() => {
        const checkComparisonStatus = async () => {
            setIsChecking(true);
            try {
                const status = await isInComparison(fund.code);
                setIsInList(status);
            } catch (error) {
                console.error('Karşılaştırma durumu kontrol edilirken hata:', error);
            } finally {
                setIsChecking(false);
            }
        };
        checkComparisonStatus();
    }, [fund.code]);

    const handleClick = async (event: React.MouseEvent) => {
        event.stopPropagation();
        
        setIsChecking(true);
        try {
            if (isInList) {
                await removeFromComparison(fund.code);
                setIsInList(false);
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
                setIsInList(true);
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
            setIsChecking(false);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isChecking}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center ${className || ''}`}
            >
                {isChecking ? (
                    <div className="w-4 h-4 animate-pulse bg-gray-200 rounded-full" />
                ) : isInList ? (
                    <ArrowsRightLeftIconSolid className="h-4 w-4 text-indigo-600" />
                ) : (
                    <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400 hover:text-indigo-600" />
                )}
            </button>
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    );
} 