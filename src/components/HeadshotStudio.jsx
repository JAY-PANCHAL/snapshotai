import { useState, useEffect, useCallback } from 'react';
import { TEMPLATES, BACKGROUNDS } from '../data/templates';
import { buildHeadshotPrompt } from '../utils/imageUtils';
import { toast } from './Toast';
import styles from './HeadshotStudio.module.css';

/* ─── constants ─────────────────────────────────────────────── */
const MOODS = [
  { id: 'confident', label: 'Confident', emoji: '💼', value: 'Confident & approachable' },
  { id: 'warm',      label: 'Warm Smile', emoji: '😊', value: 'Warm friendly smile' },
  { id: 'serious',   label: 'Authoritative', emoji: '🎯', value: 'Serious & authoritative' },
  { id: 'calm',      label: 'Trustworthy', emoji: '🤝', value: 'Calm & trustworthy' },
  { id: 'dynamic',   label: 'Dynamic', emoji: '⚡', value: 'Dynamic & charismatic' },
  { id: 'focused',   label: 'Focused', emoji: '🔍', value: 'Focused & determined' },
];

const PLATFORMS = [
  { id: 'linkedin',  label: 'LinkedIn',   icon: '🔗', value: 'LinkedIn Profile' },
  { id: 'resume',    label: 'Resume / CV', icon: '📄', value: 'Resume / CV' },
  { id: 'website',   label: 'Website',    icon: '🌐', value: 'Company Website' },
  { id: 'social',    label: 'Social Media', icon: '📸', value: 'Instagram / Social' },
  { id: 'speaker',   label: 'Speaker Bio', icon: '🎤', value: 'Speaker Bio / Conference' },
  { id: 'freelance', label: 'Freelance',  icon: '💻', value: 'Upwork / Freelance' },
];

const LIGHTINGS = [
  { id: 'studio',    label: 'Studio',      value: 'Three-point studio lighting' },
  { id: 'natural',   label: 'Natural',     value: 'Soft natural window light' },
  { id: 'dramatic',  label: 'Dramatic',    value: 'Rembrandt dramatic lighting' },
  { id: 'golden',    label: 'Golden Hour', value: 'Golden hour warm light' },
];

const MODELS = [
  { id: 'flux-realism', label: 'Hyper-Realistic', desc: 'Best skin & detail (recommended)' },
  { id: 'flux',         label: 'High Quality',    desc: 'Balanced quality & speed' },
  { id: 'turbo',        label: 'Fast Preview',    desc: 'Quick draft — lower detail' },
];

const SIZES = [
  { label: '1:1 Square',   w: 1024, h: 1024, hint: 'LinkedIn, Instagram',    icon: '⬜' },
  { label: '4:5 Portrait', w: 820,  h: 1024, hint: 'Resume, Upwork',         icon: '▭' },
  { label: '3:4 Classic',  w: 768,  h: 1024, hint: 'Business card, Website', icon: '▯' },
];

const VARIATIONS = 4;

