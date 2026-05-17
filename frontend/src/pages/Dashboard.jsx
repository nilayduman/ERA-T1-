import { useEffect, useState } from 'react';
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#2F4F4F]">AI Operasyonel Aksiyonlar</h2>
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
