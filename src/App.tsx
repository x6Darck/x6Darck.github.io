import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppProvider, useReveal } from './lib/hooks';
import Nav from './components/Nav';
import Hero from './components/Hero';
import GeaChapter from './components/GeaChapter';
import FarmChapter from './components/FarmChapter';
import { About, Contact, Footer, Stack } from './components/Sections';

function Page() {
  useReveal();
  useEffect(() => { const r = () => ScrollTrigger.refresh(); addEventListener('load', r); return () => removeEventListener('load', r); }, []);
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <GeaChapter />
        <FarmChapter />
        <Stack />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
export default function App() { return <AppProvider><Page /></AppProvider>; }
