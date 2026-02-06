
import React, { useState } from 'react';
import { Calendar, Search, Download, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { Sale, PaymentMode } from '../types';

interface ReportsProps {
  sales: Sale[];
  shopType: 'STATIONERY' | 'GENERAL_STORE' | 'COMBINED';
}

const Reports: React.FC<ReportsProps> = ({ sales }) => {
  const [dateRange, setDateRange] = useState('ALL');

  const filteredSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="pl-10 pr-6 py-2 bg-white border border-slate-200 rounded-xl outline-none appearance-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="ALL">All Transactions</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-100 transition-colors">
            <FileSpreadsheet size={18} />
            <span className="hidden md:inline">Export Excel</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-colors">
            <FileText size={18} />
            <span className="hidden md:inline">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date & Time</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Items</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Mode</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map(sale => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-700">
                    {new Date(sale.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{sale.customerName || 'Walk-in Customer'}</div>
                  <div className="text-xs text-slate-400">{sale.customerPhone || 'No Phone'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                    {sale.items.length} Product(s)
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${sale.paymentMode === PaymentMode.CASH ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {sale.paymentMode}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-black text-slate-800">Rs. {sale.totalAmount.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-500 font-bold uppercase">Profit: Rs. {sale.totalProfit.toLocaleString()}</div>
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                        No sales data found for the selected period
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
