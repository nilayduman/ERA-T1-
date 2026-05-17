import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

const TYPE_LABELS = {
  stock: 'Stok',
  route: 'Rota',
  reorder: 'Yeniden Sipariş',
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


export default function ProactiveAlert({ suggestion, onApply }) {
  const [isApplying, setIsApplying] = useState(false);
  const [executionStep, setExecutionStep] = useState(-1);
  const steps = getExecutionSteps(suggestion);
  const type = suggestion.type || 'stock';
  const priority = suggestion.priority || 'high';

  const simulateExecution = async () => {
    setIsApplying(true);
    for (let i = 0; i < steps.length - 1; i++) {
      setExecutionStep(i);
      await new Promise(r => setTimeout(r, steps[i].duration));
    }
    setExecutionStep(steps.length - 1);
    await onApply(suggestion.id);
    setIsApplying(false);
  };

  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.zIndex = '-9999';
    element.style.opacity = '1';
    element.style.pointerEvents = 'none';
    element.style.background = 'white';

    element.innerHTML = `
      <div style="width: 790px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: white; box-sizing: border-box;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E76F51; padding-bottom: 15px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px; font-family: sans-serif;">ERA LOJİSTİK VE OPERASYON ANALİZİ</h1>
            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">YAPAY ZEKA DESTEKLİ OPERASYONEL AKSİYON RAPORU — YÜKSEK ÖNCELİK</p>
          </div>
          <div style="text-align: right;">
            <span style="background-color: #FEF2F2; color: #DC2626; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid #FECACA;">⚠ KRİTİK SEVİYE</span>
          </div>
        </div>

        <!-- Meta Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <tr style="background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <td style="padding: 10px; width: 50%; vertical-align: top;">
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Belge Rapor ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #E76F51;">REP-ERA-CRIT-${suggestion.id}-${Date.now().toString().slice(-6)}</span></p>
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Oluşturma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              <p style="margin: 0;"><strong style="color: #475569;">İşlem Durumu:</strong> <span style="color: #16a34a; font-weight: 800;">✓ UYGULANDI (ERP AKTİF)</span></p>
            </td>
            <td style="padding: 10px; width: 50%; vertical-align: top; border-left: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Analiz Kategorisi:</strong> <span style="font-weight: 600; color: #334155;">${TYPE_LABELS[type] || type} Optimizasyonu</span></p>
              <p style="margin: 0 0 6px 0;"><strong style="color: #475569;">Öncelik Derecesi:</strong> <span style="text-transform: uppercase; font-weight: 800; color: #dc2626;">YÜKSEK — KRİTİK</span></p>
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
          <div style="color: #334155; background-color: #FEF2F2; padding: 12px; border-radius: 6px; border-left: 4px solid #E76F51;">
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
            <div>[${new Date().toISOString()}] CRITICAL: Suggestion #${suggestion.id} flagged as HIGH PRIORITY by Llama-3.3-70B model.</div>
            <div>[${new Date().toISOString()}] INFO: Proactive risk mitigation initiated automatically.</div>
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

    const contentEl = element.firstElementChild;
    const opt = {
      margin: 0.4,
      filename: `era-co_Kritik_Rapor_ID${suggestion.id}.pdf`,
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

  if (suggestion.applied) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-[#A8C69F]/50 bg-[#F0F9F8] p-8 shadow-sm transition-all">
        <div className="absolute left-0 top-0 h-full w-2 bg-[#A8C69F]" />

        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#A8C69F]/30 text-2xl">
            ✨
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-[#2F4F4F] line-through opacity-60">Risk: {suggestion.title}</h3>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 text-xs font-bold text-[#457B9D] hover:text-[#E76F51] transition-colors bg-white px-4 py-2 rounded-full border border-[#A8C69F]/40 hover:border-[#E76F51]/40 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PDF İndir
              </button>
            </div>
            <p className="mt-1 text-[#457B9D] leading-relaxed">
              <span className="font-bold text-[#689B96]">Aksiyon Alındı:</span> {suggestion.action}
            </p>
          </div>
        </div>

        {/* Startup-friendly Execution Report */}
        <div className="bg-white rounded-2xl p-6 border border-[#A8C69F]/30 shadow-inner">
          <h4 className="text-xs font-bold text-[#689B96] uppercase tracking-widest mb-4">Sistem Yürütme Raporu (Execution Log)</h4>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-[#457B9D]">
              <span className="text-[#A8C69F]">✔</span>
              <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">API_CALL</span>
              <span>WMS (Depo Yönetim Sistemi) ile iletişime geçildi. Parametreler güncellendi.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#457B9D]">
              <span className="text-[#A8C69F]">✔</span>
              <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">DATA_SYNC</span>
              <span>Canlı rota ve stok verileri ERP'ye işlendi. <strong className="text-[#2F4F4F]">{suggestion.potential_saving}</strong> garanti altına alındı.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#457B9D]">
              <span className="text-[#A8C69F]">✔</span>
              <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">AI_RLHF</span>
              <span>İnsan onayı alındı. Llama-3 modeli bu eşik değerini (threshold) "Güvenli Optimizasyon" olarak ağırlıklandırdı.</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#E2F1F8] rounded-xl border border-[#B2E2F2]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="text-xs font-bold text-[#457B9D] uppercase tracking-widest mb-1">Takviyeli Öğrenme Başarılı</p>
                <p className="text-sm font-medium text-[#2F4F4F]">Model, sizin kararınızı bir "Ödül Sinyali" (Reward Signal) olarak kaydetti. Benzer durumlarda daha otonom davranacak.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border-[3px] border-[#E5B3BB]/30 bg-[#FDFCF0] p-8 shadow-lg transition-transform ${isApplying ? 'scale-[1.01]' : 'hover:-translate-y-1'}`}>
      {/* Urgent indicator stripe */}
      <div className="absolute left-0 top-0 h-full w-2 bg-[#E76F51]" />

      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#E5B3BB]/20 text-2xl">
          ⚠️
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#2F4F4F]">Tahmini Risk: {suggestion.title}</h3>
          <p className="mt-2 text-[#457B9D] leading-relaxed">
            {suggestion.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 ml-16">
        {!isApplying ? (
          <>
            <button
              onClick={simulateExecution}
              className="flex-1 rounded-[1.5rem] bg-[#E76F51] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#D65D41] hover:shadow-lg"
            >
              Önerilen Aksiyonları Değiştir ve Güncelle
            </button>
            <button
              className="flex-1 rounded-[1.5rem] border-2 border-[#A8C69F] bg-white px-6 py-3 text-sm font-bold text-[#689B96] transition-all hover:bg-[#F0F9F8]"
            >
              Bırak, AI Kendi Çözsün
            </button>
          </>
        ) : (
          <div className="w-full bg-white/50 rounded-2xl p-6 border border-[#E5B3BB]/20">
            <h4 className="text-sm font-bold text-[#2F4F4F] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#E76F51] animate-pulse" />
              AI Uygulama Yol Haritası
            </h4>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#E76F51] before:to-[#A8C69F]">
              {steps.map((step, idx) => {
                const isPast = executionStep > idx;
                const isCurrent = executionStep === idx;
                return (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                      ${isPast ? 'bg-[#A8C69F] border-white' : isCurrent ? 'bg-[#E76F51] border-white animate-pulse' : 'bg-white border-[#E5B3BB]'}`}>
                    </div>
                    <div className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border ${isCurrent ? 'bg-white border-[#E76F51] shadow-md' : 'bg-transparent border-transparent'}`}>
                      <p className={`text-sm font-bold ${isCurrent ? 'text-[#E76F51]' : isPast ? 'text-[#A8C69F]' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-xs text-[#E76F51]/80 mt-1">{step.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
