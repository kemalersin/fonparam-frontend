import { useQuery } from '@tanstack/react-query';
import * as api from '../services/api';

// Portföy Yönetim Şirketleri
export const useCompanies = (params?: Parameters<typeof api.getCompanies>[0]) => {
    return useQuery({
        queryKey: ['companies', params],
        queryFn: () => api.getCompanies(params),
        staleTime: 5 * 60 * 1000, // 5 dakika
    });
};

export const useCompanyDetails = (code: string, includeFunds: boolean = true) => {
    return useQuery({
        queryKey: ['company', code, includeFunds],
        queryFn: () => api.getCompanyDetails(code, includeFunds),
        staleTime: 10 * 60 * 1000, // 10 dakika
        enabled: !!code,
    });
};

// Fonlar
export const useFunds = (params?: Parameters<typeof api.getFunds>[0]) => {
    return useQuery({
        queryKey: ['funds', params],
        queryFn: () => api.getFunds(params),
        staleTime: 5 * 60 * 1000, // 5 dakika
    });
};

export const useTopPerformingFunds = (funds?: string) => {
    return useQuery({
        queryKey: ['top-funds', funds],
        queryFn: () => api.getTopPerformingFunds(funds),
        staleTime: 5 * 60 * 1000, // 5 dakika
    });
};

export const useCompareFunds = (codes: string[]) => {
    return useQuery({
        queryKey: ['compare-funds', codes],
        queryFn: () => api.compareFunds(codes),
        staleTime: 5 * 60 * 1000, // 5 dakika
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
        staleTime: 30 * 60 * 1000, // 30 dakika
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
        staleTime: 30 * 60 * 1000, // 30 dakika
        enabled: !!code,
    });
};

export const useFundDetails = (code: string) => {
    return useQuery({
        queryKey: ['fund', code],
        queryFn: () => api.getFunds({ code }).then(response => response.data[0]),
        staleTime: 5 * 60 * 1000, // 5 dakika
        enabled: !!code,
    });
}; 