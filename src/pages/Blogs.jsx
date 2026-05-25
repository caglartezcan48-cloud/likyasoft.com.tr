import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blogs.php')
            .then(res => res.json())
            .then(data => {
                setBlogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '100px' }}>
            <Helmet>
                <title>Blog & Haberler | Likyasoft Dijital Mimari</title>
                <meta name="description" content="Yapay zeka, yazılım dünyası ve dijital dönüşüm hakkındaki en güncel haberler ve makaleler Likyasoft blog sayfasında." />
            </Helmet>

            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}
                        >
                            İçerik Dünyamız
                        </motion.span>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'var(--text-heading)', marginTop: '1rem', letterSpacing: '-1.5px' }}
                        >
                            Blog & <span className="gradient-text">Haberler</span>
                        </motion.h1>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>Yükleniyor...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
                            {blogs.map((blog, index) => (
                                <motion.div 
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="blog-card-fancy"
                                    style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}
                                >
                                    <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={blog.image_url ? `${blog.image_url.split('?')[0]}?w=403&h=268&q=75&fm=webp&fit=crop` : 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=403&h=268&q=75&fm=webp&fit=crop'} alt={blog.title} loading="lazy" width="403" height="268" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="blog-img" />
                                        <span style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>{blog.category}</span>
                                    </div>
                                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> {new Date(blog.created_at).toLocaleDateString('tr-TR')}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> {blog.author}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem', lineHeight: 1.3 }}>{blog.title}</h3>
                                        <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>{blog.summary}</p>
                                        <Link to={`/blog/${blog.slug}`} className="btn-fancy" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem', width: 'max-content' }}>
                                            Devamını Oku <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Blogs;
