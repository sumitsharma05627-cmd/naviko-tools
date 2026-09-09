import React, { useEffect, useRef } from 'react';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
}

export const Ambient3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Draw a subtle, static ambient gradient and do not run animation loop
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const particleCount = isMobile ? 18 : 45;
    const particles: Particle3D[] = [];

    const colors = [
      'rgba(99, 102, 241, ', // Indigo
      'rgba(16, 185, 129, ', // Emerald
      'rgba(168, 85, 247, ', // Purple
      'rgba(45, 212, 191, ', // Teal
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.25 + 0.1,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.05;
      targetMouseY = (e.clientY - height / 2) * 0.05;
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const fov = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera dampening
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const cx = width / 2 + mouseX;
      const cy = height / 2 + mouseY;

      // Draw subtle connections between close nodes
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particles
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.z += p1.vz;

        // Wrap around bounds
        if (p1.z < 50) p1.z = 850;
        if (p1.z > 900) p1.z = 60;
        if (p1.x < -width) p1.x = width;
        if (p1.x > width) p1.x = -width;
        if (p1.y < -height) p1.y = height;
        if (p1.y > height) p1.y = -height;

        const scale = fov / (fov + p1.z);
        const screenX = cx + p1.x * scale;
        const screenY = cy + p1.y * scale;
        const radius = Math.max(0.5, p1.size * scale);

        if (screenX >= -50 && screenX <= width + 50 && screenY >= -50 && screenY <= height + 50) {
          // Draw particle
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p1.color}${p1.alpha * scale})`;
          ctx.fill();

          // Connect nearby particles with subtle light filament
          if (!isMobile) {
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dz = p1.z - p2.z;
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

              if (dist < 150) {
                const p2Scale = fov / (fov + p2.z);
                const p2ScreenX = cx + p2.x * p2Scale;
                const p2ScreenY = cy + p2.y * p2Scale;
                const lineAlpha = (1 - dist / 150) * 0.08 * scale;

                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(p2ScreenX, p2ScreenY);
                ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
                ctx.lineWidth = 0.75;
                ctx.stroke();
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 dark:opacity-75" />
    </div>
  );
};
