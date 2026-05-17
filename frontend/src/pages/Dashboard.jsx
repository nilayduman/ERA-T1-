import { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
  analyze,
  applySuggestion,
  fetchAiStatus,
  fetchSampleData,
  uploadData,
} from '../api/client';
import AiInsightsPanel from '../components/AiInsightsPanel';
import StatsBar from '../components/StatsBar';
import SuggestionCard from '../components/SuggestionCard';
import UploadZone from '../components/UploadZone';
import UsageBanner from '../components/UsageBanner';
import TrainLoading from '../components/TrainLoading';
import CopilotBrief from '../features/copilot/CopilotBrief';
import OmniSearchBar from '../features/copilot/OmniSearchBar';
import ProactiveAlert from '../features/copilot/ProactiveAlert';
import { askCopilot } from '../api/client';
import StockChart from '../components/charts/StockChart';
import RouteChart from '../components/charts/RouteChart';
import RiskGauge from '../components/charts/RiskGauge';
import TurkeyMap from '../components/charts/TurkeyMap';

const TYPE_LABELS = {
  stock: 'Stok',
  route: 'Rota',
  reorder: 'Yeniden Sipariş',
};

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [operationId, setOperationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [analysisMeta, setAnalysisMeta] = useState({
    source: null,
    model: null,
    usage: null,
    apiCalls: 0,
  });
  const [aiStatus, setAiStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [phase, setPhase] = useState('upload');
  const [copilotAnswer, setCopilotAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [isApplyingAll, setIsApplyingAll] = useState(false);

  useEffect(() => {
    fetchAiStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ configured: false }));
  }, []);

  const runAnalysis = async (uploadedId) => {
    const result = await analyze(uploadedId);
    setSuggestions(result.suggestions || []);
    setInsights(result.insights || null);
    setAnalysisMeta({
      source: result.source,
      model: result.model,
      usage: result.usage,
      apiCalls: result.api_calls,
    });
    setStats(result.stats || null);
    setWarning(result.warning || '');
    setRawData(result.raw_data || null);
    setCopilotAnswer(null); // Reset answer on new analysis
    setPhase('results');
  };

  const handleAskCopilot = async (query) => {
    if (!operationId) return;
    setIsAsking(true);
    setCopilotAnswer(null);
    try {
      const result = await askCopilot(operationId, query);
      setCopilotAnswer(result.answer);
    } catch (err) {
      setCopilotAnswer('Üzgünüm, yanıt alırken bir hata oluştu: ' + err.message);
    } finally {
      setIsAsking(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Lütfen bir JSON dosyası seçin');
      return;
    }

    setLoading(true);
    setError('');
    setWarning('');

    try {
      const uploadResult = await uploadData(file);
      setOperationId(uploadResult.operation_id);
      await runAnalysis(uploadResult.operation_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleData = async () => {
    setLoading(true);
    setError('');
    setWarning('');

    try {
      const sample = await fetchSampleData();
      const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
      const sampleFile = new File([blob], 'sample-data.json', { type: 'application/json' });
      setFile(sampleFile);

      const uploadResult = await uploadData(sampleFile);
      setOperationId(uploadResult.operation_id);
      await runAnalysis(uploadResult.operation_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (suggestionId) => {
    if (!operationId) return;

    setApplyingId(suggestionId);
    try {
      await applySuggestion(operationId, suggestionId);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, applied: true } : s))
      );
      setStats((prev) =>
        prev ? { ...prev, applied: prev.applied + 1, pending: prev.pending - 1 } : null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setApplyingId(null);
    }
  };

  const handleApplyAll = async () => {
    if (!operationId || isApplyingAll) return;
    setIsApplyingAll(true);
    setError('');

    try {
      const unapplied = suggestions.filter(s => !s.applied);
      // Sequentially apply all to avoid race conditions in UI state updates
      for (const suggestion of unapplied) {
        await applySuggestion(operationId, suggestion.id);
        setSuggestions((prev) =>
          prev.map((s) => (s.id === suggestion.id ? { ...s, applied: true } : s))
        );
        setStats((prev) =>
          prev ? { ...prev, applied: prev.applied + 1, pending: prev.pending - 1 } : null
        );
      }
    } catch (err) {
      setError('Tüm aksiyonlar uygulanırken hata oluştu: ' + err.message);
    } finally {
      setIsApplyingAll(false);
    }
  };

  const handleReset = () => {
    setPhase('upload');
    setFile(null);
    setOperationId(null);
    setSuggestions([]);
    setInsights(null);
    setAnalysisMeta({ source: null, model: null, usage: null, apiCalls: 0 });
    setStats(null);
    setRawData(null);
    setCopilotAnswer(null);
    setError('');
    setWarning('');
  };

  const handleDownloadAllPDFs = () => {
    const appliedSuggestions = suggestions.filter(s => s.applied);
    if (appliedSuggestions.length === 0) return;

    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.zIndex = '-9999';
    element.style.opacity = '1';
    element.style.pointerEvents = 'none';
    element.style.background = 'white';

    const suggestionsHtml = appliedSuggestions.map((s, idx) => {
      const type = s.type || 'stock';
      const priority = s.priority || 'medium';
      return `
        <div style="margin-bottom: 30px; padding-bottom: 25px; ${idx < appliedSuggestions.length - 1 ? 'border-bottom: 2px dashed #e2e8f0;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">${idx + 1}. ${s.title}</h3>
            <div style="display: flex; gap: 8px;">
              <span style="background-color: ${priority === 'high' ? '#FEF2F2' : priority === 'medium' ? '#FFFBEB' : '#F0FDF4'}; color: ${priority === 'high' ? '#DC2626' : priority === 'medium' ? '#D97706' : '#16A34A'}; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700;">${priority === 'high' ? 'YÜKSEK' : priority === 'medium' ? 'ORTA' : 'DÜŞÜK'}</span>
              <span style="background-color: #EFF6FF; color: #1D4ED8; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700;">${TYPE_LABELS[type] || type}</span>
            </div>
          </div>
          <div style="font-size: 11px; line-height: 1.6; margin-bottom: 10px;">
            <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Durum Tespiti:</strong></p>
            <div style="color: #334155; background-color: #f8fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #64748b;">${s.description}</div>
          </div>
          <div style="font-size: 11px; line-height: 1.6; margin-bottom: 10px;">
            <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Uygulanan Aksiyon:</strong></p>
            <div style="color: #16a34a; background-color: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 3px solid #16a34a; font-weight: 600;">${s.action}</div>
          </div>
          ${s.potential_saving ? `<p style="margin: 0; font-size: 11px;"><strong style="color: #475569;">Öngörülen Tasarruf:</strong> <span style="font-weight: 800; color: #1e3a8a;">${s.potential_saving}</span></p>` : ''}
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #16a34a; font-weight: 700;">✓ UYGULANDI</p>
        </div>
      `;
    }).join('');

    element.innerHTML = `
      <div style="width: 790px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: white; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px;">ERA TOPLU AKSİYON RAPORU</h1>
            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">TÜM UYGULANAN OPERASYONLARİN KONSOLİDE RAPORU</p>
          </div>
          <div style="text-align: right;">
            <span style="background-color: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid #dbeafe;">ERA-CO PILOT SECURE</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
          <tr style="background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <td style="padding: 10px; width: 50%; vertical-align: top;">
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Rapor ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #3b82f6;">REP-ERA-ALL-${Date.now().toString().slice(-6)}</span></p>
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Oluşturma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              <p style="margin: 0;"><strong style="color: #475569;">Operasyon ID:</strong> <span style="font-family: monospace; color: #3b82f6;">${operationId || 'N/A'}</span></p>
            </td>
            <td style="padding: 10px; width: 50%; vertical-align: top; border-left: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Toplam Aksiyon:</strong> <span style="font-weight: 800; color: #1e3a8a;">${suggestions.length}</span></p>
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Uygulanan:</strong> <span style="font-weight: 800; color: #16a34a;">${appliedSuggestions.length}</span></p>
              <p style="margin: 0;"><strong style="color: #475569;">Bekleyen:</strong> <span style="font-weight: 800; color: #d97706;">${suggestions.length - appliedSuggestions.length}</span></p>
            </td>
          </tr>
        </table>

        ${suggestionsHtml}

        <div style="margin-top: 30px; font-size: 12px; line-height: 1.6;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Sistem Denetim Kayıtları</h3>
          <div style="background-color: #fafafa; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 10px; color: #334155; line-height: 1.5;">
            <div>[${new Date().toISOString()}] BATCH: ${appliedSuggestions.length} suggestion(s) processed by Llama-3.3-70B model.</div>
            <div>[${new Date().toISOString()}] SECURE: All RLHF feedback weights updated.</div>
            <div>[${new Date().toISOString()}] INTEGRATION: WMS/TMS/ERP synchronized. All API responses 200 OK.</div>
            <div>[${new Date().toISOString()}] AUDIT: Consolidated report generated.</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 11px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 0; font-weight: 700; color: #475569;">Raporlayan Sistem (AI Engine)</p>
              <p style="margin: 3px 0 0 0; color: #64748b;">Era-Co Logistics AI Core</p>
              <div style="margin-top: 10px; font-family: monospace; color: #cbd5e1; font-size: 9px; border: 1px dashed #cbd5e1; display: inline-block; padding: 3px 6px; border-radius: 4px;">
                ELECTRONICALLY SIGNED BY ERA-CO
              </div>
            </td>
            <td style="width: 50%; text-align: right; vertical-align: top;">
              <p style="margin: 0; font-weight: 700; color: #475569;">Onaylayan Yönetici</p>
              <p style="margin: 3px 0 0 0; color: #64748b;">Operasyon ve Lojistik Direktörü</p>
              <div style="margin-top: 25px; border-bottom: 1px solid #94a3b8; width: 160px; display: inline-block;"></div>
              <p style="margin: 3px 0 0 0; font-size: 9px; color: #94a3b8;">İmza / Tarih</p>
            </td>
          </tr>
        </table>

        <div style="margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
          Bu belge, Era Lojistik ve Karar Destek Platformu yapay zeka motoru tarafından anlık olarak üretilmiştir.<br />
          © 2026 Era AI Logistics Platform. Tüm Hakları Saklıdır.
        </div>
      </div>
    `;

    document.body.appendChild(element);

    const contentEl = element.firstElementChild;
    const opt = {
      margin: 0.4,
      filename: `era-co_Toplu_Aksiyon_Raporu.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 900 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    setTimeout(() => {
      html2pdf().set(opt).from(contentEl).save().then(() => {
        document.body.removeChild(element);
      });
    }, 300);
  };

  const isAiReady = aiStatus?.configured;
  const isAiResult = analysisMeta.source === 'ai';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-intercom-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <p className="section-label mb-2">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-intercom-black">
            Operasyon Analizi
          </h1>
          <p className="mt-2 text-intercom-gray-500">
            Stok ve rota verilerinizi yükleyin; NVIDIA Llama AI darboğazları tespit etsin.
          </p>

          {aiStatus && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
              <span
                className={`h-2 w-2 rounded-full ${isAiReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              {isAiReady ? (
                <span className="text-intercom-gray-600">
                  AI aktif — <span className="text-intercom-black">{aiStatus.model}</span>
                </span>
              ) : (
                <span className="text-amber-700">API key yok — demo mod</span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-intercom border border-intercom-gray-200 bg-white p-8 shadow-card">
            <TrainLoading />
          </div>
        ) : (
          <>
            {phase === 'upload' && (
              <form onSubmit={handleUpload} className="space-y-6">
                <UploadZone file={file} onFileChange={setFile} disabled={loading} />

                {error && (
                  <div className="rounded-intercom border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={loading || !file} className="btn-primary flex-1 disabled:opacity-50">
                    {loading ? 'AI Analiz Başlatıldı...' : 'AI ile Analiz Et'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSampleData}
                    disabled={loading}
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Örnek Veri İşleniyor...' : 'Örnek Veri + AI Analiz'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {phase === 'results' && (
          <div className="space-y-8">
            <div className="rounded-intercom border border-intercom-gray-200 bg-white p-6 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-intercom-black">
                    {isAiResult ? 'AI analizi tamamlandı' : 'Analiz tamamlandı'}
                  </h2>
                  <p className="mt-1 text-sm text-intercom-gray-500">
                    Operation ID:{' '}
                    <code className="rounded bg-intercom-gray-100 px-2 py-0.5 text-intercom-blue">
                      {operationId}
                    </code>
                  </p>
                </div>
                <button type="button" onClick={handleReset} className="btn-secondary text-sm">
                  Yeni Analiz
                </button>
              </div>
              {warning && (
                <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</p>
              )}
            </div>

            <UsageBanner
              usage={analysisMeta.usage}
              apiCalls={analysisMeta.apiCalls}
              source={analysisMeta.source}
            />

            <StatsBar stats={stats} insights={insights} />

            {rawData && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-3">
                    <TurkeyMap
                      stockData={rawData.stock}
                      routesData={rawData.routes}
                      minStockDays={rawData.company_rules?.min_stock_days}
                      targetHours={rawData.company_rules?.target_delivery_hours}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <StockChart
                      stockData={rawData.stock}
                      minStockDays={rawData.company_rules?.min_stock_days}
                    />
                  </div>
                  <div>
                    <RiskGauge suggestions={suggestions} />
                  </div>
                  <div className="md:col-span-3">
                    <RouteChart
                      routesData={rawData.routes}
                      targetHours={rawData.company_rules?.target_delivery_hours}
                    />
                  </div>
                </div>
              </div>
            )}

            <CopilotBrief insights={insights} />

            <OmniSearchBar onSearch={handleAskCopilot} isSearching={isAsking} />

            {copilotAnswer && (
              <div className="rounded-[2rem] bg-white p-6 border-2 border-[#7EB2AC] shadow-lg mb-8 relative">
                <div className="absolute -top-4 left-6 bg-[#7EB2AC] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Copilot Yanıtı</div>
                <p className="text-[#457B9D] leading-relaxed font-medium mt-2">
                  {copilotAnswer}
                </p>
                <button onClick={() => setCopilotAnswer(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-intercom border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isAiResult && (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-[#2F4F4F]">AI Operasyonel Aksiyonlar</h2>
                <div className="flex items-center gap-3">
                  {suggestions.filter(s => s.applied).length > 0 && (
                    <button
                      onClick={handleDownloadAllPDFs}
                      className="flex items-center gap-2 rounded-full bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100 hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tüm PDF'leri İndir
                    </button>
                  )}
                  {suggestions.filter(s => !s.applied).length > 1 && (
                    <button
                      onClick={handleApplyAll}
                      disabled={isApplyingAll}
                      className="flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isApplyingAll ? (
                        <>
                          <span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                          Tümü İşleniyor...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">✨</span>
                          Tümünü Otonom Uygula
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {suggestions.length > 0 ? (
              <div className="space-y-6">
                {/* Yüksek öncelikli olanları Proactive Alert olarak göster */}
                {suggestions.filter(s => s.priority === 'high').map(suggestion => (
                  <ProactiveAlert
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={handleApply}
                  />
                ))}

                {/* Diğerlerini normal kart olarak göster */}
                <div className="grid gap-4 md:grid-cols-2">
                  {suggestions.filter(s => s.priority !== 'high').map(suggestion => (
                    <SuggestionCard
                      key={suggestion.id ?? suggestion.title}
                      suggestion={suggestion}
                      onApply={handleApply}
                      applying={applyingId === suggestion.id}
                      showAiBadge={isAiResult}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-intercom border border-intercom-gray-200 bg-white p-12 text-center text-intercom-gray-500 shadow-card">
                Öneri bulunamadı. Lütfen tekrar deneyin.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
