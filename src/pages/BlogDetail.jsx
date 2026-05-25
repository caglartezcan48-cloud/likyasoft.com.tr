import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';

const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/blogs.php?slug=${slug}`)
            .then(res => res.json())
            .then(data => {
                setBlog(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div style={{ padding: '10rem 0', textAlign: 'center' }}>Yazı hazırlanıyor...</div>;
    if (!blog) return <div style={{ padding: '10rem 0', textAlign: 'center' }}>Yazı bulunamadı.</div>;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '120px' }}>
            <Helmet>
                <title>{blog.title} | Likyasoft Blog</title>
                <meta name="description" content={blog.summary} />
            </Helmet>

            <article className="container" style={{ maxWidth: '900px' }}>
                <Link to="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-body)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Blog'a Dön
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Tag size={16} /> {blog.category}
                    </span>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-1.5px' }}>
                        {blog.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)', color: 'var(--text-body)', fontSize: '0.95rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> {new Date(blog.created_at).toLocaleDateString('tr-TR')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18} /> {blog.author}</span>
                    </div>

                    <div style={{ borderRadius: '40px', overflow: 'hidden', marginBottom: '3rem', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
                        <img src={blog.image_url ? `${blog.image_url.split('?')[0]}?w=1200&h=600&q=80&fm=webp&fit=crop` : 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&q=80&fm=webp&fit=crop'} alt={blog.title} loading="lazy" width="1200" height="600" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>

                    <div 
                        className="blog-content-rich"
                        style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-heading)', opacity: 0.9 }}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    <div style={{ marginTop: '5rem', padding: '3rem', background: 'var(--bg-alt)', borderRadius: '32px', textAlign: 'center' }}>
                        <h4 style={{ marginBottom: '1rem', fontWeight: 800 }}>Bu yazıyı faydalı buldunuz mu?</h4>
                        <p style={{ color: 'var(--text-body)', marginBottom: '2rem' }}>Daha fazla teknoloji haberi ve dijital strateji için bizi takip etmeye devam edin.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn-fancy" onClick={() => window.print()} aria-label="Yazıyı Yazdır" style={{ padding: '0.8rem 2rem' }}>Yazdır</button>
                            <button className="btn-fancy ripple" aria-label="Yazıyı Paylaş" style={{ padding: '0.8rem 2rem', background: 'var(--text-heading)', borderColor: 'var(--text-heading)' }}>
                                <Share2 size={18} /> Paylaş
                            </button>
                        </div>
                    </div>
                </motion.div>
            </article>
        </div>
    );
};

export default BlogDetail;
