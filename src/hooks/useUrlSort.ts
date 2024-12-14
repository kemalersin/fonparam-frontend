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
    defaultOrder = 'DESC',
    defaultSearch = '',
    defaultType = '',
    defaultPage = 1,
    defaultMinFunds = ''
}: UseUrlSortOptions<T>) {
    const [searchParams, setSearchParams] = useSearchParams();

    // State'leri URL'den başlat
    const [search, setSearchState] = useState(searchParams.get('search') ?? defaultSearch);
    const [min_total_funds, setMinFundsState] = useState(searchParams.get('min_total_funds') ?? defaultMinFunds);
    const [sort, setSortState] = useState<T>((searchParams.get('sort') as T) ?? defaultSort);
    const [order, setOrderState] = useState<'ASC' | 'DESC'>((searchParams.get('order') as 'ASC' | 'DESC') ?? defaultOrder);
    const [type, setTypeState] = useState(searchParams.get('type') ?? defaultType);
    const [page, setPageState] = useState(() => {
        const pageFromUrl = searchParams.get('page');
        return pageFromUrl ? Math.max(1, parseInt(pageFromUrl, 10)) : defaultPage;
    });

    // URL parametreleri değiştiğinde state'leri güncelle
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        const minFundsFromUrl = searchParams.get('min_total_funds');
        const sortFromUrl = searchParams.get('sort');
        const orderFromUrl = searchParams.get('order');
        const typeFromUrl = searchParams.get('type');
        const pageFromUrl = searchParams.get('page');

        setSearchState(searchFromUrl ?? defaultSearch);
        setMinFundsState(minFundsFromUrl ?? defaultMinFunds);
        setSortState((sortFromUrl as T) ?? defaultSort);
        setOrderState((orderFromUrl as 'ASC' | 'DESC') ?? defaultOrder);
        setTypeState(typeFromUrl ?? defaultType);
        setPageState(pageFromUrl ? Math.max(1, parseInt(pageFromUrl, 10)) : defaultPage);
    }, [searchParams]);

    // State değişikliklerini URL'e yansıt
    useEffect(() => {
        const params = new URLSearchParams();

        if (search !== defaultSearch) params.set('search', search);
        if (sort !== defaultSort) params.set('sort', sort);
        if (order !== defaultOrder) params.set('order', order);
        if (type !== defaultType) params.set('type', type);
        if (min_total_funds !== defaultMinFunds) params.set('min_total_funds', min_total_funds);
        if (page !== defaultPage) params.set('page', page.toString());

        setSearchParams(params);
    }, [search, sort, order, type, min_total_funds, page]);

    const setSearch = (value: string) => {
        setSearchState(value);
        setPageState(1);
    };

    const setMinFunds = (value: string) => {
        setMinFundsState(value);
        setPageState(1);
    };


    const setSort = (value: T) => {
        setSortState(value);
    };

    const setOrder = (value: 'ASC' | 'DESC') => {
        setOrderState(value);
    };

    const setType = (value: string) => {
        setTypeState(value);
        setPageState(1);
    };

    const setPage = (value: number) => {
        setPageState(Math.max(1, value));
    };

    const handleSort = (field: T) => {
        const newOrder = sort === field ? (order === 'ASC' ? 'DESC' : 'ASC') : 'ASC';
        setSortState(field);
        setOrderState(newOrder);
        setPageState(1);
    };

    return {
        search,
        setSearch,
        min_total_funds,
        setMinFunds,
        sort,
        setSort,
        order,
        setOrder,
        type,
        setType,
        page,
        setPage,
        handleSort
    };
} 