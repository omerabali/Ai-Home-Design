import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/ui/FileUpload';
import StyleSelector from '../components/ui/StyleSelector';
import ModelSelector from '../components/ui/ModelSelector';
import Toast from '../components/ui/Toast';
import { Sparkles, Play, CheckCircle, ArrowLeft, X, Menu, LogOut, Mic, MicOff } from 'lucide-react';
import { generateImage, generateVideoFromImage } from '../services/aiService';
import { segmentRoom } from '../services/segmentationService';

export default function DesignGenerator() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState(null); // Force explicit selection
    const [selectedRoom, setSelectedRoom] = useState('living_room');

    // Debugging Logs
    useEffect(() => { console.log("Selected Style:", selectedStyle); }, [selectedStyle]);
    useEffect(() => { console.log("Selected Room:", selectedRoom); }, [selectedRoom]);
    useEffect(() => { console.log("Selected Image:", selectedImage ? "Loaded" : "None"); }, [selectedImage]);

    const [selectedModel, setSelectedModel] = useState('flux');
    const [customPrompt, setCustomPrompt] = useState(''); // New State
    const [isListening, setIsListening] = useState(false); // New State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [resultProvider, setResultProvider] = useState(null);
    const [resultVideo, setResultVideo] = useState(null);
    const [toast, setToast] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Segmentation States
    const [isSegmenting, setIsSegmenting] = useState(false);
    const [segmentationResult, setSegmentationResult] = useState(null);

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const showToast = (message, type = 'error') => setToast({ message, type });

    // Voice Recognition Logic
    const recognitionRef = useRef(null);

    const toggleListening = () => {
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Tarayıcınız sesli girişi desteklemiyor.", "error");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = true; // Don't stop after silence
        recognition.interimResults = true; // Show words as they are spoken

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech error", event.error);
            // Don't toast on 'no-speech' as it's common during pauses
            if (event.error !== 'no-speech') {
                showToast("Ses algılanamadı: " + event.error, "error");
            }
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            // Iterate through results because continuous mode returns multiple chunks
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }

            if (finalTranscript) {
                setCustomPrompt(prev => {
                    const cleanPrev = prev ? prev.trim() : '';
                    return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
                });
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };



    const handleGenerate = async () => {
        if (!selectedImage) { showToast("Lütfen önce bir resim yükleyin.", "error"); return; }

        setIsGenerating(true);
        setResultImage(null);
        setResultProvider(null);
        setResultVideo(null);

        try {
            const userId = currentUser ? currentUser.uid : null;
            const scenario = document.getElementById('selectedScenario')?.value || 'living';

            // Pass selectedRoom state instead of hardcoded 'living_room'
            // Default style to 'modern' since selector is removed
            const result = await generateImage(userId, selectedImage, selectedStyle || 'modern', selectedRoom, selectedModel, scenario, customPrompt);
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
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-900/40 to-transparent blur-[120px]" />
                <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-purple-900/40 to-transparent blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span>Ana Sayfa</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-white/50 hidden md:block">{currentUser.email}</span>
                                <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Çıkış Yap">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-sm text-white/70 hover:text-white">Giriş Yap</Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <Menu size={24} />
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="md:hidden mt-4 pt-4 border-t border-white/10"
                    >
                        <div className="flex flex-col gap-4">
                            {currentUser ? (
                                <button onClick={logout} className="flex items-center gap-2 text-gray-300 hover:text-white">
                                    <LogOut size={16} /> Çıkış Yap
                                </button>
                            ) : (
                                <Link to="/login" className="text-gray-300">Giriş Yap</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pt-28 pb-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white via-purple-100 to-indigo-200">
                        Hayalindeki Odayı Tasarla
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Yapay zeka mimarımız odanızı analiz eder, derinlik haritasını çıkarır ve istediğiniz stili
                        <span className="text-purple-400 font-semibold"> piksel mükemmelliğinde</span> uygular.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Controls */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. Upload Section */}
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs">1</span>
                                Fotoğraf Yükle
                            </h2>
                            <FileUpload
                                onFileSelect={async (file, base64) => {
                                    console.log("Image Selected:", file ? file.name : "None");
                                    setSelectedImage(base64); // Save base64 for API
                                    setSegmentationResult(null); // Reset previous result

                                    if (base64) {
                                        setIsSegmenting(true);
                                        try {
                                            const result = await segmentRoom(base64);
                                            setSegmentationResult(result);
                                            showToast("Oda analizi tamamlandı.", "success");
                                        } catch (error) {
                                            console.error("Segmentation Failed:", error);
                                            // Don't show toast for silent failure, just don't show the checkmark
                                        } finally {
                                            setIsSegmenting(false);
                                        }
                                    }
                                }}
                                selectedImage={selectedImage}
                            />

                            {isSegmenting && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/30 py-2 px-3 rounded-lg w-fit border border-yellow-800">
                                    <div className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                                    <span>Segmentasyon Analizi Yapılıyor...</span>
                                </div>
                            )}

                            {!isSegmenting && segmentationResult && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-green-400 bg-green-900/30 py-2 px-3 rounded-lg w-fit border border-green-800">
                                    <CheckCircle size={14} />
                                    <span>Segmentasyon Analizi Hazır</span>
                                </div>
                            )}
                        </div>

                        {/* 2. Style & Settings Removed */}

                        {/* 3. Smart Prompt */}
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white text-xs">3</span>
                                Özel İstekler & Mimar
                            </h2>

                            <div className="relative">
                                <textarea
                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none h-32 pr-12"
                                    placeholder="Örn: 'Şöminenin üstüne TV koy', 'İskandinav tarzı olsun', 'Duvarları maviye boya'..."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                />
                                <button
                                    onClick={toggleListening}
                                    title={isListening ? "Dinlemeyi Durdur" : "Sesle Yaz"}
                                    type="button"
                                    className={`absolute bottom-3 right-3 p-2.5 rounded-lg transition-all shadow-lg z-10 cursor-pointer border ${isListening
                                        ? 'bg-red-600 text-white border-red-500 animate-pulse'
                                        : 'bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600 hover:text-white'
                                        }`}
                                >
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5 p-2 bg-gray-700/50 rounded-lg border border-gray-700/50">
                                <Sparkles size={12} className="text-yellow-400" />
                                <span>Akıllı Mimar (VLM) isteklerinizi analiz edip otomatik yerleşim yapacaktır.</span>
                            </p>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedImage}
                            type="button"
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] border cursor-pointer ${isGenerating || !selectedImage
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-500 shadow-purple-900/20'
                                }`}
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Mimar Tasarlıyor...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span>Tasarımı Başlat</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Preview & Results */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Result Display Area */}
                        <div className="glass-panel p-1 rounded-3xl min-h-[600px] flex items-center justify-center relative overflow-hidden bg-black/40">
                            {!resultImage && !isGenerating && (
                                <div className="text-center text-gray-500">
                                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p>Tasarımınız burada görünecek</p>
                                </div>
                            )}

                            {resultImage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative w-full h-full rounded-2xl overflow-hidden"
                                >
                                    <img src={resultImage} alt="Generated Design" className="w-full h-full object-contain max-h-[800px]" />

                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                                        <button className="px-6 py-3 rounded-full glass-button hover:bg-white/20 text-white font-medium flex items-center gap-2 shadow-lg backdrop-blur-md">
                                            <Play size={16} fill="currentColor" /> Video Turu Oluştur
                                        </button>
                                        <a href={resultImage} download className="px-6 py-3 rounded-full bg-white text-black font-medium flex items-center gap-2 shadow-lg hover:bg-gray-200 transition-colors">
                                            İndir
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main >

            {/* Toast Notification */}
            < AnimatePresence >
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
                }
            </AnimatePresence >
        </div >
    );
}
