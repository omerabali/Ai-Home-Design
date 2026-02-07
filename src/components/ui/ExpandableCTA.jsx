import { useState, useEffect } from "react";
import { X, Check, ArrowRight, Sparkles, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpandableCTA({
    buttonText = "Demo İste",
    onSuccess
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [formStep, setFormStep] = useState("idle"); // idle, submitting, success

    const handleExpand = () => setIsExpanded(true);

    const handleClose = () => {
        setIsExpanded(false);
        setTimeout(() => setFormStep("idle"), 500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStep("submitting");
        setTimeout(() => {
            setFormStep("success");
            onSuccess?.();
        }, 1500);
    };

    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isExpanded]);

    return (
        <>
            {/* Trigger Button */}
            <AnimatePresence initial={false}>
                {!isExpanded && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleExpand}
                        className="inline-flex items-center gap-2 h-14 px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
                    >
                        {buttonText}
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Modal Overlay */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={handleClose}
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="relative flex flex-col lg:flex-row h-full sm:h-auto w-full sm:max-w-4xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 sm:rounded-3xl shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Left Side: Info */}
                            <div className="flex-1 flex flex-col justify-center p-8 lg:p-12 gap-6 text-white">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                                        <Sparkles className="w-4 h-4" />
                                        AI Destekli Tasarım
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                                        Hayalinizdeki Evi<br />Tasarlayalım
                                    </h2>
                                    <p className="text-indigo-100 text-lg max-w-md">
                                        Profesyonel ekibimiz sizinle iletişime geçip ücretsiz demo sunacak.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            <Home className="w-6 h-6 text-indigo-200" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Sınırsız Tasarım</h3>
                                            <p className="text-indigo-100/80 text-sm leading-relaxed mt-1">
                                                Modern, Industrial, Minimalist ve daha fazla stil seçeneği.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/20 hidden lg:block">
                                    <figure>
                                        <blockquote className="text-lg font-medium leading-relaxed mb-4">
                                            "DesignAI ile evimi tamamen yeniden tasarladım. Sonuçlar inanılmazdı!"
                                        </blockquote>
                                        <figcaption className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                                                AK
                                            </div>
                                            <div>
                                                <div className="font-semibold">Ayşe Kaya</div>
                                                <div className="text-sm text-indigo-200">İç Mimar</div>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white/5 backdrop-blur-sm">
                                <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">

                                    {formStep === "success" ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center text-center py-12 space-y-6"
                                        >
                                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                                <Check className="w-10 h-10 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Talebiniz Alındı!</h3>
                                                <p className="text-indigo-100">Ekibimiz en kısa sürede sizinle iletişime geçecek.</p>
                                            </div>
                                            <button
                                                onClick={handleClose}
                                                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                Kapat
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-semibold text-white">Ücretsiz Demo Al</h3>
                                                <p className="text-sm text-indigo-200">Formu doldurun, size ulaşalım.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-xs font-medium text-indigo-200 mb-1.5 uppercase tracking-wider">
                                                        Ad Soyad
                                                    </label>
                                                    <input
                                                        required
                                                        type="text"
                                                        id="name"
                                                        placeholder="Ahmet Yılmaz"
                                                        className="w-full px-4 py-3 rounded-lg bg-indigo-950/40 border border-indigo-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className="block text-xs font-medium text-indigo-200 mb-1.5 uppercase tracking-wider">
                                                        E-posta
                                                    </label>
                                                    <input
                                                        required
                                                        type="email"
                                                        id="email"
                                                        placeholder="ahmet@ornek.com"
                                                        className="w-full px-4 py-3 rounded-lg bg-indigo-950/40 border border-indigo-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="phone" className="block text-xs font-medium text-indigo-200 mb-1.5 uppercase tracking-wider">
                                                        Telefon
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        placeholder="+90 5XX XXX XX XX"
                                                        className="w-full px-4 py-3 rounded-lg bg-indigo-950/40 border border-indigo-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="message" className="block text-xs font-medium text-indigo-200 mb-1.5 uppercase tracking-wider">
                                                        Mesajınız
                                                    </label>
                                                    <textarea
                                                        id="message"
                                                        rows={3}
                                                        placeholder="Projeniz hakkında bilgi verin..."
                                                        className="w-full px-4 py-3 rounded-lg bg-indigo-950/40 border border-indigo-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                disabled={formStep === "submitting"}
                                                type="submit"
                                                className="w-full flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                            >
                                                {formStep === "submitting" ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                                        Gönderiliyor...
                                                    </span>
                                                ) : "Gönder"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
