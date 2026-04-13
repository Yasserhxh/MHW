export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  isFavorite: boolean;
  latestPrice: number | null;
  cheapestRecentPrice: number | null;
  lastUpdated: string | null;
}

export interface PriceEntry {
  id: string;
  productId: string;
  productName: string;
  price: number;
  currency: string;
  storeName: string;
  recordedAt: string;
  notes?: string;
}

export interface GroceryPriceListItem extends PriceEntry {
  productName: string;
  storeName: string;
  unit: string;
  date: string;
  isFavorite: boolean;
}

export interface AddPriceRequest {
  productId?: string;
  productName: string;
  productCategory?: string;
  productUnit?: string;
  price: number;
  currency: string;
  storeName: string;
  notes?: string;
  date?: string;
}
