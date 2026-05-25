import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import AiAssistant from './components/shared/AiAssistant';

// Desktop Performance: Code Splitting with React.lazy
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const Corporate = lazy(() => import('./pages/Corporate'));
const Contact = lazy(() => import('./pages/Contact'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const WebDesign = lazy(() => import('./pages/WebDesign'));
const ErpSystems = lazy(() => import('./pages/ErpSystems'));
const AiSolutions = lazy(() => import('./pages/AiSolutions'));
const Terms = lazy(() => import('./pages/Terms'));
const Legal = lazy(() => import('./pages/Legal'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const Login = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
    <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    // Desktop Performance: Delay non-critical tracking
    window.addEventListener('load', () => {
        fetch('/api/track.php', { method: 'POST' }).catch(e => console.error(e));
    });

    fetch('/api/settings.php')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.primary_color) document.documentElement.style.setProperty('--primary', data.primary_color);
        if (data.secondary_color) document.documentElement.style.setProperty('--secondary', data.secondary_color);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <HelmetProvider>
      <Router basename="/">
        <ScrollToTop />
        <div className="app-container">
          <Navbar settings={settings} />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home settings={settings} />} />
              <Route path="/bakimda" element={<ComingSoon settings={settings} />} />
              <Route path="/hakkimizda" element={<About settings={settings} />} />
              <Route path="/projelerimiz" element={<Projects settings={settings} />} />
              <Route path="/kurumsal" element={<Corporate settings={settings} />} />
              <Route path="/iletisim" element={<Contact settings={settings} />} />
              <Route path="/blog" element={<Blogs settings={settings} />} />
              <Route path="/blog/:slug" element={<BlogDetail settings={settings} />} />
              <Route path="/hizmetler/web-tasarim" element={<WebDesign settings={settings} />} />
              <Route path="/hizmetler/erp-sistemleri" element={<ErpSystems settings={settings} />} />
              <Route path="/hizmetler/yapay-zeka" element={<AiSolutions settings={settings} />} />
              <Route path="/hizmet-sartlari" element={<Terms settings={settings} />} />
              <Route path="/sozlesmeler" element={<Legal settings={settings} />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
          <AiAssistant settings={settings} />
          <Footer settings={settings} />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
