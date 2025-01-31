import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, ChevronUpDownIcon, ChartBarSquareIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useFunds } from '../hooks/useApi';
import { formatPercent } from '../utils/format';
import ComparisonButton from '../components/ComparisonButton';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingOverlay from '../components/LoadingOverlay';
import SortHeader from '../components/SortHeader';
import { useUrlSort } from '../hooks/useUrlSort';
import { DEFAULT_PAGE_SIZE, DEBOUNCE_DELAY, FUND_TYPES } from '../constants';
import { Combobox } from '@headlessui/react';
import { Fund, PaginatedResponse } from '../types/api';

type SortableFields = 'code' | 'title' | 'risk_value' | 'yield_1m' | 'yield_3m' | 'yield_6m' | 'yield_ytd' | 'yield_1y' | 'yield_3y' | 'yield_5y';

const TEFAS_OPTIONS = [
    { label: 'TEFAS\'ta Var', value: true },
    { label: 'TEFAS\'ta Yok', value: false }
];

export default function Funds() {
    const navigate = useNavigate();
    const { search: searchInput, setSearch: setSearchInput, sort, order, handleSort, type, setType, page, setPage, company, minRiskValue, maxRiskValue, setRiskRange, tefas, setTefas } = useUrlSort<SortableFields>({
        defaultSort: 'code',
        defaultOrder: 'ASC',
        defaultPage: 1
    });

    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
    const [currentData, setCurrentData] = useState<PaginatedResponse<Fund> | undefined>(undefined);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // Debounced search için useEffect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading } = useFunds({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch,
        sort,
        order,
        type: type || undefined,
        management_company: company || undefined,
        min_risk_value: minRiskValue,
        max_risk_value: maxRiskValue,
        tefas: tefas
    });

    // Yeni veriler geldiğinde mevcut verileri güncelle
    useEffect(() => {
        if (data) {
            setCurrentData(data);
            setIsFirstLoad(false);
        }
    }, [data]);

    const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, fundCode: string) => {
        if ((event.target as HTMLElement).closest('.company-logo')) {
            return;
        }
        navigate(`/funds/${fundCode}`);
    };

    const displayData = isLoading ? currentData : data;

    const headerContent = (
        <div className="sm:flex sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Yatırım Fonları</h1>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Tüm yatırım fonlarını görüntüleyin ve <span className="hidden sm:inline">performanslarını</span> karşılaştırın
                </p>
            </div>
        </div>
    );

    if (isFirstLoad && isLoading) {
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
                <title>Yatırım Fonları | FonParam</title>
                <meta name="description" content="Türkiye'deki tüm yatırım fonlarını inceleyin, filtreleyin ve detaylı analizler yapın." />
            </Helmet>
            <LoadingOverlay isLoading={isLoading} />

            {/* Header */}
            {headerContent}

            <div className="mt-6 space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-10">
                    {/* Search */}
                    <div className="relative sm:col-span-3">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
                            placeholder="Fon kodu veya adı ile arayın..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    {/* Fund Type Filter */}
                    <div className="sm:col-span-3">
                        <Combobox
                            as="div"
                            value={FUND_TYPES.find(t => t.value === type)}
                            onChange={(t) => t && setType(t.value)}
                        >
                            <div className="relative">
                                <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    <div className="flex items-center gap-2">
                                        <WalletIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <span className="block truncate">
                                            {FUND_TYPES.find(t => t.value === type)?.label || 'Tüm Fonlar'}
                                        </span>
                                    </div>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    </span>
                                </Combobox.Button>
                                <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {FUND_TYPES.map((type) => (
                                        <Combobox.Option
                                            key={type.value}
                                            value={type}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                }`
                                            }
                                        >
                                            {({ active }) => (
                                                <div className="flex items-center gap-2">
                                                    <WalletIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                                                    <span>{type.label}</span>
                                                </div>
                                            )}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            </div>
                        </Combobox>
                    </div>

                    {/* TEFAS Filter */}
                    <div className="sm:col-span-2">
                        <Combobox
                            as="div"
                            value={tefas !== undefined ? TEFAS_OPTIONS.find(t => t.value === tefas) : null}
                            onChange={(option) => setTefas(option?.value)}
                            nullable
                        >
                            <div className="relative">
                                <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium ${
                                            tefas === undefined ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                                            tefas ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            T
                                        </span>
                                        <span className="block truncate">
                                            {tefas !== undefined ? TEFAS_OPTIONS.find(t => t.value === tefas)?.label : 'TEFAS Durumu'}
                                        </span>
                                    </div>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    </span>
                                </Combobox.Button>
                                <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    <Combobox.Option
                                        value={null}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`
                                        }
                                    >
                                        {({ active }) => (
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium ${active ? 'bg-white text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                    T
                                                </span>
                                                <span>Tümü</span>
                                            </div>
                                        )}
                                    </Combobox.Option>
                                    {TEFAS_OPTIONS.map((option) => (
                                        <Combobox.Option
                                            key={String(option.value)}
                                            value={option}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`
                                            }
                                        >
                                            {({ active }) => (
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium ${
                                                        active ? 'bg-white text-indigo-600' :
                                                        option.value ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        T
                                                    </span>
                                                    <span>{option.label}</span>
                                                </div>
                                            )}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            </div>
                        </Combobox>
                    </div>

                    {/* Risk Filter */}
                    <div className="sm:col-span-2">
                        <Combobox
                            as="div"
                            value={minRiskValue !== undefined ? { label: `Risk: ${minRiskValue}-${maxRiskValue || 7}`, value: minRiskValue } : null}
                            onChange={(option) => {
                                if (!option) {
                                    setRiskRange(undefined, undefined);
                                } else if (option.value === 1) {
                                    setRiskRange(1, 2);
                                } else if (option.value === 3) {
                                    setRiskRange(3, 4);
                                } else if (option.value === 5) {
                                    setRiskRange(5, 7);
                                }
                            }}
                            nullable
                        >
                            <div className="relative">
                                <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    <div className="flex items-center gap-2">
                                        <ChartBarSquareIcon className={`h-4 w-4 ${
                                            minRiskValue === undefined ? 'text-gray-400 dark:text-gray-500' :
                                            minRiskValue <= 2 ? 'text-green-600 dark:text-green-400' :
                                            minRiskValue <= 4 ? 'text-yellow-600 dark:text-yellow-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`} />
                                        <span className="block truncate">
                                            {minRiskValue !== undefined ? (
                                                <span className={
                                                    minRiskValue <= 2 ? 'text-green-600 dark:text-green-400' :
                                                    minRiskValue <= 4 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-red-600 dark:text-red-400'
                                                }>
                                                    Risk: {minRiskValue}-{maxRiskValue || 7}
                                                </span>
                                            ) : 'Risk Seviyesi'}
                                        </span>
                                    </div>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    </span>
                                </Combobox.Button>
                                <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    <Combobox.Option
                                        value={null}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`
                                        }
                                    >
                                        {({ active }) => (
                                            <div className="flex items-center gap-2">
                                                <ChartBarSquareIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                                                <span>Tüm Risk Seviyeleri</span>
                                            </div>
                                        )}
                                    </Combobox.Option>
                                    <Combobox.Option
                                        value={{ label: 'Risk: 1-2', value: 1 }}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`
                                        }
                                    >
                                        {({ active }) => (
                                            <div className="flex items-center gap-2">
                                                <ChartBarSquareIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                                                <span className={active ? 'text-white' : 'text-green-600 dark:text-green-400'}>Düşük Risk (1-2)</span>
                                            </div>
                                        )}
                                    </Combobox.Option>
                                    <Combobox.Option
                                        value={{ label: 'Risk: 3-4', value: 3 }}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`
                                        }
                                    >
                                        {({ active }) => (
                                            <div className="flex items-center gap-2">
                                                <ChartBarSquareIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-yellow-600 dark:text-yellow-400'}`} />
                                                <span className={active ? 'text-white' : 'text-yellow-600 dark:text-yellow-400'}>Orta Risk (3-4)</span>
                                            </div>
                                        )}
                                    </Combobox.Option>
                                    <Combobox.Option
                                        value={{ label: 'Risk: 5-7', value: 5 }}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`
                                        }
                                    >
                                        {({ active }) => (
                                            <div className="flex items-center gap-2">
                                                <ChartBarSquareIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-red-600 dark:text-red-400'}`} />
                                                <span className={active ? 'text-white' : 'text-red-600 dark:text-red-400'}>Yüksek Risk (5-7)</span>
                                            </div>
                                        )}
                                    </Combobox.Option>
                                </Combobox.Options>
                            </div>
                        </Combobox>
                    </div>
                </div>

                {/* Table */}
                {!isLoading && (!displayData?.data || displayData.data.length === 0) ? (
                    <div className="flex items-center justify-center sm:min-h-[400px]">
                        <EmptyState
                            title="Fon Bulunamadı"
                            description="Aramanızla eşleşen fon bulunamadı. Lütfen farklı bir arama yapmayı deneyin."
                        />
                    </div>
                ) : (
                    <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto scrollbar sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <SortHeader
                                                    label="Fon Kodu"
                                                    field="code"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <th />
                                                <SortHeader
                                                    label="Fon Adı"
                                                    field="title"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100" />
                                                <SortHeader
                                                    label="Risk"
                                                    field="risk_value"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="1 Ay"
                                                    field="yield_1m"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="3 Ay"
                                                    field="yield_3m"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="6 Ay"
                                                    field="yield_6m"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="YBB"
                                                    field="yield_ytd"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="1 Yıl"
                                                    field="yield_1y"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="3 Yıl"
                                                    field="yield_3y"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                                <SortHeader
                                                    label="5 Yıl"
                                                    field="yield_5y"
                                                    currentSort={sort}
                                                    currentOrder={order}
                                                    onSort={handleSort}
                                                />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                            {displayData?.data?.map((fund: Fund) => (
                                                <tr
                                                    key={fund.code}
                                                    onClick={(e) => handleRowClick(e, fund.code)}
                                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                        <div className="flex items-center">
                                                            <Link
                                                                to={`/companies/${fund.management_company?.code}`}
                                                                className="company-logo flex-shrink-0 hover:opacity-75 mr-3"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {fund.management_company?.logo ? (
                                                                    <img
                                                                        src={fund.management_company.logo}
                                                                        alt={fund.management_company.title}
                                                                        className="h-6 w-6 object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                        {fund.management_company?.title?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{fund.code}</div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex gap-1">
                                                            <FavoriteButton fund={fund} />
                                                            <ComparisonButton fund={fund} />
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="line-clamp-2 min-w-[200px] max-w-[400px] overflow-hidden text-ellipsis">{fund.title}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                                        {fund.tefas === true ? (
                                                            <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                                                                TEFAS
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-md bg-transparent px-2 py-1 text-xs font-medium" />
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                                        {fund.risk_value ? (
                                                            <span className={`inline-flex items-center justify-center aspect-square w-6 text-xs font-medium ${
                                                                fund.risk_value <= 2 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                                                fund.risk_value <= 4 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                                                                'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                                            } rounded-full`}>
                                                                {fund.risk_value}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500">-</span>
                                                        )}
                                                    </td>
                                                    {[
                                                        fund.yield_1m,
                                                        fund.yield_3m,
                                                        fund.yield_6m,
                                                        fund.yield_ytd,
                                                        fund.yield_1y,
                                                        fund.yield_3y,
                                                        fund.yield_5y
                                                    ].map((value, index) => (
                                                        <td key={index} className='whitespace-nowrap px-3 py-4 text-sm text-right'>
                                                            {value !== undefined && value !== null ? (
                                                                <span className={value >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                                                                    {formatPercent(value)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                                            )}
                                                        </td>
                                                    ))}
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
                {displayData && displayData.total > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {displayData.total > DEFAULT_PAGE_SIZE ? (
                                        <>
                                            Toplam <span className="font-medium">{displayData.total}</span> fondan{' '}
                                            <span className="font-medium">{(page - 1) * DEFAULT_PAGE_SIZE + 1}</span>-
                                            <span className="font-medium">
                                                {Math.min(page * DEFAULT_PAGE_SIZE, displayData.total)}
                                            </span>{' '}
                                            arası gösteriliyor
                                        </>
                                    ) : (
                                        <>
                                            Toplam <span className="font-medium">{displayData.total}</span> fon gösteriliyor
                                        </>
                                    )}
                                </p>
                            </div>
                            {displayData.total > DEFAULT_PAGE_SIZE && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${page === 1
                                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        Önceki
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page * DEFAULT_PAGE_SIZE >= (displayData.total || 0)}
                                        className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${page * DEFAULT_PAGE_SIZE >= (displayData.total || 0)
                                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        Sonraki
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 