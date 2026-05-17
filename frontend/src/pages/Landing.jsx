import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import ValueProposition from '../components/ValueProposition';
import kamyonImg from '../images/kamyon.png';

// High-performance, zero-dependency Scroll Reveal component using native IntersectionObserver
function ScrollReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.08, 
        rootMargin: '0px 0px -40px 0px' 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.98]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    title: 'Akıllı Stok Gözetimi',
    description: 'Depolarınızdaki her ürünün hareketini takip edin. AI, sadece sayıları değil, talebin ritmini de anlayarak kritik seviyeleri önceden raporlar.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'bg-[#580F1B]/20 text-white border border-[#580F1B]/35'
  },
  {
    title: 'Hızlı Otonom Rotalar',
    description: 'Teslimat yollarınızı en ideal şekilde optimize edin. Rota engellerini ve stok darboğazlarını daha oluşmadan görerek en verimli yolu bulun.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: 'bg-white/10 text-white border border-white/20'
  },
  {
    title: 'Ajan Destekli Kararlar',
    description: 'NVIDIA Llama zekasıyla donatılmış dijital asistanınız, karmaşık lojistik bulmacalarını saniyeler içinde çözer ve size en iyi yolu gösterir.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'bg-[#580F1B]/20 text-white border border-[#580F1B]/35'
  },
  {
    title: 'Maliyet Optimizasyonu',
    description: 'Gereksiz harcamaları ve zaman kayıplarını en aza indirin. Somut lojistik tasarruf potansiyelinizi her analizde net rakamlarla görün.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'bg-white/10 text-white border border-white/20'
  }
];

