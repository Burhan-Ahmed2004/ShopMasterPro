
import { ShopType, UnitType, Product } from './types';

export const CATEGORIES = {
  [ShopType.STATIONERY]: ['Pen', 'Copy', 'Marker', 'Register', 'File', 'Eraser', 'Pencil'],
  [ShopType.GENERAL_STORE]: ['Grains', 'Dairy', 'Snacks', 'Beverages', 'Spices', 'Soap', 'Oil'],
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 's1',
    shopType: ShopType.STATIONERY,
    name: 'Blue Gel Pen',
    category: 'Pen',
    sku: 'PEN001',
    purchasePrice: 5,
    sellingPrice: 10,
    unitType: UnitType.UNIT,
    stock: 100,
    lowStockThreshold: 20,
  },
  {
    id: 's2',
    shopType: ShopType.STATIONERY,
    name: 'A4 Register 200pg',
    category: 'Register',
    sku: 'REG001',
    purchasePrice: 40,
    sellingPrice: 75,
    unitType: UnitType.UNIT,
    stock: 50,
    lowStockThreshold: 10,
  },
  {
    id: 'g1',
    shopType: ShopType.GENERAL_STORE,
    name: 'Basmati Rice',
    category: 'Grains',
    sku: 'RIC001',
    purchasePrice: 80,
    sellingPrice: 120,
    unitType: UnitType.KG,
    stock: 50,
    lowStockThreshold: 5,
  },
  {
    id: 'g2',
    shopType: ShopType.GENERAL_STORE,
    name: 'Milk Chocolate Bar',
    category: 'Snacks',
    sku: 'SNK001',
    purchasePrice: 15,
    sellingPrice: 20,
    unitType: UnitType.UNIT,
    stock: 30,
    lowStockThreshold: 5,
  }
];
