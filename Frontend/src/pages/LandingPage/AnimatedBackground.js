import React, { useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Ultra-enhanced cosmic animated background with:
 * - Dense floating particles with varying sizes
 * - Glowing orbs with pulsing halos
 * - Shooting stars / meteor trails
 * - Wireframe geometric shapes (rotating)
 * - Network connection lines
 * - Nebula-like gradient clouds
 * - Mouse-reactive parallax layer
 */

// Deterministic pseudo-random from seed
const sr = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const COLORS = [
  'rgba(59, 130, 246, 0.6)',   // blue
  'rgba(139, 92, 246, 0.5)',   // purple
  'rgba(245, 158, 11, 0.5)',   // gold
  'rgba(16, 185, 129, 0.5)',   // emerald
  'rgba(236, 72, 153, 0.5)',   // pink
  'rgba(99, 102, 241, 0.4)',   // indigo
  'rgba(6, 182, 212, 0.4)',    // cyan
];

/* ── Floating Particle ──────────────────────────────── */
const Particle = ({ index }) => {
  const size = 1.5 + sr(index * 7) * 6;
  const x = sr(index * 13) * 100;
  const y = sr(index * 17) * 100;
  const dur = 12 + sr(index * 23) * 20;
  const delay = sr(index * 31) * 8;
  const color = COLORS[index % COLORS.length];

  return (
    <motion.div
      className="particle"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
      animate={{
        y: [0, -40 - sr(index * 41) * 60, 20, -30, 0],
        x: [0, 25 * (sr(index * 53) > 0.5 ? 1 : -1), -15, 30, 0],
        opacity: [0.2, 0.8, 0.3, 0.9, 0.2],
        scale: [1, 1.5, 0.7, 1.3, 1],
      }}
      transition={{
        duration: dur,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/* ── Glowing Orb with halo ──────────────────────────── */
const GlowingOrb = ({ index }) => {
  const size = 30 + sr(index * 43) * 80;
  const x = 10 + sr(index * 47) * 80;
  const y = 10 + sr(index * 59) * 80;
  const dur = 8 + sr(index * 61) * 12;
  const color = COLORS[index % COLORS.length];
  const colorBright = color.replace(/[\d.]+\)$/, '0.3)');

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, ${colorBright} 40%, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
        pointerEvents: 'none',
      }}
      animate={{
        scale: [1, 1.4, 0.9, 1.3, 1],
        opacity: [0.15, 0.35, 0.1, 0.3, 0.15],
      }}
      transition={{
        duration: dur,
        delay: sr(index * 67) * 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/* ── Shooting Star ──────────────────────────────────── */
const ShootingStar = ({ index }) => {
  const startX = sr(index * 73) * 100;
  const startY = sr(index * 79) * 40;
  const angle = 15 + sr(index * 83) * 30;
  const dur = 1.5 + sr(index * 89) * 2;
  const delay = sr(index * 97) * 15;
  const len = 80 + sr(index * 101) * 120;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${startX}%`,
        top: `${startY}%`,
        width: len,
        height: 1.5,
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.8), rgba(59,130,246,0.6), transparent)`,
        borderRadius: 2,
        transformOrigin: 'left center',
        transform: `rotate(${angle}deg)`,
        pointerEvents: 'none',
        filter: 'blur(0.5px)',
      }}
      animate={{
        opacity: [0, 0, 1, 1, 0],
        x: [0, 0, 200, 400, 400],
        scaleX: [0.3, 0.3, 1, 0.5, 0],
      }}
      transition={{
        duration: dur,
        delay,
        repeat: Infinity,
        repeatDelay: 8 + sr(index * 103) * 15,
        ease: 'easeOut',
        times: [0, 0.1, 0.4, 0.8, 1],
      }}
    />
  );
};

/* ── Wireframe Geometric Shape ──────────────────────── */
const WireframeShape = ({ index }) => {
  const size = 50 + sr(index * 67) * 140;
  const x = 5 + sr(index * 71) * 85;
  const y = 10 + sr(index * 79) * 75;
  const dur = 20 + sr(index * 83) * 25;
  const isTriangle = index % 3 === 0;
  const isHex = index % 3 === 1;
  const borderColor = COLORS[(index * 2) % COLORS.length].replace(/[\d.]+\)$/, '0.12)');

  if (isTriangle) {
    return (
      <motion.div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: 0,
          height: 0,
          borderLeft: `${size * 0.5}px solid transparent`,
          borderRight: `${size * 0.5}px solid transparent`,
          borderBottom: `${size * 0.866}px solid ${borderColor}`,
          pointerEvents: 'none',
        }}
        animate={{
          rotate: [0, 360],
          opacity: [0.06, 0.15, 0.06],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          rotate: { duration: dur, repeat: Infinity, ease: 'linear' },
          opacity: { duration: dur * 0.5, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: dur * 0.4, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    );
  }

  if (isHex) {
    return (
      <motion.svg
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        animate={{
          rotate: [0, -360],
          opacity: [0.05, 0.14, 0.05],
        }}
        transition={{
          rotate: { duration: dur * 1.2, repeat: Infinity, ease: 'linear' },
          opacity: { duration: dur * 0.6, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <polygon
          points="50,3 93,25 93,75 50,97 7,75 7,25"
          fill="none"
          stroke={borderColor}
          strokeWidth="1"
        />
      </motion.svg>
    );
  }

  // Circle
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        border: `1px solid ${borderColor}`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 0.95, 1],
        opacity: [0.06, 0.16, 0.06],
      }}
      transition={{
        rotate: { duration: dur, repeat: Infinity, ease: 'linear' },
        scale: { duration: dur * 0.6, repeat: Infinity, ease: 'easeInOut' },
        opacity: { duration: dur * 0.4, repeat: Infinity, ease: 'easeInOut' },
      }}
    />
  );
};

/* ── Network Connection Line ────────────────────────── */
const NetworkLine = ({ index }) => {
  const x1 = sr(index * 89) * 100;
  const y1 = sr(index * 97) * 100;
  const length = 60 + sr(index * 101) * 250;
  const angle = sr(index * 107) * 360;
  const color = COLORS[(index * 3) % COLORS.length].replace(/[\d.]+\)$/, '0.07)');

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x1}%`,
        top: `${y1}%`,
        width: length,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'left center',
        pointerEvents: 'none',
      }}
      animate={{
        opacity: [0, 0.8, 0],
        scaleX: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 4 + sr(index * 113) * 6,
        delay: sr(index * 127) * 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/* ── Main Background Component ──────────────────────── */
const AnimatedBackground = ({
  particleCount = 55,
  orbCount = 6,
  shootingStarCount = 5,
  shapeCount = 8,
  lineCount = 15,
  enableMouseParallax = true,
  className = '',
}) => {
  const particles = useMemo(() => Array.from({ length: particleCount }, (_, i) => i), [particleCount]);
  const orbs = useMemo(() => Array.from({ length: orbCount }, (_, i) => i), [orbCount]);
  const stars = useMemo(() => Array.from({ length: shootingStarCount }, (_, i) => i), [shootingStarCount]);
  const shapes = useMemo(() => Array.from({ length: shapeCount }, (_, i) => i), [shapeCount]);
  const lines = useMemo(() => Array.from({ length: lineCount }, (_, i) => i), [lineCount]);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });
  const parallaxX = useTransform(springX, [-500, 500], [-15, 15]);
  const parallaxY = useTransform(springY, [-500, 500], [-15, 15]);

  useEffect(() => {
    if (!enableMouseParallax) return;
    const handleMove = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enableMouseParallax, mouseX, mouseY]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Nebula gradient clouds */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            left: '10%', top: '-10%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            right: '5%', top: '30%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{ scale: [1, 1.2, 0.9, 1], x: [0, -20, 10, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[700px] h-[400px] rounded-full"
          style={{
            left: '30%', bottom: '-5%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
          animate={{ scale: [1, 1.15, 1], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Mouse-reactive parallax layer */}
      <motion.div
        className="absolute inset-0"
        style={enableMouseParallax ? { x: parallaxX, y: parallaxY } : {}}
      >
        {/* Network lines */}
        {lines.map((i) => (
          <NetworkLine key={`line-${i}`} index={i} />
        ))}

        {/* Wireframe shapes */}
        {shapes.map((i) => (
          <WireframeShape key={`shape-${i}`} index={i} />
        ))}

        {/* Glowing orbs */}
        {orbs.map((i) => (
          <GlowingOrb key={`orb-${i}`} index={i} />
        ))}
      </motion.div>

      {/* Particles (no parallax — they drift independently) */}
      {particles.map((i) => (
        <Particle key={`p-${i}`} index={i} />
      ))}

      {/* Shooting stars */}
      {stars.map((i) => (
        <ShootingStar key={`star-${i}`} index={i} />
      ))}
    </div>
  );
};

export default AnimatedBackground;
