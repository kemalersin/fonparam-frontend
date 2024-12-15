import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportStoreIfNotEmpty } from '../services/db';
import { useToast } from '../contexts/ToastContext';

interface Props {
    storeName: string;
    label?: string;
}

export default function ExportButton({ storeName, label = "Dışa Aktar" }: Props) {
    const { showToast } = useToast();

    const handleExport = async () => {
        try {
            const data = await exportStoreIfNotEmpty(storeName);
            if (!data) {
                showToast('Aktarılacak veri bulunamadı', 'error');
                return;
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fonparam-${storeName}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Veriler başarıyla dışa aktarıldı', 'success');
        } catch (error) {
            console.error('Veri dışa aktarma hatası:', error);
            showToast('Veriler dışa aktarılırken bir hata oluştu', 'error');
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none"
        >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            {label}
        </button>
    );
} 