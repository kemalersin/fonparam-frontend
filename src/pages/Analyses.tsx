import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getAnalyses, deleteAnalysis, AnalysisRecord } from '../services/analysis';
import { formatDate, formatCurrency, formatPercent } from '../utils/format';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';
import SortHeader from '../components/SortHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import { useUrlSort } from '../hooks/useUrlSort';
import { 
    DEFAULT_INVESTMENT_PERIOD,
    DEFAULT_INITIAL_INVESTMENT,
    DEFAULT_MONTHLY_INVESTMENT,
    DEFAULT_INCREASE_TYPE,
    DEFAULT_INCREASE_VALUE
} from '../constants';
import ExportButton from '../components/ExportButton';
import { Helmet } from 'react-helmet-async';

const PERIODS: Record<string, string> = {
    'last_1_day': '1 Gün',
    'last_1_week': '1 Hafta',
    'last_1_month': '1 Ay',
    'last_3_months': '3 Ay',
    'last_6_months': '6 Ay',
    'year_start': 'YBB',
    'last_1_year': '1 Yıl',
    'last_3_years': '3 Yıl',
    'last_5_years': '5 Yıl'
};

type SortableFields = 'code' | 'title' | 'date' | 'startDate' | 'totalInvestment' | 'totalYield' | 'currentValue' | 'totalYieldPercentage';

