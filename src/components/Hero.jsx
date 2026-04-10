import styles from './Hero.module.css';

export default function Hero({ onGetStarted }) {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} />

      <div className={styles.badge}>
        ◆ AI-Powered Studio Quality Headshots
      </div>

      <h1 className={styles.h1}>
        Transform any selfie into a<br />
        <em className={styles.italic}>studio-perfect</em> headshot
      </h1>

      <p className={styles.sub}>
        Upload your photo, analyze with AI, choose a professional template —
        and get a production-ready prompt for any AI generator. No photographer needed.
      </p>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onGetStarted}>
          Upload Your Photo
        </button>
        <button className={styles.btnOutline} onClick={() => document.getElementById('samples-section')?.scrollIntoView({ behavior: 'smooth' })}>
          See Sample Results
        </button>
      </div>

      <div className={styles.statsRow}>
        {[
          { n: '18M+', l: 'Headshots Generated' },
          { n: '200K+', l: 'Professionals' },
          { n: '8', l: 'Style Templates' },
          { n: '12', l: 'Background Options' },
          { n: '10', l: 'Platform Presets' },
        ].map(s => (
          <div key={s.l} className={styles.stat}>
            <span className={styles.statN}>{s.n}</span>
            <span className={styles.statL}>{s.l}</span>
          </div>
        ))}
      </div>

      <div className={styles.platformRow}>
        {[
          { name: 'LinkedIn', color: '#0077b5' },
          { name: 'Resume', color: '#555' },
          { name: 'Instagram', color: '#e4405f' },
          { name: 'Upwork', color: '#14a800' },
          { name: 'Company Website', color: '#4a90d9' },
          { name: 'Email Signature', color: '#888' },
          { name: 'Fiverr', color: '#1dbf73' },
          { name: 'Business Card', color: '#c9a84c' },
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
