const RISK_STYLES = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-emerald-100 text-emerald-800',
};

const RISK_LABELS = {
  high: 'Yüksek Risk',
  medium: 'Orta Risk',
  low: 'Düşük Risk',
};

export default function AiInsightsPanel({ insights, source, model }) {
  if (!insights) return null;

  const risk = insights.risk_level || 'medium';
  const metrics = insights.key_metrics || {};

  return (
    <section className="rounded-intercom border border-intercom-blue/20 bg-gradient-to-br from-intercom-blue/5 to-white p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-intercom-blue px-3 py-1 text-xs font-semibold text-white">
          {source === 'ai' ? 'AI Analiz' : 'Demo Mod'}
        </span>
        {source === 'ai' && model && (
          <span className="text-xs text-intercom-gray-500">{model}</span>
        )}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RISK_STYLES[risk]}`}>
          {RISK_LABELS[risk] || risk}
        </span>
      </div>

      {insights.summary && (
        <p className="mb-6 text-base leading-relaxed text-intercom-gray-700">{insights.summary}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <InsightList title="Stok Darboğazları" items={insights.stock_bottlenecks} />
        <InsightList title="Rota Sorunları" items={insights.route_issues} />
      </div>

      {Object.keys(metrics).length > 0 && (
        <div className="mt-6 grid gap-3 border-t border-intercom-gray-200 pt-6 sm:grid-cols-3">
          {metrics.critical_stock_count != null && (
            <Metric label="Kritik Stok" value={metrics.critical_stock_count} />
          )}
          {metrics.slow_routes_count != null && (
            <Metric label="Yavaş Rota" value={metrics.slow_routes_count} />
          )}
          {metrics.estimated_savings && (
            <div className="sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-intercom-gray-400">
                Tahmini Tasarruf
              </p>
              <p className="mt-1 text-sm font-medium text-intercom-black">{metrics.estimated_savings}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function InsightList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-intercom-black">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-intercom-gray-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-intercom-blue" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-intercom-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-intercom-black">{value}</p>
    </div>
  );
}
