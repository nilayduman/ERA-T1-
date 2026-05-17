import React from 'react';

const COMPARISON_METRICS = [
  {
    title: "Stok + Rota Ortak Optimizasyonu",
    era: "Bütünleşik Sinerji (Eşzamanlı)",
    competitorBi: "Sadece Rota (Envanterden Bağımsız)",
    competitorManual: "Bağlantısız Süreç",
    description: "Depodaki envanter seviyesi ve günlük talep durumuna göre teslimat rotalarının anlık güncellenmesi.",
    eraStrength: "100%",
  },
  {
    title: "Aktif Lojistik Ajanı (Copilot)",
    era: "Proaktif Copilot (Doğal Dil / Omni Search)",
    competitorBi: "Statik Raporlama & Filtreleme",
    competitorManual: "Rapor Yok",
    description: "Sözel komutlarla veri analizi yapabilme ve yapay zeka ajanının proaktif aksiyon kartları sunması.",
    eraStrength: "98%",
  },
  {
    title: "Süreç Uyumluluk Madenciliği",
    era: "Mevcut (Conformance Checking)",
    competitorBi: "Mevcut Değil (Sadece Rota İzleme)",
    competitorManual: "Takip Yok",
    description: "Şirket lojistik kuralları ve ideal süreçler ile gerçek operasyon akışı arasındaki sapmaları yakalama.",
    eraStrength: "95%",
  },
  {
    title: "Darboğaz Tespit Hızı",
    era: "1.2 Saniye (Anlık)",
    competitorBi: "Manuel Analiz (Saatler/Günler)",
    competitorManual: "Geç Rapor (Haftalar)",
    description: "Operasyonel kriz, envanter eksiği ve geciken sevkiyatların sistem tarafından yakalanma hızı.",
    eraStrength: "96%",
  },
  {
    title: "Operasyonel Maliyet Tasarrufu",
    era: "%28.4 Ortalama Tasarruf",
    competitorBi: "%6.5 Maksimum Tasarruf",
    competitorManual: "%0 (Kayıp)",
    description: "Akıllı sevkiyat birleştirme, dinamik rotalama ve önleyici stok aktarımıyla sağlanan net kazanç.",
    eraStrength: "92%",
  },
];

export default function ValueProposition() {
  return (
    <div className="rounded-[2.5rem] border border-slate-150 bg-white p-8 md:p-10 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-black flex items-center gap-2 font-montserrat">
            Era Rekabet & Değer Önerisi Analizi (ROI)
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">Geleneksel ERP, rota optimizasyon araçları (VRP) ve manuel yöntemlere karşı Era'nın kanıtlanmış lojistik başarı metrikleri.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#580F1B]/10 px-4 py-1.5 text-xs font-bold text-[#580F1B] border border-[#580F1B]/20 self-start md:self-center font-montserrat shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#580F1B] animate-pulse" /> Era Verimlilik Katsayısı: 4.8x
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
        <table className="w-full border-collapse text-left text-sm text-slate-500">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 font-montserrat">
            <tr>
              <th scope="col" className="px-6 py-4">Değerlendirme Kriteri</th>
              <th scope="col" className="px-6 py-4 bg-[#580F1B]/5 text-[#580F1B] font-extrabold">Era AI Hub</th>
              <th scope="col" className="px-6 py-4">Geleneksel BI/ERP</th>
              <th scope="col" className="px-6 py-4">Manuel Süreçler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 border-t border-slate-100 font-sans">
            {COMPARISON_METRICS.map((metric, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-800 text-sm font-montserrat">{metric.title}</div>
                  <div className="text-xs text-slate-400 mt-1.5 font-medium max-w-xs leading-relaxed">{metric.description}</div>
                </td>
                <td className="px-6 py-5 bg-[#580F1B]/5 font-extrabold text-[#580F1B]">
                  <div className="flex items-center gap-2">
                    <span>{metric.era}</span>
                    <span className="inline-flex items-center rounded bg-[#580F1B]/10 px-2 py-0.5 text-[9px] font-bold text-[#580F1B] tracking-widest uppercase">
                      EN İYİ
                    </span>
                  </div>
                  {/* Progress bar to visually represent strength */}
                  <div className="mt-2.5 h-1.5 w-24 overflow-hidden rounded-full bg-[#580F1B]/10">
                    <div className="h-full bg-[#580F1B]" style={{ width: metric.eraStrength }} />
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-700 font-semibold">{metric.competitorBi}</td>
                <td className="px-6 py-5 text-slate-500 font-medium">{metric.competitorManual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 font-montserrat">
        <div
          className="rounded-[2rem] p-6 text-white border border-[#580F1B]/20 shadow-md transition-all hover:scale-[1.02] duration-300"
          style={{ background: 'linear-gradient(to bottom right, #250307 0%, #000000 100%)' }}
        >
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Depo Kayıp Önleme Oranı</div>
          <div className="text-3xl font-black mt-2 text-[#FF3333]">%99.8</div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-sans font-medium">Önleyici tahminleme algoritmalarımız sayesinde depolar arası fire ve tedarik gecikmelerinde mutlak azalma.</p>
        </div>
        <div
          className="rounded-[2rem] p-6 text-white border border-[#580F1B]/20 shadow-md transition-all hover:scale-[1.02] duration-300"
          style={{ background: 'linear-gradient(to bottom right, #250307 0%, #000000 100%)' }}
        >
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Sunucu Tepki Hızı (API)</div>
          <div className="text-3xl font-black mt-2 text-white">12ms</div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-sans font-medium">FastAPI asenkron veritabanı altyapımız sayesinde operasyonel sorgularda sıfır gecikme.</p>
        </div>
        <div
          className="rounded-[2rem] p-6 text-white border border-[#580F1B]/20 shadow-md transition-all hover:scale-[1.02] duration-300"
          style={{ background: 'linear-gradient(to bottom right, #250307 0%, #000000 100%)' }}
        >
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ortalama Kar Artışı</div>
          <div className="text-3xl font-black mt-2 text-[#FF3333]">+%22.4</div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-sans font-medium">Gereksiz rotaların elenmesi ve optimize edilen dağıtım maliyetlerinin doğrudan kârlılığa yansıması.</p>
        </div>
      </div>
    </div>
  );
}
