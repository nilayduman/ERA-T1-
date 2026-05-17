import React from 'react';

export default function StatsBar({ stats, insights }) {
  if (!stats && !insights) return null;

  const riskLevel = insights?.risk_level || 'medium';
  const riskColor = {
    high: 'text-red-600 bg-red-50 border-red-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  }[riskLevel];

  const efficiency = insights?.key_metrics?.efficiency_score || '84%';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Primary KPI: Risk Score */}
      <div className={`rounded-intercom border p-5 shadow-sm ${riskColor}`}>
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Operasyonel Risk</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold">{riskLevel.toUpperCase()}</p>
          <span className="text-sm font-medium">Seviyesi</span>
        </div>
      </div>

      {/* Primary KPI: Efficiency */}
      <div className="rounded-intercom border border-intercom-blue/10 bg-intercom-blue/5 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-intercom-blue opacity-70">Verimlilik Skoru</p>
        <div className="mt-2 flex items-baseline gap-2 text-intercom-blue">
          <p className="text-3xl font-bold">{efficiency}</p>
          <div className="flex h-2 w-12 overflow-hidden rounded-full bg-intercom-blue/20">
            <div className="h-full bg-intercom-blue" style={{ width: efficiency }} />
          </div>
        </div>
      </div>

      {/* Secondary KPI: Total Actions */}
      <div className="rounded-intercom border border-intercom-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-intercom-gray-500">Öneri Sayısı</p>
        <p className="mt-2 text-3xl font-bold text-intercom-black">{stats?.total || 0}</p>
      </div>

      {/* Secondary KPI: Applied/Pending */}
      <div className="rounded-intercom border border-intercom-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-intercom-gray-500">Uygulanan / Bekleyen</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-intercom-black">{stats?.applied || 0}</p>
          <span className="text-intercom-gray-400">/</span>
          <p className="text-xl font-medium text-intercom-gray-500">{stats?.pending || 0}</p>
        </div>
      </div>
    </div>
  );
}
