import { openDB, IDBPDatabase } from 'idb';

export interface FavoriteFund {
    code: string;
    title: string;
    type: string;
    management_company_id: string;
    management_company_title: string;
    management_company_logo?: string;
    added_at: Date;
}

const DB_NAME = 'fonparam';
const STORE_NAME = 'favorites';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion) {
                // Eğer favorites store yoksa oluştur
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'code' });
                    // Ekleme tarihine göre indeks
                    store.createIndex('added_at', 'added_at');
                    // Şirket ID'sine göre indeks
                    store.createIndex('management_company_id', 'management_company_id');
                }
            },
            blocked() {
                console.warn('Veritabanı güncellemesi engellendi. Lütfen tüm sekmeleri kapatıp tekrar deneyin.');
            },
            blocking() {
                console.warn('Bu sekme veritabanı güncellemesini engelliyor.');
            },
            terminated() {
                console.error('Veritabanı bağlantısı beklenmedik şekilde sonlandı.');
                dbPromise = null;
            }
        });
    }
    return dbPromise;
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