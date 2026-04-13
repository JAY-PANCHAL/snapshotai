import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ activeSection, onNav }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: 'upload',    label: 'Upload & Analyze' },
    { id: 'templates', label: 'Style Templates' },
    { id: 'samples',   label: 'Sample Prompts' },
    { id: 'studio',    label: '✦ Generate Headshots' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>◆</span>
        <span className={styles.logoText}>SnapShot<span className={styles.logoAI}>AI</span></span>
      </div>

      <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        {links.map(l => (
          <button
            key={l.id}
            className={`${styles.link} ${activeSection === l.id ? styles.active : ''}`}
            onClick={() => { onNav(l.id); setMenuOpen(false); }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button className={styles.ctaBtn} onClick={() => onNav('upload')}>
        Get Started Free
      </button>

      <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>
    </nav>
  );
}
