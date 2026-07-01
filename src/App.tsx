import React, { useState, useEffect, useRef } from 'react';
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

  // Carousel state for tracking user exploration of the static screenshots portfolio
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    // Vertex Shader Source
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader Source
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
          return a + b*cos( 6.28318*(c*t+d) );
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 p = -1.0 + 2.0 * uv;
          p.x *= u_resolution.x / u_resolution.y;

          float t = u_time * 0.05;

          // Extremely subtle offset based on mouse position
          vec2 mouseOffset = (u_mouse - 0.5) * 0.2;

          // Domain warping for organic, fluid-like liquid waves
          for(int i = 1; i < 4; i++) {
              float fi = float(i);
              p.x += 0.3 / fi * sin(fi * 2.0 * p.y + t + fi * 1.2 + mouseOffset.x * 2.0) + 0.05;
              p.y += 0.3 / fi * cos(fi * 2.0 * p.x + t + fi * 1.8 + mouseOffset.y * 2.0) + 0.08;
          }

          // A gorgeous, highly visible yet soft pastel palette of lavenders, rose-golds, and pale sky blues
          vec3 a = vec3(0.68, 0.78, 0.90); 
          vec3 b = vec3(0.32, 0.22, 0.15); 
          vec3 c = vec3(0.8, 0.8, 0.8);    
          vec3 d = vec3(0.1, 0.2, 0.3);    

          float value = 0.5 + 0.5 * sin(p.x + p.y + t);
          vec3 col = palette(value, a, b, c, d);

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Helper to compile shaders
    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Setup a rectangle that covers the entire canvas
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    // Track mouse coordinates for subtle reactivity
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = 1.0 - (e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let startTime = Date.now();

    function resize() {
      if (!canvas || !gl) return;
      const displayWidth = canvas.clientWidth || window.innerWidth;
      const displayHeight = canvas.clientHeight || window.innerHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    function render() {
      if (!gl) return;
      resize();

      const elapsedSeconds = (Date.now() - startTime) / 1000.0;
      gl.uniform2f(resolutionLoc, canvas!.width, canvas!.height);
      gl.uniform1f(timeLoc, elapsedSeconds);

      // Smooth interpolation (lerp) for fluid cursor tracking
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;
      gl.uniform2f(mouseLoc, currentMouseX, currentMouseY);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Clean up
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

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
      
      {/* Background canvas for shader preview animation */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45 z-0" 
      />

      {/* Decorative top blurred background light patterns */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[400px] bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="w-full z-40 px-6 py-4 md:py-6 shrink-0 relative">
        <div className="max-w-full mx-auto flex items-center justify-between">
          
          {/* Brand Logo with exact styling */}
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

          {/* Center Pill Menu - exactly matched to reference image */}
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

