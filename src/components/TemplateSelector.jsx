import { useState } from 'react';
import { TEMPLATES } from '../data/templates';
import styles from './TemplateSelector.module.css';

export default function TemplateSelector({ selected, onSelect, photoAnalysis }) {
  const [hoveredId, setHoveredId] = useState(null);
  const categories = ['All', ...new Set(TEMPLATES.map(t => t.category))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className={styles.wrap} id="templates-section">
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Step 2</span>
        <h2 className={styles.title}>Choose Your Style Template</h2>
        <p className={styles.sub}>8 professionally designed templates optimized for different industries and platforms</p>
      </div>

      {/* Category filter */}
      <div className={styles.catRow}>
        {categories.map(c => (
          <button
            key={c}
            className={`${styles.catBtn} ${activeCategory === c ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map(t => (
          <div
            key={t.id}
            className={`${styles.card} ${selected?.id === t.id ? styles.cardSelected : ''}`}
            onClick={() => onSelect(t)}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Visual preview */}
            <div className={styles.cardVisual} style={{ background: t.gradient }}>
              {/* Simulated portrait silhouette */}
              <div className={styles.silhouette}>
                <div className={styles.silHead} style={{ borderColor: t.accent + '44', background: t.accent + '22' }} />
                <div className={styles.silBody} style={{ background: t.accent + '18' }} />
              </div>
              {/* Lighting sim */}
              <div className={styles.lightSim} style={{ background: `radial-gradient(ellipse at 30% 40%, ${t.accent}33 0%, transparent 60%)` }} />
              {/* Category badge */}
              <span className={styles.catBadge}>{t.category}</span>
              {selected?.id === t.id && <span className={styles.selectedBadge}>✓ Selected</span>}
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{t.name}</h3>
              <p className={styles.cardDesc}>{t.description}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>💡 {t.lighting}</span>
                <span className={styles.metaItem}>👔 {t.attire.split(',')[0]}</span>
              </div>

              <div className={styles.tagRow}>
                {t.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            {(hoveredId === t.id || selected?.id === t.id) && (
              <div className={styles.promptPreview}>
                <p className={styles.promptPreviewLabel}>Prompt preview:</p>
                <p className={styles.promptPreviewText}>{t.prompt.slice(0, 120)}…</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.selectedInfo}>
          <div className={styles.selectedLeft}>
            <span className={styles.selectedCheck}>✓</span>
            <div>
              <p className={styles.selectedName}>{selected.name} selected</p>
              <p className={styles.selectedMood}>Mood: {selected.mood}</p>
            </div>
          </div>
          <button className={styles.continueBtn} onClick={() => document.getElementById('builder-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Continue to Prompt Builder →
          </button>
        </div>
      )}
    </div>
  );
}
