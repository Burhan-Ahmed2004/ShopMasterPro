
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, User, CreditCard, Banknote, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Product, ShopType, UnitType, Sale, SaleItem, PaymentMode } from '../types';

interface SalesProps {
  shopType: ShopType;
  products: Product[];
  onSale: (s: Sale) => boolean; // Return boolean to indicate success/failure
  initialProductId?: string | null;
  onClearInitial?: () => void;
}

const Sales: React.FC<SalesProps> = ({ shopType, products, onSale, initialProductId, onClearInitial }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockWarning, setStockWarning] = useState<{ name: string; available: number; unit: string } | null>(null);

  // For weight-based input handling
  const [weightInput, setWeightInput] = useState<{ productId: string, value: string } | null>(null);

  // Handle shortcut from Inventory
  useEffect(() => {
    if (initialProductId) {
      const product = products.find(p => p.id === initialProductId);
      if (product) {
        addToCart(product);
      }
      onClearInitial?.();
    }
  }, [initialProductId]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products.slice(0, 12);
    return products.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, products]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setError(null);
    
    // Check if item is out of stock entirely
    if (product.stock <= 0) {
      setStockWarning({ name: product.name, available: 0, unit: product.unitType });
      return;
    }

    if (product.unitType === UnitType.KG) {
      setWeightInput({ productId: product.id, value: '' });
      return;
    }

    // Integer enforcement for UNIT types
    const addQty = Math.floor(quantity);

    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      const currentQtyInCart = (existing?.quantity || 0);
      
      // Stock check: total in cart + new add must not exceed stock
      if (currentQtyInCart + addQty > product.stock) {
        setStockWarning({ name: product.name, available: product.stock, unit: product.unitType });
        return prev;
      }

      if (existing) {
        return prev.map(i => i.productId === product.id 
          ? { ...i, quantity: i.quantity + addQty, subtotal: Number(((i.quantity + addQty) * i.unitPrice).toFixed(2)) } 
          : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: addQty,
        unitPrice: product.sellingPrice,
        subtotal: Number((product.sellingPrice * addQty).toFixed(2))
      }];
    });
    setSearchTerm('');
  };

  const handleWeightConfirm = (weight: number) => {
    setError(null);
    const product = products.find(p => p.id === weightInput?.productId);
    if (product && weight > 0) {
      // Stock check for decimals (KG)
      if (weight > product.stock) {
        setStockWarning({ name: product.name, available: product.stock, unit: product.unitType });
        setWeightInput(null);
        return;
      }

      setCart(prev => {
        const subtotal = weight * product.sellingPrice;
        return [...prev, {
          productId: product.id,
          productName: product.name,
          quantity: weight,
          unitPrice: product.sellingPrice,
          subtotal: Number(subtotal.toFixed(2))
        }];
      });
    }
    setWeightInput(null);
    setSearchTerm('');
  };

  const total = useMemo(() => cart.reduce((acc, i) => acc + i.subtotal, 0), [cart]);

  const handleCheckout = () => {
    setError(null);
    if (cart.length === 0) return;

    // Final inventory integrity verification
    for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (!product || item.quantity < 0 || item.quantity > product.stock) {
            setStockWarning({ 
              name: item.productName, 
              available: product?.stock || 0, 
              unit: product?.unitType || 'Units' 
            });
            return;
        }
    }

    const totalProfit = cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      const profitPerUnit = (product?.sellingPrice || 0) - (product?.purchasePrice || 0);
      return acc + (profitPerUnit * item.quantity);
    }, 0);

    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      shopType,
      timestamp: Date.now(),
      customerName: customer.name,
      customerPhone: customer.phone,
      items: cart,
      totalAmount: total,
      paymentMode,
      totalProfit
    };

    const saleProcessed = onSale(newSale);

    if (saleProcessed) {
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setShowCheckoutSuccess(true);
      setTimeout(() => setShowCheckoutSuccess(false), 3000);
    } else {
      setError("Sale could not be completed due to a stock issue. Please review the cart and try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      {/* Product Selection */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-800">Choose Items</h3>
            <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className={`p-4 bg-white border rounded-2xl transition-all text-left group flex flex-col justify-between h-full relative overflow-hidden ${p.stock > 0 ? 'border-slate-200 hover:border-blue-500 hover:shadow-md' : 'border-slate-100 bg-slate-50 cursor-not-allowed grayscale'}`}
              >
                {p.stock <= 0 && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded">OUT OF STOCK</div>
                )}
                <div>
                    <div className="font-bold text-slate-800 line-clamp-2 leading-tight">{p.name}</div>
                    <div className={`text-xs mt-1 font-medium ${p.stock <= p.lowStockThreshold && p.stock > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {p.stock > 0 ? `${p.stock.toFixed(p.unitType === UnitType.KG ? 2 : 0)} ${p.unitType} left` : 'None in stock'}
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-blue-600 font-black text-lg">Rs. {p.sellingPrice}</div>
                    {p.stock > 0 && (
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Plus size={16} />
                      </div>
                    )}
                </div>
              </button>
            ))}
          </div>
          {searchTerm && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                <Search size={48} className="mb-2 opacity-20" />
                <p className="text-lg">Product not found in this shop</p>
                <button onClick={() => setSearchTerm('')} className="mt-2 text-blue-600 font-bold">Show all products</button>
            </div>
          )}
        </div>

        {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700 font-bold animate-pulse">
                <AlertCircle />
                <span>{error}</span>
            </div>
        )}

        {/* Stock Warning Popup */}
        {stockWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                <XCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Insufficient Stock!</h3>
              <p className="text-slate-500 mb-6 px-4">
                You cannot sell more than available. <br/>
                <span className="font-bold text-slate-800 text-lg">"{stockWarning.name}"</span> <br/>
                Available: <span className="text-rose-600 font-black">{stockWarning.available} {stockWarning.unit}</span>
              </p>
              <button 
                onClick={() => setStockWarning(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Understood
              </button>
            </div>
          </div>
        )}

        {/* Weight Keypad */}
        {weightInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-sm p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Enter Weight (KG)</h3>
              <div className="bg-slate-100 p-6 rounded-2xl text-center text-4xl font-bold mb-6 text-slate-800">
                {weightInput.value || '0.00'} <span className="text-xl text-slate-400">KG</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map(k => (
                  <button 
                    key={k}
                    onClick={() => {
                      if (k === 'DEL') setWeightInput({ ...weightInput, value: weightInput.value.slice(0, -1) });
                      else if (k === '.' && weightInput.value.includes('.')) return;
                      else if (typeof k === 'number' && weightInput.value.split('.')[1]?.length >= 3) return;
                      else setWeightInput({ ...weightInput, value: weightInput.value + k });
                    }}
                    className="h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-bold hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => setWeightInput(null)}
                  className="flex-1 py-4 bg-slate-200 rounded-2xl font-bold text-slate-600"
                >Cancel</button>
                <button 
                  onClick={() => handleWeightConfirm(parseFloat(weightInput.value))}
                  className={`flex-1 py-4 bg-${shopType === ShopType.STATIONERY ? 'blue' : 'emerald'}-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50`}
                  disabled={!weightInput.value || isNaN(parseFloat(weightInput.value))}
                >Add to Bill</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bill Section */}
      <div className="xl:col-span-4 flex flex-col h-full space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />
              Bill Summary
            </h3>
            <button 
              onClick={() => setCart([])} 
              className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50"
              title="Clear Bill"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group animate-in fade-in slide-in-from-right-2">
                <div className="flex-1 pr-4">
                  <div className="font-bold text-sm text-slate-800 truncate">{item.productName}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.quantity} x Rs. {item.unitPrice}
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-right min-w-[80px]">Rs. {item.subtotal.toFixed(2)}</div>
                <button 
                  onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                  className="ml-4 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60 italic py-20">
                    <ShoppingCart size={40} className="mb-2" />
                    <p>Bill is empty</p>
                </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between text-3xl font-black text-slate-800">
              <span className="text-lg font-bold text-slate-400">Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <User size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Customer Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="Name" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                    value={customer.name}
                    onChange={e => setCustomer({...customer, name: e.target.value})}
                  />
                  <input 
                    placeholder="Phone" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                    value={customer.phone}
                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                  />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMode(PaymentMode.CASH)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMode === PaymentMode.CASH ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
              >
                <Banknote size={24} />
                <span className="text-xs font-bold mt-1">Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMode(PaymentMode.DIGITAL)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMode === PaymentMode.DIGITAL ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
              >
                <CreditCard size={24} />
                <span className="text-xs font-bold mt-1">Digital</span>
              </button>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-5 bg-${shopType === ShopType.STATIONERY ? 'blue' : 'emerald'}-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95`}
            >
              Confirm Sale & Record
            </button>
          </div>
        </div>
      </div>

      {showCheckoutSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center space-x-4 z-[100] animate-bounce-in border border-slate-700">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div>
            <div className="font-black text-lg leading-none">Sale Recorded!</div>
            <div className="text-slate-400 text-sm mt-1">Inventory updated successfully.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
