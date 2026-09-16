import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface TouchParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'spark' | 'hex' | 'line';
  angle?: number;
}

interface TouchRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
  style: 'ring' | 'crosshair' | 'circuit';
}

const CYBER_COLORS = [
  '#00f2fe', // Holographic Cyan
  '#4facfe', // Neon Blue
  '#ff007f', // Cyber Magenta
  '#00ff87', // Electric Lime
  '#ff9900', // Mech Amber
  '#ffffff', // Core White
];

export const CyberTouchEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<TouchParticle[]>([]);
  const ringsRef = useRef<TouchRing[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerDown = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Play subtle robotic tick
      audioEngine.playRoboticTick();

      const baseColor = CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)];
      const styleType = (['ring', 'crosshair', 'circuit'] as const)[Math.floor(Math.random() * 3)];

      // Spawn concentric sci-fi rings / reticle
      ringsRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: 36 + Math.random() * 24,
        color: baseColor,
        life: 1.0,
        maxLife: 24,
        style: styleType
      });

      // Spawn unpredictable cyber-particles
      const particleCount = 6 + Math.floor(Math.random() * 8);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
        const speed = 2.5 + Math.random() * 4.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)],
          size: 2 + Math.random() * 3,
          life: 1.0,
          maxLife: 20 + Math.random() * 15,
          shape: Math.random() > 0.4 ? 'spark' : 'circle',
          angle
        });
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // 60FPS render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render rings
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const ring = ringsRef.current[i];
        ring.radius += (ring.maxRadius - ring.radius) * 0.18;
        ring.life -= 1 / ring.maxLife;

        if (ring.life <= 0) {
          ringsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ring.life);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 8;

        if (ring.style === 'ring') {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ring.style === 'crosshair') {
          // HUD Reticle
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
          // Cross ticks
          ctx.beginPath();
          ctx.moveTo(ring.x - ring.radius - 6, ring.y);
          ctx.lineTo(ring.x - ring.radius + 4, ring.y);
          ctx.moveTo(ring.x + ring.radius - 4, ring.y);
          ctx.lineTo(ring.x + ring.radius + 6, ring.y);
          ctx.moveTo(ring.x, ring.y - ring.radius - 6);
          ctx.lineTo(ring.x, ring.y - ring.radius + 4);
          ctx.moveTo(ring.x, ring.y + ring.radius - 4);
          ctx.lineTo(ring.x, ring.y + ring.radius + 6);
          ctx.stroke();
        } else {
          // Circuit polygon
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const rad = ring.radius;
            const a = (Math.PI / 3) * s;
            const px = ring.x + Math.cos(a) * rad;
            const py = ring.y + Math.sin(a) * rad;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      }

      // Render particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        if (p.shape === 'spark') {
          // Angled circuit spark
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999]"
      aria-hidden="true"
    />
  );
};
