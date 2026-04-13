import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

/* ── Particle canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.35 + 0.06,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className={styles.particles} aria-hidden="true" />;
}

/* ── Counter animation ── */
function AnimatedStat({ n, l }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statN}>{n}</span>
      <span className={styles.statL}>{l}</span>
    </div>
  );
}

export default function Hero({ onGetStarted }) {
  return (
    <section className={styles.hero}>
      <ParticleCanvas />
      <div className={styles.glow} />
      <div className={styles.glow2} />

      {/* Badge */}
      <div className={styles.badge} data-reveal="fade">
        <span className={styles.badgeDot} />
        ◆ AI-Powered Studio Quality Headshots
      </div>

      {/* Title */}
      <h1 className={styles.h1} data-reveal="up-slow">
        Transform any selfie into a<br />
        <em className={styles.italic}>studio-perfect</em> headshot
      </h1>

      <p className={styles.sub} data-reveal>
        Upload your photo, analyze with AI, choose a professional template —
        and get a production-ready prompt for any AI generator. No photographer needed.
      </p>

      {/* CTA */}
      <div className={styles.actions} data-reveal>
        <button className={styles.btnPrimary} onClick={onGetStarted}>
          <span className={styles.btnShine} />
          Upload Your Photo
          <span className={styles.btnArrow}>→</span>
        </button>
        <button
          className={styles.btnOutline}
          onClick={() => document.getElementById('samples-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          See Sample Results
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow} data-stagger data-reveal="fade">
        {[
          { n: '18M+', l: 'Headshots Generated' },
          { n: '200K+', l: 'Professionals' },
          { n: '8',    l: 'Style Templates' },
          { n: '12',   l: 'Background Options' },
          { n: '10',   l: 'Platform Presets' },
        ].map(s => <AnimatedStat key={s.l} {...s} />)}
      </div>

      {/* Platform badges */}
      <div className={styles.platformRow} data-reveal="fade">
        {[
          { name: 'LinkedIn',        color: '#0077b5' },
          { name: 'Resume',          color: '#666' },
          { name: 'Instagram',       color: '#e4405f' },
          { name: 'Upwork',          color: '#14a800' },
          { name: 'Company Website', color: '#4a90d9' },
          { name: 'Email Signature', color: '#888' },
          { name: 'Fiverr',          color: '#1dbf73' },
          { name: 'Business Card',   color: '#c9a84c' },
        ].map(p => (
          <span key={p.name} className={styles.platformBadge}>
            <span className={styles.platformDot} style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
    </section>
  );
}
