import { useState } from 'react';
import { SAMPLE_PROMPTS } from '../data/templates';
import { toast } from './Toast';
import styles from './SampleGallery.module.css';

// Realistic placeholder face SVGs using different skin tones and styles
const AVATAR_CONFIGS = [
  { skin: '#c8956c', hair: '#2c1810', shirt: '#1a237e', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { skin: '#f4c896', hair: '#3d2b1f', shirt: '#37474f', bg: 'linear-gradient(135deg, #0f0f14, #1a1a2a)' },
  { skin: '#8d5524', hair: '#1a0a00', shirt: '#4a148c', bg: 'linear-gradient(135deg, #2d1b3d, #1a0a2e)' },
  { skin: '#e8b98c', hair: '#4e342e', shirt: '#e3f2fd', bg: 'linear-gradient(135deg, #e8f4fd, #f0f7ff)' },
  { skin: '#d4956a', hair: '#2c1810', shirt: '#1b5e20', bg: 'linear-gradient(135deg, #1c3a1c, #2d4a2d)' },
  { skin: '#c68642', hair: '#1c1009', shirt: '#212121', bg: 'linear-gradient(135deg, #2a1a08, #3d2a10)' },
];

function HeadshotIllustration({ config, size = 200 }) {
  const { skin, hair, shirt } = config;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Neck */}
      <rect x="84" y="128" width="32" height="28" rx="4" fill={skin} />
      {/* Shoulders / shirt */}
      <ellipse cx="100" cy="175" rx="60" ry="35" fill={shirt} />
      <rect x="40" y="155" width="120" height="45" fill={shirt} />
      {/* Face */}
      <ellipse cx="100" cy="100" rx="42" ry="50" fill={skin} />
      {/* Hair */}
      <ellipse cx="100" cy="64" rx="42" ry="22" fill={hair} />
      <rect x="58" y="64" width="84" height="20" fill={hair} />
      {/* Ears */}
      <ellipse cx="58" cy="105" rx="7" ry="9" fill={skin} />
      <ellipse cx="142" cy="105" rx="7" ry="9" fill={skin} />
      {/* Eyes */}
      <ellipse cx="85" cy="97" rx="7" ry="5" fill="white" />
      <ellipse cx="115" cy="97" rx="7" ry="5" fill="white" />
      <circle cx="87" cy="97" r="3.5" fill="#2c1810" />
      <circle cx="117" cy="97" r="3.5" fill="#2c1810" />
      <circle cx="88" cy="95.5" r="1.2" fill="white" />
      <circle cx="118" cy="95.5" r="1.2" fill="white" />
      {/* Eyebrows */}
      <path d="M79 89 Q86 86 93 89" stroke={hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M107 89 Q114 86 121 89" stroke={hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <path d="M100 102 Q97 112 95 115 Q100 117 105 115 Q103 112 100 102" fill={skin} stroke={skin} strokeWidth="0.5" />
      {/* Mouth — subtle smile */}
      <path d="M90 122 Q100 128 110 122" stroke="#a0685a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M91 122 Q100 126 109 122" stroke={skin} strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function SampleGallery({ onUsePrompt }) {
  const [activeId, setActiveId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copyPrompt = (prompt, id) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    toast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className={styles.wrap} id="samples-section">
      <div className={styles.header} data-reveal>
        <span className={styles.sectionLabel}>Sample Results</span>
        <h2 className={styles.title}>See what's possible</h2>
        <p className={styles.sub}>
          These illustrate the kind of headshots you can generate using our prompts with any AI image generator (Midjourney, DALL·E, Stable Diffusion, etc.)
        </p>
      </div>

      <div className={styles.grid}>
        {SAMPLE_PROMPTS.map((s, i) => {
          const cfg = AVATAR_CONFIGS[i % AVATAR_CONFIGS.length];
          const isActive = activeId === s.id;
          return (
            <div
              key={s.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
            >
              {/* Portrait illustration */}
              <div className={styles.portrait} style={{ background: s.preview_bg }}>
                <div className={styles.portraitInner}>
                  <HeadshotIllustration config={cfg} size={160} />
                </div>
                <div className={styles.lightOverlay} />
                <div className={styles.platformBadge}>{s.platform}</div>
                <div className={styles.qualityBadge}>{s.quality}</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <span className={styles.categoryTag}>{s.category}</span>
                  </div>
                  <div className={styles.styleTags}>
                    {s.style_tags.map(t => (
                      <span key={t} className={styles.styleTag}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Prompt box */}
                <div className={styles.promptBox}>
                  <p className={styles.promptLabel}>AI Prompt</p>
                  <p className={styles.promptText}>
                    {isActive ? s.prompt : s.prompt.slice(0, 100) + '...'}
                  </p>
                  <button
                    className={styles.expandBtn}
                    onClick={() => setActiveId(isActive ? null : s.id)}
                  >
                    {isActive ? 'Show less ↑' : 'Show full prompt ↓'}
                  </button>
                </div>

                {/* Tips */}
                <div className={styles.tips}>
                  <p className={styles.tipsLabel}>📸 Photo tips for best results:</p>
                  <ul className={styles.tipsList}>
                    {s.tips.map(t => <li key={t}>{t}</li>)}
                  </ul>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.copyBtn}
                    onClick={() => copyPrompt(s.prompt, s.id)}
                  >
                    {copiedId === s.id ? '✓ Copied!' : 'Copy Prompt'}
                  </button>
                  <button
                    className={styles.useBtn}
                    onClick={() => onUsePrompt?.(s)}
                  >
                    Use in Builder →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.disclaimer}>
        <p>💡 <strong>Note:</strong> The portraits above are AI-generated illustrations showing style direction. Actual headshots generated with these prompts using tools like Midjourney, DALL·E 3, or Stable Diffusion will look photorealistic — upload your own photo first for best identity-accurate results.</p>
      </div>
    </section>
  );
}
