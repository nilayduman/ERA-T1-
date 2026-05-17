import React from 'react';

export default function TrainLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-xl max-w-xl mx-auto">

      {/* Hand-drawn/Vector Logistics Highway Frame */}
      <div className="relative w-full max-w-lg h-44 bg-gradient-to-b from-[#0A192F] to-[#081325] rounded-[2.5rem] border-[4px] border-[#0A192F] shadow-2xl overflow-hidden mb-8">

        {/* Ambient Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />

        {/* PARALLAX LAYER 1: Cloud SVGs (Emoji Free!) */}
        <div className="absolute top-4 left-0 w-[200%] flex animate-[cloudMove_24s_linear_infinite] opacity-25 pointer-events-none z-10">
          <div className="w-1/2 flex justify-around">
            {/* Cloud 1 */}
            <svg className="w-10 h-6 text-white/50 fill-current" viewBox="0 0 24 16">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
            {/* Cloud 2 */}
            <svg className="w-8 h-5 text-white/50 fill-current mt-4" viewBox="0 0 24 16">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </div>
          <div className="w-1/2 flex justify-around">
            <svg className="w-10 h-6 text-white/50 fill-current" viewBox="0 0 24 16">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
            <svg className="w-8 h-5 text-white/50 fill-current mt-4" viewBox="0 0 24 16">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </div>
        </div>

        {/* PARALLAX LAYER 2: Live Animated Route Networks / Highway Paths in Background */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 500 176" fill="none">
            {/* Winding Highway Line 1 */}
            <path
              d="M-50,60 C120,20 200,100 350,30 C450,-10 500,80 600,60"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8,8"
              className="animate-[dataPulse_8s_linear_infinite]"
            />
            {/* Winding Highway Line 2 */}
            <path
              d="M-30,120 C100,80 180,20 320,110 C420,160 480,90 550,110"
              stroke="#580F1B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8,8"
              className="animate-[dataPulseReverse_10s_linear_infinite]"
            />
          </svg>
        </div>

        {/* Endless Looping Road Container */}
        <div className="absolute bottom-6 left-0 w-full h-10 bg-[#1A1A24] border-y-[3px] border-[#0A192F] overflow-hidden z-20 flex flex-col justify-center">
          {/* Running centerline striping */}
          <div
            className="w-full h-1 bg-[linear-gradient(to_right,white_20px,transparent_20px)] bg-[size:40px_100%] animate-[roadMove_0.8s_linear_infinite]"
          />
        </div>

        {/* Dynamic Looping Truck (Kamyon) with rotating wheels */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end z-30 animate-[truckBob_1.2s_ease-in-out_infinite]">

          {/* High-end European cab-over truck cabin and cargo semi-trailer */}
          <div className="relative flex items-end drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">

            {/* Premium Semi Cargo Container (White branded with Golden & Red stripes) */}
            <div className="w-28 h-16 bg-white rounded-l-lg border-y-[3.5px] border-l-[3.5px] border-white relative z-10 -mr-[4px] flex items-center justify-center overflow-hidden">
              {/* Gold/Red speed vectors */}
              <div className="absolute left-0 bottom-2 w-full h-1 bg-gradient-to-r from-[#580F1B] via-amber-500 to-transparent opacity-80" />
              <div className="absolute left-0 bottom-4 w-full h-0.5 bg-gradient-to-r from-[#580F1B] to-transparent opacity-65" />

              {/* ERA brand text */}
              <span className="font-montserrat font-black text-sm text-[#0A192F] tracking-widest uppercase">
                ERA
              </span>
            </div>

            {/* Sleek Cabin Cab (Era Burgundy Red cab & Dark glass wind deflector) */}
            <div className="w-13 h-14 bg-[#580F1B] rounded-r-2xl border-[3.5px] border-white relative overflow-hidden z-20 flex flex-col justify-between">
              {/* Windshield */}
              <div className="w-9 h-5 bg-[#DCEFF6] border-b-2 border-l-2 border-white rounded-bl-md relative overflow-hidden ml-1">
                <div className="absolute top-0 right-0 w-3 h-full bg-white/40 skew-x-12" /> {/* Windshield Glare */}
              </div>
              {/* Grill/Bumper detailing */}
              <div className="w-10 h-3 bg-black/60 border-t border-white/20 self-end flex items-center justify-end pr-1">
                <span className="w-2.5 h-1.5 bg-yellow-300 rounded-sm shadow-md animate-pulse" /> {/* Headlight */}
              </div>
            </div>

            {/* Front Bumper hook */}
            <div className="absolute -bottom-0.5 right-[-2.5px] w-2.5 h-3 bg-slate-800 border-r-2 border-t-2 border-white rounded-tr-sm -z-10" />
          </div>

          {/* Rotating Truck Wheels (Endless spinning) */}
          <div className="absolute -bottom-2.5 left-0 w-full flex justify-between px-4 z-40">
            {/* Trailer Wheel 1 */}
            <div className="w-6 h-6 rounded-full border-[3px] border-slate-900 bg-slate-700 flex items-center justify-center animate-[spinWheel_0.6s_linear_infinite] shadow-md">
              <div className="w-1 h-3 bg-white/80 rounded-full" />
              <div className="absolute w-2 h-2 bg-slate-900 rounded-full" />
            </div>
            {/* Trailer Wheel 2 */}
            <div className="w-6 h-6 rounded-full border-[3px] border-slate-900 bg-slate-700 flex items-center justify-center animate-[spinWheel_0.6s_linear_infinite] shadow-md -ml-2">
              <div className="w-1 h-3 bg-white/80 rounded-full" />
              <div className="absolute w-2 h-2 bg-slate-900 rounded-full" />
            </div>

            {/* Cab Front Wheel */}
            <div className="w-6 h-6 rounded-full border-[3px] border-slate-900 bg-slate-700 flex items-center justify-center animate-[spinWheel_0.6s_linear_infinite] shadow-md mr-1">
              <div className="w-1 h-3 bg-white/80 rounded-full" />
              <div className="absolute w-2 h-2 bg-slate-900 rounded-full" />
            </div>
          </div>

        </div>

        {/* Exhaust exhaust/smoke rings (Minimalist clean SVGs) */}
        <div className="absolute bottom-16 left-[22%] w-10 h-8 z-0 pointer-events-none">
          <div className="absolute w-4 h-4 bg-white/20 rounded-full blur-[2px] animate-[exhaustSmoke_2s_ease-out_infinite]" style={{ animationDelay: '0s' }} />
          <div className="absolute w-5 h-5 bg-white/10 rounded-full blur-[3px] animate-[exhaustSmoke_2s_ease-out_infinite]" style={{ animationDelay: '0.6s' }} />
          <div className="absolute w-3 h-3 bg-white/15 rounded-full blur-[1px] animate-[exhaustSmoke_2s_ease-out_infinite]" style={{ animationDelay: '1.2s' }} />
        </div>

      </div>

      {/* Modern High-End Loading Text */}
      <h3 className="text-xl font-bold text-[#0A192F] font-montserrat tracking-tight mb-2">Yapay Zeka & Rota Optimizasyonu Aktif...</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-sans font-medium">
        NVIDIA Llama zekası operasyonel verilerinizi analiz ediyor, en karlı stok dağıtımlarını ve teslimat rotalarını çiziyor.
      </p>

      {/* Inline styles for Infinite motion & Parallax clouds/routes */}
      <style>{`
        @keyframes cloudMove {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes dataPulse {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes dataPulseReverse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 200; }
        }
        @keyframes roadMove {
          from { background-position-x: 0px; }
          to { background-position-x: -40px; }
        }
        @keyframes truckBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.8px); }
        }
        @keyframes spinWheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes exhaustSmoke {
          0% { transform: scale(0.3) translate(0, 0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { transform: scale(1.6) translate(-30px, -25px); opacity: 0.1; }
          100% { transform: scale(2) translate(-45px, -35px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
