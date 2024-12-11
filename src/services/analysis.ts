import { getDB } from './db';
import type { YearlyIncreaseType } from '../types/api';

export interface AnalysisRecord {
    id?: number;
    date: string;
    fund: {
        code: string;
        title: string;
        management_company_id: string;
        management_company_title: string;
        management_company_logo?: string;
    };
    parameters: {
        initialInvestment: number;
        monthlyInvestment: number;
        yearlyIncrease: {
            type: YearlyIncreaseType;
            value: number;
        };
        startDate: string;
    };
    summary: {
        totalInvestment: number;
        totalYield: number;
        currentValue: number;
        totalYieldPercentage: number;
    };
}

const STORE_NAME = 'analysis';

export const getAnalyses = async (): Promise<AnalysisRecord[]> => {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NAME, 'date');
};

export const deleteAnalysis = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
};

const isSameAnalysis = (a: AnalysisRecord, b: Omit<AnalysisRecord, 'id' | 'date'>) => {
    return a.fund.code === b.fund.code &&
        a.parameters.startDate === b.parameters.startDate &&
        a.parameters.initialInvestment === b.parameters.initialInvestment &&
        a.parameters.monthlyInvestment === b.parameters.monthlyInvestment &&
        a.parameters.yearlyIncrease.type === b.parameters.yearlyIncrease.type &&
        a.parameters.yearlyIncrease.value === b.parameters.yearlyIncrease.value;
};

const isInSameTimeSlot = (date1: Date, date2: Date) => {
    const hour1 = date1.getHours();
    const hour2 = date2.getHours();
    return (hour1 < 18 && hour2 < 18) || (hour1 >= 18 && hour2 >= 18);
};

export const saveAnalysis = async (analysis: Omit<AnalysisRecord, 'id' | 'date'>): Promise<void> => {
    const now = new Date();
    const db = await getDB();
    const existingAnalyses = await db.getAllFromIndex(STORE_NAME, 'date');
    
    // Aynı parametrelerle yapılmış analizleri bul
    const sameAnalyses = existingAnalyses.filter(existing => isSameAnalysis(existing, analysis));
    
    if (sameAnalyses.length > 0) {
        // Aynı zaman diliminde kayıt var mı kontrol et
        const sameTimeSlotAnalysis = sameAnalyses.find(existing => 
            isInSameTimeSlot(new Date(existing.date), now)
        );
        
        if (sameTimeSlotAnalysis) {
            // Aynı zaman diliminde kayıt varsa yeni kayıt yapma
            return;
        }
    }
    
    // Yeni kayıt yap
    const newRecord: AnalysisRecord = {
        ...analysis,
        date: now.toISOString()
    };
    await db.put(STORE_NAME, newRecord);
};
