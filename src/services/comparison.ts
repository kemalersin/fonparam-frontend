import { getDB } from './db';

const STORE_NAME = 'comparison';

export interface ComparisonFund {
    code: string;
    title: string;
    management_company_id: string;
    management_company_title: string;
    management_company_logo?: string;
    added_at: Date;
}

export const addToComparison = async (fund: Omit<ComparisonFund, 'added_at'>): Promise<void> => {
    const db = await getDB();
    
    // Mevcut listeyi kontrol et
    const currentList = await db.getAllFromIndex(STORE_NAME, 'added_at');
    if (currentList.length >= 5) {
        throw new Error('Karşılaştırma listesine en fazla 5 fon eklenebilir.');
    }

    const comparisonFund: ComparisonFund = {
        ...fund,
        added_at: new Date()
    };
    await db.put(STORE_NAME, comparisonFund);
};

export const removeFromComparison = async (code: string): Promise<void> => {
    const db = await getDB();
    await db.delete(STORE_NAME, code);
};

export const getComparisonList = async (): Promise<ComparisonFund[]> => {
    const db = await getDB();
    const funds = await db.getAllFromIndex(STORE_NAME, 'added_at');
    return funds;
};

export const isInComparison = async (code: string): Promise<boolean> => {
    const db = await getDB();
    const fund = await db.get(STORE_NAME, code);
    return fund !== undefined;
}; 