import { motion } from 'framer-motion';
import { Star, Users, Image, Zap } from 'lucide-react';

const stats = [
    {
        icon: Users,
        value: "50K+",
        label: "Aktif Kullanıcı",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Image,
        value: "1M+",
        label: "Oluşturulan Tasarım",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: Zap,
        value: "<10s",
        label: "Ortalama Süre",
        color: "from-orange-500 to-red-500"
    },
    {
        icon: Star,
        value: "4.9",
        label: "Kullanıcı Puanı",
        color: "from-yellow-500 to-orange-500"
    },
];

const testimonials = [
    {
        name: "Ayşe Kaya",
        role: "İç Mimar",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        content: "DesignAI ile projelerimi 10 kat daha hızlı tamamlıyorum. Müşterilerim sonuçlara bayılıyor!",
        rating: 5
    },
    {
        name: "Mehmet Yılmaz",
        role: "Emlak Danışmanı",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        content: "Evleri satışa çıkarmadan önce AI ile yeniden tasarlıyorum. Satış süreleri yarıya düştü.",
        rating: 5
    },
    {
        name: "Zeynep Demir",
        role: "Ev Sahibi",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        content: "Evimi yenilemeden önce nasıl görüneceğini görmek harika. Tasarruf ettim ve mükemmel sonuç aldım.",
        rating: 5
    }
];

export function StatsAndTestimonials() {
    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-${stat.color}))` }} />
                            <div className="relative p-6 text-center">
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-slate-600 text-sm">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Testimonials Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-4"
                    >
                        <Star className="w-4 h-4 fill-current" />
                        Kullanıcı Yorumları
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        Binlerce Kullanıcı Güveniyor
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        Profesyonellerden ev sahiplerine, herkes DesignAI ile hayallerini gerçeğe dönüştürüyor.
                    </motion.p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
                        >
                            {/* Quote icon */}
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-serif">
                                "
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-slate-700 mb-6 leading-relaxed">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50"
                                />
                                <div>
                                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default StatsAndTestimonials;
