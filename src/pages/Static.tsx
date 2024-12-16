import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

export default function Static() {
    const { slug } = useParams();
    const location = useLocation();
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                // Eğer guides/:slug formatında ise guides dizininden, değilse static dizininden oku
                const path = location.pathname.startsWith('/guides/') 
                    ? `/html/guides/${slug}.html`
                    : `/html/static${location.pathname}.html`;

                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error('Sayfa bulunamadı');
                }
                const html = await response.text();
                setContent(html);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Bir hata oluştu');
                setContent('');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [slug, location.pathname]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="animate-pulse space-y-4 p-6">
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {error}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Lütfen daha sonra tekrar deneyin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:bg-white dark:sm:bg-gray-800 sm:rounded-lg sm:shadow-sm">
            <div 
                className="prose dark:prose-invert max-w-none px-1 sm:p-8"
                dangerouslySetInnerHTML={{ __html: content }} 
            />
        </div>
    );
} 