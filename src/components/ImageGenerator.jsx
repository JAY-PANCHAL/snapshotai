import { useState, useRef, useEffect } from 'react';
import { toast } from './Toast';
import styles from './ImageGenerator.module.css';

const MODELS = [
  { id: 'flux', label: 'Flux', desc: 'Best quality — recommended for portraits' },
  { id: 'flux-realism', label: 'Flux Realism', desc: 'Hyper-realistic skin & detail' },
  { id: 'turbo', label: 'Turbo', desc: 'Fastest — good for quick previews' },
];

const SIZES = [
  { label: '1:1 Square', w: 1024, h: 1024, hint: 'LinkedIn, Instagram' },
  { label: '4:5 Portrait', w: 820, h: 1024, hint: 'Resume, Upwork' },
  { label: '3:4 Classic', w: 768, h: 1024, hint: 'Business card, Website' },
  { label: '2:3 Tall', w: 683, h: 1024, hint: 'Speaker bio' },
];

const VARIATIONS = 4;

function buildPollinationsUrl(prompt, model, width, height, seed) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&private=true`;
}

export default function ImageGenerator({ prompt: initialPrompt }) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [model, setModel] = useState('flux-realism');
  const [size, setSize] = useState(SIZES[0]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedImg, setSelectedImg] = useState(null);
  const [seeds, setSeeds] = useState([]);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  // Update prompt if parent sends a new one
  useEffect(() => { if (initialPrompt) setPrompt(initialPrompt); }, [initialPrompt]);

  const randomSeed = () => Math.floor(Math.random() * 9999999);

  const generate = async () => {
    if (!prompt.trim()) { setError('Please enter or generate a prompt first.'); return; }
    setError('');
    setLoading(true);
    setImages([]);
    setSelectedImg(null);

    const newSeeds = Array.from({ length: VARIATIONS }, randomSeed);
    setSeeds(newSeeds);

    const initStates = {};
    newSeeds.forEach((_, i) => { initStates[i] = 'loading'; });
    setLoadingStates(initStates);

    const results = Array(VARIATIONS).fill(null);

    await Promise.all(newSeeds.map(async (seed, idx) => {
      const url = buildPollinationsUrl(prompt, model, size.w, size.h, seed);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const dataUrl = URL.createObjectURL(blob);
        results[idx] = { url: dataUrl, seed, fetchUrl: url };
        setImages([...results]);
        setLoadingStates(prev => ({ ...prev, [idx]: 'done' }));
      } catch (e) {
        results[idx] = { error: true, seed };
        setImages([...results]);
        setLoadingStates(prev => ({ ...prev, [idx]: 'error' }));
      }
    }));

    setLoading(false);
    // auto-select first successful
    const first = results.find(r => r && !r.error);
    if (first) {
      setSelectedImg(first);
      const successCount = results.filter(r => r && !r.error).length;
      toast(`${successCount} headshot${successCount !== 1 ? 's' : ''} generated!`, 'success');
    } else {
      toast('Generation failed — please try again.', 'error');
    }
  };

  const regenerateOne = async (idx) => {
    const newSeed = randomSeed();
    const newSeeds2 = [...seeds];
    newSeeds2[idx] = newSeed;
    setSeeds(newSeeds2);
    setLoadingStates(prev => ({ ...prev, [idx]: 'loading' }));

    const url = buildPollinationsUrl(prompt, model, size.w, size.h, newSeed);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const dataUrl = URL.createObjectURL(blob);
      const updated = [...images];
      updated[idx] = { url: dataUrl, seed: newSeed, fetchUrl: url };
      setImages(updated);
      setLoadingStates(prev => ({ ...prev, [idx]: 'done' }));
    } catch {
      setLoadingStates(prev => ({ ...prev, [idx]: 'error' }));
    }
  };

  const downloadImage = async (img, filename = 'headshot.jpg') => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = filename;
    a.click();
    toast(`Downloading ${filename}…`, 'success');
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast('Prompt copied!', 'success');
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast('Image URL copied!', 'info');
  };

  return (
    <section className={styles.wrap} id="generator-section">
      <div className={styles.header}>
        <span className={styles.sectionLabel}>✦ Step 4 — Generate</span>
        <h2 className={styles.title}>Generate Your Headshot</h2>
        <p className={styles.sub}>
          Powered by <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className={styles.link}>Pollinations.ai</a> — 100% free, no account needed. Uses Flux AI for photorealistic portraits.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Controls */}
        <div className={styles.controls}>

          {/* Prompt */}
          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>Your Prompt</label>
              <button className={styles.copyPromptBtn} onClick={copyPrompt}>Copy</button>
            </div>
            <textarea
              className={styles.promptArea}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={6}
              placeholder="Your prompt will appear here after using the Prompt Builder above, or type/paste any prompt..."
            />
            <p className={styles.promptHint}>
              {prompt.length} chars · Tip: more detail = better result
            </p>
          </div>

          {/* Model */}
          <div className={styles.field}>
            <label className={styles.label}>AI Model</label>
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

          {/* Size */}
          <div className={styles.field}>
            <label className={styles.label}>Output Size</label>
            <div className={styles.sizeGrid}>
              {SIZES.map(s => (
                <button
                  key={s.label}
                  className={`${styles.sizeBtn} ${size.label === s.label ? styles.sizeActive : ''}`}
                  onClick={() => setSize(s)}
                >
                  <span className={styles.sizeLabel}>{s.label}</span>
                  <span className={styles.sizeHint}>{s.hint}</span>
                  <span className={styles.sizePx}>{s.w}×{s.h}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            className={`${styles.generateBtn} ${loading ? styles.generating : ''}`}
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.btnSpinner} />
                Generating {VARIATIONS} variations...
              </>
            ) : (
              <>✦ Generate {VARIATIONS} Headshot Variations</>
            )}
          </button>

          <p className={styles.freeNote}>
            ✓ Free · ✓ No signup · ✓ {VARIATIONS} variations per generate · ✓ HD download
          </p>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {images.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="12" width="48" height="40" rx="4" stroke="var(--border-hover)" strokeWidth="1.5" />
                  <circle cx="22" cy="26" r="5" stroke="var(--border-hover)" strokeWidth="1.5" />
                  <path d="M8 42l12-10 8 8 10-12 18 14" stroke="var(--border-hover)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Your headshots will appear here</p>
              <p className={styles.emptySub}>Configure the prompt and click Generate — {VARIATIONS} variations will be created in parallel</p>
            </div>
          )}

          {/* Variation grid */}
          {(images.length > 0 || loading) && (
            <div className={styles.varGrid}>
              {Array.from({ length: VARIATIONS }).map((_, idx) => {
                const img = images[idx];
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
                        <button className={styles.retryBtn} onClick={e => { e.stopPropagation(); regenerateOne(idx); }}>Retry</button>
                      </div>
                    )}
                    {state === 'done' && img?.url && (
                      <>
                        <img src={img.url} alt={`Variation ${idx + 1}`} className={styles.varImg} />
                        <div className={styles.varOverlay}>
                          <span className={styles.varNum}>#{idx + 1}</span>
                          <div className={styles.varActions}>
                            <button className={styles.varBtn} onClick={e => { e.stopPropagation(); downloadImage(img, `headshot-v${idx + 1}.jpg`); }} title="Download">↓</button>
                            <button className={styles.varBtn} onClick={e => { e.stopPropagation(); regenerateOne(idx); }} title="Regenerate">↺</button>
                          </div>
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
                <span className={styles.previewTitle}>Selected — Ready to download</span>
                <span className={styles.previewSeed}>seed: {selectedImg.seed}</span>
              </div>
              <div className={styles.previewImgWrap}>
                <img src={selectedImg.url} alt="Selected headshot" className={styles.previewImg} />
              </div>
              <div className={styles.previewActions}>
                <button className={styles.dlBtn} onClick={() => downloadImage(selectedImg, 'headshot-hd.jpg')}>
                  ↓ Download HD
                </button>
                <button className={styles.dlBtnOutline} onClick={() => downloadImage(selectedImg, 'headshot-linkedin.jpg')}>
                  ↓ LinkedIn Size
                </button>
                <button className={styles.dlBtnOutline} onClick={() => copyImageUrl(selectedImg.fetchUrl)}>
                  Copy Image URL
                </button>
              </div>
              <p className={styles.previewNote}>
                💡 For best results: use this as reference in Midjourney with <code>--iw 1.5</code> or upload to HeadshotPro for identity-accurate rendering
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
