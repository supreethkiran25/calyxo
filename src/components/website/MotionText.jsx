import React from 'react';
import { motion } from 'framer-motion';

export function RevealHeading({ 
  children, 
  className = "", 
  delay = 0,
  as = "h2"
}) {
  const words = typeof children === 'string' ? children.split(' ') : [children];
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        delayChildren: delay 
      },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 28,
      filter: 'blur(6px)',
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 100,
      },
    },
  };

  const Component = motion[as] || motion.h2;

  return (
    <Component
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block transform-gpu will-change-transform"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
}

export function FadeUp({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.6,
  yOffset = 24 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: duration, 
        delay: delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
