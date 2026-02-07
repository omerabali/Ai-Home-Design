import { motion } from 'framer-motion';

const styles = [
    { id: 'modern', name: 'Modern', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
    { id: 'bohemian', name: 'Bohemian', image: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400&q=80' },
    { id: 'minimalist', name: 'Minimalist', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80' },
    { id: 'industrial', name: 'Industrial', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=80' },
    { id: 'scandinavian', name: 'Scandinavian', image: 'https://images.unsplash.com/photo-1595558171673-e794821558bb?w=400&q=80' },
    { id: 'luxury', name: 'Luxury Creative', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80' },
    { id: 'midcentury', name: 'Mid-Century', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80' },
    { id: 'art_deco', name: 'Art Deco', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80' },
    { id: 'farmhouse', name: 'Farmhouse', image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80' },
    { id: 'coastal', name: 'Coastal', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80' }
];

export default function StyleSelector({ selected, onSelect }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {styles.map((style) => (
                <motion.div
                    key={style.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        console.log("Style selected:", style.id); // Debug Log
                        onSelect(style.id);
                    }}
                    className={`relative cursor-pointer rounded-xl overflow-hidden aspect-square group border-2 transition-all ${selected === style.id
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-500 ring-offset-2 ring-offset-black'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                >
                    <img src={style.image} alt={style.name} className="w-full h-full object-cover" />

                    {/* Fixed Overlay: Pointer events none allows clicks to pass through to the parent div if needed, 
                        but since the onClick is on the parent, this visual overlay shouldn't block it unless z-index is weird.
                        Making it pointer-events-none ensures clarity. */}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity pointer-events-none ${selected === style.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                        <span className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                            {style.name}
                        </span>
                    </div>

                    {selected === style.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
