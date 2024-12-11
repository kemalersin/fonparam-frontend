import { getDB } from './db';

export interface RecentlyViewedFund {
    id?: number;
    code: string;
    title: string;
    management_company_id: string;
    management_company_title: string;
    management_company_logo?: string;
    viewed_at: string;
}

const STORE_NAME = 'recently_viewed';
const MAX_ITEMS = 10;

export const addToRecentlyViewed = async (fund: Omit<RecentlyViewedFund, 'id' | 'viewed_at'>): Promise<void> => {
    const db = await getDB();
    const existingItems = await db.getAllFromIndex(STORE_NAME, 'code', fund.code);
    
    // Aynı fon varsa sil
    for (const item of existingItems) {
        await db.delete(STORE_NAME, item.id);
    }
    
    // Yeni kaydı ekle
    const newRecord: Omit<RecentlyViewedFund, 'id'> = {
        ...fund,
        viewed_at: new Date().toISOString()
    };
    await db.add(STORE_NAME, newRecord);
    
    // Maksimum sayıyı aşıyorsa en eski kayıtları sil
    const allItems = await db.getAllFromIndex(STORE_NAME, 'viewed_at');
    if (allItems.length > MAX_ITEMS) {
        const itemsToDelete = allItems
            .sort((a, b) => new Date(a.viewed_at).getTime() - new Date(b.viewed_at).getTime())
            .slice(0, allItems.length - MAX_ITEMS);
            
        for (const item of itemsToDelete) {
            await db.delete(STORE_NAME, item.id);
        }
    }
};

export const getRecentlyViewed = async (): Promise<RecentlyViewedFund[]> => {
    const db = await getDB();
    const items = await db.getAllFromIndex(STORE_NAME, 'viewed_at');
    return items.sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime());
}; 