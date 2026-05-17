import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function StockChart({ stockData, minStockDays }) {
  if (!stockData || stockData.length === 0) return null;

  // Prepare data: calculate how many days of stock we have
  const data = stockData.map((item) => {
    const dailyDemand = item.daily_demand || 1;
    const daysOfStock = Number((item.qty / dailyDemand).toFixed(1));
    const isCritical = daysOfStock < (minStockDays || 3);
    
    return {
      name: `${item.product_id} (${item.warehouse})`,
      "Mevcut Stok": item.qty,
      "Günlük Talep": dailyDemand,
      "Stok Dayanma Süresi (Gün)": daysOfStock,
      isCritical,
    };
  });

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#2F4F4F]">📦 Stok & Talep Durumu</h3>
        <p className="text-xs text-[#457B9D]">Mevcut stok seviyeleri ile günlük tüketim hızlarının karşılaştırması.</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#457B9D" tick={{ fontSize: 11 }} />
            <YAxis stroke="#457B9D" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #7EB2AC',
                borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar 
              dataKey="Mevcut Stok" 
              fill="#7EB2AC" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="Günlük Talep" 
              fill="#E76F51" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              item.isCritical 
                ? 'bg-red-50 text-red-700 border border-red-100' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {item.name}: {item["Stok Dayanma Süresi (Gün)"]} Günlük Stok
          </span>
        ))}
      </div>
    </div>
  );
}
