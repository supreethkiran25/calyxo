import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ThreeUI Inspired ShaderButtons — Star Portal Variant
 * Raw Canvas 2D + Micro Particle Starfield + Cursor Radiance + CSS Conic Glow
 */
export default function ShaderButton({
  children,
  onClick,
  variant = 'star-portal', // 'star-portal' | 'neon-portal' | 'ghost-portal'
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  disabled = false,
  type = 'button',
  ...props
}) {
  const canvasRef = useRef(null);
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Canvas Starfield Engine (ThreeUI Star Portal)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || 160);
    let height = (canvas.height = canvas.offsetHeight || 44);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 160;
      height = canvas.height = canvas.offsetHeight || 44;
    };

    window.addEventListener('resize', handleResize);

    // Initialize 32 cosmic stars
    const starCount = 28;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
      angle: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Deep space ambient glow centered on mouse
      const glowX = mousePos.x * width;
      const glowY = mousePos.y * height;
      const glowRadius = isHovered ? Math.max(width, height) * 0.85 : width * 0.5;

      const radialGradient = ctx.createRadialGradient(
        glowX, glowY, 0,
        glowX, glowY, glowRadius
      );

      if (variant === 'neon-portal') {
        radialGradient.addColorStop(0, isHovered ? 'rgba(204, 255, 0, 0.35)' : 'rgba(204, 255, 0, 0.18)');
        radialGradient.addColorStop(0.5, 'rgba(204, 255, 0, 0.05)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (variant === 'ghost-portal') {
        radialGradient.addColorStop(0, isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        // Standard Star Portal (Cosmic Indigo / Cyan / Acid Starburst)
        radialGradient.addColorStop(0, isHovered ? 'rgba(120, 119, 198, 0.4)' : 'rgba(88, 86, 214, 0.22)');
        radialGradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.08)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      // Render & Animate Stars
      stars.forEach((star) => {
        // Star twinkling pulse
        const dynamicAlpha = Math.sin(time * star.pulseSpeed * 60 + star.pulseOffset) * 0.35 + 0.65;
        
        // Gentle cosmic drift
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        if (variant === 'neon-portal') {
          ctx.fillStyle = `rgba(204, 255, 0, ${star.alpha * dynamicAlpha})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * dynamicAlpha})`;
        }
        ctx.fill();

        // Shimmering cross sparkle on brightest stars
        if (star.size > 1.4 && isHovered) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha * dynamicAlpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - 3, star.y);
          ctx.lineTo(star.x + 3, star.y);
          ctx.moveTo(star.x, star.y - 3);
          ctx.lineTo(star.x, star.y + 3);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, mousePos, variant]);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs rounded-xl h-[36px]',
    md: 'px-5 py-2.5 text-xs font-semibold rounded-2xl h-[44px]',
    lg: 'px-8 py-3.5 text-sm font-bold rounded-2xl h-[52px]'
  };

  const variantStyles = {
    'star-portal': `
      bg-[#06060c] text-white border border-white/20 
      hover:border-white/50 shadow-[0_0_20px_rgba(120,119,198,0.25)] 
      hover:shadow-[0_0_35px_rgba(120,119,198,0.45)]
    `,
    'neon-portal': `
      bg-[#0a0f05] text-[#CCFF00] border border-[#CCFF00]/40 
      hover:border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.2)] 
      hover:shadow-[0_0_40px_rgba(204,255,0,0.5)]
    `,
    'ghost-portal': `
      bg-white/[0.04] text-gray-200 border border-white/10 
      hover:border-white/30 hover:text-white
    `
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`relative group inline-flex items-center justify-center gap-2.5 overflow-hidden transition-all duration-200 cursor-pointer select-none font-sans ${sizeClasses[size] || sizeClasses.md} ${variantStyles[variant] || variantStyles['star-portal']} ${className}`}
      {...props}
    >
      {/* Background Star Portal Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl z-0"
      />

      {/* Radiant Conic Shimmer Ring on Hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Button Content Label & Icon */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
