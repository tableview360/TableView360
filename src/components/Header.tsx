import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/productos' },
    { name: 'About', href: '/nosotros' },
    { name: 'Contact', href: '/contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-b border-slate-400/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 no-underline text-slate-50"
        >
          <span className="text-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
            ◈
          </span>
          <span className="text-2xl font-bold tracking-tight">
            TableView
            <span className="bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              360
            </span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-slate-300 no-underline text-[0.95rem] font-medium transition-colors duration-200 hover:text-slate-50"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/register"
            className="text-slate-300 no-underline text-[0.95rem] font-medium transition-colors duration-200 hover:text-slate-50 border border-slate-600 px-4 py-2 rounded-lg hover:border-slate-500"
          >
            Sign Up
          </a>
          <a
            href="/demo"
            className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white px-5 py-2.5 rounded-lg no-underline font-semibold text-sm shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]"
          >
            Try Demo
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-slate-50 rounded-sm transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-slate-50 rounded-sm transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-slate-50 rounded-sm transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="flex md:hidden flex-col px-6 py-4 pb-6 gap-2 border-t border-slate-400/10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/register"
            className="text-slate-300 no-underline py-3 text-base font-medium border border-slate-600 rounded-lg text-center hover:text-slate-50 transition-colors"
          >
            Sign Up
          </a>
          <a
            href="/demo"
            className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white py-3.5 rounded-lg no-underline font-semibold text-center mt-2"
          >
            Try Demo
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
