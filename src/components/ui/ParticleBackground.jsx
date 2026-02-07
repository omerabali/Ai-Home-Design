import React, { useEffect, useRef, useState, useCallback } from 'react';

// Configuration
const PARTICLE_DENSITY = 0.00012;
const BG_PARTICLE_DENSITY = 0.00004;
const MOUSE_RADIUS = 180;
const RETURN_SPEED = 0.08;
const DAMPING = 0.90;
const REPULSION_STRENGTH = 1.2;

const randomRange = (min, max) => Math.random() * (max - min) + min;

export default function ParticleBackground({
    className = "",
    particleColor = "#6366f1",
    accentColor = "#4f46e5"
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const particlesRef = useRef([]);
    const backgroundParticlesRef = useRef([]);
    const mouseRef = useRef({ x: -1000, y: -1000, isActive: false });
    const frameIdRef = useRef(0);
    const lastTimeRef = useRef(0);

    const initParticles = useCallback((width, height) => {
        // Main particles
        const particleCount = Math.floor(width * height * PARTICLE_DENSITY);
        const newParticles = [];

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;

            newParticles.push({
                x, y,
                originX: x,
                originY: y,
                vx: 0, vy: 0,
                size: randomRange(1, 2.5),
                color: Math.random() > 0.85 ? accentColor : '#ffffff',
                angle: Math.random() * Math.PI * 2,
            });
        }
        particlesRef.current = newParticles;

        // Background particles
        const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
        const newBgParticles = [];

        for (let i = 0; i < bgCount; i++) {
            newBgParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: randomRange(0.5, 1.5),
                alpha: randomRange(0.1, 0.4),
                phase: Math.random() * Math.PI * 2
            });
        }
        backgroundParticlesRef.current = newBgParticles;
    }, [accentColor]);

    const animate = useCallback((time) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        lastTimeRef.current = time;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Radial glow
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const pulseOpacity = Math.sin(time * 0.0008) * 0.035 + 0.085;

        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(canvas.width, canvas.height) * 0.7
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${pulseOpacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background particles
        const bgParticles = backgroundParticlesRef.current;
        ctx.fillStyle = "#ffffff";

        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
            ctx.globalAlpha = p.alpha * (0.3 + 0.7 * twinkle);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Main particles physics
        const particles = particlesRef.current;
        const mouse = mouseRef.current;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (mouse.isActive && distance < MOUSE_RADIUS) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                const repulsion = force * REPULSION_STRENGTH;
                p.vx -= forceDirectionX * repulsion * 5;
                p.vy -= forceDirectionY * repulsion * 5;
            }

            const springDx = p.originX - p.x;
            const springDy = p.originY - p.y;
            p.vx += springDx * RETURN_SPEED;
            p.vy += springDy * RETURN_SPEED;
        }

        // Draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.vx *= DAMPING;
            p.vy *= DAMPING;
            p.x += p.vx;
            p.y += p.vy;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const opacity = Math.min(0.3 + velocity * 0.1, 1);

            ctx.fillStyle = p.color === '#ffffff'
                ? `rgba(255, 255, 255, ${opacity})`
                : p.color;
            ctx.fill();
        }

        frameIdRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;

                canvasRef.current.width = width * dpr;
                canvasRef.current.height = height * dpr;
                canvasRef.current.style.width = `${width}px`;
                canvasRef.current.style.height = `${height}px`;

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);

                initParticles(width, height);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [initParticles]);

    useEffect(() => {
        frameIdRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameIdRef.current);
    }, [animate]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            isActive: true,
        };
    };

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 z-0 overflow-hidden bg-slate-900 ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseRef.current.isActive = false; }}
        >
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
