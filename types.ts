
export enum ShopType {
  STATIONERY = 'STATIONERY',
  GENERAL_STORE = 'GENERAL_STORE',
}

export enum UnitType {
  UNIT = 'UNIT',
  KG = 'KG',
}

export enum PaymentMode {
  CASH = 'CASH',
  DIGITAL = 'DIGITAL',
}

export interface Product {
  id: string;
  shopType: ShopType;
  name: string;
  category: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  unitType: UnitType;
  stock: number;
  lowStockThreshold: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number; // For KG this can be 0.25, etc.
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  shopType: ShopType;
  timestamp: number;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMode: PaymentMode;
  totalProfit: number;
}

export interface StockHistory {
  id: string;
  productId: string;
  type: 'ADD' | 'SALE' | 'ADJUST';
  quantity: number;
  timestamp: number;
}

export interface AppState {
  products: Product[];
  sales: Sale[];
  currentShop: ShopType | 'COMBINED';
}
