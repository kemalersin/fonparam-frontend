export interface FundManagementCompany {
    code: string;
    title: string;
    logo?: string;
}

export interface CompanyListItem extends FundManagementCompany {
    total_funds: number;
    avg_yield_1m?: number;
    avg_yield_6m?: number;
    avg_yield_ytd?: number;
    avg_yield_1y?: number;
    avg_yield_3y?: number;
    avg_yield_5y?: number;
}

export interface CompanyStatistics {
    total_funds: number;
    avg_yield_1m?: number;
    avg_yield_6m?: number;
    avg_yield_ytd?: number;
    avg_yield_1y?: number;
    avg_yield_3y?: number;
    avg_yield_5y?: number;
    best_performing_funds?: FundYield[];
}

export interface FundYield {
    code: string;
    management_company_id: string;
    title: string;
    type: 'Hisse Senedi' | 'Borçlanma Araçları' | 'Karma' | 'Para Piyasası' | 'Altın' | 'Serbest' | 'Diğer';
    tefas?: boolean;
    yield_1m?: number;
    yield_3m?: number;
    yield_6m?: number;
    yield_ytd?: number;
    yield_1y?: number;
    yield_3y?: number;
    yield_5y?: number;
    management_company?: FundManagementCompany;
}

export interface FundHistoricalValue {
    code: string;
    date: string;
    value: number;
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    data: T[];
}

export interface CompanyDetails {
    company: FundManagementCompany;
    stats: CompanyStatistics;
    funds?: FundYield[];
}

export interface FundAnalysis {
    code: string;
    management_company_id: string;
    title: string;
    summary: {
        totalInvestment: number;
        currentValue: number;
        totalYield: number;
        totalYieldPercentage: number;
    };
    monthlyDetails?: {
        date: string;
        investment: number;
        totalInvestment: number;
        unitPrice: number;
        units: number;
        totalUnits: number;
        value: number;
        monthlyChange: number;
        monthlyChangePercentage: number;
        totalYield: number;
        totalYieldPercentage: number;
    }[];
}

export type YearlyIncreaseType = 'percentage' | 'amount';

export interface AnalysisParams {
    startDate: string;
    initialInvestment: number;
    monthlyInvestment: number;
    yearlyIncrease: {
        type: YearlyIncreaseType;
        value: number;
    };
} 