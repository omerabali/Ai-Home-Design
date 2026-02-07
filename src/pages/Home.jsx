import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import FileUpload from '../components/ui/FileUpload';
import StyleSelector from '../components/ui/StyleSelector';
import ModelSelector from '../components/ui/ModelSelector';
import Toast from '../components/ui/Toast';
import CardStack from '../components/ui/CardStack';
import ExpandableCTA from '../components/ui/ExpandableCTA';
import StatsAndTestimonials from '../components/ui/StatsAndTestimonials';
import { Sparkles, ArrowRight, Play, LogOut, User, CheckCircle, Zap, DollarSign, Layers, MessageCircle, Menu, X, Star, Home as HomeIcon, Palette, Camera } from 'lucide-react';
import { generateImage, generateVideoFromImage, interpolateVideo } from '../services/aiService';
import HoverFooter from '../components/HoverFooter';

// Showcase data for CardStack
const showcaseItems = [
    { id: 1, title: "Modern Salon Dönüşümü", description: "Minimalist ve şık tasarım", imageSrc: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", tag: "Modern" },
    { id: 2, title: "Industrial Mutfak", description: "Ham beton ve metal detaylar", imageSrc: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", tag: "Industrial" },
    { id: 3, title: "Scandinavian Yatak Odası", description: "Sıcak ve huzurlu atmosfer", imageSrc: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80", tag: "Scandinavian" },
    { id: 4, title: "Bohemian Oturma Alanı", description: "Renkli ve özgür ruh", imageSrc: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80", tag: "Bohemian" },
    { id: 5, title: "Art Deco Giriş Holü", description: "Lüks ve zarif detaylar", imageSrc: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", tag: "Art Deco" }
];

// Floating Feature Items
const FeatureItem = ({ icon: Icon, name, value, position }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{
            opacity: { duration: 0.5 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className={`absolute ${position} z-20 hidden lg:flex`}
    >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <div className="text-white font-medium text-sm">{name}</div>
                <div className="text-white/60 text-xs">{value}</div>
            </div>
        </div>
    </motion.div>
);

export default function Home() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState('modern');
    const [selectedModel, setSelectedModel] = useState('flux');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [resultProvider, setResultProvider] = useState(null);
    const [resultVideo, setResultVideo] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const showToast = (message, type = 'error') => setToast({ message, type });
    const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const handleGenerate = async () => {
        // if (!currentUser) { navigate('/login'); return; } // Removed to allow guest access
        if (!selectedImage) { showToast("Lütfen önce bir resim yükleyin.", "error"); return; }

        setIsGenerating(true);
        setResultImage(null);
        setResultProvider(null);
        setResultVideo(null);

        try {
            const userId = currentUser ? currentUser.uid : null;
            const scenario = document.getElementById('selectedScenario')?.value || 'living';
            const result = await generateImage(userId, selectedImage, selectedStyle, 'living_room', selectedModel, scenario);
            if (result.success) {
                setResultImage(result.imageUrl);
                setResultProvider(result.provider);

                if (result.provider === 'pollinations-fallback') {
                    showToast(`AI Servis Hatası: ${result.fallbackError || 'Limit aşıldı'}. Yedek (rastgele) modele geçildi.`, "warning");
                } else {
                    showToast("Tasarım başarıyla oluşturuldu!", "success");
                }
            } else {
                showToast(result.error || "Bir hata oluştu.", "error");
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVideoGenerate = async () => {
        if (!resultImage) { showToast("Önce bir tasarım oluşturun.", "error"); return; }
        setIsVideoGenerating(true);
        try {
            const result = await generateVideoFromImage(resultImage);
            if (result.success) {
                setResultVideo(result.videoUrl);
                showToast("Video oluşturuldu!", "success");
            } else {
                showToast(result.error, "error");
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setIsVideoGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* ===== HERO SECTION WITH GRADIENT ===== */}
            <section className="relative min-h-screen overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-purple-600/30 to-transparent blur-[120px]" />
                    <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-indigo-600/20 to-transparent blur-[100px]" />
                    <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-pink-600/20 to-transparent blur-[80px]" />
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 z-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                {/* Navigation */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative z-50 container mx-auto px-6 py-6"
                >
                    <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">DesignAI</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('features')} className="text-white/70 hover:text-white transition-colors text-sm">Özellikler</button>
                            <button onClick={() => scrollToSection('showcase')} className="text-white/70 hover:text-white transition-colors text-sm">Galeri</button>
                            <button onClick={() => scrollToSection('pricing')} className="text-white/70 hover:text-white transition-colors text-sm">Fiyatlar</button>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    <span className="text-white/60 text-sm">{currentUser.email}</span>
                                    <button onClick={logout} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm">
                                        Çıkış
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-white/70 hover:text-white transition-colors text-sm">Giriş</Link>
                                    <Link to="/register" className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors">
                                        Başla
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </motion.nav>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6"
                        >
                            <div className="flex flex-col gap-6 text-center">
                                <button onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }} className="text-xl py-3 border-b border-white/10">Özellikler</button>
                                <button onClick={() => { scrollToSection('showcase'); setMobileMenuOpen(false); }} className="text-xl py-3 border-b border-white/10">Galeri</button>
                                <button onClick={() => { scrollToSection('pricing'); setMobileMenuOpen(false); }} className="text-xl py-3 border-b border-white/10">Fiyatlar</button>
                                {currentUser ? (
                                    <button onClick={logout} className="mt-4 py-3 bg-white/10 rounded-full">Çıkış</button>
                                ) : (
                                    <Link to="/login" className="mt-4 py-3 bg-white rounded-full text-black font-medium">Giriş Yap</Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Feature Items */}
                <FeatureItem icon={Zap} name="Hızlı AI" value="<10 saniye" position="top-40 left-10" />
                <FeatureItem icon={Palette} name="10+ Stil" value="Modern, Industrial..." position="top-60 right-10" />
                <FeatureItem icon={Camera} name="4K Kalite" value="Ultra HD çıktı" position="bottom-40 left-20" />
                <FeatureItem icon={Star} name="4.9 Puan" value="50K+ kullanıcı" position="bottom-60 right-20" />

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-6 pt-12 pb-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left - Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm text-white/80">AI-Powered Interior Design V3.0</span>
                            </motion.div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                                Evinizi
                                <br />
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    AI ile Dönüştürün
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                                Oda fotoğrafınızı yükleyin, stil seçin ve <span className="text-white">saniyeler içinde</span> profesyonel iç mekan tasarımı alın. Yapay zeka ile hayalinizdeki evi görün.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/design')}
                                    className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                                >
                                    Ücretsiz Dene
                                    <ArrowRight size={18} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/design')}
                                    className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2"
                                >
                                    <Play size={18} />
                                    Demo İzle
                                </motion.button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-8 border-t border-white/10">
                                <p className="text-white/40 text-sm mb-4">Binlerce kullanıcı güveniyor</p>
                                <div className="flex items-center gap-6">
                                    <div className="flex -space-x-3">
                                        {['photo-1494790108377-be9c29b29330', 'photo-1507003211169-0a1dd7228f2d', 'photo-1438761681033-6461ffad8d80', 'photo-1500648767791-00dcc994a43e'].map((id, i) => (
                                            <img key={i} src={`https://images.unsplash.com/${id}?w=100&q=80`} className="w-10 h-10 rounded-full border-2 border-black object-cover" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
                                        <span className="text-white/60 text-sm ml-2">4.9/5 (2.5K+ yorum)</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right - Generator Card CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Glow behind card */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

                            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl text-center flex flex-col items-center justify-center min-h-[500px]">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold">Profesyonel Tasarım</h3>
                                <p className="text-white/60 text-lg max-w-xs">
                                    Yapay zeka asistanımız ile odanızı saniyeler içinde baştan yaratın.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full max-w-xs my-6">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                                        <Layers className="text-indigo-400" />
                                        <span className="text-sm">Çoklu Stil</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                                        <CheckCircle className="text-green-400" />
                                        <span className="text-sm">4K Render</span>
                                    </div>
                                </div>

                                <Link
                                    to="/design"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={20} />
                                    Tasarım Aracını Başlat
                                </Link>
                                <p className="text-white/40 text-xs mt-4">Kredi kartı gerekmez • 5 Ücretsiz hak</p>
                            </div>
                        </motion.div>
                    </div>
                </div >
            </section >

            {/* ===== SHOWCASE SECTION ===== */}
            < section id="showcase" className="py-24 bg-gradient-to-b from-black to-slate-900" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full text-indigo-400 text-sm font-medium mb-4"
                        >
                            <Layers size={16} />
                            Galeri
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Son Dönüşümler</h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">AI tarafından oluşturulan profesyonel iç mekan tasarımları</p>
                    </div>

                    <div className="flex justify-center">
                        <CardStack items={showcaseItems} autoPlay autoPlayInterval={3500} showDots cardWidth={480} cardHeight={300} />
                    </div>
                </div>
            </section >

            {/* ===== STATS & TESTIMONIALS ===== */}
            < div id="features" >
                <StatsAndTestimonials />
            </div >

            {/* ===== PRICING SECTION ===== */}
            < section id="pricing" className="py-24 bg-black border-t border-white/10" >
                <div className="container mx-auto px-6 text-center">
                    <div className="mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-400 text-sm font-medium mb-4"
                        >
                            <DollarSign size={16} />
                            Fiyatlandırma
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Basit & Şeffaf Fiyatlar</h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">İhtiyacınıza uygun planı seçin</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-colors">
                            <h3 className="text-lg font-medium text-white/60 mb-2">Ücretsiz</h3>
                            <div className="text-4xl font-bold mb-6">₺0<span className="text-lg text-white/40">/ay</span></div>
                            <ul className="space-y-3 text-white/70 mb-8">
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> 5 tasarım/ay</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Temel stiller</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> 720p çözünürlük</li>
                            </ul>
                            <button className="w-full py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors">Başla</button>
                        </div>

                        {/* Pro - Featured */}
                        <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-left relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-semibold">EN POPÜLER</div>
                            <h3 className="text-lg font-medium text-indigo-300 mb-2">Pro</h3>
                            <div className="text-4xl font-bold mb-6">₺199<span className="text-lg text-white/40">/ay</span></div>
                            <ul className="space-y-3 text-white/70 mb-8">
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-indigo-400" /> Sınırsız tasarım</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-indigo-400" /> Tüm stiller</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-indigo-400" /> 4K çözünürlük</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-indigo-400" /> Video oluşturma</li>
                            </ul>
                            <button className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-lg shadow-indigo-500/30">Yükselt</button>
                        </div>

                        {/* Enterprise */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-colors">
                            <h3 className="text-lg font-medium text-white/60 mb-2">Enterprise</h3>
                            <div className="text-4xl font-bold mb-6">Özel</div>
                            <ul className="space-y-3 text-white/70 mb-8">
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> API erişimi</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Özel modeller</li>
                                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Öncelikli destek</li>
                            </ul>
                            <button className="w-full py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors">İletişim</button>
                        </div>
                    </div>
                </div>
            </section >

            {/* ===== CTA SECTION ===== */}
            < section className="py-24 relative overflow-hidden" >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                }} />
                <div className="relative container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Hayalinizdeki Evi Tasarlayın</h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">Profesyonel danışmanlık için ekibimizle iletişime geçin</p>
                    <ExpandableCTA buttonText="Ücretsiz Demo İste" />
                </div>
            </section >

            {/* ===== FOOTER ===== */}
            {/* ===== FOOTER ===== */}
            <HoverFooter />

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl md:hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-end mb-8">
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-6 text-center">
                                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-white/80">Özellikler</a>
                                <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-white/80">Galeri</a>
                                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-white/80">Fiyatlar</a>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 bg-white rounded-full text-black font-medium mx-auto">Giriş Yap</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
