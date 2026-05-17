import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  high: '#E76F51',
  medium: '#E5B3BB',
  low: '#7EB2AC',
};

const PRIORITY_LABELS = {
  high: 'Yüksek Öncelik',
  medium: 'Orta Öncelik',
  low: 'Düşük Öncelik',
};

export default function RiskGauge({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  // Group and count by priority
  const counts = suggestions.reduce((acc, curr) => {
    const priority = curr.priority || 'low';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(counts).map((key) => ({
    name: PRIORITY_LABELS[key] || key,
    value: counts[key],
    color: COLORS[key] || '#cccccc',
  }));

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-[#2F4F4F]">🎯 Aksiyon Öncelik Dağılımı</h3>
        <p className="text-xs text-[#457B9D]">Darboğaz çözüm önerilerinin önem derecesine göre yüzdesi.</p>
      </div>

      <div className="h-48 w-full flex items-center justify-center my-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #7EB2AC',
                borderRadius: '1rem',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs font-semibold text-[#457B9D] border-b border-gray-50 pb-1">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
            <span className="font-bold text-[#2F4F4F]">{item.value} Aksiyon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
