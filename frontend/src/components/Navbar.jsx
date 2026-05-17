import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoeva from '../images/logoeva.jpg';

export default function Navbar() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHome]);

  // Determine classes dynamically
  const isTransparent = isHome && !scrolled;

  const headerClass = isTransparent
    ? 'sticky top-0 z-50 transition-all duration-300 bg-transparent border-b border-transparent text-white'
    : 'sticky top-0 z-50 transition-all duration-300 border-b border-intercom-gray-200 bg-white/90 backdrop-blur-md text-intercom-black shadow-sm';

  const logoBoxClass = isTransparent
    ? 'flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold shadow-sm overflow-hidden'
    : 'flex h-8 w-8 items-center justify-center rounded-lg bg-[#580F1B] text-sm font-bold text-white overflow-hidden';

  const logoTextClass = isTransparent
    ? 'text-lg font-bold tracking-tight text-white font-montserrat'
    : 'text-lg font-semibold tracking-tight text-intercom-black font-montserrat';

  const navLinkClass = isTransparent
    ? 'text-sm text-white/80 hover:text-white transition-colors font-medium font-montserrat'
    : 'text-sm text-intercom-gray-500 hover:text-intercom-black transition-colors font-medium font-montserrat';

  const dashboardBtnClass = isTransparent
    ? 'inline-flex items-center justify-center rounded-[1.2rem] bg-white px-5 py-2 text-xs font-bold transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-[0_3px_0_rgba(255,255,255,0.7)] font-montserrat'
    : 'inline-flex items-center justify-center rounded-[1.2rem] bg-[#580F1B] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#3d0b13] hover:scale-105 active:scale-95 shadow-[0_3px_0_#3d0b13] font-montserrat';

  const homeBtnClass = 'inline-flex items-center justify-center rounded-[1.2rem] border-2 border-[#580F1B] bg-white px-5 py-2 text-xs font-bold text-[#580F1B] transition-all hover:bg-[#580F1B]/5 hover:scale-105 active:scale-95 font-montserrat';

  const logoBoxStyle = isTransparent ? { color: '#580F1B' } : {};
  const dashboardBtnStyle = isTransparent ? { color: '#580F1B' } : {};

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className={logoBoxClass} style={logoBoxStyle}>
            <img src={logoeva} alt="Era Logo" className="w-full h-full object-cover" />
          </span>
          <span className={logoTextClass}>Era</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#features" className={navLinkClass}>
            Özellikler
          </a>
          <a href="/#how-it-works" className={navLinkClass}>
            Nasıl Çalışır
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!isDashboard && (
            <Link to="/dashboard" className={dashboardBtnClass} style={dashboardBtnStyle}>
              Dashboard&apos;a Git
            </Link>
          )}
          {isDashboard && (
            <Link to="/" className={homeBtnClass}>
              Ana Sayfa
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
