import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    LayoutDashboard, 
    FolderKanban, 
    Settings, 
    LogOut, 
    Plus, 
    Trash2, 
    Edit3,
    ExternalLink,
    BotMessageSquare,
    X,
    Save,
    Upload,
    Tags,
    Users,
    Globe,
    BookOpen,
    FileText
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState([]);
    const [leads, setLeads] = useState([]);
    const [categories, setCategories] = useState([]);
    const [blogs, setBlogs] = useState([]); // Blog state
    const [settings, setSettings] = useState({
        site_title: '', contact_email: '', contact_phone: '', instagram_url: '', linkedin_url: '', address: '',
        hero_title: '', hero_subtitle: '', hero_button: '', hero_image_url: '', primary_color: '#1eacc7', secondary_color: '#c5a363', home_project_limit: 8
    });
    const [analytics, setAnalytics] = useState({ today_visits: 0, total_visits: 0 });
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobil menü kontrolü

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentProject, setCurrentProject] = useState({
        id: '', title: '', category: '', description: '', image_url: '', project_url: '', status: 'completed', order_index: 0
    });
    const [currentBlog, setCurrentBlog] = useState({
        id: '', title: '', slug: '', summary: '', content: '', image_url: '', category: '', status: 'published'
    });
    const [blogModalOpen, setBlogModalOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            navigate('/admin/login');
            return;
        }
        fetchProjects();
        fetchLeads();
        fetchSettings();
        fetchAnalytics();
        fetchCategories();
        fetchBlogs();
    }, [navigate]);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs.php');
            const data = await res.json();
            setBlogs(data);
        } catch (error) { console.error('Error fetching blogs:', error); }
    };
    
    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories.php');
            const data = await res.json();
            setCategories(data);
        } catch (error) { console.error('Error fetching categories:', error); }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/track.php');
            const data = await res.json();
            setAnalytics(data);
        } catch (error) { console.error('Error fetching analytics:', error); }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings.php');
            const data = await res.json();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/ai_lead.php');
            const data = await res.json();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects.php');
            const data = await response.json();
            setProjects(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/settings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                alert('Ayarlar başarıyla güncellendi!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Ayarlar kaydedilemedi.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 5) {
            alert('Şifreniz güvenlik sebebiyle en az 5 karakter olmalıdır.');
            return;
        }
        try {
            const response = await fetch('/api/change_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_password: newPassword })
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                alert('Yönetim paneli şifreniz başarıyla değiştirildi! Sonraki girişlerinizde yeni şifrenizi kullanın.');
                setNewPassword('');
            } else {
                alert(data.message || 'Şifre güncellenemedi.');
            }
        } catch (error) {
            console.error('Password change error:', error);
            alert('Sistem hatası oluştu.');
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('Bu mesajı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
        try {
            const response = await fetch(`/api/ai_lead.php?id=${id}`, { method: 'DELETE' });
            if (response.ok) fetchLeads();
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    };

    const updateLeadStatus = async (id, status) => {
        try {
            const response = await fetch('/api/ai_lead.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (response.ok) fetchLeads();
        } catch (error) { console.error('Error updating lead status:', error); }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const newCat = prompt('Yeni Sektör / Kategori Adı:');
        if (!newCat) return;
        try {
            const res = await fetch('/api/categories.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCat })
            });
            if (res.ok) fetchCategories();
            else alert('Bu sektör zaten var veya bir hata oluştu.');
        } catch (error) { console.error('Error adding category:', error); }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Bu sektörü silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`/api/categories.php?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchCategories();
        } catch (error) { console.error('Error deleting category:', error); }
    };

    const deleteProject = async (id) => {
        if (!window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
        try {
            const response = await fetch('/api/projects.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: id })
            });
            if (response.ok) {
                fetchProjects();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const openAddModal = () => {
        setCurrentProject({ id: '', title: '', category: '', description: '', image_url: '', project_url: '', status: 'completed', order_index: 0 });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (project) => {
        setCurrentProject(project);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        try {
            // Basic slug generation from title if empty
            const slug = currentProject.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const payload = { ...currentProject, slug };

            const response = await fetch('/api/projects.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                setIsModalOpen(false);
                fetchProjects();
            } else {
                alert('Hata: ' + (data.message || 'İşlem başarısız oldu.'));
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Sunucu ile iletişim kurulamadı.');
        }
    };

    const handleImageUpload = async (e, type = 'project') => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                if (type === 'hero') {
                    setSettings({ ...settings, hero_image_url: data.url });
                } else {
                    setCurrentProject({ ...currentProject, image_url: data.url });
                }
            } else {
                alert(data.message || 'Görsel yüklenirken hata oluştu.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Görsel sunucuya yüklenemedi.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/admin/login');
    };

    const sidebarButtonStyle = (tabName) => ({
        width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', 
        borderRadius: '16px', transition: 'var(--transition)', cursor: 'pointer', border: 'none',
        background: activeTab === tabName ? 'var(--text-heading)' : 'transparent',
        color: activeTab === tabName ? 'white' : 'var(--text-body)',
        fontWeight: activeTab === tabName ? 700 : 500
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }} className="admin-layout">
            <Helmet>
                <title>Likyasoft | Panel: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</title>
            </Helmet>

            {/* Sidebar - Mobile Responsive */}
            <aside 
                className={`admin-sidebar ${isSidebarOpen ? 'active' : ''}`}
                style={{ 
                    width: '280px', 
                    background: 'white', 
                    borderRight: '1px solid var(--border)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 2005
                }}
            >
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Likyasoft <span style={{ fontSize: '0.7rem', background: 'var(--bg-alt)', padding: '0.2rem 0.5rem', borderRadius: '8px', color: 'var(--text-body)' }}>Panel</span>
                    </Link>
                    <button className="md-hidden" onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-body)' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} style={sidebarButtonStyle('overview')}>
                        <LayoutDashboard size={20} /> Genel Bakış
                    </button>
                    <button onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }} style={sidebarButtonStyle('projects')}>
                        <FolderKanban size={20} /> Projeleri Yönet
                    </button>
                    <button onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }} style={sidebarButtonStyle('categories')}>
                        <Tags size={20} /> Sektörler (Kategori)
                    </button>
                    <button onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} style={sidebarButtonStyle('messages')}>
                        <BotMessageSquare size={20} /> Yapay Zeka Mesajları
                    </button>
                    <button onClick={() => { setActiveTab('blogs'); setIsSidebarOpen(false); }} style={sidebarButtonStyle('blogs')}>
                        <BookOpen size={20} /> Blog Yazıları
                    </button>
                    <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} style={sidebarButtonStyle('settings')}>
                        <Settings size={20} /> Site Ayarları
                    </button>
                </nav>

                <div style={{ padding: '2rem' }}>
                    <button 
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                        <LogOut size={20} /> Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Mobile Header Bar */}
                <header className="admin-mobile-header md-hidden" style={{ background: 'white', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'var(--bg-alt)', border: 'none', padding: '0.5rem', borderRadius: '10px' }}>
                        <div className="hamburger active"><span></span><span></span><span></span></div>
                    </button>
                    <span style={{ fontWeight: 800 }}>LIKYASOFT PANEL</span>
                    <div style={{ width: '40px' }}></div>
                </header>

                <main className="admin-main-content" style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-heading)' }}>
                                {activeTab === 'messages' ? 'Müşteri Talepleri (AI)' : 
                                 activeTab === 'categories' ? 'Sektör Yönetimi' : 
                                 activeTab === 'blogs' ? 'Blog & İçerik Yönetimi' : 
                                 activeTab === 'projects' ? 'Proje Yönetimi' :
                                 activeTab === 'settings' ? 'Sistem Ayarları' :
                                 'Yönetim Paneli'}
                            </h2>
                            <p style={{ color: 'var(--text-body)', marginTop: '0.5rem' }}>Likyasoft dijital vitrinini buradan kontrol edin.</p>
                        </div>
                        {activeTab === 'blogs' && (
                            <button onClick={() => { setCurrentBlog({ id: '', title: '', slug: '', summary: '', content: '', image_url: '', category: '', status: 'published' }); setBlogModalOpen(true); }} className="btn-fancy ripple" style={{ padding: '0.8rem 1.5rem' }}>
                                <Plus size={18} /> Yeni Yazı Ekle
                            </button>
                        )}
                    </header>

                {activeTab === 'projects' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div onClick={openAddModal} style={{ background: 'rgba(30, 172, 199, 0.05)', border: '2px dashed var(--primary)', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '1.5rem', color: 'var(--primary)', transition: 'all 0.2s', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.8rem', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={24} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Buraya Tıklayarak Yeni Proje Ekle</span>
                        </div>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-body)', padding: '3rem 0' }}>Yükleniyor...</p>
                        ) : projects.length > 0 ? (
                            projects.map((project) => (
                                <div key={project.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ width: '100px', height: '70px', borderRadius: '12px', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {project.image_url ? (
                                                <img src={project.image_url} alt={project.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-body)' }}>Görsel Yok</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-heading)' }}>{project.title}</h4>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{project.category}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => openEditModal(project)} style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--bg-alt)', border: 'none', cursor: 'pointer', color: 'var(--text-body)' }}>
                                            <Edit3 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteProject(project.id)}
                                            style={{ padding: '0.8rem', borderRadius: '12px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <a 
                                            href={project.project_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--text-heading)', color: 'white', display: 'flex' }}
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '24px', padding: '5rem', textAlign: 'center', color: 'var(--text-body)' }}>
                                <p>Henüz proje eklenmemiş.</p>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'messages' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <div key={lead.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', opacity: lead.status === 'contacted' ? 0.6 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-heading)', textDecoration: lead.status === 'contacted' ? 'line-through' : 'none' }}>{lead.name}</h4>
                                            <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>{lead.email}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {lead.status !== 'contacted' && (
                                                <button onClick={() => updateLeadStatus(lead.id, 'contacted')} style={{ fontSize: '0.8rem', background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>İletişime Geçildi</button>
                                            )}
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-body)', background: 'var(--bg-alt)', padding: '0.3rem 0.6rem', borderRadius: '10px' }}>
                                                {new Date(lead.created_at).toLocaleString('tr-TR')}
                                            </span>
                                            <button onClick={() => deleteLead(lead.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Mesajı Sil">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--bg-alt)', padding: '1rem', borderRadius: '16px', color: 'var(--text-heading)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                        {lead.message}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                                <BotMessageSquare size={48} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Gelen Mesaj Yok</h3>
                                <p style={{ color: 'var(--text-body)' }}>Yapay Zeka asistanından gelen tüm potansiyel müşteri bildirimleri burada listelenir.</p>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'blogs' ? (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {blogs.map((blog) => (
                            <div key={blog.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '160px', background: 'var(--bg-alt)', overflow: 'hidden' }}>
                                    {blog.image_url ? (
                                        <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-body)' }}>Görsel Yok</div>
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(30, 172, 199, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>{blog.category}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>{new Date(blog.created_at).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.8rem' }}>{blog.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.5rem' }}>{blog.summary}</p>
                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => { setCurrentBlog(blog); setBlogModalOpen(true); }} style={{ flex: 1, padding: '0.7rem', borderRadius: '12px', background: 'var(--bg-alt)', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Düzenle</button>
                                        <button onClick={async () => {
                                            if(window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
                                                await fetch('/api/blogs.php', { method: 'POST', body: JSON.stringify({ action: 'delete', id: blog.id }) });
                                                fetchBlogs();
                                            }
                                        }} style={{ padding: '0.7rem', borderRadius: '12px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'categories' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div onClick={handleAddCategory} style={{ background: 'rgba(30, 172, 199, 0.05)', border: '2px dashed var(--primary)', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '1.5rem', color: 'var(--primary)', transition: 'all 0.2s', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.8rem', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} /></div>
                            <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Yeni Sektör (Kategori) Ekle</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {categories.map(cat => (
                                <div key={cat.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{cat.name}</span>
                                    <button onClick={() => deleteCategory(cat.id)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="glass" style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '2rem' }}>Sistem Ayarları</h3>
                        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: '1 / 3' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Site Başlığı (SEO)</label>
                                <input type="text" value={settings.site_title || ''} onChange={e => setSettings({...settings, site_title: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>İletişim E-Posta</label>
                                <input type="email" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>İletişim Telefon</label>
                                <input type="text" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Instagram URL</label>
                                <input type="text" value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>LinkedIn URL</label>
                                <input type="text" value={settings.linkedin_url || ''} onChange={e => setSettings({...settings, linkedin_url: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / 3' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Adres Bilgisi</label>
                                <input type="text" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / 3' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Ana Sayfa Proje Gösterim Limiti</label>
                                <input type="number" min="1" max="100" value={settings.home_project_limit || 8} onChange={e => setSettings({...settings, home_project_limit: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} placeholder="Örn: 8" />
                            </div>

                            <div style={{ gridColumn: '1 / 3', background: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>Vitrin Metinleri ve Tasarım Renkleri</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: '1 / 3' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Vitrin Ana Başlık</label>
                                        <input type="text" value={settings.hero_title || ''} onChange={e => setSettings({...settings, hero_title: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} placeholder="Örn: En Gelişmiş Dijital Mimari" />
                                    </div>
                                    <div style={{ gridColumn: '1 / 3' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Vitrin Açıklaması (Subtitle)</label>
                                        <textarea rows="3" value={settings.hero_subtitle || ''} onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }} placeholder="İşletmeniz için yüksek performanslı..." />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Aksiyon Butonu Metni</label>
                                        <input type="text" value={settings.hero_button || ''} onChange={e => setSettings({...settings, hero_button: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} placeholder="Örn: Projeleri Keşfet" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Kapak Görseli (Hero Image)</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input type="text" value={settings.hero_image_url || ''} onChange={e => setSettings({...settings, hero_image_url: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} placeholder="Görsel URL veya Yükleyin" />
                                            <div style={{ position: 'relative', overflow: 'hidden' }}>
                                                <button type="button" style={{ padding: '0.8rem', borderRadius: '12px', background: 'white', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                                    <Upload size={18} />
                                                </button>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / 3' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Ana Renk</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input type="color" value={settings.primary_color || '#1eacc7'} onChange={e => setSettings({...settings, primary_color: e.target.value})} style={{ width: '45px', height: '45px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                                                <input type="text" value={settings.primary_color || '#1eacc7'} readOnly style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }} />
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>İkincil Renk</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input type="color" value={settings.secondary_color || '#c5a363'} onChange={e => setSettings({...settings, secondary_color: e.target.value})} style={{ width: '45px', height: '45px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                                                <input type="text" value={settings.secondary_color || '#c5a363'} readOnly style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / 3', marginTop: '1rem' }}>
                                <button type="submit" className="btn-fancy ripple" style={{ padding: '1rem 3rem' }}>
                                    <Save size={18} /> Ayarları Yansıt
                                </button>
                            </div>
                        </form>

                        {/* Güvenlik Modülü */}
                        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.2rem' }}>Güvenlik Ayarları (Şifre Yenileme)</h4>
                            <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Hesabınızın (admin) giriş şifresini buradan kolayca değiştirebilirsiniz. Bir sonraki girişinizde aktif olur.</p>
                            
                            <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', maxWidth: '500px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Yeni Şifre</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} 
                                        placeholder="En az 5 karakter" 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn-fancy ripple" style={{ padding: '1rem 2rem', background: '#ef4444', borderColor: '#ef4444' }}>
                                    Şifreyi Değiştir
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="glass" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <FolderKanban size={24} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-body)', fontWeight: 600, fontSize: '0.8rem' }}>Toplam Proje</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{projects.length}</h3>
                                </div>
                            </div>
                            <div className="glass" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a363' }}>
                                    <BotMessageSquare size={24} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-body)', fontWeight: 600, fontSize: '0.8rem' }}>Bekleyen Mesaj</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{leads.length}</h3>
                                </div>
                            </div>
                            <div className="glass" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-body)', fontWeight: 600, fontSize: '0.8rem' }}>Bugünkü Ziyaretçi</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{analytics.today_visits}</h3>
                                </div>
                            </div>
                            <div className="glass" style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-body)', fontWeight: 600, fontSize: '0.8rem' }}>Toplam Trafik</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{analytics.total_visits}</h3>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1.5rem', marginTop: '3rem' }}>Son Gelen Bildirimler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {leads.slice(0, 3).map((lead) => (
                                <div key={lead.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{lead.name}</h4>
                                        <p style={{ color: 'var(--text-body)', fontSize: '0.9rem' }}>{lead.email}</p>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--bg-alt)', padding: '0.4rem 0.8rem', borderRadius: '12px' }}>
                                        {new Date(lead.created_at).toLocaleString('tr-TR')}
                                    </span>
                                </div>
                            ))}
                            {leads.length === 0 && <p style={{ color: 'var(--text-body)', textAlign: 'center', padding: '2rem' }}>Henüz bildirim yok.</p>}
                        </div>
                    </div>
                )}
                </main>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '24px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{modalMode === 'add' ? 'Yeni Proje Ekle' : 'Projeyi Düzenle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-alt)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Proje Adı</label>
                                <input type="text" required value={currentProject.title} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Kategori / Sektör</label>
                                    <select required value={currentProject.category} onChange={e => setCurrentProject({...currentProject, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'white' }}>
                                        <option value="">Seçiniz...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Durum</label>
                                    <select value={currentProject.status || 'completed'} onChange={e => setCurrentProject({...currentProject, status: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'white' }}>
                                        <option value="completed">Tamamlandı</option>
                                        <option value="in_progress">Çalışma Aşamasında</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Ekran Sırası (Örn: 1, 2...)</label>
                                    <input type="number" value={currentProject.order_index} onChange={e => setCurrentProject({...currentProject, order_index: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Açıklama</label>
                                <textarea rows="3" value={currentProject.description} onChange={e => setCurrentProject({...currentProject, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }}></textarea>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Proje Görseli</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1, border: '1px solid var(--border)', borderRadius: '12px', background: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => handleImageUpload(e, 'project')} 
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                        />
                                        <div style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-body)', pointerEvents: 'none' }}>
                                            <Upload size={18} /> Cihazdan Görsel Seç or Yükle
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="text" value={currentProject.image_url} onChange={e => setCurrentProject({...currentProject, image_url: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} placeholder="...veya Link (URL) Yapıştır" />
                                    </div>
                                </div>
                                {currentProject.image_url && (
                                    <div style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden', height: '100px', width: 'max-content', border: '1px solid var(--border)' }}>
                                        <img src={currentProject.image_url} alt="Önizleme" style={{ height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Proje Linki (İsteğe Bağlı)</label>
                                <input type="text" value={currentProject.project_url} onChange={e => setCurrentProject({...currentProject, project_url: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }} placeholder="https://..." />
                            </div>

                            <button type="submit" className="btn-fancy ripple" style={{ padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                <Save size={20} /> Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Blog Modal */}
            {blogModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '24px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Blog Yazısı {currentBlog.id ? 'Düzenle' : 'Ekle'}</h3>
                            <button onClick={() => setBlogModalOpen(false)} style={{ background: 'var(--bg-alt)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const slug = currentBlog.slug || currentBlog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                            const res = await fetch('/api/blogs.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...currentBlog, slug })
                            });
                            if(res.ok) { setBlogModalOpen(false); fetchBlogs(); }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Yazı Başlığı</label>
                                <input type="text" required value={currentBlog.title} onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Kategori</label>
                                    <input type="text" value={currentBlog.category} onChange={e => setCurrentBlog({...currentBlog, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }} placeholder="Örn: Yapay Zeka" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Durum</label>
                                    <select value={currentBlog.status} onChange={e => setCurrentBlog({...currentBlog, status: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'white' }}>
                                        <option value="published">Yayında</option>
                                        <option value="draft">Taslak</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Özet (Kısa Açıklama)</label>
                                <textarea rows="2" value={currentBlog.summary} onChange={e => setCurrentBlog({...currentBlog, summary: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', resize: 'vertical' }}></textarea>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>İçerik (HTML Destekler)</label>
                                <textarea rows="8" value={currentBlog.content} onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', resize: 'vertical', fontFamily: 'monospace' }} placeholder="Yazı detayları buraya..."></textarea>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Kapak Görseli URL</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" value={currentBlog.image_url} onChange={e => setCurrentBlog({...currentBlog, image_url: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }} placeholder="https://..." />
                                    <button type="button" onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.onchange = async (e) => {
                                            const file = e.target.files[0];
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            const res = await fetch('/api/upload.php', { method: 'POST', body: formData });
                                            const data = await res.json();
                                            if(data.status === 'success') setCurrentBlog({...currentBlog, image_url: data.url});
                                        };
                                        input.click();
                                    }} style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--bg-alt)', border: 'none', cursor: 'pointer' }}>
                                        <Upload size={18} />
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-fancy ripple" style={{ padding: '1rem', marginTop: '1rem' }}>
                                <Save size={20} /> Yazıyı Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
