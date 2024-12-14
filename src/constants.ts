import type { YearlyIncreaseType } from './types/api';

// Investment Analysis Default Parameters
export const DEFAULT_INVESTMENT_PERIOD = 'last_1_year';
export const DEFAULT_INITIAL_INVESTMENT = 10000;
export const DEFAULT_MONTHLY_INVESTMENT = 1000;
export const DEFAULT_INCREASE_TYPE: YearlyIncreaseType = 'percentage';
export const DEFAULT_INCREASE_VALUE = 10;

// Pagination Parameters
export const DEFAULT_PAGE_SIZE = 20;
export const DEBOUNCE_DELAY = 300;

// Fund Types
export const FUND_TYPES = [
    { value: '', label: 'Tüm Fonlar' },
    { value: 'altin', label: 'Altın Fonları' },
    { value: 'borclanma_araclari', label: 'Borçlanma Araçları Fonları' },
    { value: 'degisken', label: 'Değişken Fonlar' },
    { value: 'fon_sepeti', label: 'Fon Sepeti Fonları' },
    { value: 'gumus', label: 'Gümüş Fonları' },
    { value: 'hisse_senedi', label: 'Hisse Senedi Fonları' },
    { value: 'hisse_senedi_yogun', label: 'Hisse Senedi Yoğun Fonlar' },
    { value: 'karma', label: 'Karma Fonlar' },
    { value: 'katilim', label: 'Katılım Fonları' },
    { value: 'kiymetli_madenler', label: 'Kıymetli Maden Fonları' },
    { value: 'para_piyasasi', label: 'Para Piyasası Fonları' },
    { value: 'serbest', label: 'Serbest Fonlar' },
    { value: 'yabanci', label: 'Yabancı Fonlar' },
    { value: 'diger', label: 'Diğer Fonlar' }
] as const;