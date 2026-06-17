// PLAN: motion.js
// - Shared spring constants for snappy, smooth, and panel transitions
// - Named variants: fadeUp, fadeIn, stagger, slideFromRight, collapseWidth
// - Every animated component imports from here — zero inline animation props for repeated patterns
// END PLAN

export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.6,
};

export const SPRING_SMOOTH = {
  type: 'spring',
  stiffness: 220,
  damping: 26,
  mass: 0.8,
};

export const SPRING_PANEL = {
  type: 'spring',
  stiffness: 140,
  damping: 22,
  mass: 0.9,
};

export const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING_SMOOTH } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const stagger = (delayChildren = 0.05, staggerChildren = 0.06) => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const slideFromRight = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { ...SPRING_PANEL } },
  exit:    { opacity: 0, x: 24, transition: { duration: 0.18, ease: 'easeIn' } },
};

export const collapseWidth = (collapsedWidth = 48, expandedWidth = 240) => ({
  collapsed: { width: collapsedWidth, transition: SPRING_PANEL },
  expanded:  { width: expandedWidth, transition: SPRING_PANEL },
});
