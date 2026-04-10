import { useState, useEffect } from 'react';
import { TEMPLATES, BACKGROUNDS } from '../data/templates';
import { buildHeadshotPrompt } from '../utils/imageUtils';
import { usePromptGeneration } from '../utils/claudeApi';
import styles from './PromptBuilder.module.css';

const EXTRAS = [
  'Natural skin texture preserved',
  'Sharp direct eye contact',
  'Hair detail preserved',
  'Glasses-friendly rendering',
  'Beard/facial hair accurate',
  'Subtle professional makeup',
  'Skin retouching (minimal)',
  'No AI artifacts',
  'Teeth visible in smile',
  'Freckles/marks preserved',
];

const MOODS = [
  'Confident & approachable',
  'Warm friendly smile',
  'Serious & authoritative',
  'Calm & trustworthy',
  'Dynamic & charismatic',
  'Empathetic & warm',
  'Focused & determined',
  'Relaxed & genuine',
];

const LIGHTINGS = [
  'Soft natural window light',
  'Three-point studio lighting',
  'Rembrandt dramatic lighting',
  'High-key bright & even',
  'Low-key moody & contrasty',
  'Golden hour warm light',
  'Ring light — clean catchlights',
  'Split lighting — half shadow',
];

const PLATFORMS = [
  'LinkedIn Profile',
  'Resume / CV',
  'Company Website',
  'Instagram / Social',
  'Upwork / Freelance',
  'Email Signature',
  'Business Card',
  'Speaker Bio / Conference',
  'YouTube Channel Art',
  'Podcast Cover',
];

const QUALITIES = [
  '4K photorealistic',
  '2K HD — web optimized',
  'Print-ready high resolution',
  'Social media optimized',
];

