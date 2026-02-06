
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { IndianRupee, TrendingUp, ShoppingBag, Layers, Activity } from 'lucide-react';
import { Product, Sale, ShopType } from '../types';

interface Props {
  products: Product[];
  sales: Sale[];
}

const CombinedDashboard: React.FC<Props> = ({ products, sales }) => {
  const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.totalProfit, 0);

  const statsByShop = [
    { 
      type: ShopType.STATIONERY, 
      sales: sales.filter(s => s.shopType === ShopType.STATIONERY).reduce((acc, s) => acc + s.totalAmount, 0),
      profit: sales.filter(s => s.shopType === ShopType.STATIONERY).reduce((acc, s) => acc + s.totalProfit, 0)
    },
    { 
      type: ShopType.GENERAL_STORE, 
      sales: sales.filter(s => s.shopType === ShopType.GENERAL_STORE).reduce((acc, s) => acc + s.totalAmount, 0),
      profit: sales.filter(s => s.shopType === ShopType.GENERAL_STORE).reduce((acc, s) => acc + s.totalProfit, 0)
    }
  ];

  const pieData = statsByShop.map(s => ({
    name: s.type === ShopType.STATIONERY ? 'Stationery' : 'General Store',
    value: s.sales
  }));

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
           <div>
              <p className="text-indigo-100 font-medium">Consolidated Revenue</p>
              <h2 className="text-4xl font-black mt-1">Rs. {totalSales.toLocaleString()}</h2>
           </div>
           <div className="mt-8 flex items-center justify-between">
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp size={14} /> Global Performance
              </div>
              <ShoppingBag className="opacity-40" size={40} />
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <TrendingUp size={28} />
                </div>
                <div>
                    <p className="text-slate-500 font-medium text-sm">Total Business Profit</p>
                    <h3 className="text-3xl font-bold text-slate-800">Rs. {totalProfit.toLocaleString()}</h3>
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Layers size={28} />
                </div>
                <div>
                    <p className="text-slate-500 font-medium text-sm">Total Active SKU Count</p>
                    <h3 className="text-3xl font-bold text-slate-800">{products.length}</h3>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-8">Revenue Distribution</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={10}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', padding: '12px' }}
                            formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4">
                {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-sm font-bold text-slate-600">{entry.name}</span>
                    </div>
                ))}
            </div>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-8">Performance Comparison</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsByShop} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="type" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}}
                            tickFormatter={(v) => v === ShopType.STATIONERY ? 'Stationery' : 'Grocery'}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none' }}
                            formatter={(value) => [`Rs. ${value}`, 'Amount']}
                        />
                        <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} name="Total Sales" />
                        <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} name="Total Profit" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CombinedDashboard;
