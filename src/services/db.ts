import { openDB, IDBPDatabase } from 'idb';

export const DB_NAME = 'fonparam';
export const DB_VERSION = 5;

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
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
                if (!db.objectStoreNames.contains('analyses')) {
                    const store = db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('date', 'date');
                    store.createIndex('fund_code', 'fund.code');
                }

                // Recently viewed store
                if (!db.objectStoreNames.contains('recently_viewed')) {
                    const store = db.createObjectStore('recently_viewed', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('viewed_at', 'viewed_at');
                    store.createIndex('code', 'code');
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

// Veri aktarım tipleri
export interface ExportData {
    version: number;
    timestamp: number;
    stores: {
        [key: string]: any[];
    };
}

// Tüm veritabanını dışa aktar
export async function exportDatabase(): Promise<ExportData> {
    const db = await getDB();
    const stores = db.objectStoreNames;
    const data: ExportData = {
        version: DB_VERSION,
        timestamp: Date.now(),
        stores: {}
    };

    for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        data.stores[storeName] = await store.getAll();
    }

    return data;
}

// Store'un boş olup olmadığını kontrol et
export async function isStoreEmpty(storeName: string): Promise<boolean> {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const count = await store.count();
    return count === 0;
}

// Belirli bir store'u dışa aktar (sadece boş değilse)
export async function exportStoreIfNotEmpty(storeName: string): Promise<ExportData | null> {
    if (await isStoreEmpty(storeName)) {
        return null;
    }

    const db = await getDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    return {
        version: DB_VERSION,
        timestamp: Date.now(),
        stores: {
            [storeName]: await store.getAll()
        }
    };
}

// Veri dosyasını doğrula
export function validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || typeof data.version !== 'number') return false;
    if (!data.timestamp || typeof data.timestamp !== 'number') return false;
    if (!data.stores || typeof data.stores !== 'object') return false;
    
    // Store'ların varlığını kontrol et
    for (const storeName in data.stores) {
        if (!Array.isArray(data.stores[storeName])) return false;
    }

    return true;
}

// Tüm veritabanını içe aktar
export async function importDatabase(data: ExportData): Promise<void> {
    if (!validateImportData(data)) {
        throw new Error('Geçersiz veri formatı');
    }

    const db = await getDB();
    
    for (const storeName in data.stores) {
        if (!db.objectStoreNames.contains(storeName)) {
            console.warn(`${storeName} store'u mevcut değil, atlanıyor`);
            continue;
        }

        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        // Mevcut verileri temizle
        await store.clear();
        
        // Yeni verileri ekle
        for (const item of data.stores[storeName]) {
            await store.add(item);
        }
    }
}

// Belirli bir store'u içe aktar
export async function importStore(storeName: string, data: ExportData): Promise<void> {
    if (!validateImportData(data) || !data.stores[storeName]) {
        throw new Error('Geçersiz veri formatı');
    }

    const db = await getDB();
    if (!db.objectStoreNames.contains(storeName)) {
        throw new Error(`${storeName} store'u mevcut değil`);
    }

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Mevcut verileri temizle
    await store.clear();
    
    // Yeni verileri ekle
    for (const item of data.stores[storeName]) {
        await store.add(item);
    }
}