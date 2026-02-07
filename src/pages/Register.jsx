import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ParticleBackground from '../components/ui/ParticleBackground';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (password.length < 6) {
            return setError('Şifre en az 6 karakter olmalıdır');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, fullName);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Hesap oluşturulamadı. ' + err.message);
        }
        setLoading(false);
    }

    const features = [
        "Sınırsız AI tasarım",
        "Profesyonel stiller",
        "HD çıktılar"
    ];

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Interactive Particle Background */}
            <ParticleBackground />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 space-y-6 border border-white/50"
            >
                {/* Logo */}
                <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Hesap Oluştur</h2>
                    <p className="text-slate-500">Hayalinizdeki evi tasarlamaya başlayın</p>
                </div>

                {/* Features */}
                <div className="flex justify-center gap-4 flex-wrap">
                    {features.map((feature, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            {feature}
                        </span>
                    ))}
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                            placeholder="Ahmet Yılmaz"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Şifre</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 mt-1">En az 6 karakter</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                        disabled={loading}
                    >
                        {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
                    </Button>
                </form>

                <p className="text-center text-sm text-slate-600">
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                        Giriş Yap
                    </Link>
                </p>

                <p className="text-center text-xs text-slate-400">
                    Kayıt olarak <span className="underline">Kullanım Şartları</span> ve <span className="underline">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
                </p>
            </motion.div>
        </div>
    );
}
