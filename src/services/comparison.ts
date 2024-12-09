import { openDB, IDBPDatabase } from 'idb';

export interface ComparisonFund {
    code: string;
    title: string;
    management_company_id: string;
    management_company_title: string;
    management_company_logo?: string;
    added_at: Date;
}

const DB_NAME = 'fonparam';
const STORE_NAME = 'comparison';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion) {
                if (!db.objectStoreNames.contains('favorites')) {
                    const favoritesStore = db.createObjectStore('favorites', { keyPath: 'code' });
                    favoritesStore.createIndex('added_at', 'added_at');
                    favoritesStore.createIndex('management_company_id', 'management_company_id');
                }
                
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const comparisonStore = db.createObjectStore(STORE_NAME, { keyPath: 'code' });
                    comparisonStore.createIndex('added_at', 'added_at');
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