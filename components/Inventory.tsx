
import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Package2, ShoppingCart } from 'lucide-react';
import { Product, ShopType, UnitType } from '../types';
import { CATEGORIES } from '../constants';

interface InventoryProps {
  shopType: ShopType;
  products: Product[];
  onAdd: (p: Product) => void;
  onUpdate: (p: Product) => void;
  onSell: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ shopType, products, onAdd, onUpdate, onSell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (p?: Product) => {
    setEditingProduct(p || null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className={`flex items-center space-x-2 bg-${shopType === ShopType.STATIONERY ? 'blue' : 'emerald'}-600 text-white px-6 py-2 rounded-xl hover:opacity-90 transition-all font-semibold`}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product Info</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Pricing</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Stock</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${product.stock <= product.lowStockThreshold ? 'rose' : 'slate'}-100 text-${product.stock <= product.lowStockThreshold ? 'rose' : 'slate'}-600`}>
                      <Package2 size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{product.name}</div>
                      <div className="text-xs text-slate-400">SKU: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="px-3 py-1 bg-slate-100 rounded-full">{product.category}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-800">S: Rs. {product.sellingPrice}</div>
                  <div className="text-xs text-slate-400">P: Rs. {product.purchasePrice} / {product.unitType}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm font-bold ${product.stock <= product.lowStockThreshold ? 'text-rose-600' : 'text-slate-800'}`}>
                    {product.stock.toFixed(product.unitType === UnitType.KG ? 3 : 0)} {product.unitType}
                  </div>
                  {product.stock <= product.lowStockThreshold && (
                    <div className="flex items-center text-[10px] text-rose-500 font-medium">
                      <AlertTriangle size={10} className="mr-1" /> LOW STOCK
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => onSell(product.id)}
                        disabled={product.stock <= 0}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${product.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        <ShoppingCart size={14} />
                        <span>Sell</span>
                    </button>
                    <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductModal 
          shopType={shopType} 
          product={editingProduct} 
          onClose={() => setShowModal(false)} 
          onSave={(p) => {
            if (editingProduct) onUpdate(p);
            else onAdd(p);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

interface ModalProps {
  shopType: ShopType;
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}

const ProductModal: React.FC<ModalProps> = ({ shopType, product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    shopType,
    unitType: shopType === ShopType.GENERAL_STORE ? UnitType.KG : UnitType.UNIT,
    category: CATEGORIES[shopType][0],
    stock: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    lowStockThreshold: 5,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
        
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSave({ 
            ...formData, 
            id: product?.id || Math.random().toString(36).substr(2, 9) 
          } as Product);
        }}>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Product Name</label>
            <input 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES[shopType].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">SKU Code</label>
              <input 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.sku || ''} 
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Purchase Price (Rs.)</label>
              <input 
                type="number" step="0.01"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.purchasePrice || 0} 
                onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Selling Price (Rs.)</label>
              <input 
                type="number" step="0.01"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.sellingPrice || 0} 
                onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Unit</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                value={formData.unitType}
                onChange={e => setFormData({...formData, unitType: e.target.value as UnitType})}
                disabled={!!product} // Disable changing unit type on existing products
              >
                <option value={UnitType.UNIT}>Unit</option>
                {shopType === ShopType.GENERAL_STORE && <option value={UnitType.KG}>KG</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Initial Stock</label>
              <input 
                type="number" step="0.001"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.stock || 0} 
                onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Alert Qty</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.lowStockThreshold || 5} 
                onChange={e => setFormData({...formData, lowStockThreshold: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <button className={`w-full bg-${shopType === ShopType.STATIONERY ? 'blue' : 'emerald'}-600 text-white py-3 rounded-2xl font-bold mt-4 hover:opacity-90 transition-opacity`}>
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default Inventory;
