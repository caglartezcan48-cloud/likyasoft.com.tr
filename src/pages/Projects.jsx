import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';

const Projects = ({ settings }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/projects.php')
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <main style={{ paddingTop: '100px' }}>
            <Helmet>
                <title>Projelerimiz | {settings?.site_title || 'Likyasoft'}</title>
                <meta name="description" content="Likyasoft tarafından tamamlanan premium web tasarım, yapay zeka ve ERP projeleri portfolyosu." />
            </Helmet>

            <section className="section-padding" style={{ background: 'var(--bg-alt)', minHeight: '80vh' }}>
                <div className="container">
                    <div style={{ marginTop: '2rem' }}></div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
                    ) : (
                        <div className="exhibition-grid">
                            {projects && projects.length > 0 ? (
                                projects.map((p, index) => {
                                    const isCompleted = p.status === 'completed';
                                    const statusLabel = isCompleted ? 'Tamamlandı' : 'Çalışma Aşamasında';
                                    const statusColor = isCompleted ? 'var(--secondary)' : 'rgba(30,172,199,0.8)';
                                    
                                    let displayImage = p.image_url;
                                    if (displayImage && displayImage.startsWith('http')) {
                                        displayImage = `${displayImage.split('?')[0]}?w=403&h=268&q=75&fm=webp&fit=crop`;
                                    } else if (displayImage && displayImage.startsWith('/uploads/')) {
                                        // Keep as is or optimize if needed
                                    }
                                    if (!displayImage) {
                                        const cat = (p.category || '').toLowerCase();
                                        if (cat.includes('mobilya')) displayImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=403&h=268&q=75&fm=webp&fit=crop';
                                        else if (cat.includes('muhasebe') || cat.includes('finans')) displayImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=403&h=268&q=75&fm=webp&fit=crop';
                                        else if (cat.includes('restoran') || cat.includes('kasap')) displayImage = 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42c7b?w=403&h=268&q=75&fm=webp&fit=crop';
                                        else if (cat.includes('parfüm')) displayImage = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=403&h=268&q=75&fm=webp&fit=crop';
                                        else if (cat.includes('telefon')) displayImage = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=403&h=268&q=75&fm=webp&fit=crop';
                                        else displayImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=403&h=268&q=75&fm=webp&fit=crop'; 
                                    }

                                    return (
                                        <motion.a 
                                            href={p.project_url || '/bakimda'}
                                            target={p.project_url ? "_blank" : "_self"}
                                            rel={p.project_url ? "noopener noreferrer" : ""}
                                            key={index}
                                            initial="hidden" 
                                            whileInView="visible" 
                                            viewport={{ once: true, margin: "-50px" }} 
                                            variants={revealVariants}
                                            className="project-ex"
                                        >
                                            <span className="badge-status" style={{ background: statusColor }}>{statusLabel}</span>
                                            <div className="project-frame-img">
                                                <img src={displayImage} alt={p.title} loading="lazy" width="403" height="268" />
                                            </div>
                                            <div className="project-info-box">
                                                <div>
                                                    <span className="sector-tag">{p.category} Sektörü</span>
                                                    <div className="project-title-mini">{p.title}</div>
                                                </div>
                                                {p.project_url && (
                                                    <div style={{ color: 'var(--primary)' }}>
                                                        <ArrowRight size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.a>
                                    );
                                })
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                                    Henüz eklenecek proje bulunamadı.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Projects;