function buildPollinationsUrl(prompt, model, width, height, seed) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&private=true`;
}

async function fetchHeadshotBlob(imageUrl) {
  const proxyUrl = `/api/image?url=${encodeURIComponent(imageUrl)}`;
  const requestUrls = import.meta.env.DEV
    ? [imageUrl, proxyUrl]
    : [proxyUrl, imageUrl];
  let lastError = null;

  for (const requestUrl of requestUrls) {
    try {
      const res = await fetch(requestUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.startsWith('image/')) {
        throw new Error(`Non-image response: ${contentType || 'unknown'}`);
      }
      return await res.blob();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to fetch generated image');
}

/* ─── component ─────────────────────────────────────────────── */
export default function HeadshotStudio({ selectedTemplate, photoData }) {
  // Style settings
  const [template, setTemplate]   = useState(selectedTemplate || null);
  const [mood, setMood]           = useState('confident');
  const [platform, setPlatform]   = useState('linkedin');
  const [lighting, setLighting]   = useState('studio');
  const [background, setBackground] = useState('Neutral grey seamless backdrop');
  const [attire, setAttire]       = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Generation settings
  const [model, setModel]   = useState('flux-realism');
  const [size, setSize]     = useState(SIZES[0]);

  // Generation state
  const [images, setImages]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [seeds, setSeeds]               = useState([]);
  const [selectedImg, setSelectedImg]   = useState(null);
  const [error, setError]               = useState('');
  const [promptPreview, setPromptPreview] = useState('');
  const [showPrompt, setShowPrompt]     = useState(false);

  // Sync when parent changes template
  useEffect(() => {
    if (selectedTemplate) {
      setTemplate(selectedTemplate);
      const matchedLighting = LIGHTINGS.find(l =>
        selectedTemplate.lighting?.toLowerCase().includes(l.id)
      );
      if (matchedLighting) setLighting(matchedLighting.id);
      if (selectedTemplate.attire) setAttire(selectedTemplate.attire);
    }
  }, [selectedTemplate]);

  // Keep prompt preview fresh
  const rebuildPrompt = useCallback(() => {
    const moodObj     = MOODS.find(m => m.id === mood);
    const platformObj = PLATFORMS.find(p => p.id === platform);
    const lightingObj = LIGHTINGS.find(l => l.id === lighting);

    const p = buildHeadshotPrompt({
      template,
      background,
      lighting:  lightingObj?.value || lighting,
      attire:    attire || 'Business professional',
      mood:      moodObj?.value || mood,
      platform:  platformObj?.value || platform,
      quality:   '4K photorealistic',
      extras:    ['Sharp direct eye contact', 'Natural skin texture preserved', 'No AI artifacts'],
      customNotes,
    });
    setPromptPreview(p);
    return p;
  }, [template, mood, platform, lighting, background, attire, customNotes]);

  useEffect(() => { rebuildPrompt(); }, [rebuildPrompt]);

  const randomSeed = () => Math.floor(Math.random() * 9_999_999);

  const generate = async () => {
    setError('');
    setLoading(true);
    setImages([]);
    setSelectedImg(null);

    const prompt = rebuildPrompt();
    const newSeeds = Array.from({ length: VARIATIONS }, randomSeed);
    setSeeds(newSeeds);

    const initStates = {};
    newSeeds.forEach((_, i) => { initStates[i] = 'loading'; });
    setLoadingStates(initStates);

    const results = Array(VARIATIONS).fill(null);
    toast('Generating your headshots…', 'info', 8000);

    await Promise.all(newSeeds.map(async (seed, idx) => {
      const imageUrl = buildPollinationsUrl(prompt, model, size.w, size.h, seed);
      try {
        const blob = await fetchHeadshotBlob(imageUrl);
        const dataUrl = URL.createObjectURL(blob);
        results[idx] = { url: dataUrl, seed, fetchUrl: imageUrl };
        setImages([...results]);
        setLoadingStates(prev => ({ ...prev, [idx]: 'done' }));
      } catch (err) {
        console.error(`Failed to fetch image ${idx}:`, err);
        results[idx] = { error: true, seed };
        setImages([...results]);
        setLoadingStates(prev => ({ ...prev, [idx]: 'error' }));
      }
    }));

    setLoading(false);
    const first = results.find(r => r && !r.error);
    if (first) {
      setSelectedImg(first);
      const count = results.filter(r => r && !r.error).length;
      toast(`${count} headshot${count !== 1 ? 's' : ''} ready — pick your favourite!`, 'success');
    } else {
      setError('Generation failed. Please try again.');
      toast('Generation failed — please retry.', 'error');
    }
  };

  const regenerateOne = async (idx) => {
    const newSeed = randomSeed();
    const newSeeds2 = [...seeds];
    newSeeds2[idx] = newSeed;
    setSeeds(newSeeds2);
    setLoadingStates(prev => ({ ...prev, [idx]: 'loading' }));

    const prompt = rebuildPrompt();
    const imageUrl = buildPollinationsUrl(prompt, model, size.w, size.h, newSeed);
    try {
      const blob = await fetchHeadshotBlob(imageUrl);
      const dataUrl = URL.createObjectURL(blob);
      const updated = [...images];
      updated[idx] = { url: dataUrl, seed: newSeed, fetchUrl: imageUrl };
      setImages(updated);
      setLoadingStates(prev => ({ ...prev, [idx]: 'done' }));
    } catch (err) {
      console.error(`Regenerate failed for ${idx}:`, err);
      setLoadingStates(prev => ({ ...prev, [idx]: 'error' }));
      toast('Retry failed — please try again.', 'error');
    }
  };

  const downloadImage = (img, filename = 'headshot.jpg') => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = filename;
    a.click();
    toast(`Downloading ${filename}…`, 'success');
  };

  /* helper */
  const moodObj     = MOODS.find(m => m.id === mood);
  const platformObj = PLATFORMS.find(p => p.id === platform);

  return (
    <section className={styles.wrap} id="studio-section">
      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.sectionLabel}>✦ Step 3 — Generate</span>
        <h2 className={styles.title}>Create Your AI Headshot</h2>
        <p className={styles.sub}>
          Choose your style, click generate — we'll build the perfect prompt and deliver stunning headshots instantly.
          Powered by <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className={styles.link}>Pollinations.ai</a>
        </p>
      </div>

      <div className={styles.layout}>
        {/* ── Left: Style Config ── */}
        <div className={styles.config}>

          {/* Template Quick-Pick */}
          {TEMPLATES.length > 0 && (
            <div className={styles.section}>
              <label className={styles.sectionTitle}>🎭 Style Template</label>
              <div className={styles.templateGrid}>
                <button
                  className={`${styles.templateCard} ${!template ? styles.templateActive : ''}`}
                  onClick={() => setTemplate(null)}
                >
                  <span className={styles.templateEmoji}>✨</span>
                  <span className={styles.templateName}>Custom</span>
                </button>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    className={`${styles.templateCard} ${template?.id === t.id ? styles.templateActive : ''}`}
                    style={{ '--t-accent': t.accent, '--t-bg': t.bg }}
                    onClick={() => {
                      setTemplate(t);
                      const ml = LIGHTINGS.find(l => t.lighting?.toLowerCase().includes(l.id));
                      if (ml) setLighting(ml.id);
                      if (t.attire) setAttire(t.attire);
                    }}
                  >
                    <span className={styles.templateDot} style={{ background: t.accent }} />
                    <span className={styles.templateName}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Platform */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>🎯 Platform</label>
            <div className={styles.chipGrid}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  className={`${styles.chip} ${platform === p.id ? styles.chipActive : ''}`}
                  onClick={() => setPlatform(p.id)}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>😊 Expression & Mood</label>
            <div className={styles.chipGrid}>
              {MOODS.map(m => (
                <button
                  key={m.id}
                  className={`${styles.chip} ${mood === m.id ? styles.chipActive : ''}`}
                  onClick={() => setMood(m.id)}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>💡 Lighting Style</label>
            <div className={styles.chipGrid}>
              {LIGHTINGS.map(l => (
                <button
                  key={l.id}
                  className={`${styles.chip} ${lighting === l.id ? styles.chipActive : ''}`}
                  onClick={() => setLighting(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>🖼 Background</label>
            <div className={styles.bgGrid}>
              {BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  className={`${styles.bgBtn} ${background.includes(bg.label) ? styles.bgActive : ''}`}
                  onClick={() => setBackground(bg.label + ' background')}
                  title={bg.description}
                >
                  <span
                    className={styles.bgSwatch}
                    style={{ background: bg.gradient || bg.color }}
                  />
                  <span className={styles.bgLabel}>{bg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Attire */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>👔 Attire / Outfit</label>
            <input
              type="text"
              className={styles.textInput}
              value={attire}
              onChange={e => setAttire(e.target.value)}
              placeholder="e.g. Dark navy suit with white shirt"
            />
          </div>

          {/* Custom notes */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>📝 Custom Notes <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="e.g. Short curly hair, slight head tilt, glasses…"
              rows={2}
            />
          </div>

          {/* Advanced: model + size */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>⚙️ AI Model</label>
            <div className={styles.modelGrid}>
              {MODELS.map(m => (
                <button
                  key={m.id}
                  className={`${styles.modelBtn} ${model === m.id ? styles.modelActive : ''}`}
                  onClick={() => setModel(m.id)}
                >
                  <span className={styles.modelName}>{m.label}</span>
                  <span className={styles.modelDesc}>{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.sectionTitle}>📐 Output Size</label>
            <div className={styles.sizeGrid}>
              {SIZES.map(s => (
                <button
                  key={s.label}
                  className={`${styles.sizeBtn} ${size.label === s.label ? styles.sizeActive : ''}`}
                  onClick={() => setSize(s)}
                >
                  <span className={styles.sizeIcon}>{s.icon}</span>
                  <span className={styles.sizeLabel}>{s.label}</span>
                  <span className={styles.sizeHint}>{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt preview (collapsible) */}
          <div className={styles.promptToggleRow}>
            <button
              className={styles.promptToggleBtn}
              onClick={() => setShowPrompt(v => !v)}
            >
              {showPrompt ? '▼' : '▶'} {showPrompt ? 'Hide' : 'Preview'} AI prompt
            </button>
          </div>
          {showPrompt && (
            <div className={styles.promptPreviewBox}>
              <p className={styles.promptPreviewText}>{promptPreview}</p>
              <span className={styles.promptPreviewMeta}>{promptPreview.length} chars</span>
            </div>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* Generate button */}
          <button
            className={`${styles.generateBtn} ${loading ? styles.generating : ''}`}
            onClick={generate}
            disabled={loading}
            data-testid="generate-btn"
          >
            {loading ? (
              <>
                <span className={styles.btnSpinner} />
                Generating {VARIATIONS} headshots…
              </>
            ) : (
              <>✦ Generate My Headshots</>
            )}
          </button>
          <p className={styles.freeNote}>✓ Free &nbsp;·&nbsp; ✓ No signup &nbsp;·&nbsp; ✓ {VARIATIONS} variations &nbsp;·&nbsp; ✓ HD download</p>
        </div>

        {/* ── Right: Results ── */}
        <div className={styles.results}>
          {/* Context summary */}
          <div className={styles.summary}>
            <span className={styles.summaryItem}>{moodObj?.emoji} {moodObj?.label}</span>
            <span className={styles.summaryDot}>·</span>
            <span className={styles.summaryItem}>{platformObj?.icon} {platformObj?.label}</span>
            {template && (
              <>
                <span className={styles.summaryDot}>·</span>
                <span className={styles.summaryItem} style={{ color: template.accent }}>
                  {template.name}
                </span>
              </>
            )}
            {photoData?.analysis && (
              <>
                <span className={styles.summaryDot}>·</span>
                <span className={styles.summaryItem}>📷 Photo score: {photoData.analysis.overallScore}/10</span>
              </>
            )}
          </div>

          {/* Empty state */}
          {images.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect x="10" y="14" width="52" height="44" rx="6" stroke="var(--border-hover)" strokeWidth="1.5" />
                  <circle cx="26" cy="30" r="6" stroke="var(--border-hover)" strokeWidth="1.5" />
                  <path d="M10 47l14-12 9 9 11-13 18 15" stroke="var(--border-hover)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Your AI headshots will appear here</p>
              <p className={styles.emptySub}>Configure your style on the left, then click<br /><strong>Generate My Headshots</strong></p>
              <div className={styles.emptySteps}>
                <span>1. Pick template & mood</span>
                <span>→</span>
                <span>2. Click Generate</span>
                <span>→</span>
                <span>3. Download your favourite</span>
              </div>
            </div>
          )}

          {/* Variation grid */}
          {(images.length > 0 || loading) && (
            <div className={styles.varGrid}>
              {Array.from({ length: VARIATIONS }).map((_, idx) => {
                const img   = images[idx];
                const state = loadingStates[idx];
                return (
                  <div
                    key={idx}
                    className={`${styles.varCard} ${selectedImg?.seed === img?.seed && img?.url ? styles.varSelected : ''}`}
                    onClick={() => img?.url && setSelectedImg(img)}
                  >
                    {state === 'loading' && (
                      <div className={styles.varLoading}>
                        <div className={styles.varSpinner} />
                        <span>Generating…</span>
                      </div>
                    )}
                    {state === 'error' && (
                      <div className={styles.varError}>
                        <span>Failed</span>
                        <button
                          className={styles.retryBtn}
                          onClick={e => { e.stopPropagation(); regenerateOne(idx); }}
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    {state === 'done' && img?.url && (
                      <>
                        <img src={img.url} alt={`Variation ${idx + 1}`} className={styles.varImg} />
                        <div className={styles.varOverlay}>
                          <span className={styles.varNum}>#{idx + 1}</span>
                          <button
                            className={styles.varDlBtn}
                            onClick={e => { e.stopPropagation(); downloadImage(img, `headshot-v${idx + 1}.jpg`); }}
                            title="Download"
                          >
                            ↓ Download
                          </button>
                        </div>
                        {selectedImg?.seed === img.seed && <div className={styles.varCheck}>✓</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected large preview */}
          {selectedImg?.url && (
            <div className={styles.selectedPreview}>
              <div className={styles.previewHeader}>
                <span className={styles.previewTitle}>✦ Selected — Ready to download</span>
                <span className={styles.previewSeed}>seed {selectedImg.seed}</span>
              </div>
              <div className={styles.previewImgWrap}>
                <img src={selectedImg.url} alt="Selected headshot" className={styles.previewImg} />
              </div>
              <div className={styles.previewActions}>
                <button
                  className={styles.dlBtnPrimary}
                  onClick={() => downloadImage(selectedImg, 'headshot-hd.jpg')}
                >
                  ↓ Download HD
                </button>
                <button
                  className={styles.dlBtnSecondary}
                  onClick={() => downloadImage(selectedImg, 'headshot-linkedin.jpg')}
                >
                  ↓ LinkedIn Size
                </button>
              </div>
              <p className={styles.previewNote}>
                💡 For identity-accurate results upload to <a href="https://headshotpro.com" target="_blank" rel="noopener noreferrer">HeadshotPro</a> or use as reference in Midjourney with <code>--iw 1.5</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
