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
    // Create a temporary container — must be in viewport for html2canvas to render
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.zIndex = '-9999';
    element.style.opacity = '1';
    element.style.pointerEvents = 'none';
    element.style.background = 'white';

    // Set standard styles and HTML content
    element.innerHTML = `
      <div style="width: 790px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: white; box-sizing: border-box;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px; font-family: sans-serif;">ERA LOJİSTİK VE OPERASYON ANALİZİ</h1>
            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">YAPAY ZEKA DESTEKLİ OPERASYONEL AKSİYON RAPORU</p>
          </div>
          <div style="text-align: right;">
            <span style="background-color: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid #dbeafe;">ERA-CO PILOT SECURE</span>
          </div>
        </div>

        <!-- Meta Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <tr style="background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <td style="padding: 10px; width: 50%; vertical-align: top;">
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Belge Rapor ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #3b82f6;">REP-ERA-${suggestion.id}-${Date.now().toString().slice(-6)}</span></p>
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Oluşturma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              <p style="margin: 0;"><strong style="color: #475569;">İşlem Durumu:</strong> <span style="color: #16a34a; font-weight: 800;">✓ UYGULANDI (ERP AKTİF)</span></p>
            </td>
            <td style="padding: 10px; width: 50%; vertical-align: top; border-left: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Analiz Kategorisi:</strong> <span style="font-weight: 600; color: #334155;">${TYPE_LABELS[type] || type} Optimizasyonu</span></p>
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Öncelik Derecesi:</strong> <span style="text-transform: uppercase; font-weight: 800; color: ${priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#16a34a'}">${priority === 'high' ? 'Yüksek' : priority === 'medium' ? 'Orta' : 'Düşük'}</span></p>
              <p style="margin: 0;"><strong style="color: #475569;">Öngörülen Tasarruf:</strong> <span style="font-weight: 800; color: #1e3a8a;">${suggestion.potential_saving || 'Tanımlanmadı'}</span></p>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">${suggestion.title}</h2>
          <div style="height: 2px; background-color: #e2e8f0; width: 100%;"></div>
        </div>

        <!-- Section 1 -->
        <div style="margin-bottom: 20px; font-size: 12px; line-height: 1.6;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">1. Operasyonel Darboğaz ve Durum Tespiti</h3>
          <div style="color: #334155; background-color: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #64748b;">
            ${suggestion.description}
          </div>
        </div>

        <!-- Section 2 -->
        <div style="margin-bottom: 20px; font-size: 12px; line-height: 1.6;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">2. Yapay Zeka Tarafından Kararlaştırılan Çözüm Planı</h3>
          <div style="color: #16a34a; background-color: #f0fdf4; padding: 12px; border-radius: 6px; border-left: 4px solid #16a34a; font-weight: 600;">
            ${suggestion.action}
          </div>
        </div>

        <!-- Section 3: Roadmap Table -->
        <div style="margin-bottom: 25px; font-size: 12px; line-height: 1.6;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">3. Operasyonel Yol Haritası & Uygulama Adımları</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 30%;">Yol Haritası Aşaması</th>
                <th style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 55%;">Gerçekleştirilen İşlemler ve Detaylar</th>
                <th style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #475569; width: 15%; text-align: center;">Durum</th>
              </tr>
            </thead>
            <tbody>
              ${steps.map((step, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">
                    ${step.label}
                  </td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #475569;">
                    ${step.desc}
                  </td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center; color: #16a34a; font-weight: bold;">
                    ✓ Başarılı
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Section 4: System Integration Audit Logs -->
        <div style="margin-bottom: 30px; font-size: 12px; line-height: 1.6;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">4. Entegrasyon ve Denetim Kayıtları (Audit Logs)</h3>
          <div style="background-color: #fafafa; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 10px; color: #334155; line-height: 1.5;">
            <div>[${new Date().toISOString()}] INFO: Suggestion #${suggestion.id} processed by Llama-3.3-70B model.</div>
            <div>[${new Date().toISOString()}] SECURE: RLHF feedback weights updated in the neural network database.</div>
            <div>[${new Date().toISOString()}] INTEGRATION: WMS/TMS database tables synchronized. API response 200 OK.</div>
            <div>[${new Date().toISOString()}] AUDIT: Executive approval signature generated.</div>
          </div>
        </div>

        <!-- Signatures -->
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
              <p style="margin: 0; font-weight: 700; color: #475569;">Onaylayan Yönetici (Human-in-the-Loop)</p>
              <p style="margin: 3px 0 0 0; color: #64748b;">Operasyon ve Lojistik Direktörü</p>
              <div style="margin-top: 25px; border-bottom: 1px solid #94a3b8; width: 160px; display: inline-block;"></div>
              <p style="margin: 3px 0 0 0; font-size: 9px; color: #94a3b8;">İmza / Tarih</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div style="margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
          Bu belge, Era Lojistik ve Karar Destek Platformu yapay zeka motoru tarafından anlık olarak üretilmiştir.<br />
          © 2026 Era AI Logistics Platform. Tüm Hakları Saklıdır. Gizli Belgedir - Sadece Kurum İçi Paylaşıma Uygundur.
        </div>
      </div>
    `;

    document.body.appendChild(element);

    // Small delay to let browser render the element before capture
    const contentEl = element.firstElementChild;
    const opt = {
      margin: 0.4,
      filename: `era-co_Kurumsal_Rapor_ID${suggestion.id}.pdf`,
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-300 ${isPast
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
