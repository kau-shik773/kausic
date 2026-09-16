import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Shuffle } from 'lucide-react';

export type VisualizerMode = 'ORBITAL_SPHERE' | 'HEX_SPECTRUM' | 'SONIC_SHOCKWAVES' | 'LASER_OSCILLOSCOPE';

const MODES: VisualizerMode[] = [
  'ORBITAL_SPHERE',
  'HEX_SPECTRUM',
  'SONIC_SHOCKWAVES',
  'LASER_OSCILLOSCOPE'
];

interface CyberVisualizerProps {
  className?: string;
}

export const CyberVisualizer: React.FC<CyberVisualizerProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentMode, setCurrentMode] = useState<VisualizerMode>(() => {
    return MODES[Math.floor(Math.random() * MODES.length)];
  });

  const animRef = useRef<number>(0);
  const rotAngleRef = useRef<number>(0);

  const cycleMode = () => {
    audioEngine.playRoboticTick();
    setCurrentMode(prev => {
      const idx = MODES.indexOf(prev);
      return MODES[(idx + 1) % MODES.length];
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(128);

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      audioEngine.getFrequencyData(dataArray);

      let bassSum = 0;
      for (let i = 0; i < 10; i++) bassSum += dataArray[i];
      const bassAvg = bassSum / 10 / 255;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      if (currentMode === 'ORBITAL_SPHERE') {
        rotAngleRef.current += 0.015 + bassAvg * 0.03;
        const count = 36;
        const radius = Math.min(w, h) * 0.28 + bassAvg * 35;

        for (let i = 0; i < count; i++) {
          const theta = (Math.PI * 2 * i) / count + rotAngleRef.current;
          const freqVal = dataArray[i % 64] / 255;
          const r = radius + freqVal * 30;

          const px = cx + Math.cos(theta) * r;
          const py = cy + Math.sin(theta) * r * 0.6;

          ctx.beginPath();
          ctx.arc(px, py, 2.5 + freqVal * 4, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#d4af37' : '#f7e7b4';
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 10;
          ctx.fill();

          if (freqVal > 0.4) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(px, py);
            ctx.strokeStyle = `rgba(212, 175, 55, ${freqVal * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      } else if (currentMode === 'HEX_SPECTRUM') {
        const barCount = 32;
        const barWidth = (w * 0.8) / barCount;
        const startX = w * 0.1;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] / 255;
          const barHeight = Math.max(6, val * (h * 0.6));
          const bx = startX + i * barWidth;
          const by = cy + (h * 0.3) - barHeight;

          const grad = ctx.createLinearGradient(bx, by, bx, by + barHeight);
          grad.addColorStop(0, '#f7e7b4');
          grad.addColorStop(0.5, '#d4af37');
          grad.addColorStop(1, '#8c701e');

          ctx.fillStyle = grad;
          ctx.fillRect(bx + 1.5, by, barWidth - 3, barHeight);

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 8;
          ctx.fillRect(bx + 1.5, by - 3, barWidth - 3, 2);
        }
      } else if (currentMode === 'SONIC_SHOCKWAVES') {
        const rings = 5;
        for (let r = 1; r <= rings; r++) {
          const ringRad = (Math.min(w, h) * 0.12 * r) + bassAvg * 25 * r;
          const alpha = Math.max(0.1, 1 - (r / rings) + bassAvg * 0.3);

          ctx.beginPath();
          ctx.arc(cx, cy, ringRad, 0, Math.PI * 2);
          ctx.strokeStyle = r % 2 === 0 ? `rgba(212, 175, 55, ${alpha})` : `rgba(247, 231, 180, ${alpha})`;
          ctx.lineWidth = 1.5 + bassAvg * 2;
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 12;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, 14 + bassAvg * 20, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af37';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#d4af37';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f7e7b4';
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 12;

        const sliceWidth = w / 64;
        let x = 0;
        for (let i = 0; i < 64; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * (h * 0.3)) + (cy - (h * 0.15));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [currentMode]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/40 border border-[#d4af37]/30 backdrop-blur-md group ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={220}
        className="w-full h-full object-cover"
      />

      <button
        onClick={cycleMode}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 hover:bg-neutral-800 text-[10px] font-mono text-[#f7e7b4] border border-[#d4af37]/30 shadow-md backdrop-blur-md transition-all hover:scale-105"
        title="Cycle Visualizer Engine"
      >
        <Shuffle className="w-3 h-3 text-[#d4af37]" />
        <span>{currentMode.replace('_', ' ')}</span>
      </button>
    </div>
  );
};
