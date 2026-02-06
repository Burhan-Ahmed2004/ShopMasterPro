
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, 
  BookOpen, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Settings, 
  Plus, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import { ShopType, Product, Sale, AppState } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Reports from './components/Reports';
import CombinedDashboard from './components/CombinedDashboard';

const App: React.FC = () => {
  const [currentShop, setCurrentShop] = useState<ShopType | 'COMBINED' | null>(null);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'SALES' | 'REPORTS'>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [preSelectedProductId, setPreSelectedProductId] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const savedProducts = localStorage.getItem('shop_products');
    const savedSales = localStorage.getItem('shop_sales');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
    }

    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('shop_products', JSON.stringify(products));
    }
    localStorage.setItem('shop_sales', JSON.stringify(sales));
  }, [products, sales]);

  const handleAddSale = (newSale: Sale): boolean => {
    // 1. Authoritative Stock Validation
    for (const item of newSale.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        alert(
          `Sale failed: Insufficient stock for ${item.productName}. ` +
          `Available: ${product?.stock || 0}, Requested: ${item.quantity}.`
        );
        console.error("Sale aborted due to insufficient stock.", {
          productId: item.productId,
          requested: item.quantity,
          available: product?.stock,
        });
        return false; // Abort transaction
      }
    }

    // 2. Update Sales History (if validation passes)
    setSales(prev => [newSale, ...prev]);

    // 3. Reduce Stock in Products State
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        const saleItem = newSale.items.find(item => item.productId === product.id);
        if (saleItem) {
          const newStock = product.stock - saleItem.quantity;
          return { ...product, stock: newStock };
        }
        return product;
      });
      return updatedProducts;
    });

    return true; // Signal success
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const goToSales = (productId?: string) => {
    if (productId) setPreSelectedProductId(productId);
    setActiveTab('SALES');
  };

  const shopTheme = useMemo(() => {
    if (currentShop === ShopType.STATIONERY) return 'blue';
    if (currentShop === ShopType.GENERAL_STORE) return 'emerald';
    return 'indigo';
  }, [currentShop]);

  if (currentShop === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 text-center mb-4">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">ShopMaster Pro</h1>
            <p className="text-slate-500">Select a business module to get started</p>
          </div>
          
          <button 
            onClick={() => setCurrentShop(ShopType.STATIONERY)}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <BookOpen size={120} className="text-blue-600" />
            </div>
            <div className="relative z-10 text-left">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Stationery Shop</h2>
              <p className="text-slate-500 mt-2">Manage pens, registers, and quantity-based items.</p>
              <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm">
                Enter Shop <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setCurrentShop(ShopType.GENERAL_STORE)}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Store size={120} className="text-emerald-600" />
            </div>
            <div className="relative z-10 text-left">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Store size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">General Store</h2>
              <p className="text-slate-500 mt-2">Manage groceries with weight-based (KG) calculations.</p>
              <div className="mt-6 flex items-center text-emerald-600 font-semibold text-sm">
                Enter Shop <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setCurrentShop('COMBINED')}
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <BarChart3 size={120} className="text-indigo-600" />
            </div>
            <div className="relative z-10 text-left">
              <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart3 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Combined View</h2>
              <p className="text-slate-500 mt-2">View analytics across both shops in one dashboard.</p>
              <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm">
                View Reports <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (currentShop === 'COMBINED') return <CombinedDashboard products={products} sales={sales} />;

    switch (activeTab) {
      case 'DASHBOARD':
        return <Dashboard 
          shopType={currentShop} 
          products={products} 
          sales={sales} 
          onNewSale={() => setActiveTab('SALES')} 
        />;
      case 'INVENTORY':
        return <Inventory 
          shopType={currentShop} 
          products={products.filter(p => p.shopType === currentShop)} 
          onAdd={handleAddProduct}
          onUpdate={handleUpdateProduct}
          onSell={goToSales}
        />;
      case 'SALES':
        return <Sales 
          shopType={currentShop} 
          products={products.filter(p => p.shopType === currentShop)} 
          onSale={handleAddSale}
          initialProductId={preSelectedProductId}
          onClearInitial={() => setPreSelectedProductId(null)}
        />;
      case 'REPORTS':
        return <Reports shopType={currentShop} sales={sales.filter(s => s.shopType === currentShop)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col`}>
        <div className="p-6 flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentShop(null)}>
          <div className={`p-2 bg-${shopTheme}-600 rounded-lg text-white`}>
            {currentShop === ShopType.STATIONERY ? <BookOpen size={24} /> : (currentShop === ShopType.GENERAL_STORE ? <Store size={24} /> : <BarChart3 size={24} />)}
          </div>
          <span className="font-bold text-xl hidden md:block">ShopMaster</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'DASHBOARD', icon: BarChart3, label: 'Dashboard' },
            ...(currentShop !== 'COMBINED' ? [
              { id: 'INVENTORY', icon: Package, label: 'Inventory' },
              { id: 'SALES', icon: ShoppingCart, label: 'Point of Sale' },
            ] : []),
            { id: 'REPORTS', icon: ClipboardList, label: 'Reports' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? `bg-${shopTheme}-50 text-${shopTheme}-600 font-semibold` 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setCurrentShop(null)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <Settings size={20} />
            <span className="hidden md:block">Switch Shop</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              {currentShop === 'COMBINED' ? 'Global Overview' : currentShop.replace('_', ' ')}
            </h2>
            <h1 className="text-2xl font-bold text-slate-800">{activeTab}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
             {currentShop !== 'COMBINED' && currentShop !== null && (
               <button 
                onClick={() => setActiveTab('SALES')}
                className={`hidden md:flex items-center space-x-2 bg-${shopTheme}-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all font-semibold`}
               >
                 <PlusCircle size={18} />
                 <span>Add Sale</span>
               </button>
             )}
             <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <div className="w-6 h-6 rounded-full bg-slate-300" />
                <span className="text-sm font-medium text-slate-600 hidden md:block">Admin</span>
             </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
