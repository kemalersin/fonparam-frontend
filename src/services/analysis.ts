import { getDB } from './db';
import type { FundManagementCompany, YearlyIncreaseType } from '../types/api';

export interface AnalysisRecord {
    id?: number;
    date: string;
    fund: {
        code: string;
        title: string;
        management_company: FundManagementCompany;
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
    // Tarihleri yerel saat dilimine çevir
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Her iki tarih için de saat 18:00'i referans al
    const ref1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 18, 0, 0);
    const ref2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 18, 0, 0);

    // Eğer saat 18:00'den küçükse bir önceki günün 18:00'ini al
    const slot1 = d1.getHours() < 18 ? new Date(ref1.getTime() - 24 * 60 * 60 * 1000) : ref1;
    const slot2 = d2.getHours() < 18 ? new Date(ref2.getTime() - 24 * 60 * 60 * 1000) : ref2;

    // İki slot aynı ise aynı zaman diliminde demektir
    return slot1.getTime() === slot2.getTime();
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
