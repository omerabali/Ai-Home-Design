import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { cn } from "./Button"; // Reusing cn utility, usually should be in utils/cn.js

export default function FileUpload({ onFileSelect, className }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Basic validation
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            if (onFileSelect) onFileSelect(file, reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        if (onFileSelect) onFileSelect(null, null);
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                className={cn(
                    "relative group w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50",
                    preview ? "border-solid border-slate-200" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />

                {preview ? (
                    <div className="relative w-full h-full">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={removeFile}
                                className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        {/* Change overlay */}
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to change
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center p-6 space-y-4">
                        <div className={cn(
                            "p-4 rounded-full bg-blue-50 text-blue-500 transition-transform duration-300 group-hover:scale-110",
                            dragActive && "bg-blue-100 scale-110"
                        )}>
                            <UploadCloud size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Upload your room photo
                            </h3>
                            <p className="text-sm text-slate-500 max-w-[240px]">
                                Drag & drop or click to browse. Supports JPG, PNG, WEBP.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
