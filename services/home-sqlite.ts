import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { MarketplaceCardData, EventCardData, ServiceCardData } from '@/types/explore';
import { getEvents } from '@/services/events-api';
import { getProductAds } from '@/services/marketplace-api';
import { getNews, type NewsItem } from '@/services/news-api';
import { getPartnerOffers, type PartnerOffer } from '@/services/partner-offers-api';
import { getServiceRequests } from '@/services/service-requests-api';

export type HomeData = {
  news: NewsItem[];
  services: ServiceCardData[];
  ads: MarketplaceCardData[];
  offers: PartnerOffer[];
  events: EventCardData[];
  updatedAt: string | null;
};

export type HomeSyncResult = {
  data: HomeData;
  didRefreshFromApi: boolean;
  apiFailed: boolean;
};

type HomeCacheRow = {
  key: keyof Omit<HomeData, 'updatedAt'>;
  value: string;
  updated_at: string;
};

const DATABASE_NAME = 'kolshe-home.db';
const TABLE_NAME = 'home_api_cache';

const emptyHomeData: HomeData = {
  news: [],
  services: [],
  ads: [],
  offers: [],
  events: [],
  updatedAt: null,
};

async function openHomeDatabase() {
  // Opens the local SQLite database. Expo creates the file automatically if needed.
  return SQLite.openDatabaseAsync(DATABASE_NAME);
}

async function createHomeCacheTable(db: SQLiteDatabase) {
  // One row per Home section. Each API response is saved as JSON text.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function parseCachedList<T>(value: string | null | undefined): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function saveHomeSection(
  db: SQLiteDatabase,
  key: HomeCacheRow['key'],
  value: HomeData[HomeCacheRow['key']],
) {
  // INSERT OR REPLACE keeps the latest API data for this section.
  await db.runAsync(
    `
      INSERT OR REPLACE INTO ${TABLE_NAME} (key, value, updated_at)
      VALUES (?, ?, ?);
    `,
    key,
    JSON.stringify(value),
    new Date().toISOString(),
  );
}

function mapRowsToHomeData(rows: HomeCacheRow[]): HomeData {
  const nextData: HomeData = { ...emptyHomeData };

  for (const row of rows) {
    if (row.key === 'news') {
      nextData.news = parseCachedList<NewsItem>(row.value);
    }

    if (row.key === 'services') {
      nextData.services = parseCachedList<ServiceCardData>(row.value);
    }

    if (row.key === 'ads') {
      nextData.ads = parseCachedList<MarketplaceCardData>(row.value);
    }

    if (row.key === 'offers') {
      nextData.offers = parseCachedList<PartnerOffer>(row.value);
    }

    if (row.key === 'events') {
      nextData.events = parseCachedList<EventCardData>(row.value);
    }

    if (!nextData.updatedAt || row.updated_at > nextData.updatedAt) {
      nextData.updatedAt = row.updated_at;
    }
  }

  return nextData;
}

export async function getCachedHomeDataFromSQLite() {
  const db = await openHomeDatabase();

  await createHomeCacheTable(db);

  // Read all saved Home sections from SQLite so the UI can work offline.
  const rows = await db.getAllAsync<HomeCacheRow>(`
    SELECT key, value, updated_at
    FROM ${TABLE_NAME};
  `);

  return mapRowsToHomeData(rows);
}

export async function syncHomeDataFromApiToSQLite() {
  const db = await openHomeDatabase();

  await createHomeCacheTable(db);

  const errors: unknown[] = [];

  // Each API section is saved separately, so one failed request does not erase old cached data.
  try {
    await saveHomeSection(db, 'news', await getNews());
  } catch (error) {
    errors.push(error);
  }

  try {
    await saveHomeSection(db, 'services', await getServiceRequests());
  } catch (error) {
    errors.push(error);
  }

  try {
    await saveHomeSection(db, 'ads', await getProductAds());
  } catch (error) {
    errors.push(error);
  }

  try {
    await saveHomeSection(db, 'offers', await getPartnerOffers());
  } catch (error) {
    errors.push(error);
  }

  try {
    await saveHomeSection(db, 'events', await getEvents());
  } catch (error) {
    errors.push(error);
  }

  return {
    data: await getCachedHomeDataFromSQLite(),
    didRefreshFromApi: errors.length < 5,
    apiFailed: errors.length > 0,
  } satisfies HomeSyncResult;
}
