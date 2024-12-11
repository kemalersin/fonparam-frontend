import { openDB, IDBPDatabase } from 'idb';

export const DB_NAME = 'fonparam';
export const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion) {
                // Favorites store
                if (!db.objectStoreNames.contains('favorites')) {
                    const favoritesStore = db.createObjectStore('favorites', { keyPath: 'code' });
                    favoritesStore.createIndex('added_at', 'added_at');
                    favoritesStore.createIndex('management_company_id', 'management_company_id');
                }
                
                // Comparison store
                if (!db.objectStoreNames.contains('comparison')) {
                    const comparisonStore = db.createObjectStore('comparison', { keyPath: 'code' });
                    comparisonStore.createIndex('added_at', 'added_at');
                }
                
                // Analysis store
                if (!db.objectStoreNames.contains('analysis')) {
                    const store = db.createObjectStore('analysis', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('date', 'date');
                    store.createIndex('fund_code', 'fund.code');
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