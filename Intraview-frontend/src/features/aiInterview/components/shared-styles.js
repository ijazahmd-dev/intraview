// Shared CSS for all AI interview components — import as a string and inject via <style>
export const AI_INTERVIEW_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  /* ── Variables ──────────────────────────── */
  :root {
    --iv-bg:           #05090f;
    --iv-bg-2:         #080e18;
    --iv-bg-3:         #0c1424;
    --iv-bg-4:         #111d31;
    --iv-teal:         #14b8a6;
    --iv-teal-lt:      #2dd4bf;
    --iv-teal-dk:      #0d9488;
    --iv-teal-glow:    rgba(20,184,166,0.18);
    --iv-teal-ring:    rgba(20,184,166,0.30);
    --iv-border:       rgba(255,255,255,0.06);
    --iv-border-teal:  rgba(20,184,166,0.22);
    --iv-border-live:  rgba(20,184,166,0.50);
    --iv-text:         #dce8f0;
    --iv-text-2:       #7a9ab5;
    --iv-text-3:       #3d5269;
    --iv-green:        #22c55e;
    --iv-red:          #ef4444;
    --iv-amber:        #f59e0b;
    --ff-tech:         'Oxanium', monospace;
    --ff-body:         'DM Sans', sans-serif;
  }

  /* ── Global base ────────────────────────── */
  .iv-root {
    font-family: var(--ff-body);
    background: var(--iv-bg);
    color: var(--iv-text);
    min-height: 100vh;
  }

  /* ── Background dot grid ────────────────── */
  .iv-dot-grid::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(rgba(20,184,166,0.035) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Keyframes ──────────────────────────── */
  @keyframes iv-pulse-ring {
    0%   { transform: scale(1);    opacity: 0.7; }
    100% { transform: scale(1.8);  opacity: 0;   }
  }
  @keyframes iv-breathe {
    0%, 100% { box-shadow: 0 0 0   0px rgba(20,184,166,0); }
    50%       { box-shadow: 0 0 48px 8px rgba(20,184,166,0.18); }
  }
  @keyframes iv-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes iv-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes iv-slide-right {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes iv-orbit {
    from { transform: rotate(0deg)   translateX(32px) rotate(0deg);   }
    to   { transform: rotate(360deg) translateX(32px) rotate(-360deg);}
  }
  @keyframes iv-orbit-slow {
    from { transform: rotate(0deg)   translateX(48px) rotate(0deg);   }
    to   { transform: rotate(-360deg) translateX(48px) rotate(360deg);}
  }
  @keyframes iv-ripple {
    0%   { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(3); opacity: 0;   }
  }
  @keyframes iv-eq-bar {
    0%, 100% { height: 6px;  }
    50%       { height: 20px; }
  }
  @keyframes iv-blink-live {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes iv-scan {
    0%   { top: -2px; }
    100% { top: 100%; }
  }
  @keyframes iv-typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
    40%           { transform: scale(1);   opacity: 1; }
  }

  /* ── Utility animations ─────────────────── */
  .iv-fade-up     { animation: iv-fade-up 0.5s ease both; }
  .iv-fade-up-d1  { animation-delay: 0.08s; }
  .iv-fade-up-d2  { animation-delay: 0.16s; }
  .iv-fade-up-d3  { animation-delay: 0.24s; }
  .iv-fade-in     { animation: iv-fade-in 0.4s ease both; }
  .iv-slide-right { animation: iv-slide-right 0.4s ease both; }

  /* ── Avatar breathe (live) ──────────────── */
  .iv-avatar-breathing { animation: iv-breathe 3s ease-in-out infinite; }

  /* ── Equalizer bars (audio indicator) ───── */
  .iv-eq { display: flex; align-items: flex-end; gap: 2px; height: 20px; }
  .iv-eq-bar {
    width: 3px; background: var(--iv-teal); border-radius: 2px;
    animation: iv-eq-bar 0.8s ease-in-out infinite;
  }
  .iv-eq-bar:nth-child(2) { animation-delay: 0.12s; }
  .iv-eq-bar:nth-child(3) { animation-delay: 0.24s; }
  .iv-eq-bar:nth-child(4) { animation-delay: 0.36s; }
  .iv-eq-bar:nth-child(5) { animation-delay: 0.48s; }

  /* ── Scan line overlay ──────────────────── */
  .iv-scanline-wrap { position: relative; overflow: hidden; }
  .iv-scanline-wrap::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(20,184,166,0.25), transparent);
    animation: iv-scan 4s linear infinite;
    pointer-events: none;
    z-index: 5;
  }

  /* ── Typing dots ────────────────────────── */
  .iv-typing-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--iv-teal); display: inline-block;
    animation: iv-typing 1.2s ease-in-out infinite;
  }
  .iv-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .iv-typing-dot:nth-child(3) { animation-delay: 0.4s; }

  /* ── Cards ──────────────────────────────── */
  .iv-card {
    background: var(--iv-bg-3);
    border: 1px solid var(--iv-border);
    border-radius: 16px;
  }
  .iv-card-teal {
    background: var(--iv-bg-3);
    border: 1px solid var(--iv-border-teal);
    border-radius: 16px;
  }
  .iv-glass {
    background: rgba(12, 20, 36, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--iv-border);
    border-radius: 16px;
  }

  /* ── Scrollbar ──────────────────────────── */
  .iv-scrollbar::-webkit-scrollbar { width: 4px; }
  .iv-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .iv-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(20,184,166,0.25);
    border-radius: 99px;
  }
`;