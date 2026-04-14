export interface GroceryProductListItem {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  isFavorite: boolean;
  latestPrice: number | null;
  latestCurrency: string | null;
  cheapestRecentPrice: number | null;
  lastUpdated: string | null;
  latestStoreName?: string;
}

export interface GroceryPriceHistoryEntry {
  id: string;
  price: number;
  currency: string;
  storeName?: string;
  recordedAt: string;
}

export interface GroceryProductDetail {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  isFavorite: boolean;
  latestPrice: number | null;
  latestCurrency: string | null;
  cheapestRecentPrice: number | null;
  lastUpdated: string | null;
  history: GroceryPriceHistoryEntry[];
}

export interface GroceryFilters {
  search?: string;
  category?: string;
  favoritesOnly?: boolean;
}

export interface AddPriceRequest {
  productId?: string;
  productName: string;
  productCategory?: string;
  productUnit?: string;
  price: number;
  currency: string;
  storeName?: string;
  notes?: string;
  date?: string;
}
