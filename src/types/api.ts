export interface FundType {
    type: string;
    short_name: string;
    long_name: string;
    group_name: string;
}

export interface DailyStatistics {
    date: string;
    total_funds: number;
    total_companies: number;
    total_investors: number;
    total_aum: number;
    avg_profit: number;
    avg_loss: number;
}

export interface FundTypeDetails {
    type: string;
    short_name: string;
    long_name: string;
    group_name: string;
    yield_1d?: number;
    yield_1w?: number;
    yield_1m?: number;
    yield_3m?: number;
    yield_6m?: number;
    yield_ytd?: number;
    yield_1y?: number;
    yield_3y?: number;
    yield_5y?: number;
    total_funds: number;
    total_aum?: number;
}

export interface FundHistoricalValue {
    code?: string;
    value: number;
    aum: number;
    shares_active: number;
    cumulative_cashflow: number;
    date: string;
    investor_count: number;
}

export interface FundManagementCompany {
    code: string;
    title: string;
    logo?: string;
}

export interface CompanyListItem extends FundManagementCompany {
    total_funds: number;
    avg_yield_1d?: number;
    avg_yield_1m?: number;
    avg_yield_6m?: number;
    avg_yield_ytd?: number;
    avg_yield_1y?: number;
    avg_yield_3y?: number;
    avg_yield_5y?: number;
}

export interface CompanyDetails extends CompanyListItem {
    best_performing_funds?: Fund[];
    funds?: Fund[];
}

export interface Fund {
    code: string;
    title: string;
    type: string;
    tefas: boolean;
    yield_1d?: number;    
    yield_1w?: number;    
    yield_1m?: number;
    yield_3m?: number;
    yield_6m?: number;
    yield_ytd?: number;
    yield_1y?: number;
    yield_3y?: number;
    yield_5y?: number;
    management_company: FundManagementCompany;
    fund_type: FundType;
    last_historical_value: FundHistoricalValue;
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
    periodDetails?: {
        date: string;
        investment: number;
        totalInvestment: number;
        unitPrice: number;
        units: number;
        totalUnits: number;
        value: number;
        periodChange: number;
        periodChangePercentage: number;
        totalYield: number;
        totalYieldPercentage: number;
    }[];
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    data: T[];
}

export type YearlyIncreaseType = 'percentage' | 'amount';

export interface AnalysisParams {
    startDate: string;
    initialInvestment: number | null;
    monthlyInvestment: number | null;
    yearlyIncrease: {
        type: YearlyIncreaseType;
        value: number | null;
    };
} 