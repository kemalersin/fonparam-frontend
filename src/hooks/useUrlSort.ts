import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseUrlSortOptions<T> {
    defaultSort: T;
    defaultOrder?: 'ASC' | 'DESC';
    defaultSearch?: string;
    defaultType?: string;
    defaultPage?: number;
    defaultMinFunds?: string;
}

export function useUrlSort<T extends string>({
    defaultSort,
    defaultOrder = 'ASC',
    defaultSearch = '',
    defaultType = '',
    defaultPage = 1,
    defaultMinFunds = ''
}: UseUrlSortOptions<T>) {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || defaultSearch;
    const sort = (searchParams.get('sort') as T) || defaultSort;
    const order = (searchParams.get('order') as 'ASC' | 'DESC') || defaultOrder;
    const type = searchParams.get('type') || defaultType;
    const page = Number(searchParams.get('page')) || defaultPage;
    const minFunds = searchParams.get('minFunds') || defaultMinFunds;

    const setSearch = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    };

    const setType = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('type', value);
        } else {
            newParams.delete('type');
        }
        newParams.delete('page');
        setSearchParams(newParams);
    };

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

    const setPage = (value: number) => {
        const newParams = new URLSearchParams(searchParams);
        if (value !== 1) {
            newParams.set('page', value.toString());
        } else {
            newParams.delete('page');
        }
        setSearchParams(newParams);
    };

    const handleSort = (field: T) => {
        const newParams = new URLSearchParams(searchParams);
        if (field === sort) {
            newParams.set('order', order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            newParams.set('sort', field);
            newParams.set('order', 'ASC');
        }
        setSearchParams(newParams);
    };

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
        setMinFunds
    };
} 