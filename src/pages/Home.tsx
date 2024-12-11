import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTopPerformingFunds } from '../hooks/useApi';
import { formatPercent } from '../utils/format';
import RecentlyViewedFunds from '../components/RecentlyViewedFunds';
import { Tab } from '@headlessui/react';
import { 
    ChartBarIcon, 
    BuildingOfficeIcon, 
    ArrowTrendingUpIcon, 
    MagnifyingGlassIcon,
    AcademicCapIcon,
    ChartPieIcon,
    ScaleIcon,
    ClockIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';

const stats = [
    {
        name: 'Toplam Fon',
        value: '500+',
        description: 'Aktif olarak işlem gören'
    },
    {
        name: 'Portföy Yönetim Şirketi',
        value: '50+',
        description: 'Türkiye genelinde'
    },
    {
        name: 'Günlük İşlem Hacmi',
        value: '₺1.2B+',
        description: 'Ortalama'
    },
    {
        name: 'Toplam Portföy Büyüklüğü',
        value: '₺450B+',
        description: 'Yönetilen varlık'
    }
];

const guides = [
    {
        title: 'Yatırım Fonu Nedir?',
        description: 'Yatırım fonları, birçok yatırımcının birikimlerini bir araya getirerek oluşturduğu portföylerdir.',
        icon: AcademicCapIcon,
    },
    {
        title: 'Fon Türleri',
        description: 'Hisse senedi, borçlanma araçları, karma ve serbest fonlar hakkında bilgi edinin.',
        icon: ChartPieIcon,
    },
    {
        title: 'Nasıl Fon Seçilir?',
        description: 'Fon seçerken dikkat edilmesi gereken kriterler ve analiz yöntemleri.',
        icon: ScaleIcon,
    },
    {
        title: 'Yatırım Stratejileri',
        description: 'Düzenli yatırım, portföy çeşitlendirme ve risk yönetimi hakkında ipuçları.',
        icon: ClockIcon,
    },
];

const marketSummary = [
    { type: 'Hisse Senedi Fonları', value: 112.4, trend: 'up' },
    { type: 'Borçlanma Araçları Fonları', value: 42.8, trend: 'up' },
    { type: 'Karma Fonlar', value: 28.5, trend: 'down' },
    { type: 'Para Piyasas Fonları', value: 35.2, trend: 'up' },
    { type: 'Katılım Fonları', value: 45.6, trend: 'up' },
    { type: 'Serbest Fonlar', value: 65.3, trend: 'down' }
];

export default function Home() {
    const { data: topFunds, isLoading } = useTopPerformingFunds();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/funds?search=${encodeURIComponent(search.trim())}`);
        }
    };

    const getFundGroups = () => {
        if (!topFunds) return [[], []];
        return [
            topFunds.slice(0, 5),
            topFunds.slice(5, 10)
        ];
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative isolate">
                <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-400 opacity-30 dark:from-indigo-700 dark:to-indigo-900 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm p-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Türkiye'nin Yatırım Fonu Verileri
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Tüm yatırım fonlarının güncel ve geçmiş verilerine erişin, karşılaştırmalar yapın, yatırımlarınızı analiz edin
                    </p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                placeholder="Fon kodu veya adı ile arayın..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </form>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/funds"
                            className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            <ChartBarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fon Listesi</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tüm fonları inceleyin</p>
                            </div>
                        </Link>
                        <Link
                            to="/companies"
                            className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            <BuildingOfficeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Portföy Şirketleri</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Şirketleri karşılaştırın</p>
                            </div>
                        </Link>
                        <Link
                            to="/compare"
                            className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fon Karşılaştırma</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Detaylı analiz yapın</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                    <div className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-400 opacity-30 dark:from-indigo-700 dark:to-indigo-900 sm:left-[calc(50%+30rem)] sm:w-[72.1875rem]"></div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="mx-auto max-w-7xl">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-8 sm:gap-y-0 sm:grid-cols-2 lg:grid-cols-4 p-8">
                        {stats.map((stat) => (
                            <div key={stat.name} className="flex flex-col items-center gap-y-2 border-gray-100 dark:border-gray-700 sm:border-l first:border-0 sm:px-8">
                                <dt className="text-sm leading-6 text-gray-600 dark:text-gray-400">{stat.name}</dt>
                                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{stat.value}</dd>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{stat.description}</p>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>

            {/* Top Performing Funds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">En İyi Performans Gösteren Fonlar</h2>
                    <Link to="/funds" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                        Tümünü Gör →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                ) : (
                    <Tab.Group>
                        <div className="relative">
                            <Tab.Panels className="overflow-hidden">
                                {getFundGroups().map((group, idx) => (
                                    <Tab.Panel
                                        key={idx}
                                        className={`space-y-6 sm:space-y-4`}
                                    >
                                        {group.map((fund) => (
                                            <Link
                                                key={fund.code}
                                                to={`/funds/${fund.code}`}
                                                className="block p-0 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
                                                                <div className="h-9 w-9 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-base font-medium text-gray-500 dark:text-gray-400">
                                                                    {fund.management_company?.title.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 leading-tight">{fund.title}</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{fund.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                            {formatPercent(fund.yield_1y)}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Yıllık Getiri</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </Tab.Panel>
                                ))}
                            </Tab.Panels>
                            <Tab.List className="flex justify-center gap-2 mt-6">
                                {getFundGroups().map((_, idx) => (
                                    <Tab
                                        key={idx}
                                        className={({ selected }) =>
                                            `w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                                                selected
                                                    ? 'bg-indigo-600 dark:bg-indigo-500'
                                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                            }`
                                        }
                                    />
                                ))}
                            </Tab.List>
                        </div>
                    </Tab.Group>
                )}
            </div>

            {/* Education Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Yatırım Fonu Rehberi</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Yatırım fonları hakkında temel bilgiler ve yatırım stratejileri
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {guides.map((guide) => (
                            <div
                                key={guide.title}
                                className="relative flex flex-col gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500 dark:bg-indigo-600 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 transition-colors">
                                    <guide.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {guide.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {guide.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Market Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Piyasa Özeti</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Fon türlerine göre yıllık ortalama getiriler
                            </p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {marketSummary.map((item) => (
                            <div
                                key={item.type}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                            >
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.type}</h3>
                                    <p className={`text-2xl font-semibold mt-1 ${
                                        item.trend === 'up' 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        %{item.value}
                                    </p>
                                </div>
                                {item.trend === 'up' ? (
                                    <ArrowUpIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                                ) : (
                                    <ArrowDownIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recently Viewed Funds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Son Görüntülenen Fonlar</h2>
                <RecentlyViewedFunds />
            </div>
        </div>
    );
} 