export const formatPercent = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-';
    return `%${value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'TRY'
    });
};

export const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('tr-TR');
};

export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
