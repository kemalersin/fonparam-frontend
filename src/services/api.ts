import axios from 'axios';
import type { 
    Fund,
    CompanyDetails, 
    FundHistoricalValue,
    FundAnalysis,
    PaginatedResponse,
    CompanyListItem,
    DailyStatistics,
    FundTypeDetails
} from '../types/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: {
        dots: true
    }
});

// Portföy Yönetim Şirketleri
export const getCompanies = async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
    search?: string;
    min_total_funds?: number;
}) => {
    const { data } = await api.get<PaginatedResponse<CompanyListItem>>('/companies', { params });
    return data;
};

export const getCompanyDetails = async (code: string, includeFunds: boolean = true) => {
    const { data } = await api.get<CompanyDetails>(`/companies/${code}`, {
        params: { include_funds: includeFunds }
    });
    return data;
};

// Fonlar
export const getFunds = async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    code?: string;
    management_company?: string;
    tefas?: boolean;
    sort?: string;
    order?: 'ASC' | 'DESC';
}) => {
    const { data } = await api.get<PaginatedResponse<Fund>>('/funds', { params });
    return data;
};

export const getTopPerformingFunds = async (funds?: string) => {
    const { data } = await api.get<Fund[]>('/funds/top-performing', {
        params: { funds }
    });
    return data;
};

export const compareFunds = async (codes: string[]) => {
    const { data } = await api.get<Fund[]>('/funds/compare', {
        params: { codes: codes.join(',') }
    });
    return data;
};

export const analyzeFund = async (
    code: string,
    params: {
        startDate: string;
        initialInvestment: number;
        monthlyInvestment?: number;
        yearlyIncrease?: {
            type: 'percentage' | 'amount';
            value: number;
        };
        includeMonthlyDetails?: boolean;
    }
) => {
    const { data } = await api.get<FundAnalysis>(`/funds/${code}/analyze`, { params });
    return data;
};

export const getFundHistory = async (
    code: string,
    params?: {
        start_date?: string;
        end_date?: string;
        interval?: 'daily' | 'weekly' | 'monthly';
        sort?: 'date' | 'value';
        order?: 'ASC' | 'DESC';
        limit?: number;
    }
) => {
    const { data } = await api.get<FundHistoricalValue[]>(`/funds/${code}/historical`, { params });
    return data;
};

export const getFundDetails = async (code: string) => {
    const { data } = await api.get<Fund>(`/funds/${code}`);
    return data;
};

// İstatistikler
export const getStatistics = async (params?: {
    start_date?: string;
    end_date?: string;
    sort?: 'date' | 'total_funds' | 'total_companies' | 'total_investors' | 'total_aum' | 'avg_profit' | 'avg_loss';
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}) => {
    const { data } = await api.get<PaginatedResponse<DailyStatistics>>('/statistics', { params });
    return data;
};

export const getLatestStatistics = async () => {
    const { data } = await api.get<DailyStatistics>('/statistics/latest');
    return data;
};

export const getStatisticsByDate = async (date: string) => {
    const { data } = await api.get<DailyStatistics>(`/statistics/${date}`);
    return data;
};

// Fon Tipleri
export const getFundTypes = async (params?: {
    sort?: 'type' | 'short_name' | 'long_name' | 'group_name';
    order?: 'ASC' | 'DESC';
    min_total_funds?: number;
    max_total_funds?: number;
}) => {
    const { data } = await api.get<FundTypeDetails[]>('/fund-types', { params });
    return data;
};

export const getFundTypeDetails = async (type: string) => {
    const { data } = await api.get<FundTypeDetails>(`/fund-types/${type}`);
    return data;
};
 