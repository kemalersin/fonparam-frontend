import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCompanyDetails } from '../hooks/useApi';
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { Fund } from '../types/api';
import EmptyState from '../components/EmptyState';
import { formatPercent, formatNumber } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function CompanyDetail() {
    const { code } = useParams<{ code: string }>();
    const { data, isLoading } = useCompanyDetails(code ?? '');
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-500">404</h2>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Şirket Bulunamadı</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Belirtilen şirket koduna sahip bir şirket bulunamadı.</p>
                <div className="mt-6">
                    <Link to="/companies" className="text-base font-medium text-indigo-600 dark:text-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400">
                        Şirket Listesine Dön <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            {data && (
                <Helmet>
                    <title>{data.title} | FonParam</title>
                    <meta name="description" content={`${data.title} portföy yönetim şirketi hakkında detaylı bilgi, yönetilen fonlar ve performans analizi.`} />
                    
                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content={data.title} />
                    <meta property="og:description" content={`${data.title} portföy yönetim şirketi hakkında detaylı bilgi, yönetilen fonlar ve performans analizi.`} />
                    {data.logo && (
                        <meta property="og:image" content={data.logo} />
                    )}
                    
                    {/* Twitter */}
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content={data.title} />
                    <meta name="twitter:description" content={`${data.title} portföy yönetim şirketi hakkında detaylı bilgi, yönetilen fonlar ve performans analizi.`} />
                    {data.logo && (
                        <meta name="twitter:image" content={data.logo} />
                    )}
                </Helmet>
            )}
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.title}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{data.code}</p>
                        </div>
                        {data.logo && (
                            <img
                                src={data.logo}
                                alt={data.title}
                                className="h-16 w-16 object-contain"
                            />
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            <span className="hidden sm:inline">Toplam</span> Fon Sayısı
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {formatNumber(data.total_funds)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {[
                        { label: '1 Aylık', value: data.avg_yield_1m },
                        { label: '6 Aylık', value: data.avg_yield_6m },
                        { label: 'Yıllık', value: data.avg_yield_1y },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {stat.value && stat.value >= 0 ? (
                                            <ArrowUpIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                                        ) : (
                                            <ArrowDownIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                {stat.label} Getiri
                                            </dt>
                                            <dd className={`text-lg font-semibold ${
                                                stat.value && stat.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                {data.best_performing_funds && data.best_performing_funds.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">En İyi Performans Gösteren Fonlar</h2>
                        <div className="space-y-4">
                            {data.best_performing_funds.map((fund) => (
                                <Link
                                    key={fund.code}
                                    to={`/funds/${fund.code}`}
                                    className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{fund.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{fund.type}</p>
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
                        </div>
                    </div>
                )}

                {/* All Funds */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tüm Fonlar</h2>
                        {data.funds && data.funds.length > 0 && (
                            <Link
                                to={`/funds?company=${data.code}`}
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400"
                            >
                                Tümünü Gör →
                            </Link>
                        )}
                    </div>
                    {data.funds && data.funds.length > 0 ? (
                        <div className="overflow-x-auto scrollbar">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Kod
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Fon Adı
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Tip
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            1 Aylık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            6 Aylık
                                        </th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            1 Yıllık
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {(data.funds as Fund[])
                                        ?.slice(0, 20)
                                        .map((fund) => (
                                            <tr
                                                key={fund.code}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                onClick={() => navigate(`/funds/${fund.code}`)}
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    <Link
                                                        to={`/funds/${fund.code}`}
                                                        className="text-indigo-600 dark:text-indigo-500 hover:text-indigo-900 dark:hover:text-indigo-400"
                                                    >
                                                        {fund.code}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="truncate max-w-md" title={fund.title}>
                                                        {fund.title}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {fund.type}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <span
                                                        className={
                                                            fund.yield_1m && fund.yield_1m >= 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }
                                                    >
                                                        {formatPercent(fund.yield_1m)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <span
                                                        className={
                                                            fund.yield_6m && fund.yield_6m >= 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }
                                                    >
                                                        {formatPercent(fund.yield_6m)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <span
                                                        className={
                                                            fund.yield_1y && fund.yield_1y >= 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
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
        </div>
    );
} 