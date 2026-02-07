import React, { useEffect, useState } from 'react';

// ArcGalleryHero Component - Displays images in an arc formation with animations
export function ArcGalleryHero({
    images,
    title = "AI ile Mekanlarınızı Yeniden Keşfedin",
    subtitle = "Akıllı platformumuz en değerli anlarınızı bulur, düzenler ve hayata döndürür.",
    ctaText = "Tasarıma Başla",
    secondaryCtaText = "Nasıl Çalışır",
    onCtaClick,
    onSecondaryCtaClick,
    startAngle = 20,
    endAngle = 160,
    radiusLg = 480,
    radiusMd = 360,
    radiusSm = 260,
    cardSizeLg = 120,
    cardSizeMd = 100,
    cardSizeSm = 80,
    className = '',
}) {
    const [dimensions, setDimensions] = useState({
        radius: radiusLg,
        cardSize: cardSizeLg,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
            } else if (width < 1024) {
                setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
            } else {
                setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

    const count = Math.max(images.length, 2);
    const step = (endAngle - startAngle) / (count - 1);

    return (
        <section className={`relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen flex flex-col ${className}`}>
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Arc container */}
            <div
                className="relative mx-auto"
                style={{
                    width: '100%',
                    height: dimensions.radius * 1.2,
                }}
            >
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
                    {images.map((src, i) => {
                        const angle = startAngle + step * i;
                        const angleRad = (angle * Math.PI) / 180;
                        const x = Math.cos(angleRad) * dimensions.radius;
                        const y = Math.sin(angleRad) * dimensions.radius;

                        return (
                            <div
                                key={i}
                                className="absolute opacity-0 animate-fade-in-up"
                                style={{
                                    width: dimensions.cardSize,
                                    height: dimensions.cardSize,
                                    left: `calc(50% + ${x}px)`,
                                    bottom: `${y}px`,
                                    transform: `translate(-50%, 50%)`,
                                    animationDelay: `${i * 100}ms`,
                                    animationFillMode: 'forwards',
                                    zIndex: count - i,
                                }}
                            >
                                <div
                                    className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-white/20 bg-slate-800 transition-transform hover:scale-105 w-full h-full"
                                    style={{ transform: `rotate(${angle / 4}deg)` }}
                                >
                                    <img
                                        src={src}
                                        alt={`Design ${i + 1}`}
                                        className="block w-full h-full object-cover"
                                        draggable={false}
                                        onError={(e) => {
                                            e.target.src = `https://placehold.co/400x400/334155/e2e8f0?text=Design`;
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-6 -mt-40 md:-mt-52 lg:-mt-64">
                <div className="text-center max-w-2xl px-6 opacity-0 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                        {title}
                    </h1>
                    <p className="mt-4 text-lg text-slate-300">
                        {subtitle}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onCtaClick}
                            className="w-full sm:w-auto px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {ctaText}
                        </button>
                        <button
                            onClick={onSecondaryCtaClick}
                            className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-500 hover:bg-slate-700 transition-all duration-200"
                        >
                            {secondaryCtaText}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline CSS for animations */}
            <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 60%); }
          to { opacity: 1; transform: translate(-50%, 50%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
        </section>
    );
}

export default ArcGalleryHero;
