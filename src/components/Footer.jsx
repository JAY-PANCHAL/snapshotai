import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>◆</span>
              <span className={styles.logoText}>SnapShot<span className={styles.logoAI}>AI</span></span>
            </div>
            <p className={styles.tagline}>Professional headshots powered by AI.<br />No photographer needed.</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <p className={styles.linkGroupTitle}>Tools</p>
              <a href="#upload-section" className={styles.link}>Upload & Analyze</a>
              <a href="#templates-section" className={styles.link}>Style Templates</a>
              <a href="#samples-section" className={styles.link}>Sample Prompts</a>
              <a href="#builder-section" className={styles.link}>Prompt Builder</a>
            </div>
            <div className={styles.linkGroup}>
              <p className={styles.linkGroupTitle}>AI Platforms</p>
              <a href="https://midjourney.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Midjourney</a>
              <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className={styles.link}>DALL·E 3</a>
              <a href="https://headshotpro.com" target="_blank" rel="noopener noreferrer" className={styles.link}>HeadshotPro</a>
              <a href="https://betterpic.io" target="_blank" rel="noopener noreferrer" className={styles.link}>BetterPic</a>
            </div>
            <div className={styles.linkGroup}>
              <p className={styles.linkGroupTitle}>Optimize For</p>
              <a href="#" className={styles.link}>LinkedIn Profile</a>
              <a href="#" className={styles.link}>Resume / CV</a>
              <a href="#" className={styles.link}>Company Website</a>
              <a href="#" className={styles.link}>Business Card</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© 2025 SnapShot AI — Built by Mindtech Solutions</p>
          <p className={styles.note}>Your photos are never stored. All analysis is done in real-time and discarded immediately.</p>
        </div>
      </div>
    </footer>
  );
}
