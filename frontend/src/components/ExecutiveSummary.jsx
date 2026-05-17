import React from 'react';

export default function ExecutiveSummary({ insights }) {
  if (!insights) return null;

  return (
    <div className="rounded-intercom border border-intercom-gray-200 bg-white p-8 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-intercom-black">Yönetici Özeti (Executive Summary)</h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-intercom-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-intercom-blue"></span>
          </span>
          <span className="text-xs font-semibold text-intercom-gray-500 uppercase tracking-tighter">Canlı Operasyon Analizi</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Impact */}
        <div className="lg:col-span-2">
          <p className="text-lg leading-relaxed text-intercom-gray-700 italic">
            "{insights.summary}"
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-intercom-gray-50 p-5">
              <h3 className="text-xs font-bold text-intercom-gray-400 uppercase tracking-widest mb-3">Kritik Darboğazlar</h3>
              <div className="space-y-2">
                {insights.stock_bottlenecks?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-intercom-black">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-intercom-gray-50 p-5">
              <h3 className="text-xs font-bold text-intercom-gray-400 uppercase tracking-widest mb-3">Rota Optimizasyonu</h3>
              <div className="space-y-2">
                {insights.route_issues?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-intercom-black">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Impact / Goal */}
        <div className="rounded-2xl bg-gradient-to-br from-intercom-blue to-intercom-blue-hover p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Tahmini Tasarruf Potansiyeli</h3>
            <p className="mt-4 text-4xl font-black tracking-tight">
              {insights.key_metrics?.estimated_savings || '₺24.500 / Ay'}
            </p>
            <p className="mt-2 text-xs opacity-70 leading-relaxed">
              Önerilen tüm aksiyonlar uygulandığında beklenen operasyonel verimlilik artışı ve maliyet düşüşü.
            </p>
          </div>
          
          <div className="mt-8 border-t border-white/20 pt-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>HEDEF UYUMU</span>
              <span>%92</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-white" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
