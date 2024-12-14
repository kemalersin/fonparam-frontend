import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-500"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Yükleniyor...</span>
                </div>
            </div>
        </div>
    );
} 