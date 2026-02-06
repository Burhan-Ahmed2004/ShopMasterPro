
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { ShoppingCart, Package, IndianRupee, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { ShopType, Product, Sale } from '../types';

interface DashboardProps {
  shopType: ShopType;
  products: Product[];
  sales: Sale[];
  onNewSale: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ shopType, products, sales, onNewSale }) => {
  const shopProducts = products.filter(p => p.shopType === shopType);
  const shopSales = sales.filter(s => s.shopType === shopType);

  const totalSales = shopSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = shopSales.reduce((acc, s) => acc + s.totalProfit, 0);
  const stockValue = shopProducts.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const lowStockCount = shopProducts.filter(p => p.stock <= p.lowStockThreshold).length;

  // Last 7 days sales chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-PK', { weekday: 'short' });
    const daySales = shopSales
      .filter(s => new Date(s.timestamp).toDateString() === d.toDateString())
      .reduce((acc, s) => acc + s.totalAmount, 0);
    return { name: dateStr, sales: daySales };
  }).reverse();

  const categoryData = useMemo(() => {
    const categorySales = new Map<string, number>();

    shopSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = shopProducts.find(p => p.id === item.productId);
        if (product) {
          const currentQty = categorySales.get(product.category) || 0;
          categorySales.set(product.category, currentQty + item.quantity);
        }
      });
    });

    return Array.from(categorySales.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [shopProducts, shopSales]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black mb-1">Welcome Back!</h2>
          <p className="text-slate-400">You have <span className="text-white font-bold">{lowStockCount}</span> items running low on stock today.</p>
        </div>
        <button 
          onClick={onNewSale}
          className={`flex items-center space-x-3 bg-${shopType === ShopType.STATIONERY ? 'blue' : 'emerald'}-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-black/20`}
        >
          <Plus size={24} />
          <span className="text-lg">New Sale Entry</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<IndianRupee className="text-emerald-600" />}
          label="Total Sales"
          value={`Rs. ${totalSales.toLocaleString()}`}
          subtext="Total revenue generated"
          color="emerald"
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />}
          label="Total Profit"
          value={`Rs. ${totalProfit.toLocaleString()}`}
          subtext="Net profit after COGS"
          color="blue"
        />
        <StatCard 
          icon={<Package className="text-amber-600" />}
          label="Stock Value"
          value={`Rs. ${stockValue.toLocaleString()}`}
          subtext="Current inventory worth"
          color="amber"
        />
        <StatCard 
          icon={<AlertCircle className="text-rose-600" />}
          label="Low Stock"
          value={lowStockCount}
          subtext="Items needing restock"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sales Performance (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`Rs. ${value}`, 'Sales']}
                />
                <Bar dataKey="sales" fill={shopType === ShopType.STATIONERY ? '#3b82f6' : '#10b981'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sales by Category</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-slate-400 text-sm text-center">
                    <ShoppingCart size={40} className="mx-auto mb-2 opacity-20" />
                    No sales data yet
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h4 className="text-slate-500 text-sm font-medium">{label}</h4>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{subtext}</p>
  </div>
);

export default Dashboard;
