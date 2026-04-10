import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PhotoUploader from './components/PhotoUploader';
import TemplateSelector from './components/TemplateSelector';
import SampleGallery from './components/SampleGallery';
import PromptBuilder from './components/PromptBuilder';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [photoData, setPhotoData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [prefillPrompt, setPrefillPrompt] = useState(null);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id + '-section') || document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePhotoReady = (data) => {
    setPhotoData(data);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTimeout(() => scrollTo('builder'), 300);
  };

  const handleUseSamplePrompt = (sample) => {
    setPrefillPrompt(sample);
    setTimeout(() => scrollTo('builder'), 300);
  };

  return (
    <div className="app">
      <Navbar activeSection={activeSection} onNav={scrollTo} />
      <Hero onGetStarted={() => scrollTo('upload')} />
      <PhotoUploader onPhotoReady={handlePhotoReady} />
      <TemplateSelector
        selected={selectedTemplate}
        onSelect={handleTemplateSelect}
        photoAnalysis={photoData?.analysis}
      />
      <SampleGallery onUsePrompt={handleUseSamplePrompt} />
      <PromptBuilder
        selectedTemplate={selectedTemplate}
        photoData={photoData}
        prefillPrompt={prefillPrompt}
      />
      <Footer />
    </div>
  );
}
