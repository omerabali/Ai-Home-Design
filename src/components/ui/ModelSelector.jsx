import React from 'react';
import { ChevronDown, Cpu, Zap, Box, Sparkles, Palette } from 'lucide-react';

const models = [
    { id: 'flux', name: 'Flux Realism', icon: Box, description: 'En İyi Kalite (Önerilen)' },
    { id: 'flux-realism', name: 'Flux Realism Pro', icon: Sparkles, description: 'Ultra Gerçekçi' },
    { id: 'turbo', name: 'Turbo', icon: Zap, description: 'Hızlı Sonuç' },
    { id: 'flux-anime', name: 'Flux Anime', icon: Palette, description: 'Anime Stili' },
];

export default function ModelSelector({ selected, onSelect }) {
    return (
        <div className="w-full">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                </div>
                <select
                    value={selected}
                    onChange={(e) => onSelect(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 text-base border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl appearance-none bg-white/5 backdrop-blur-sm transition-all hover:border-indigo-500/50 cursor-pointer text-white font-medium"
                >
                    {models.map((model) => (
                        <option key={model.id} value={model.id} className="bg-slate-800 text-white">
                            {model.name} - {model.description}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-white/40 group-hover:text-indigo-400 transition-colors">
                    <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </div>
            </div>
            <p className="mt-2 text-xs text-white/40 px-1">
                💡 "Flux Realism" en tutarlı sonuçları verir
            </p>
        </div>
    );
}
