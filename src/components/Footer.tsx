import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import DataManagementModal from './DataManagementModal';

export default function Footer() {
    const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Rehber
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link to="/guides/yatirim-fonu-nedir" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Yatırım Fonu Nedir?
                                </Link>
                            </li>
                            <li>
                                <Link to="/guides/fon-turleri" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Fon Türleri
                                </Link>
                            </li>
                            <li>
                                <Link to="/guides/nasil-fon-secilir" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Nasıl Fon Seçilir?
                                </Link>
                            </li>
                            <li>
                                <Link to="/guides/yatirim-stratejileri" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Yatırım Stratejileri
                                </Link>
                            </li>
                            <li>
                                <Link to="/guides/yatirim-fonlari-vergilendirmesi" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Vergilendirme
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Araçlar
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link to="/funds" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Fon Arama
                                </Link>
                            </li>
                            <li>
                                <Link to="/companies" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Şirket Analizi
                                </Link>
                            </li>
                            <li>
                                <Link to="/compare" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Karşılaştırma
                                </Link>
                            </li>
                            <li>
                                <Link to="/inflation" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Enflasyon
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Kişisel
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link to="/favorites" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Favoriler
                                </Link>
                            </li>
                            <li>
                                <Link to="/analyses" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Analizlerim
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => setIsDataManagementOpen(true)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                >
                                    Veri Yönetimi
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Yasal
                        </h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Hakkında
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Kullanım Koşulları
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center space-y-4">
                    <div>
                        <Link to="/api" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                            <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                            FonParam API
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} FonParam. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>

            <DataManagementModal
                isOpen={isDataManagementOpen}
                onClose={() => setIsDataManagementOpen(false)}
            />
        </footer>
    );
} 