export default function PromptBuilder({ selectedTemplate, photoData, prefillPrompt }) {
  const [template, setTemplate] = useState(selectedTemplate || null);
  const [background, setBackground] = useState('Neutral grey seamless backdrop');
  const [lighting, setLighting] = useState('Three-point studio lighting');
  const [attire, setAttire] = useState('Business professional');
  const [mood, setMood] = useState('Confident & approachable');
  const [platform, setPlatform] = useState('LinkedIn Profile');
  const [quality, setQuality] = useState('4K photorealistic');
  const [extras, setExtras] = useState(['Sharp direct eye contact', 'Natural skin texture preserved']);
  const [customNotes, setCustomNotes] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);

  const { generatedPrompt, generateEnhancedPrompt } = usePromptGeneration();

  useEffect(() => {
    if (selectedTemplate) {
      setTemplate(selectedTemplate);
      setLighting(selectedTemplate.lighting);
      setAttire(selectedTemplate.attire);
      setMood(selectedTemplate.mood);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (prefillPrompt) setFinalPrompt(prefillPrompt.prompt);
  }, [prefillPrompt]);

  useEffect(() => {
    buildFinalPrompt();
  }, [template, background, lighting, attire, mood, platform, quality, extras, customNotes]);

  function buildFinalPrompt() {
    const prompt = buildHeadshotPrompt({
      template,
      background,
      lighting,
      attire,
      mood,
      platform,
      quality,
      extras,
      customNotes,
    });
    setFinalPrompt(prompt);
  }

  const toggleExtra = (ex) => {
    setExtras(prev =>
      prev.includes(ex) ? prev.filter(e => e !== ex) : [...prev, ex]
    );
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiEnhance = async () => {
    setAiEnhancing(true);
    const enhanced = await generateEnhancedPrompt(finalPrompt, photoData?.analysis);
    if (enhanced) setFinalPrompt(enhanced);
    setAiEnhancing(false);
  };

  const resetToTemplate = () => {
    if (!template) return;
    setLighting(template.lighting);
    setAttire(template.attire);
    setMood(template.mood);
  };

  return (
    <div className={styles.wrap} id="builder-section">
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Step 3</span>
        <h2 className={styles.title}>Build Your Master Prompt</h2>
        <p className={styles.sub}>Fine-tune every parameter and generate a production-ready prompt for any AI image platform</p>
      </div>

      <div className={styles.layout}>
        {/* Controls */}
        <div className={styles.controls}>

          {/* Template quick-pick */}
          <div className={styles.section}>
            <label className={styles.label}>Base Template</label>
            <div className={styles.templatePicker}>
              <select
                className={styles.select}
                value={template?.id || ''}
                onChange={e => {
                  const t = TEMPLATES.find(t => t.id === e.target.value);
                  setTemplate(t || null);
                  if (t) { setLighting(t.lighting); setAttire(t.attire); setMood(t.mood); }
                }}
              >
                <option value="">— No template —</option>
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {template && (
                <button className={styles.resetBtn} onClick={resetToTemplate} title="Reset to template defaults">↺</button>
              )}
            </div>
          </div>

          <div className={styles.row2}>
            {/* Platform */}
            <div className={styles.section}>
              <label className={styles.label}>Platform Target</label>
              <select className={styles.select} value={platform} onChange={e => setPlatform(e.target.value)}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Quality */}
            <div className={styles.section}>
              <label className={styles.label}>Output Quality</label>
              <select className={styles.select} value={quality} onChange={e => setQuality(e.target.value)}>
                {QUALITIES.map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.row2}>
            {/* Lighting */}
            <div className={styles.section}>
              <label className={styles.label}>Lighting Style</label>
              <select className={styles.select} value={lighting} onChange={e => setLighting(e.target.value)}>
                {LIGHTINGS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Mood */}
            <div className={styles.section}>
              <label className={styles.label}>Expression & Mood</label>
              <select className={styles.select} value={mood} onChange={e => setMood(e.target.value)}>
                {MOODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Background */}
          <div className={styles.section}>
            <label className={styles.label}>Background</label>
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
            <label className={styles.label}>Attire / Outfit</label>
            <input
              type="text"
              className={styles.input}
              value={attire}
              onChange={e => setAttire(e.target.value)}
              placeholder="e.g. Dark navy suit with white shirt"
            />
          </div>

          {/* Extras */}
          <div className={styles.section}>
            <label className={styles.label}>Enhancements</label>
            <div className={styles.extrasGrid}>
              {EXTRAS.map(ex => (
                <button
                  key={ex}
                  className={`${styles.extraBtn} ${extras.includes(ex) ? styles.extraActive : ''}`}
                  onClick={() => toggleExtra(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Custom notes */}
          <div className={styles.section}>
            <label className={styles.label}>Custom Notes (optional)</label>
            <textarea
              className={styles.textarea}
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="Any specific requirements, e.g. 'subject has short curly hair' or 'slight head tilt to the right'"
              rows={3}
            />
          </div>
        </div>

        {/* Output panel */}
        <div className={styles.outputPanel}>
          <div className={styles.outputHeader}>
            <span className={styles.outputTitle}>Generated Prompt</span>
            {template && (
              <span className={styles.templateBadge}>{template.name}</span>
            )}
          </div>

          {/* Photo context */}
          {photoData?.analysis && (
            <div className={styles.photoContext}>
              <p className={styles.photoContextTitle}>📷 Based on your photo analysis:</p>
              <div className={styles.photoContextRow}>
                <span>Framing: <strong>{photoData.analysis.framing}</strong></span>
                <span>Lighting: <strong>{photoData.analysis.lighting}</strong></span>
                <span>Score: <strong>{photoData.analysis.overallScore}/10</strong></span>
              </div>
            </div>
          )}

          {/* Prompt text */}
          <div className={styles.promptBox}>
            <textarea
              className={styles.promptTextarea}
              value={finalPrompt}
              onChange={e => setFinalPrompt(e.target.value)}
              rows={10}
              spellCheck={false}
            />
            <div className={styles.promptMeta}>
              <span>{finalPrompt.length} characters</span>
              <span>{finalPrompt.split(' ').filter(Boolean).length} words</span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.outputActions}>
            <button
              className={`${styles.aiBtn} ${aiEnhancing ? styles.aiLoading : ''}`}
              onClick={handleAiEnhance}
              disabled={aiEnhancing}
            >
              {aiEnhancing ? '✦ Enhancing...' : '✦ AI Enhance Prompt'}
            </button>
            <button className={styles.copyBtn} onClick={copyPrompt}>
              {copied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
          </div>

          {/* Where to use */}
          <div className={styles.whereToUse}>
            <p className={styles.whereTitle}>Use this prompt with:</p>
            <div className={styles.wherePlatforms}>
              {[
                { name: 'Midjourney', url: 'https://midjourney.com', hint: '/imagine' },
                { name: 'DALL·E 3', url: 'https://chat.openai.com', hint: 'ChatGPT' },
                { name: 'Stable Diffusion', url: 'https://stability.ai', hint: 'SDXL' },
                { name: 'Adobe Firefly', url: 'https://firefly.adobe.com', hint: 'Free' },
                { name: 'HeadshotPro', url: 'https://headshotpro.com', hint: 'Dedicated' },
                { name: 'BetterPic', url: 'https://betterpic.io', hint: 'Dedicated' },
              ].map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={styles.whereItem}>
                  <span className={styles.whereName}>{p.name}</span>
                  <span className={styles.whereHint}>{p.hint}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
