import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                                    Portföy Yönetim Şirketleri
                                </Link>
                            </li>
                            <li>
                                <Link to="/compare" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Fon Karşılaştırma
                                </Link>
                            </li>
                            <li>
                                <Link to="/analyses" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                    Analizler
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
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Yasal</h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link to="/about" className="text-base text-gray-500 hover:text-gray-400">
                                    Hakkında
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-400">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-base text-gray-500 hover:text-gray-400">
                                    Kullanım Koşulları
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} FonParam. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    );
} 