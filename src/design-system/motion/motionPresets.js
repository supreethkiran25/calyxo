/**
 * Calyxo Motion & Animation Presets
 * 
 * Inspired by Anime.js timeline stagger curves & Kokonut UI spring dynamics.
 * Engineered for 60fps mobile hardware performance with zero layout jank.
 */

export const SpringTransitions = {
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  },
  bouncy: {
    type: 'spring',
    stiffness: 350,
    damping: 20
  },
  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 24
  },
  sheet: {
    type: 'spring',
    stiffness: 320,
    damping: 32,
    mass: 0.8
  }
};

export const MotionVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 16 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.05,
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1]
      }
    }),
    exit: { opacity: 0, y: 8, transition: { duration: 0.2 } }
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: SpringTransitions.snappy
    },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
  },
  
  sheetBottom: {
    hidden: { y: '100%', opacity: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      transition: SpringTransitions.sheet
    },
    exit: {
      y: '100%',
      opacity: 0.8,
      transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] }
    }
  },
  
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04
      }
    }
  },
  
  tapFeedback: {
    scale: 0.96,
    transition: { duration: 0.1 }
  }
};
