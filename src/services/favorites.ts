import { getDB } from './db';

const STORE_NAME = 'favorites';

export interface FavoriteFund {
    code: string;
    title: string;
    type: string;
    management_company_id: string;
    management_company_title: string;
    management_company_logo?: string;
    added_at: Date;
}

export const addFavorite = async (fund: Omit<FavoriteFund, 'added_at'>): Promise<void> => {
    const db = await getDB();
    const favorite: FavoriteFund = {
        ...fund,
        added_at: new Date()
    };
    await db.put(STORE_NAME, favorite);
};

export const removeFavorite = async (code: string): Promise<void> => {
    const db = await getDB();
    await db.delete(STORE_NAME, code);
};

export const getFavorites = async (): Promise<FavoriteFund[]> => {
    const db = await getDB();
    const favorites = await db.getAllFromIndex(STORE_NAME, 'added_at');
    return favorites;
};

export const isFavorite = async (code: string): Promise<boolean> => {
    const db = await getDB();
    const favorite = await db.get(STORE_NAME, code);
    return favorite !== undefined;
};

export const getFavoritesByCompany = async (companyId: string): Promise<FavoriteFund[]> => {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NAME, 'management_company_id', companyId);
}; 