export default function Landing() {
  return (
    <div className="bg-[#0A192F] text-slate-200 overflow-x-hidden font-sans">
      {/* Hero Section - Keeps champagne burgundy gradient */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-24 pb-48 text-white"
        style={{ background: 'linear-gradient(to bottom, #580F1B 0%, #35050D 55%, #1C0106 80%, #000000 100%)' }}
      >
        {/* Ambient background glowing light */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-black/40 rounded-full blur-[180px] pointer-events-none animate-pulse delay-1000" />

        {/* Massive Background 3D Text Behind the Truck */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] z-0 w-full select-none pointer-events-none text-center">
          <h2 className="font-montserrat font-black text-[24vw] md:text-[22vw] leading-none tracking-tighter text-white/40 uppercase drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            ERA
          </h2>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto text-center flex flex-col items-center justify-center w-full">
          {/* Badge */}
          <div className="mb-6 float-anim">
            <span className="font-montserrat text-[11px] font-extrabold uppercase tracking-[0.3em] bg-white/10 border border-white/20 px-5 py-2 rounded-full text-white inline-block backdrop-blur-md shadow-lg">
              ERA OTONOM LOJİSTİK SİSTEMLERİ
            </span>
          </div>

          {/* Elegant Artistic Title */}
          <h1 className="text-4xl md:text-7xl font-bold font-montserrat tracking-tight leading-tight max-w-4xl mx-auto mb-8 drop-shadow-md text-white">
            Geleceğin Lojistiği <br />
            <span className="font-serif italic font-normal text-white/95">Otonom Zeka</span> ile Buluşuyor
          </h1>

          {/* Large Truck Image layered in front of the EVA text and in front of the Title */}
          <div className="relative z-10 w-full max-w-[850px] -mt-10 mb-6 transition-all duration-700 ease-out select-none float-anim filter drop-shadow-[0_35px_60px_rgba(0,0,0,0.65)] hover:scale-105">
            <img 
              src={kamyonImg} 
              alt="Era Otonom Lojistik Kamyonu" 
              className="w-full h-auto object-contain pointer-events-none"
            />
          </div>

          {/* Subheading / Description about Eva Project */}
          <div className="max-w-3xl mx-auto mt-6 z-20">
            <p className="text-lg md:text-xl font-serif italic text-white/90 leading-relaxed mb-4">
              "Yapay zekanın proaktif gücü, otonom dağıtım ağlarında kusursuz dengeyi yakalıyor."
            </p>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-white/70 leading-relaxed mb-10 font-normal font-sans">
              Era Projesi; karmaşık lojistik operasyonları, stok darboğazlarını ve dağıtım rotalarını NVIDIA Llama zekasıyla anlık olarak optimize eden geleceğin otonom lojistik ekosistemidir.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 z-20">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-3 rounded-[2rem] bg-white px-10 py-4.5 text-base font-bold transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-[0_5px_0_rgba(255,255,255,0.7)] group font-montserrat"
              style={{ color: '#580F1B' }}
            >
              Maceraya Başla
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a 
              href="#story" 
              className="font-montserrat text-sm font-extrabold uppercase tracking-wider text-white hover:text-white/80 transition-colors flex items-center gap-3 py-3"
            >
              <span className="w-8 h-[2px] bg-white" />
              Hikayemizi Dinle
            </a>
          </div>
        </div>

        {/* Soft elegant transition to Ralph Lauren Navy */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[#0A192F] pointer-events-none" />
      </section>

      {/* Story Section - Ralph Lauren Navy (#0A192F) with glassmorphic cards and no emojis */}
      <section id="story" className="relative pb-40 pt-20 px-6 bg-[#0A192F] text-white -mt-32 z-20">
        {/* Soft background blue glow ambient light */}
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-[#580F1B]/15 rounded-full blur-[100px] pointer-events-none" />

        <ScrollReveal className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Glassmorphic core card */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:border-white/15 transition-all duration-500">
            <span className="font-montserrat text-[11px] font-extrabold uppercase tracking-[0.25em] bg-[#580F1B]/20 border border-[#580F1B]/35 px-4 py-1.5 rounded-full text-white inline-block mb-6 font-montserrat">
              PRESTİJLİ YÖNETİM
            </span>
            
            <h2 className="text-4xl md:text-5xl font-black font-montserrat mb-8 text-white tracking-tight leading-tight">
              Neden Era?
            </h2>
            
            <div className="space-y-6 text-base md:text-lg text-slate-300 leading-relaxed font-sans font-light">
              <p>
                Lojistik sadece kutuları bir yerden bir yere taşımak değildir. Bu bir denge oyunudur. 
                Bir depodaki eksik ürün, bir rotadaki 10 dakikalık gecikme... Hepsi birleşerek büyük bir operasyonel gürültü oluşturur.
              </p>
              <p>
                Biz bu gürültüyü kusursuz bir senfoniye dönüştürüyoruz. Era, NVIDIA Llama'nın eşsiz zekasını kullanarak, 
                verilerinizin içindeki karmaşayı çözer ve size sadece en verimli ve doğru adımları gösterir.
              </p>
            </div>
            
            {/* High-end metrics list - Emoji Free with custom SVGs */}
            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center font-montserrat">
              <div>
                <svg className="w-6 h-6 text-[#580F1B] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                </svg>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">Eşzamanlı</div>
              </div>
              <div>
                <svg className="w-6 h-6 text-[#580F1B] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707" />
                </svg>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">Llama 3.3</div>
              </div>
              <div>
                <svg className="w-6 h-6 text-[#580F1B] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">Anlık Karar</div>
              </div>
            </div>
          </div>

          {/* Premium layered visual side */}
          <div className="relative group">
            {/* Outer red glowing halo */}
            <div className="absolute -inset-4 bg-[#580F1B]/10 rounded-[4.5rem] blur-3xl group-hover:bg-[#580F1B]/15 transition-all duration-700" />
            
            {/* Main Warehouse image */}
            <div className="relative w-full aspect-[4/3] md:aspect-[4/5] rounded-[3.5rem] overflow-hidden border-[8px] border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.55)] transition-all duration-700 group-hover:scale-[1.01] bg-[#0c1d37]">
              <div 
                className="w-full h-full bg-cover bg-center transition-all duration-1000 group-hover:scale-110"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200")' }}
              />
              <div className="absolute inset-0 bg-[#0A192F]/20 group-hover:bg-transparent transition-all duration-700" />
            </div>
            
            {/* Premium Floating Badge */}
            <div className="absolute -bottom-6 -left-6 py-5 px-8 bg-[#0c1d37]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] float-anim">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-white font-bold text-xs uppercase tracking-widest font-montserrat">
                  Live AI Engine Active
                </p>
              </div>
              <p className="text-slate-400 text-[10px] font-medium mt-1 font-sans">
                Mevcut Verimlilik Skoru: %98.4
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features Grid - Ralph Lauren Navy / Slate depth with massive Nixtio display headline */}
      <section className="py-40 px-6 relative bg-[#081325]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F] to-[#081325] opacity-90 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <span className="font-montserrat text-[11px] font-extrabold uppercase tracking-[0.2em] bg-[#580F1B]/20 border border-[#580F1B]/35 px-4 py-1.5 rounded-full text-white inline-block mb-6">
              YETENEKLER
            </span>
            <h2 className="text-5xl md:text-7.5xl font-black font-montserrat tracking-tighter leading-[1.02] text-white mt-4 max-w-5xl mx-auto">
              Otonom Düzen,<br />Yapay Zekanın Gücü
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {FEATURES.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2rem] shadow-lg hover:shadow-2xl hover:scale-105 duration-500 hover:border-[#580F1B]/40 hover:bg-[#580F1B]/5 transition-all h-full flex flex-col">
                  <div className={`w-20 h-20 ${feature.color} rounded-[2rem] flex items-center justify-center mb-8 transition-transform shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-montserrat text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans flex-1">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Changed to Pure White Background with Slate-800 texts */}
      <section id="how-it-works" className="py-40 px-6 bg-white text-slate-800 relative z-10 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold font-montserrat tracking-tight text-black">Yolculuk Nasıl Başlar?</h2>
          </div>
          
          <div className="grid gap-16 relative">
            {/* Connection Line */}
            <div className="absolute left-10 top-0 w-1 h-full bg-dashed bg-gradient-to-b from-[#580F1B] to-transparent opacity-20 hidden md:block" />
            
            {[
              { 
                t: 'Verilerinizi Emanet Edin', 
                d: 'Stok ve rota dosyalarınızı güvenli bir şekilde sisteme yükleyin. Sistemimiz onları bir hikaye gibi okumaya başlar.', 
                i: (
                  <svg className="w-8 h-8 text-[#580F1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ), 
                c: 'bg-white border border-slate-100 hover:border-[#580F1B]/35 hover:shadow-md' 
              },
              { 
                t: 'AI Gözüyle Bakış', 
                d: 'NVIDIA Llama motoru, binlerce satır veri içindeki gizli darboğazları, yavaşlayan rotaları ve maliyet sızıntılarını tespit eder.', 
                i: (
                  <svg className="w-8 h-8 text-[#580F1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ), 
                c: 'bg-[#580F1B]/5 border-l-4 border-l-[#580F1B] border-t-slate-100 border-r-slate-100 border-b-slate-100 shadow-md' 
              },
              { 
                t: 'Huzura Erişin', 
                d: 'Önerileri inceleyin, beklenen tasarrufu görün ve tek bir dokunuşla operasyonunuzu iyileştirin.', 
                i: (
                  <svg className="w-8 h-8 text-[#580F1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                c: 'bg-white border border-slate-100 hover:border-[#580F1B]/35 hover:shadow-md' 
              }
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 200}>
                <div className="flex flex-col md:flex-row gap-12 items-center md:items-start group">
                  <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#580F1B] border-4 border-white text-white flex items-center justify-center font-black text-2xl shadow-xl z-10 transition-transform group-hover:scale-110">
                    {i + 1}
                  </div>
                  <div className={`flex-1 p-10 rounded-[2rem] border transition-all duration-300 ${step.c}`}>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">{step.i}</div>
                      <h3 className="text-2xl font-bold font-montserrat text-black">{step.t}</h3>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed font-serif italic">"{step.d}"</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Premium Solid Pitch Black Style with elegant stardust texture and border */}
      <section className="py-40 px-6 relative overflow-hidden rounded-[4rem] mx-6 mb-20 text-white bg-black border border-white/5">
         <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
         
         <div className="max-w-6xl mx-auto text-center relative z-10">
            <ScrollReveal>
              <h2 className="text-4xl font-bold mb-20 font-serif italic tracking-wide">Rakamlarla Era Etkisi</h2>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
              {[
                { l: 'Verimlilik Artışı', v: '%32+' },
                { l: 'Hatalı Stok Riski', v: '%0.02' },
                { l: 'Rota Tasarrufu', v: '240s/ay' },
                { l: 'AI Analiz Hızı', v: '<60sn' }
              ].map((stat, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="group">
                    <p className="text-5xl md:text-7xl font-black text-white mb-4 transition-transform group-hover:scale-110 group-hover:text-white/90">{stat.v}</p>
                    <p className="text-xs font-bold font-montserrat uppercase tracking-[0.3em] opacity-60">{stat.l}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
         </div>
      </section>

      {/* Competitor & Value Proposition Section - Changed to White Background */}
      <section className="py-20 px-6 bg-white w-full border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <ValueProposition />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA - Rethemed to Ralph Lauren Navy background with Light Yellow text & button, elegance font-serif title */}
      <section className="py-40 px-6 bg-white">
        <ScrollReveal>
          <div 
            className="max-w-5xl mx-auto border text-center p-20 rounded-[2.5rem] relative overflow-hidden shadow-3xl border-none"
            style={{ background: 'linear-gradient(to bottom right, #0A192F, #050E1A)' }}
          >
            <div className="absolute -top-10 -right-10 text-9xl opacity-[0.03] text-white">✨</div>
            <div className="absolute -bottom-10 -left-10 text-9xl opacity-[0.03] text-white">✨</div>
            
            <h2 className="text-5xl md:text-6xl font-normal font-serif italic mb-8 text-[#FEF08A] tracking-tight leading-tight">Operasyonunuzda Yeni Bir Sayfa Açın</h2>
            <p className="text-xl text-[#FEF9C3]/90 mb-12 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
              Huzurlu, verimli ve AI destekli otonom lojistik yönetimi için bugün Era ile tanışın. 
              Karmaşaya veda edin, kusursuz düzene merhaba deyin.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center rounded-[2rem] bg-[#FEF08A] px-16 py-5 text-xl font-bold transition-all hover:bg-[#FEF9C3] hover:scale-105 active:scale-95 shadow-[0_5px_0_rgba(254,240,138,0.4)] font-montserrat"
              style={{ color: '#0A192F' }}
            >
              Ücretsiz Deneyin
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer - Deep Dark Navy */}
      <footer className="py-20 bg-[#061021] border-t border-white/5 text-slate-400">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 items-center gap-12 px-6">
          <div className="text-left">
            <h4 className="font-black text-2xl text-white mb-2 font-serif italic">Era</h4>
            <p className="text-sm opacity-60 italic">"Doğanın dengesi, verinin zekasıyla buluşuyor."</p>
          </div>
          <div className="flex justify-center gap-10 font-bold text-sm uppercase tracking-widest font-montserrat text-slate-300">
             <a href="#" className="hover:text-white transition-colors" style={{ hoverColor: '#580F1B' }}>Gizlilik</a>
             <a href="#" className="hover:text-white transition-colors" style={{ hoverColor: '#580F1B' }}>Destek</a>
             <a href="#" className="hover:text-white transition-colors" style={{ hoverColor: '#580F1B' }}>LinkedIn</a>
          </div>
          <div className="text-right text-xs opacity-50">
            <p>© 2026 Era — Lojistik Sanatı ve Bilimi</p>
            <p className="mt-1 font-montserrat">Hand-crafted for operational excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
