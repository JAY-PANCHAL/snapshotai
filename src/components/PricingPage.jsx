import { useState } from 'react';
import styles from './PricingPage.module.css';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      desc: 'Perfect for individuals',
      price: billingCycle === 'monthly' ? 9 : 79,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save 27%' : null,
      features: [
        '20 AI headshots per month',
        '4 style templates',
        'Standard quality (1024×1024)',
        'Basic backgrounds (5)',
        'Email support',
        'Commercial rights',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      desc: 'For job seekers & freelancers',
      price: billingCycle === 'monthly' ? 29 : 261,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save 25%' : null,
      features: [
        '100 AI headshots per month',
        'All 8 style templates',
        'Premium quality (1536×1536)',
        'All backgrounds (12)',
        'Advanced mood & lighting options',
        'Priority support',
        'Bulk download (ZIP)',
        'LinkedIn optimization',
      ],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      desc: 'For teams & companies',
      price: 'Custom',
      period: '',
      savings: null,
      features: [
        'Unlimited headshots',
        'Team management (multi-user)',
        'White-label option',
        'Custom backgrounds & templates',
        'Advanced analytics & reporting',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Phone support',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const competitors = [
    { name: 'HeadshotPro', price: '$29', headshots: '40', quality: '1024×1024', support: 'Email' },
    { name: 'BetterPic', price: '$35', headshots: '20', quality: '4K', support: 'Email' },
    { name: 'Aragon AI', price: '$19.99/mo', headshots: 'Unlimited', quality: '1024×1024', support: 'Email' },
    { name: 'SnapShot AI', price: '$9/mo', headshots: '20/mo', quality: '1536×1536', support: 'Priority', highlight: true },
  ];

  const faqs = [
    {
      q: 'Can I use the headshots for LinkedIn & resume?',
      a: 'Yes! All plans include commercial rights. You can use headshots on LinkedIn, resumes, company websites, and more.',
    },
    {
      q: 'What if I don\'t like the generated headshots?',
      a: 'You can regenerate variations unlimited times within your monthly quota. No additional cost for retries.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes, cancel anytime with no long-term contracts. Month-to-month or annual billing available.',
    },
    {
      q: 'Do you keep my photos?',
      a: 'No. Your photos are analyzed in real-time and discarded immediately. We never store personal images.',
    },
    {
      q: 'What\'s included in "commercial rights"?',
      a: 'You can use generated headshots for personal & business use (LinkedIn, websites, portfolios, etc.). No reselling of images.',
    },
    {
      q: 'Can I upgrade/downgrade mid-month?',
      a: 'Yes! Change plans anytime. We\'ll pro-rate your subscription.',
    },
  ];

  return (
    <section className={styles.wrap} id="pricing-section">
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Simple, Transparent Pricing</h1>
        <p className={styles.sub}>
          Professional AI headshots at a fraction of traditional photography costs.
          <br />All plans include unlimited style options, mood customization, and full commercial rights.
        </p>

        {/* Billing toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.active : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Annual
            <span className={styles.badge}>Save 25%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className={styles.cardsGrid}>
        {plans.map(plan => (
          <div key={plan.id} className={`${styles.card} ${plan.highlighted ? styles.highlighted : ''}`}>
            {plan.highlighted && <div className={styles.ribbon}>Most Popular</div>}

            <div className={styles.cardHead}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDesc}>{plan.desc}</p>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.price}>
                {typeof plan.price === 'number' && <span className={styles.currency}>$</span>}
                <span className={styles.amount}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              {plan.savings && <span className={styles.savingsBadge}>{plan.savings}</span>}
            </div>

            <button className={`${styles.cta} ${plan.highlighted ? styles.ctaPrimary : ''}`}>
              {plan.cta}
            </button>

            <div className={styles.features}>
              {plan.features.map((feature, i) => (
                <div key={i} className={styles.feature}>
                  <span className={styles.checkmark}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div className={styles.comparison}>
        <h2 className={styles.comparisonTitle}>How SnapShot AI Compares</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Starting Price</th>
                <th>Headshots</th>
                <th>Quality</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(comp => (
                <tr key={comp.name} className={comp.highlight ? styles.highlight : ''}>
                  <td className={styles.provider}>
                    {comp.name}
                    {comp.highlight && <span className={styles.badge2}>Our App</span>}
                  </td>
                  <td>{comp.price}</td>
                  <td>{comp.headshots}</td>
                  <td>{comp.quality}</td>
                  <td>{comp.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {faqs.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <h4 className={styles.faqQ}>{faq.q}</h4>
              <p className={styles.faqA}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to transform your professional image?</h2>
        <p className={styles.ctaSub}>Start generating stunning headshots in minutes — no photographer needed.</p>
        <button className={styles.ctaBig}>Get Started Free</button>
        <p className={styles.ctaNote}>7-day free trial. No credit card required.</p>
      </div>
    </section>
  );
}
