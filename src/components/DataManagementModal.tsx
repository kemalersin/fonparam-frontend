import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { exportDatabase, importDatabase, ExportData } from '../services/db';
import { useToast } from '../contexts/ToastContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function DataManagementModal({ isOpen, onClose }: Props) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Sayfanın yenilenmesi gereken rotalar
    const refreshableRoutes = ['/favorites', '/analyses'];

    const handleExport = async () => {
        try {
            setIsLoading(true);
            const data = await exportDatabase();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fonparam-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Veriler başarıyla dışa aktarıldı', 'success');
        } catch (error) {
            console.error('Veri dışa aktarma hatası:', error);
            showToast('Veriler dışa aktarılırken bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (file: File) => {
        try {
            setIsLoading(true);
            const text = await file.text();
            const data = JSON.parse(text) as ExportData;
            await importDatabase(data);
            showToast('Veriler başarıyla içe aktarıldı', 'success');
            onClose();

            // Eğer yenilenmesi gereken bir sayfadaysak, sayfayı yenile
            if (refreshableRoutes.includes(location.pathname)) {
                navigate(0);
            }
        } catch (error) {
            console.error('Veri içe aktarma hatası:', error);
            showToast('Veriler içe aktarılırken bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImport(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            handleImport(file);
        } else {
            showToast('Lütfen geçerli bir JSON dosyası sürükleyin', 'error');
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Kapat</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                            Veri Yönetimi
                                        </Dialog.Title>
                                        <div className="mt-4 space-y-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Favorilerinizi, analizlerinizi ve diğer verilerinizi yedekleyebilir veya başka bir cihazdan aktarabilirsiniz.
                                            </p>
                                            <div 
                                                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                                                    isDragging 
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <div className="space-y-4">
                                                    <button
                                                        type="button"
                                                        onClick={handleExport}
                                                        disabled={isLoading}
                                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none disabled:opacity-50"
                                                    >
                                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                                        Verileri Dışa Aktar
                                                    </button>
                                                    <div>
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none disabled:opacity-50 cursor-pointer"
                                                        >
                                                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                                                            Verileri İçe Aktar
                                                        </label>
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            accept=".json"
                                                            onChange={handleFileInputChange}
                                                            ref={fileInputRef}
                                                            disabled={isLoading}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    veya dosyayı buraya sürükleyin
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Not: Verileri içe aktarmak mevcut verilerinizin üzerine yazacaktır.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
} 