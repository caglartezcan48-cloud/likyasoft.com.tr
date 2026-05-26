// App.js
// Path: assets/js/App.js

window.Agency = window.Agency || {};

window.Agency.App = () => {
    const [lang, setLang] = React.useState('tr');
    const [activeSection, setActiveSection] = React.useState('');

    // Fetch Dictionary data
    const d = window.Agency.Dictionary[lang];

    // IntersectionObserver to set active navigation item based on scrolling
    React.useEffect(() => {
        const sections = ['services', 'products', 'portfolio', 'about', 'contact'];
        const observers = [];

        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the core viewport
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                observer.observe(el);
                observers.push(el);
            }
        });

        // Track hero at the very top
        const handleHeroScroll = () => {
            if (window.scrollY < 200) {
                setActiveSection('');
            }
        };
        window.addEventListener('scroll', handleHeroScroll);

        return () => {
            observers.forEach(el => observer.unobserve(el));
            window.removeEventListener('scroll', handleHeroScroll);
        };
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col justify-between selection:bg-violet-600 selection:text-white">
            
            {/* Nav Header */}
            <window.Agency.Navbar 
                activeSection={activeSection} 
                lang={lang} 
                setLang={setLang} 
                t={d.nav} 
            />

            {/* Hero Main Screen */}
            <window.Agency.Hero t={d.hero} />

            {/* Core Services Section */}
            <window.Agency.Services t={d.services} />

            {/* Flagship Products Section */}
            <window.Agency.Products t={d.products} />

            {/* Portfolio Projects Grid */}
            <window.Agency.Portfolio t={d.portfolio} />

            {/* About Corporate Details */}
            <window.Agency.About t={d.about} />

            {/* Interactive Contact Forms */}
            <window.Agency.Contact t={d.contact} />

            {/* Footer and Links */}
            <window.Agency.Footer t={d.footer} />

        </div>
    );
};
