import styles from './StepProgress.module.css';

const STEPS = [
  { id: 'upload',    num: 1, label: 'Upload Photo',   icon: '↑' },
  { id: 'templates', num: 2, label: 'Choose Style',   icon: '◈' },
  { id: 'studio',    num: 3, label: 'Generate',       icon: '✦' },
];

export default function StepProgress({ activeSection, onNav }) {
  const activeIdx = STEPS.findIndex(s => s.id === activeSection);

  return (
    <div className={styles.wrap} role="navigation" aria-label="Workflow steps">
      <div className={styles.inner}>
        {STEPS.map((step, i) => {
          const done    = i < activeIdx;
          const current = i === activeIdx;
          return (
            <div key={step.id} className={styles.stepWrapper}>
              <button
                className={`${styles.step} ${done ? styles.done : ''} ${current ? styles.current : ''}`}
                onClick={() => onNav(step.id)}
                aria-current={current ? 'step' : undefined}
              >
                <div className={styles.circle}>
                  {done ? <span className={styles.checkmark}>✓</span> : <span className={styles.icon}>{step.icon}</span>}
                  {current && <div className={styles.pulse} />}
                </div>
                <span className={styles.label}>{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`${styles.connector} ${done ? styles.connectorDone : ''}`}>
                  <div className={`${styles.connectorFill} ${done ? styles.connectorFillDone : ''}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
