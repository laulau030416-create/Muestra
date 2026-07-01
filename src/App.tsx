import React, { useState } from 'react';
import { webScreenshots } from './data';
import { WebScreenshot } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

// Minimalist skeleton and image fade-in component for carousel items
function CarouselImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="w-full h-full relative bg-slate-100">
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600/60 rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover object-top select-none pointer-events-none transition-opacity duration-700 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState<string>('Inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Animated transitions variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="h-screen max-h-screen min-h-screen overflow-hidden bg-gradient-to-b from-[#94b3e3] via-[#cbd5e1] to-[#f8fafc] text-slate-900 font-sans relative flex flex-col justify-between select-none">
      
      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80"></div>
        
        {/* Animated glowing orbs (ondas de luces) */}
        <motion.div 
          animate={{ 
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-blue-300/40 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 50, 0],
            y: [0, 40, -40, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-1/4 w-[500px] h-[400px] bg-indigo-300/30 rounded-full blur-3xl" 
        />
      </div>

      {/* HEADER NAVBAR */}
      <header className="w-full z-40 px-6 py-4 md:py-6 shrink-0 relative">
        <div className="max-w-full mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex flex-col select-none" id="brand-logo">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-3xl tracking-tight text-slate-900">
                icanti
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block animate-pulse"></span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold -mt-1 font-mono">
              agencia digital
            </span>
          </div>

          {/* Center Pill Menu */}
          <nav className="hidden lg:flex items-center bg-black text-slate-300 rounded-full p-1 shadow-2xl border border-white/10" id="nav-pill">
            <button
              onClick={() => setActiveNav('Inicio')}
              className={`px-6 py-2 text-xs font-semibold rounded-full tracking-wide transition-all ${
                activeNav === 'Inicio' 
                  ? 'bg-white text-slate-950 font-bold' 
                  : 'hover:text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveNav('Servicios')}
              className={`px-6 py-2 text-xs font-semibold rounded-full tracking-wide transition-all ${
                activeNav === 'Servicios' 
                  ? 'bg-white text-slate-950 font-bold' 
                  : 'hover:text-white'
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setActiveNav('Portafolio')}
              className={`px-6 py-2 text-xs font-semibold rounded-full tracking-wide transition-all ${
                activeNav === 'Portafolio' 
                  ? 'bg-white text-slate-950 font-bold' 
                  : 'hover:text-white'
              }`}
            >
              Portafolio
            </button>
            <button
              onClick={() => setActiveNav('Contacto')}
              className={`px-6 py-2 text-xs font-semibold rounded-full tracking-wide transition-all ${
                activeNav === 'Contacto' 
                  ? 'bg-white text-slate-950 font-bold' 
                  : 'hover:text-white'
              }`}
            >
              Contacto
            </button>
          </nav>

          {/* Right Pill CTA button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveNav('Contacto')}
              className="hidden lg:block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-full shadow-lg hover:shadow-blue-500/10 transition-all select-none border border-blue-500/20"
              id="cta-navbar-btn"
            >
              Solicita una consulta Gratuita
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-900 bg-white/90 backdrop-blur-xs rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute top-20 left-4 right-4 bg-black text-white rounded-2xl p-5 shadow-2xl border border-white/10 z-50 flex flex-col gap-3 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {['Inicio', 'Servicios', 'Portafolio', 'Contacto'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveNav(label);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                      activeNav === label 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-3">
                <button
                  onClick={() => {
                    setActiveNav('Contacto');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs"
                >
                  Solicita una consulta Gratuita
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CORE HERO SECTION CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center py-4 md:py-6 text-center select-none shrink relative z-10">
        
        {/* Full width container layout with flexible padding */}
        <div className="w-full px-6 md:px-12 flex flex-col items-center gap-4 md:gap-6 my-auto">
          
          {/* Main H1 Title - Styled in exact Inter regular 149px with word-by-word fade-in up motion */}
          <motion.h1 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-sans font-normal tracking-tight leading-[1.05] text-center text-slate-900 select-none text-[3.2rem] sm:text-[5.5rem] md:text-[7.5rem] lg:text-[9.3125rem]"
            id="hero-title"
          >
            <motion.span variants={wordVariants} className="inline-block">Creamos</motion.span>{' '}
            <motion.span variants={wordVariants} className="inline-block text-[#344c7d] font-sans font-normal">
              Experiencias
            </motion.span>{' '}
            <motion.span variants={wordVariants} className="inline-block">Digitales</motion.span>
          </motion.h1>

          {/* Subheading with exact phrases in bold as reference, subtle fade-in */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-700 font-sans tracking-wide max-w-3xl leading-relaxed select-none"
          >
            Impulsa <span className="font-extrabold text-slate-900">tus ventas</span> con soluciones personalizadas <span className="font-extrabold text-slate-900 font-sans">adaptadas a tu negocio.</span>
          </motion.p>

        </div>

      </main>

      {/* FULL WIDTH HORIZONTAL CAROUSEL OF HIGH FIDELITY WEB SCREENSHOTS */}
      <section 
        id="carousel-section" 
        className="w-full shrink-0 overflow-hidden relative z-10"
      >
        {/* Horizontal track featuring exact 24px (gap-[24px]) spacing, sitting completely flush at the bottom */}
        <div className="w-full overflow-hidden pt-2 pb-0 flex relative" id="web-screenshots-carousel">
          <motion.div 
            className="flex gap-[24px] w-max pr-[24px] select-none"
            animate={{ x: [0, "-50%"] }}
            transition={{
              ease: "linear",
              duration: 55, // speed of the scroll made significantly slower
              repeat: Infinity,
            }}
          >
            {/* Double the array to have a seamless transition */}
            {[...webScreenshots, ...webScreenshots].map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className="w-[280px] sm:w-[380px] md:w-[460px] h-[190px] sm:h-[230px] md:h-[260px] shrink-0 bg-white rounded-t-2xl overflow-hidden shadow-2xl border-t border-x border-slate-200/50 relative"
              >
                {/* Simulated high-fidelity web screenshot matching the exact order - strictly static, no hover or overlays */}
                <div className="w-full h-full relative overflow-hidden bg-slate-50">
                  <CarouselImage src={item.imagePath} alt={item.title} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