export default function Analyses() {
    const navigate = useNavigate();
    const { search, setSearch, sort, order, handleSort } = useUrlSort<SortableFields>({
        defaultSort: 'date',
        defaultOrder: 'DESC'
    });

    const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        loadAnalyses();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            setIsFirstLoad(false);
        }
    }, [isLoading]);

    const loadAnalyses = async () => {
        setIsLoading(true);
        try {
            const data = await getAnalyses();
            setAnalyses(data);
        } catch (error) {
            console.error('Analizler yüklenirken hata:', error);
            showToast('Analizler yüklenirken bir hata oluştu.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (event: React.MouseEvent, analysis: AnalysisRecord) => {
        if ((event.target as HTMLElement).closest('.company-logo')) {
            return;
        }
        navigate(getAnalysisLink(analysis));
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteAnalysis(id);
            setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
            showToast('Analiz başarıyla silindi.', 'success');
        } catch (error) {
            console.error('Analiz silinirken hata:', error);
            showToast('Analiz silinirken bir hata oluştu.', 'error');
        }
    };

    const filteredAnalyses = analyses
        .filter(analysis => 
            search.trim() === '' || 
            analysis.fund.code.toLowerCase().includes(search.toLowerCase()) || 
            analysis.fund.title.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let aValue, bValue;

            switch (sort) {
                case 'code':
                    aValue = a.fund.code.toLowerCase();
                    bValue = b.fund.code.toLowerCase();
                    break;
                case 'title':
                    aValue = a.fund.title.toLowerCase();
                    bValue = b.fund.title.toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                case 'startDate':
                    const periodOrder: { [key: string]: number } = {
                        last_1_day: 1,
                        last_1_week: 2,
                        last_1_month: 3,
                        last_3_months: 4,
                        last_6_months: 5,
                        year_start: 6,
                        last_1_year: 7,
                        last_3_years: 8,
                        last_5_years: 9
                    };
                    aValue = periodOrder[a.parameters.startDate] || 0;
                    bValue = periodOrder[b.parameters.startDate] || 0;
                    break;
                case 'totalInvestment':
                    aValue = a.summary.totalInvestment;
                    bValue = b.summary.totalInvestment;
                    break;
                case 'totalYield':
                    aValue = a.summary.totalYield;
                    bValue = b.summary.totalYield;
                    break;
                case 'currentValue':
                    aValue = a.summary.currentValue;
                    bValue = b.summary.currentValue;
                    break;
                case 'totalYieldPercentage':
                    aValue = a.summary.totalYieldPercentage;
                    bValue = b.summary.totalYieldPercentage;
                    break;
                default:
                    return 0;
            }

            if (aValue === bValue) return 0;
            const comparison = aValue < bValue ? -1 : 1;
            return order === 'ASC' ? comparison : -comparison;
        });

    const getAnalysisLink = (analysis: AnalysisRecord) => {
        const params = new URLSearchParams();
        
        if (analysis.parameters.startDate !== DEFAULT_INVESTMENT_PERIOD) {
            params.set('period', analysis.parameters.startDate);
        }
        
        if (analysis.parameters.initialInvestment !== DEFAULT_INITIAL_INVESTMENT) {
            params.set('initial', analysis.parameters.initialInvestment.toString());
        }
        
        if (analysis.parameters.monthlyInvestment !== DEFAULT_MONTHLY_INVESTMENT) {
            params.set('monthly', analysis.parameters.monthlyInvestment.toString());
        }
        
        const hasCustomIncrease = analysis.parameters.yearlyIncrease.type !== DEFAULT_INCREASE_TYPE || 
                                analysis.parameters.yearlyIncrease.value !== DEFAULT_INCREASE_VALUE;
        
        if (hasCustomIncrease) {
            params.set('increaseType', analysis.parameters.yearlyIncrease.type);
            params.set('increaseValue', analysis.parameters.yearlyIncrease.value.toString());
        }

        const queryString = params.toString();
        return `/funds/${analysis.fund.code}${queryString ? `?${queryString}` : ''}`;
    };

    const headerContent = (
        <div className="sm:flex sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analizlerim</h1>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Kaydettiğiniz fon analizlerini görüntüleyin ve takip edin
                </p>
            </div>
            <ExportButton storeName="analyses" />
        </div>
    );

    if (isFirstLoad) {
        return (
            <div>
                <LoadingOverlay isLoading={true} />
                {headerContent}
            </div>
        );
    }

    return (
        <div>
            <Helmet>
                <title>Fon Analizlerim | FonParam</title>
                <meta name="description" content="Yatırım fonları için yaptığınız analizleri görüntüleyin ve takip edin." />
            </Helmet>
            <LoadingOverlay isLoading={isLoading} />
            {headerContent}

            <div className="mt-6 space-y-6">
                {/* Search */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
                        placeholder="Fon kodu veya adı ile arayın..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                {(!isLoading && filteredAnalyses.length === 0) ? (
                    <div className="flex items-center justify-center sm:min-h-[400px]">
                        <EmptyState
                            title={search.trim() ? "Arama sonucu bulunamadı" : "Kayıtlı analiz bulunmuyor"}
                            description={search.trim()
                                ? "Aramanızla eşleşen analiz bulunamadı. Lütfen farklı bir arama yapmayı deneyin."
                                : "Henüz kaydettiğiniz analiz bulunmuyor. Fon sayfasından analiz yapıp kaydedebilirsiniz."
                            }
                        />
                    </div>
                ) : (
                    <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto scrollbar sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <SortHeader
                                                    label="Fon Kodu"
                                                    field={'code' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Fon Adı"
                                                    field={'title' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Analiz Tarihi"
                                                    field={'date' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Yatırım Süresi"
                                                    field={'startDate' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Toplam Yatırım"
                                                    field={'totalInvestment' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Güncel Değer"
                                                    field={'currentValue' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Toplam Kazanç"
                                                    field={'totalYield' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="Getiri Oranı"
                                                    field={'totalYieldPercentage' as SortableFields}
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                    <span className="sr-only">İşlemler</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                            {filteredAnalyses.map((analysis) => (
                                                <tr
                                                    key={analysis.id}
                                                    onClick={(e) => handleRowClick(e, analysis)}
                                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                        <div className="flex items-center">
                                                            <Link
                                                                to={`/companies/${analysis.fund.management_company.code}`}
                                                                className="company-logo flex-shrink-0 hover:opacity-75 mr-3"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {analysis.fund.management_company.logo ? (
                                                                    <img
                                                                        src={analysis.fund.management_company.logo}
                                                                        alt={analysis.fund.management_company.title}
                                                                        className="h-6 w-6 object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                        {analysis.fund.management_company.title?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{analysis.fund.code}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="line-clamp-2 min-w-[200px] max-w-[400px] overflow-hidden text-ellipsis">
                                                            {analysis.fund.title}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                                                        {formatDate(new Date(analysis.date))}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                                                        {PERIODS[analysis.parameters.startDate] || analysis.parameters.startDate}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                                                        {formatCurrency(analysis.summary.totalInvestment)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                                                        {formatCurrency(analysis.summary.currentValue)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                        <span className={analysis.summary.totalYield >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                                                            {formatCurrency(analysis.summary.totalYield)}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                        <span className={analysis.summary.totalYieldPercentage >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                                                            {formatPercent(analysis.summary.totalYieldPercentage)}
                                                        </span>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                analysis.id && handleDelete(analysis.id);
                                                            }}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                        >
                                                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && filteredAnalyses.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Toplam <span className="font-medium">{filteredAnalyses.length}</span> analiz gösteriliyor
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 