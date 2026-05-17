import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function RouteChart({ routesData, targetHours }) {
  if (!routesData || routesData.length === 0) return null;

  const data = routesData.map((route) => {
    const isSlow = (route.avg_time_hours || 0) > (targetHours || 3.5);
    return {
      name: route.route_id,
      "Ortalama Süre (Saat)": route.avg_time_hours || 0,
      "Durak Sayısı": route.stops || 0,
      "Mesafe (10km)": (route.distance_km || 0) / 10,
      isSlow,
    };
  });

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#2F4F4F]">🚚 Rota Performans Karşılaştırması</h3>
        <p className="text-xs text-[#457B9D]">Ortalama teslimat süreleri ile durak sayısının rotaya olan etkisi.</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
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
            <ReferenceLine
              y={targetHours || 3.5}
              label={{
                value: 'Hedef Süre',
                fill: '#E76F51',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
              stroke="#E76F51"
              strokeDasharray="4 4"
            />
            <Bar
              dataKey="Ortalama Süre (Saat)"
              fill="#457B9D"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
            <Line
              type="monotone"
              dataKey="Durak Sayısı"
              stroke="#E5B3BB"
              strokeWidth={3}
              dot={{ r: 5, fill: '#E5B3BB' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              item.isSlow
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.isSlow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {item.name}: Ortalama {item["Ortalama Süre (Saat)"]} Saat ({item["Durak Sayısı"]} Durak)
          </span>
        ))}
      </div>
    </div>
  );
}
