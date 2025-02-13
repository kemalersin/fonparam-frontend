export const formatPercent = (value: number | null | undefined): string => {
    if (value == null) return '-';
    return `%${value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const formatCompactNumber = (value: number): string => {
    const trillion = 1_000_000_000_000;
    const billion = 1_000_000_000;
    const million = 1_000_000;
    const thousand = 1_000;

    if (value >= trillion) {
        const truncated = Math.floor((value / trillion) * 10) / 10;
        return `+${truncated.toLocaleString('tr-TR')}T`;
    } else if (value >= billion) {
        const truncated = Math.floor((value / billion) * 10) / 10;
        return `+${truncated.toLocaleString('tr-TR')}B`;
    } else if (value >= million) {
        const truncated = Math.floor((value / million) * 10) / 10;
        return `+${truncated.toLocaleString('tr-TR')}M`;
    } else if (value >= thousand) {
        const truncated = Math.floor((value / thousand) * 10) / 10;
        return `+${truncated.toLocaleString('tr-TR')}K`;
    }
    return value.toLocaleString('tr-TR');
};

export const formatNumber = (value: number | null | undefined): string => {
    if (value == null) return '-';
    return value.toLocaleString('tr-TR');
};

export const formatCurrency = (value: number | null | undefined, maxFractionDigits?: number): string => {
    if (value == null) return '-';
    return value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: maxFractionDigits !== undefined ? Math.min(Math.max(maxFractionDigits, 0), 20) : 2,
        style: 'currency',
        currency: 'TRY'
    });
};

export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatShares = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    
    let result: number;
    let suffix: string;
    
    if (value >= 1_000_000_000) {
        result = value / 1_000_000_000;
        suffix = ' milyar';
    } else if (value >= 1_000_000) {
        result = value / 1_000_000;
        suffix = ' milyon';
    } else if (value >= 1_000) {
        result = value / 1_000;
        suffix = ' bin';
    } else {
        return value.toLocaleString('tr-TR');
    }
    
    // Ondalık kısım 0 ise tam sayı olarak göster
    return (result % 1 === 0 ? Math.floor(result) : result.toLocaleString('tr-TR', { 
        minimumFractionDigits: 1,
        maximumFractionDigits: 1 
    })) + suffix;
};
