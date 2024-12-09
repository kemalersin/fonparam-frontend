import { Link } from 'react-router-dom';
import { useTopPerformingFunds } from '../hooks/useApi';
import { ChartBarIcon, BuildingOfficeIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { formatPercent } from '../utils/format';

export default function Home() {
    const { data: topFunds, isLoading } = useTopPerformingFunds();

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Türkiye'nin Yatırım Fonu Verileri
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Tüm yatırım fonlarının güncel ve geçmiş verilerine erişin, karşılaştırmalar yapın
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/funds"
                        className="flex items-center justify-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Fon Listesi</h3>
                            <p className="text-sm text-gray-600">Tüm fonları inceleyin</p>
                        </div>
                    </Link>
                    <Link
                        to="/companies"
                        className="flex items-center justify-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <BuildingOfficeIcon className="h-8 w-8 text-indigo-600 mr-3" />
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Portföy Şirketleri</h3>
                            <p className="text-sm text-gray-600">Şirketleri karşılaştırın</p>
                        </div>
                    </Link>
                    <Link
                        to="/compare"
                        className="flex items-center justify-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600 mr-3" />
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Fon Karşılaştırma</h3>
                            <p className="text-sm text-gray-600">Detaylı analiz yapın</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Top Performing Funds */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">En İyi Performans Gösteren Fonlar</h2>
                    <Link to="/funds" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Tümünü Gör →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-4">
                        {topFunds?.map((fund) => (
                            <Link
                                key={fund.code}
                                to={`/funds/${fund.code}`}
                                className="block p-0 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start sm:items-center gap-3">
                                        <div
                                            className="flex-shrink-0 hover:opacity-75 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/companies/${fund.management_company_id}`;
                                            }}
                                        >
                                            {fund.management_company?.logo ? (
                                                <img
                                                    src={fund.management_company.logo}
                                                    alt={fund.management_company.title}
                                                    className="h-9 w-9 object-contain"
                                                />
                                            ) : (
                                                <div className="h-9 w-9 rounded bg-gray-100 flex items-center justify-center text-base font-medium text-gray-500">
                                                    {fund.management_company?.title.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-medium text-gray-900 leading-tight">{fund.title}</h3>
                                            <p className="text-sm text-gray-500">{fund.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatPercent(fund.yield_1y)}
                                        </p>
                                        <p className="text-sm text-gray-500">Yıllık Getiri</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 