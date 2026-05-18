import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { EventCardData, MarketplaceCardData, ServiceCardData } from '@/types/explore';
import { getEvents } from '@/services/events-api';
import { getProductAds } from '@/services/marketplace-api';
import { getNews, type NewsItem } from '@/services/news-api';
import { getPartnerOffers, type PartnerOffer } from '@/services/partner-offers-api';
import { getServiceRequests } from '@/services/service-requests-api';

const DATABASE_NAME = 'kolshe-home.db';
const TABLE_NAME = 'home_api_cache';

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

type HomeSectionKey = Exclude<keyof HomeData, 'updatedAt'>;
type HomeSectionValue = HomeData[HomeSectionKey];

type HomeCacheRow = {
  key: string;
  value: string;
  updated_at: string;
};

const HOME_SECTIONS = [
  { key: 'news', fetch: getNews },
  { key: 'services', fetch: getServiceRequests },
  { key: 'ads', fetch: getProductAds },
  { key: 'offers', fetch: getPartnerOffers },
  { key: 'events', fetch: getEvents },
] as const satisfies readonly {
  key: HomeSectionKey;
  fetch: () => Promise<HomeSectionValue>;
}[];

async function getHomeDatabase() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

function parseCachedList<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function saveHomeSection(
  db: SQLiteDatabase,
  key: HomeSectionKey,
  value: HomeSectionValue,
) {
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
  const data: HomeData = {
    news: [],
    services: [],
    ads: [],
    offers: [],
    events: [],
    updatedAt: null,
  };

  for (const row of rows) {
    switch (row.key) {
      case 'news':
        data.news = parseCachedList<NewsItem>(row.value);
        break;
      case 'services':
        data.services = parseCachedList<ServiceCardData>(row.value);
        break;
      case 'ads':
        data.ads = parseCachedList<MarketplaceCardData>(row.value);
        break;
      case 'offers':
        data.offers = parseCachedList<PartnerOffer>(row.value);
        break;
      case 'events':
        data.events = parseCachedList<EventCardData>(row.value);
        break;
      default:
        continue;
    }

    if (!data.updatedAt || row.updated_at > data.updatedAt) {
      data.updatedAt = row.updated_at;
    }
  }

  return data;
}

async function readCachedHomeData(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<HomeCacheRow>(`
    SELECT key, value, updated_at
    FROM ${TABLE_NAME};
  `);

  return mapRowsToHomeData(rows);
}

export async function getCachedHomeDataFromSQLite() {
  const db = await getHomeDatabase();
  return readCachedHomeData(db);
}

export async function syncHomeDataFromApiToSQLite() {
  const db = await getHomeDatabase();
  let failedSectionCount = 0;

  for (const section of HOME_SECTIONS) {
    try {
      await saveHomeSection(db, section.key, await section.fetch());
    } catch {
      failedSectionCount += 1;
    }
  }

  return {
    data: await readCachedHomeData(db),
    didRefreshFromApi: failedSectionCount < HOME_SECTIONS.length,
    apiFailed: failedSectionCount > 0,
  } satisfies HomeSyncResult;
}
