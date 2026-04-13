import { useState, useEffect } from 'react';
import Navbar           from './components/Navbar';
import StepProgress     from './components/StepProgress';
import Hero             from './components/Hero';
import PhotoUploader    from './components/PhotoUploader';
import TemplateSelector from './components/TemplateSelector';
import SampleGallery    from './components/SampleGallery';
import HeadshotStudio   from './components/HeadshotStudio';
import PricingPage      from './components/PricingPage';
import Footer           from './components/Footer';
import { ToastProvider } from './components/Toast';
import './App.css';

const SECTION_IDS = ['upload', 'templates', 'samples', 'studio', 'pricing'];

function useActiveSection() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const observers = SECTION_IDS.map(id => {
      const el = document.getElementById(`${id}-section`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return [active, setActive];
}

function useRevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal], [data-stagger]');
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', 'true');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

export default function App() {
  const [activeSection, setActiveSection] = useActiveSection();
  const [photoData, setPhotoData]               = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useRevealObserver();

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`${id}-section`) || document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTimeout(() => scrollTo('studio'), 300);
  };

  // When a sample prompt is used, map it to a template match if possible
  const handleUseSamplePrompt = () => {
    setTimeout(() => scrollTo('studio'), 300);
  };

  return (
    <ToastProvider>
      <div className="app">
        <Navbar activeSection={activeSection} onNav={scrollTo} />
        <StepProgress activeSection={activeSection} onNav={scrollTo} />
        <Hero onGetStarted={() => scrollTo('upload')} />

        <PhotoUploader onPhotoReady={setPhotoData} />

        <TemplateSelector
          selected={selectedTemplate}
          onSelect={handleTemplateSelect}
          photoAnalysis={photoData?.analysis}
        />

        <SampleGallery onUsePrompt={handleUseSamplePrompt} />

        <HeadshotStudio
          selectedTemplate={selectedTemplate}
          photoData={photoData}
        />

        <PricingPage />

        <Footer />
      </div>
    </ToastProvider>
  );
}
