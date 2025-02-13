import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useInflation } from '../hooks/useApi';
import { formatCurrency, formatPercent } from '../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Combobox, Switch } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import LoadingOverlay from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import { useSearchParams } from 'react-router-dom';
import { DEBOUNCE_DELAY } from '../constants';

type Month = {
    value: number;
    label: string;
};

export default function Inflation() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Varsayılan değerler
    const defaultAmount = 10000;
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 1);

    const years = Array.from({ length: new Date().getFullYear() - 2004 }, (_, i) => new Date().getFullYear() - i);
    const months: Month[] = [
        { value: 1, label: 'Ocak' },
        { value: 2, label: 'Şubat' },
        { value: 3, label: 'Mart' },
        { value: 4, label: 'Nisan' },
        { value: 5, label: 'Mayıs' },
        { value: 6, label: 'Haziran' },
        { value: 7, label: 'Temmuz' },
        { value: 8, label: 'Ağustos' },
        { value: 9, label: 'Eylül' },
        { value: 10, label: 'Ekim' },
        { value: 11, label: 'Kasım' },
        { value: 12, label: 'Aralık' }
    ];

    // URL'den parametreleri al veya varsayılan değerleri kullan
    const initialAmount = Number(searchParams.get('amount')) || defaultAmount;
    const initialYear = Number(searchParams.get('year')) || defaultDate.getFullYear();
    const initialMonth = months.find(m => m.value === Number(searchParams.get('month'))) || 
        months.find(m => m.value === defaultDate.getMonth() + 1)!;
    const initialShowNominal = searchParams.get('nominal') !== 'false';

    // State
    const [amount, setAmount] = useState(initialAmount);
    const [debouncedAmount, setDebouncedAmount] = useState(initialAmount);
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedMonth, setSelectedMonth] = useState<Month>(initialMonth);
    const [showNominal, setShowNominal] = useState(initialShowNominal);

    // Şu anki yıl için kullanılabilir ayları filtrele
    const availableMonths = selectedYear === new Date().getFullYear()
        ? months.filter(month => Number(month.value) <= new Date().getMonth() + 1)
        : months;

    // Yıl değiştiğinde ay seçimini kontrol et
    useEffect(() => {
        if (selectedYear === new Date().getFullYear()) {
            const currentMonth = new Date().getMonth() + 1;
            if (Number(selectedMonth.value) > currentMonth) {
                const lastAvailableMonth = availableMonths[availableMonths.length - 1];
                setSelectedMonth(lastAvailableMonth);
            }
        }
    }, [selectedYear]);

    // Amount değişikliğini yönet
    const handleAmountChange = (value: string) => {
        const newAmount = Number(value);
        if (!isNaN(newAmount) && newAmount > 0) {
            setDebouncedAmount(newAmount);
        }
    };

    // Debounced amount için useEffect
    useEffect(() => {
        const timer = setTimeout(() => {
            setAmount(debouncedAmount);
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [debouncedAmount]);

    // URL'yi güncelle
    useEffect(() => {
        const newParams = new URLSearchParams();
        
        // Sadece varsayılan değerlerden farklı olan parametreleri ekle
        if (amount !== defaultAmount) {
            newParams.set('amount', amount.toString());
        }
        if (selectedYear !== defaultDate.getFullYear()) {
            newParams.set('year', selectedYear.toString());
        }
        if (selectedMonth.value !== defaultDate.getMonth() + 1) {
            newParams.set('month', selectedMonth.value.toString());
        }
        if (showNominal !== true) {
            newParams.set('nominal', showNominal.toString());
        }

        // Eğer hiç parametre yoksa URL'yi temizle
        const params = newParams.toString();
        setSearchParams(params ? newParams : {});
    }, [amount, selectedYear, selectedMonth, showNominal]);

    const startDate = `${selectedYear}-${String(selectedMonth?.value).padStart(2, '0')}-01`;

    // API'den enflasyon verilerini çek
    const { data: inflationData, isLoading } = useInflation(startDate);

    // Enflasyon etkisini hesapla
    const calculateRealValue = () => {
        if (!inflationData) return [];

        // Verileri ters çeviriyoruz (en eskiden yeniye)
        const sortedData = [...inflationData].reverse();
        const result = [];
        let currentValue = amount;
        let nominalValue = amount;
        let cumulativeLossRate = 0;
        let cumulativeInflationRate = 0;

        for (let i = 0; i < sortedData.length; i++) {
            const item = sortedData[i];
            
            // Her ay için veriyi hazırla
            result.push({
                date: item.date,
                nominalValue: nominalValue,
                realValue: currentValue,
                monthlyRate: item.monthly_rate,
                yearlyRate: item.yearly_rate,
                cumulativeLossRate: cumulativeLossRate,
                cumulativeInflationRate: cumulativeInflationRate
            });

            // Bir sonraki ay için değerleri güncelle (eğer son ay değilse)
            if (i < sortedData.length - 1) {
                currentValue = currentValue * (1 - sortedData[i].monthly_rate / 100);
                nominalValue = nominalValue * (1 + sortedData[i].monthly_rate / 100);
                cumulativeLossRate = ((nominalValue - currentValue) / nominalValue) * 100;
                cumulativeInflationRate += item.monthly_rate;
            }
        }

        return result;
    };

    const chartData = calculateRealValue();

    return (
        <div>
            <Helmet>
                <title>Enflasyon Hesaplama</title>
                <meta name="description" content="Paranın enflasyon karşısındaki değerini hesaplayın." />
            </Helmet>

            <LoadingOverlay isLoading={isLoading} />

            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Enflasyon Hesaplama</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Paranın enflasyon karşısındaki değerini hesaplayın
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
                {/* Inputs */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Para Miktarı
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₺</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    value={debouncedAmount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    placeholder={defaultAmount.toString()}
                                    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ay
                            </label>
                            <div className="mt-1">
                                <Combobox<Month>
                                    value={selectedMonth}
                                    onChange={(value) => value && setSelectedMonth(value)}
                                    by={(a, b) => a.value === b.value}
                                >
                                    <div className="relative">
                                        <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                                    {String(selectedMonth.value).padStart(2, '0')}
                                                </span>
                                                <span className="block truncate">{selectedMonth.label}</span>
                                            </div>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                            </span>
                                        </Combobox.Button>
                                        <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {availableMonths.map((month) => (
                                                <Combobox.Option
                                                    key={month.value}
                                                    value={month}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                            active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                        }`
                                                    }
                                                >
                                                    {({ active }) => (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
                                                                active ? 'bg-white text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                                {String(month.value).padStart(2, '0')}
                                                            </span>
                                                            <span>{month.label}</span>
                                                        </div>
                                                    )}
                                                </Combobox.Option>
                                            ))}
                                        </Combobox.Options>
                                    </div>
                                </Combobox>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Yıl
                            </label>
                            <div className="mt-1">
                                <Combobox<number>
                                    value={selectedYear}
                                    onChange={(value) => value && setSelectedYear(value)}
                                >
                                    <div className="relative">
                                        <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                                    {String(selectedYear).slice(-2)}
                                                </span>
                                                <span className="block truncate">{selectedYear}</span>
                                            </div>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                            </span>
                                        </Combobox.Button>
                                        <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto scrollbar rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {years.map((year) => (
                                                <Combobox.Option
                                                    key={year}
                                                    value={year}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                            active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                        }`
                                                    }
                                                >
                                                    {({ active }) => (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
                                                                active ? 'bg-white text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                                {String(year).slice(-2)}
                                                            </span>
                                                            <span>{year}</span>
                                                        </div>
                                                    )}
                                                </Combobox.Option>
                                            ))}
                                        </Combobox.Options>
                                    </div>
                                </Combobox>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Değer Tipi
                            </label>
                            <div className="mt-1">
                                <Combobox
                                    value={showNominal ? { label: 'Nominal', value: true } : { label: 'Reel', value: false }}
                                    onChange={(option) => option && setShowNominal(option.value)}
                                    by={(a, b) => a.value === b.value}
                                >
                                    <div className="relative">
                                        <Combobox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                            <div className="flex items-center gap-2">
                                                {showNominal ? (
                                                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 7L9 13L13 9L21 17M21 17V11M21 17H15" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                                <span className="block truncate">{showNominal ? 'Nominal' : 'Reel'}</span>
                                            </div>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                            </span>
                                        </Combobox.Button>
                                        <Combobox.Options className="absolute left-0 right-0 z-10 mt-1 rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            <Combobox.Option
                                                value={{ label: 'Nominal', value: true }}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                    }`
                                                }
                                            >
                                                {({ active }) => (
                                                    <div className="flex items-center gap-2">
                                                        <svg className={`h-4 w-4 ${active ? 'text-white' : 'text-green-600 dark:text-green-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <span>Nominal</span>
                                                    </div>
                                                )}
                                            </Combobox.Option>
                                            <Combobox.Option
                                                value={{ label: 'Reel', value: false }}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                    }`
                                                }
                                            >
                                                {({ active }) => (
                                                    <div className="flex items-center gap-2">
                                                        <svg className={`h-4 w-4 ${active ? 'text-white' : 'text-red-600 dark:text-red-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 7L9 13L13 9L21 17M21 17V11M21 17H15" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <span>Reel</span>
                                                    </div>
                                                )}
                                            </Combobox.Option>
                                        </Combobox.Options>
                                    </div>
                                </Combobox>
                            </div>
                        </div>
                    </div>
                </div>

                {!isLoading && chartData.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <EmptyState
                                title="Veri Bulunamadı"
                                description="Seçilen tarih aralığı için enflasyon verisi bulunamadı. Lütfen farklı bir tarih seçin."
                                icon={<ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chart */}
                        {chartData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Değer Değişimi</h2>
                                    {chartData.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
                                                {formatCurrency(showNominal ? chartData[0].nominalValue : chartData[0].realValue)}
                                            </div>
                                            <div className="text-gray-400 dark:text-gray-500">→</div>
                                            <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                                (showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue) >= 
                                                (showNominal ? chartData[0].nominalValue : chartData[0].realValue)
                                                    ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                    : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                            }`}>
                                                {formatCurrency(showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue)}
                                            </div>
                                            <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                                (showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue) >= 
                                                (showNominal ? chartData[0].nominalValue : chartData[0].realValue)
                                                    ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                    : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                            }`}>
                                                {formatPercent(((showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue) /
                                                    (showNominal ? chartData[0].nominalValue : chartData[0].realValue) - 1) * 100)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-gray-700" />
                                            <XAxis 
                                                dataKey="date" 
                                                className="text-gray-600 dark:text-gray-300"
                                                tickFormatter={(date) => {
                                                    return new Date(date).toLocaleDateString('tr-TR', {
                                                        month: 'short',
                                                        year: 'numeric'
                                                    });
                                                }}
                                            />
                                            <YAxis
                                                className="text-gray-600 dark:text-gray-300"
                                                tickFormatter={(value) => {
                                                    if (value >= 1_000_000) {
                                                        return (value / 1_000_000).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + 'M ₺';
                                                    } else if (value >= 1_000) {
                                                        return (value / 1_000).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + 'B ₺';
                                                    }
                                                    return value.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺';
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [formatCurrency(value), 'Değer']}
                                                labelFormatter={(date) => {
                                                    return new Date(date).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'long'
                                                    });
                                                }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--background)',
                                                    borderColor: 'var(--gray-200)',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.75rem'
                                                }}
                                            />
                                            {showNominal ? (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="nominalValue" 
                                                    name="Nominal Değer"
                                                    stroke="#4f46e5"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            ) : (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="realValue" 
                                                    name="Reel Değer"
                                                    stroke="#dc2626"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Details Table */}
                        {chartData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Detaylı Analiz</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Tarih</th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {showNominal ? 'Nominal Değer' : 'Reel Değer'}
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Aylık Enflasyon</th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Yıllık Enflasyon</th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Toplam Enflasyon</th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Toplam Kayıp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                            {chartData.map((item, index) => (
                                                <tr key={item.date} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-900 dark:text-gray-100">
                                                        {new Date(item.date).toLocaleDateString('tr-TR', {
                                                            year: 'numeric',
                                                            month: 'long'
                                                        })}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(showNominal ? item.nominalValue : item.realValue)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                        {formatPercent(item.monthlyRate)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                        {formatPercent(item.yearlyRate)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                        {formatPercent(item.cumulativeInflationRate)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                                                        {formatPercent(item.cumulativeLossRate)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 