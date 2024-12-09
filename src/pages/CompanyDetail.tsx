import { useParams, Link } from 'react-router-dom';
import { useCompanyDetails } from '../hooks/useApi';
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { FundYield } from '../types/api';
import EmptyState from '../components/EmptyState';
import { formatPercent, formatNumber } from '../utils/format';

export default function CompanyDetail() {
    const { code } = useParams<{ code: string }>();
    const { data, isLoading } = useCompanyDetails(code ?? '');

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <h2 className="text-base font-semibold text-indigo-600">404</h2>
                <p className="mt-2 text-3xl font-bold text-gray-900">Şirket Bulunamadı</p>
                <p className="mt-2 text-sm text-gray-500">Belirtilen şirket koduna sahip bir şirket bulunamadı.</p>
                <div className="mt-6">
                    <Link to="/companies" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
                        Şirket Listesine Dön <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data.company.title}</h1>
                        <p className="text-sm text-gray-500">{data.company.code}</p>
                    </div>
                    {data.company.logo && (
                        <img
                            src={data.company.logo}
                            alt={data.company.title}
                            className="h-16 w-16 object-contain"
                        />
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Toplam Fon Sayısı
                                    </dt>
                                    <dd className="text-lg font-semibold text-gray-900">
                                        {formatNumber(data.stats.total_funds)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {[
                    { label: '1 Aylık', value: data.stats.avg_yield_1m },
                    { label: '6 Aylık', value: data.stats.avg_yield_6m },
                    { label: 'Yıllık', value: data.stats.avg_yield_1y },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {stat.value && stat.value >= 0 ? (
                                        <ArrowUpIcon className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <ArrowDownIcon className="h-6 w-6 text-red-500" />
                                    )}
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {stat.label} Getiri
                                        </dt>
                                        <dd className={`text-lg font-semibold ${
                                            stat.value && stat.value >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formatPercent(stat.value)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Best Performing Funds */}
            {data.stats.best_performing_funds && data.stats.best_performing_funds.length > 0 && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">En İyi Performans Gösteren Fonlar</h2>
                    <div className="space-y-4">
                        {data.stats.best_performing_funds.map((fund) => (
                            <Link
                                key={fund.code}
                                to={`/funds/${fund.code}`}
                                className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{fund.title}</h3>
                                        <p className="text-sm text-gray-500">{fund.type}</p>
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
                </div>
            )}

            {/* All Funds */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Tüm Fonlar</h2>
                    {data.funds && data.funds.length > 0 && (
                        <Link
                            to={`/funds?company=${data.company.code}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Tümünü Gör →
                        </Link>
                    )}
                </div>
                {data.funds && data.funds.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                        Kod
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Fon Adı
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Tip
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        1 Aylık
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        6 Aylık
                                    </th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                        1 Yıllık
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(data.funds as FundYield[])
                                    ?.sort(() => 0.5 - Math.random())
                                    .slice(0, 20)
                                    .map((fund) => (
                                        <tr 
                                            key={fund.code}
                                            onClick={() => window.location.href = `/funds/${fund.code}`}
                                            className="cursor-pointer hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                <Link
                                                    to={`/funds/${fund.code}`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {fund.code}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                <div className="truncate max-w-md" title={fund.title}>
                                                    {fund.title}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {fund.type}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                <span
                                                    className={
                                                        fund.yield_1m && fund.yield_1m >= 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {formatPercent(fund.yield_1m)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                <span
                                                    className={
                                                        fund.yield_6m && fund.yield_6m >= 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {formatPercent(fund.yield_6m)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                <span
                                                    className={
                                                        fund.yield_1y && fund.yield_1y >= 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {formatPercent(fund.yield_1y)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="Fon Bulunamadı"
                        description="Bu şirketin henüz yönettiği bir fon bulunmuyor."
                    />
                )}
            </div>
        </div>
    );
} 