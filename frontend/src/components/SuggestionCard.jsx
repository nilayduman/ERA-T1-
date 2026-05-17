import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';

const TYPE_LABELS = {
  stock: 'Stok',
  route: 'Rota',
  reorder: 'Yeniden Sipariş',
};

const PRIORITY_STYLES = {
  high: 'border-l-red-500 bg-red-50/50',
  medium: 'border-l-amber-500 bg-amber-50/30',
  low: 'border-l-emerald-500 bg-emerald-50/30',
};

const BADGE_STYLES = {
  stock: 'bg-blue-50 text-blue-700',
  route: 'bg-purple-50 text-purple-700',
  reorder: 'bg-emerald-50 text-emerald-700',
};

// Contextual execution steps based on suggestion type
function getExecutionSteps(suggestion) {
  const type = suggestion.type || 'stock';
  const title = suggestion.title || '';
  const action = suggestion.action || '';

  if (type === 'route') {
    return [
      { label: 'Analiz Başlatıldı', desc: `"${title}" için rota verisi okunuyor...`, icon: '📡', duration: 600 },
      { label: 'AI Rota Hesaplama', desc: `Llama-3 alternatif güzergah ve durak optimizasyonu hesaplıyor...`, icon: '🧠', duration: 1200 },
      { label: 'Aksiyon Uygulanıyor', desc: `${action}`, icon: '⚡', duration: 900 },
      { label: 'ERP Senkronizasyonu', desc: 'Güncellenmiş rota parametreleri WMS/TMS sistemine iletildi.', icon: '🔗', duration: 500 },
      { label: 'Tamamlandı', desc: `${suggestion.potential_saving || 'Optimizasyon'} garanti altına alındı.`, icon: '✅', duration: 0 },
    ];
  }

  if (type === 'reorder') {
    return [
      { label: 'Stok Durumu Kontrol', desc: `"${title}" için mevcut envanter ve talep tahmini analiz ediliyor...`, icon: '📊', duration: 700 },
      { label: 'AI Sipariş Planlama', desc: 'Llama-3 optimum sipariş miktarı ve tedarikçi eşleştirmesi hesaplıyor...', icon: '🧠', duration: 1400 },
      { label: 'Aksiyon Uygulanıyor', desc: `${action}`, icon: '⚡', duration: 800 },
      { label: 'Tedarik Zinciri Bildirim', desc: 'Sipariş talebi ERP ve tedarikçi portalına iletildi.', icon: '🔗', duration: 500 },
      { label: 'Tamamlandı', desc: `Stok riski ortadan kaldırıldı. ${suggestion.potential_saving || ''}`, icon: '✅', duration: 0 },
    ];
  }

  // default: stock
  return [
    { label: 'Veri Okuma', desc: `"${title}" için depo ve stok verileri çekiliyor...`, icon: '📦', duration: 600 },
    { label: 'AI Analiz', desc: 'Llama-3 stok dağılımı ve transfer senaryolarını değerlendiriyor...', icon: '🧠', duration: 1200 },
    { label: 'Aksiyon Uygulanıyor', desc: `${action}`, icon: '⚡', duration: 900 },
    { label: 'Sistem Güncelleme', desc: 'Depo yönetim sistemi (WMS) parametreleri güncellendi.', icon: '🔗', duration: 500 },
    { label: 'Tamamlandı', desc: `${suggestion.potential_saving || 'Optimizasyon'} sağlandı.`, icon: '✅', duration: 0 },
  ];
}

export default function SuggestionCard({ suggestion, onApply, applying, showAiBadge = false }) {
  const priority = suggestion.priority || 'medium';
  const type = suggestion.type || 'stock';

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const cardRef = useRef(null);

  const steps = getExecutionSteps(suggestion);

  const handleDownloadPDF = () => {
    if (!cardRef.current) return;
    const opt = {
      margin:       0.5,
      filename:     `era-co_Raporu_${suggestion.title.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(cardRef.current).save();
  };

  const handleExecute = async () => {
    setIsExecuting(true);

    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, steps[i].duration));
    }

    // Final step
    setCurrentStep(steps.length - 1);
    await onApply(suggestion.id);
    setIsExecuting(false);
  };

  return (
    <article
      ref={cardRef}
      className={`rounded-intercom border border-intercom-gray-200 border-l-4 bg-white p-6 shadow-card transition-all duration-300 ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium} ${isExecuting ? 'ring-2 ring-amber-300/50' : ''}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-intercom-black">
          {suggestion.title}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {showAiBadge && (
            <span className="rounded-full bg-intercom-blue/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-intercom-blue">
              AI
            </span>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${BADGE_STYLES[type] || BADGE_STYLES.stock}`}>
            {TYPE_LABELS[type] || type}
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-intercom-gray-500">
        {suggestion.description}
      </p>

      {suggestion.potential_saving && (
        <p className="mb-2 text-sm text-intercom-gray-600">
          <span className="font-medium text-intercom-black">Tasarruf:</span>{' '}
          {suggestion.potential_saving}
        </p>
      )}

      {suggestion.action && (
        <p className="mb-4 text-sm text-intercom-gray-600">
          <span className="font-medium text-intercom-black">Aksiyon:</span>{' '}
          {suggestion.action}
        </p>
      )}

      {/* Execution Roadmap */}
      {isExecuting && (
        <div className="mb-4 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50/30 border border-amber-200/50 p-5 animate-in fade-in">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            AI Aksiyon Yol Haritası
          </h4>
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isPast = currentStep > idx;
              const isCurrent = currentStep === idx;
              const isFuture = currentStep < idx;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-all duration-500 ${isFuture ? 'opacity-30' : 'opacity-100'}`}
                >
                  {/* Step indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-300 ${
                        isPast
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-600'
                          : isCurrent
                          ? 'bg-amber-100 border-amber-400 text-amber-700 animate-pulse shadow-md shadow-amber-200'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}
                    >
                      {isPast ? '✓' : step.icon}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-4 mt-1 transition-colors duration-300 ${isPast ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  {/* Step content */}
                  <div className={`pt-1 ${isCurrent ? '' : ''}`}>
                    <p className={`text-sm font-bold ${isPast ? 'text-emerald-700' : isCurrent ? 'text-amber-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isPast ? 'text-emerald-600' : isCurrent ? 'text-amber-700 font-medium' : 'text-gray-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Applied state with action summary */}
      {suggestion.applied ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Uygulandı
            </span>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-intercom-gray-600 hover:text-intercom-blue transition-colors bg-intercom-gray-100 px-3 py-1.5 rounded-md hover:bg-intercom-blue/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              PDF Olarak İndir
            </button>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 mt-2">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">AI Gerçekleştirilen Aksiyon</p>
            <p className="text-sm text-emerald-700 leading-relaxed">{suggestion.action}</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-semibold">
              <span className="inline-flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                🧠 RLHF Güncellendi
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                🔗 ERP Senkronize
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleExecute}
          disabled={applying || isExecuting}
          className="btn-primary text-sm disabled:opacity-50 transition-all"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI İşliyor...
            </span>
          ) : applying ? (
            'Uygulanıyor...'
          ) : (
            'Aksiyonları Uygula'
          )}
        </button>
      )}
    </article>
  );
}
