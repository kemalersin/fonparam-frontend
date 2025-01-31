import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

interface UseUrlSortOptions<T> {
    defaultSort: T;
    defaultOrder?: 'ASC' | 'DESC';
    defaultSearch?: string;
    defaultType?: string;
    defaultPage?: number;
    defaultMinFunds?: string;
    defaultCompany?: string;
    defaultMinRiskValue?: number;
    defaultMaxRiskValue?: number;
    defaultTefas?: boolean;
}

export function useUrlSort<T extends string>({
    defaultSort,
    defaultOrder = 'ASC',
    defaultSearch = '',
    defaultType = '',
    defaultPage = 1,
    defaultMinFunds = '',
    defaultCompany = '',
    defaultMinRiskValue,
    defaultMaxRiskValue,
    defaultTefas
}: UseUrlSortOptions<T>) {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || defaultSearch;
    const sort = (searchParams.get('sort') as T) || defaultSort;
    const order = (searchParams.get('order') as 'ASC' | 'DESC') || defaultOrder;
    const type = searchParams.get('type') || defaultType;
    const page = Number(searchParams.get('page')) || defaultPage;
    const minFunds = searchParams.get('minFunds') || defaultMinFunds;
    const company = searchParams.get('company') || defaultCompany;
    const minRiskValue = searchParams.get('min_risk_value') ? Number(searchParams.get('min_risk_value')) : defaultMinRiskValue;
    const maxRiskValue = searchParams.get('max_risk_value') ? Number(searchParams.get('max_risk_value')) : defaultMaxRiskValue;
    const tefas = searchParams.get('tefas') ? searchParams.get('tefas') === 'true' : defaultTefas;

    const setSearch = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [setSearchParams]);

    const setType = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('type', value);
        } else {
            newParams.delete('type');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [setSearchParams]);

    const setMinFunds = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('minFunds', value);
        } else {
            newParams.delete('minFunds');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    };

    const setPage = useCallback((value: number) => {
        const newParams = new URLSearchParams(searchParams);
        if (value !== 1) {
            newParams.set('page', value.toString());
        } else {
            newParams.delete('page');
        }
        setSearchParams(newParams);
    }, [setSearchParams]);

    const handleSort = useCallback((field: T) => {
        const newParams = new URLSearchParams(searchParams);
        if (field === sort) {
            newParams.set('order', order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            newParams.set('sort', field);
            newParams.set('order', 'ASC');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [setSearchParams]);

    const setCompany = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('company', value);
        } else {
            newParams.delete('company');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [setSearchParams]);

    const setRiskRange = useCallback((min?: number, max?: number) => {
        const newParams = new URLSearchParams(searchParams);
        if (min !== undefined) {
            newParams.set('min_risk_value', min.toString());
        } else {
            newParams.delete('min_risk_value');
        }
        if (max !== undefined) {
            newParams.set('max_risk_value', max.toString());
        } else {
            newParams.delete('max_risk_value');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [setSearchParams]);

    const setTefas = useCallback((value?: boolean) => {
        const newParams = new URLSearchParams(searchParams);
        if (value !== undefined) {
            newParams.set('tefas', value.toString());
        } else {
            newParams.delete('tefas');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    }, [setSearchParams]);

    return {
        search,
        setSearch,
        sort,
        order,
        handleSort,
        type,
        setType,
        page,
        setPage,
        minFunds,
        setMinFunds,
        company,
        setCompany,
        minRiskValue,
        maxRiskValue,
        setRiskRange,
        tefas,
        setTefas
    };
} 