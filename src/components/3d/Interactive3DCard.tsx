import React, { useRef, useState, useCallback } from 'react';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // default: 6 degrees
  elevation?: number; // default: 8px translateZ
  onClick?: () => void;
  style?: React.CSSProperties;
  enableGlow?: boolean;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  elevation = 10,
  onClick,
  style,
  enableGlow = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't apply tilt on touch screens or if reduced motion is requested
      if (e.pointerType === 'touch') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-maxTilt to +maxTilt)
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTransformStyle(
        `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${elevation}px)`
      );

      if (enableGlow) {
        setGlarePosition({
          x: Math.round((x / rect.width) * 100),
          y: Math.round((y / rect.height) * 100),
          opacity: 0.18,
        });
      }
    },
    [maxTilt, elevation, enableGlow]
  );

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Dynamic Specular Sheen Layer */}
      {enableGlow && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(circle 280px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Content with subtle depth */}
      <div className="w-full h-full relative z-10">{children}</div>
    </div>
  );
};
