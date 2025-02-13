import { useQuery } from '@tanstack/react-query';
import * as api from '../services/api';
import { STALE_TIME } from '../constants';
import { Fund, PaginatedResponse } from '../types/api';

// Portföy Yönetim Şirketleri
export const useCompanies = (params?: Parameters<typeof api.getCompanies>[0]) => {
    return useQuery({
        queryKey: ['companies', params],
        queryFn: () => api.getCompanies(params),
        staleTime: STALE_TIME,
    });
};

export const useCompanyDetails = (code: string, includeFunds: boolean = true) => {
    return useQuery({
        queryKey: ['company', code, includeFunds],
        queryFn: () => api.getCompanyDetails(code, includeFunds),
        staleTime: STALE_TIME,
        enabled: !!code,
    });
};

// Fonlar
interface GetFundsParams {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    code?: string;
    management_company?: string;
    tefas?: boolean;
    sort?: string;
    order?: 'ASC' | 'DESC';
    min_risk_value?: number;
    max_risk_value?: number;
}

export function useFunds(params: GetFundsParams = {}) {
    return useQuery<PaginatedResponse<Fund>>({
        queryKey: ['funds', params],
        queryFn: () => api.getFunds(params),
        staleTime: STALE_TIME,
        enabled: Object.keys(params).length > 0
    });
}

export const useTopPerformingFunds = (funds?: string) => {
    return useQuery({
        queryKey: ['top-funds', funds],
        queryFn: () => api.getTopPerformingFunds(funds),
        staleTime: STALE_TIME,
    });
};

export const useCompareFunds = (codes: string[]) => {
    return useQuery({
        queryKey: ['compare-funds', codes],
        queryFn: () => api.compareFunds(codes),
        staleTime: STALE_TIME,
        enabled: codes.length > 0,
    });
};

export const useAnalyzeFund = (
    code: string,
    params: Parameters<typeof api.analyzeFund>[1]
) => {
    return useQuery({
        queryKey: ['analyze-fund', code, params],
        queryFn: () => api.analyzeFund(code, params),
        staleTime: STALE_TIME,
        enabled: !!code && !!params.initialInvestment,
    });
};

export const useFundHistory = (
    code: string,
    params?: Parameters<typeof api.getFundHistory>[1]
) => {
    return useQuery({
        queryKey: ['fund-history', code, params],
        queryFn: () => api.getFundHistory(code, params),
        staleTime: STALE_TIME,
        enabled: !!code,
    });
};

export const useFundDetails = (code: string) => {
    return useQuery({
        queryKey: ['fund', code],
        queryFn: () => api.getFundDetails(code),
        staleTime: STALE_TIME,
        enabled: !!code,
    });
};

// İstatistik Hook'ları
export const useStatistics = (params?: Parameters<typeof api.getStatistics>[0]) => {
    return useQuery({
        queryKey: ['statistics', params],
        queryFn: () => api.getStatistics(params),
        staleTime: STALE_TIME,
    });
};

export const useLatestStatistics = () => {
    return useQuery({
        queryKey: ['statistics', 'latest'],
        queryFn: () => api.getLatestStatistics(),
        staleTime: STALE_TIME,
    });
};

export const useStatisticsByDate = (date: string) => {
    return useQuery({
        queryKey: ['statistics', date],
        queryFn: () => api.getStatisticsByDate(date),
        staleTime: STALE_TIME,
        enabled: !!date,
    });
};

// Fon Tipleri Hook'ları
export const useFundTypes = (params?: Parameters<typeof api.getFundTypes>[0]) => {
    return useQuery({
        queryKey: ['fund-types', params],
        queryFn: () => api.getFundTypes(params),
        staleTime: STALE_TIME,
    });
};

export const useFundTypeDetails = (type: string) => {
    return useQuery({
        queryKey: ['fund-type', type],
        queryFn: () => api.getFundTypeDetails(type),
        staleTime: STALE_TIME,
        enabled: !!type,
    });
};

export const useInflation = (startDate?: string) => {
    return useQuery({
        queryKey: ['inflation', startDate],
        queryFn: () => api.getInflation(startDate),
        staleTime: STALE_TIME
    });
}; 