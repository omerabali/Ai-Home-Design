import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
    secondary: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30",
    ghost: "bg-white/10 text-slate-700 hover:bg-slate-100 border border-slate-200",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600"
};

const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-medium",
};

export default function Button({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}) {
    return (
        <button
            className={cn(
                "rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
