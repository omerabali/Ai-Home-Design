import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function NavItem({ label, hasDropdown }) {
    return (
        <div className="flex items-center text-sm text-gray-300 hover:text-white cursor-pointer">
            <span>{label}</span>
            {hasDropdown && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            )}
        </div>
    );
}

function MobileNavItem({ label }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white">
            <span>{label}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
    );
}

export function GradientHero({
    logo = "DesignAI",
    navigation = [
        { label: "Özellikler", hasDropdown: true },
        { label: "Fiyatlar", hasDropdown: false },
        { label: "Hakkımızda", hasDropdown: false },
    ],
    badge = "AI ile tasarımın geleceği burada!",
    title = "Profesyonel İç Mekan Tasarımı için AI Araçları",
    subtitle = "Her gün benzersiz tasarımlar sunuyoruz. Aracımız, maliyet etkinliğini yeniden tanımlıyor.",
    ctaText = "7 Gün Ücretsiz Deneyin",
    secondaryCtaText = "Demo İzle",
    onCtaClick,
    onSecondaryCtaClick,
    heroImage = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            {/* Gradient background */}
            <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0">
                <div className="h-[10rem] rounded-full w-[60rem] bg-gradient-to-b blur-[6rem] from-purple-600 to-sky-600"></div>
                <div className="h-[10rem] rounded-full w-[90rem] bg-gradient-to-b blur-[6rem] from-pink-900 to-yellow-400"></div>
                <div className="h-[10rem] rounded-full w-[60rem] bg-gradient-to-b blur-[6rem] from-yellow-600 to-sky-500"></div>
            </div>
            <div className="absolute inset-0 z-0 bg-black/30"></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="container mx-auto flex items-center justify-between px-4 py-4 mt-6">
                    <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg">
                            ⚡
                        </div>
                        <span className="ml-3 text-xl font-bold text-white">{logo}</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="flex items-center space-x-6">
                            {navigation.map((item, i) => (
                                <NavItem key={i} label={item.label} hasDropdown={item.hasDropdown} />
                            ))}
                        </div>
                        <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-colors">
                            Giriş Yap
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
                    </button>
                </nav>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 md:hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                        ⚡
                                    </div>
                                    <span className="ml-3 text-xl font-bold text-white">{logo}</span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)}>
                                    <X className="h-6 w-6 text-white" />
                                </button>
                            </div>
                            <div className="mt-8 flex flex-col space-y-6">
                                {navigation.map((item, i) => (
                                    <MobileNavItem key={i} label={item.label} />
                                ))}
                                <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90">
                                    Başlayın
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto mt-8 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
                >
                    <span className="text-sm font-medium text-white">{badge}</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                </motion.div>

                {/* Hero Content */}
                <div className="container mx-auto mt-12 px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto mt-6 max-w-2xl text-lg text-gray-300"
                    >
                        {subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                    >
                        <button
                            onClick={onCtaClick}
                            className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-colors shadow-lg"
                        >
                            {ctaText}
                        </button>
                        <button
                            onClick={onSecondaryCtaClick}
                            className="h-12 rounded-full border border-gray-600 px-8 text-base font-medium text-white hover:bg-white/10 transition-colors"
                        >
                            {secondaryCtaText}
                        </button>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative mx-auto my-20 w-full max-w-5xl"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl" />
                        <img
                            src={heroImage}
                            alt="Interior Design Preview"
                            className="relative w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default GradientHero;
