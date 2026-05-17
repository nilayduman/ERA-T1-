import React, { useState } from 'react';

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

  if (suggestion.applied) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-[#A8C69F]/50 bg-[#F0F9F8] p-8 shadow-sm transition-all">
        <div className="absolute left-0 top-0 h-full w-2 bg-[#A8C69F]" />

        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#A8C69F]/30 text-2xl">
            ✨
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2F4F4F] line-through opacity-60">Risk: {suggestion.title}</h3>
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
