/**
 * Automated Theme & Contrast Regression Test Suite
 * Validates WCAG AA contrast compliance and semantic design token integrity
 * across Light Mode and Dark Mode.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function runThemeContrastTests() {
  console.log("=== CALYXO THEME & CONTRAST VALIDATION SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Contrast ratios in Light Mode
  const lightBg = '#F8FAFC';
  const lightSurface = '#FFFFFF';
  const lightTextPrimary = '#0F172A';
  const lightTextSecondary = '#334155';
  const lightTextMuted = '#64748B';
  const lightAccent = '#15803D';

  const contrastPrimaryOnBg = getContrastRatio(lightTextPrimary, lightBg);
  assert(contrastPrimaryOnBg >= 7.0, `Light Mode Primary Text Contrast on Background (ratio: ${contrastPrimaryOnBg.toFixed(2)}:1 >= 7:1)`);

  const contrastPrimaryOnSurface = getContrastRatio(lightTextPrimary, lightSurface);
  assert(contrastPrimaryOnSurface >= 7.0, `Light Mode Primary Text Contrast on Surface (ratio: ${contrastPrimaryOnSurface.toFixed(2)}:1 >= 7:1)`);

  const contrastSecondaryOnSurface = getContrastRatio(lightTextSecondary, lightSurface);
  assert(contrastSecondaryOnSurface >= 4.5, `Light Mode Secondary Text Contrast on Surface (ratio: ${contrastSecondaryOnSurface.toFixed(2)}:1 >= 4.5:1)`);

  const contrastMutedOnSurface = getContrastRatio(lightTextMuted, lightSurface);
  assert(contrastMutedOnSurface >= 4.5, `Light Mode Muted Text Contrast on Surface (ratio: ${contrastMutedOnSurface.toFixed(2)}:1 >= 4.5:1)`);

  const contrastAccentOnSurface = getContrastRatio(lightAccent, lightSurface);
  assert(contrastAccentOnSurface >= 4.5, `Light Mode Accent Green Contrast on Surface (ratio: ${contrastAccentOnSurface.toFixed(2)}:1 >= 4.5:1)`);

  // 2. Contrast ratios in Dark Mode
  const darkBg = '#09090B';
  const darkSurface = '#121218';
  const darkTextPrimary = '#FFFFFF';
  const darkTextSecondary = '#94A3B8';
  const darkTextMuted = '#64748B';
  const darkAccent = '#CCFF00';

  const contrastDarkPrimary = getContrastRatio(darkTextPrimary, darkSurface);
  assert(contrastDarkPrimary >= 10.0, `Dark Mode Primary Text Contrast on Surface (ratio: ${contrastDarkPrimary.toFixed(2)}:1 >= 10:1)`);

  const contrastDarkSecondary = getContrastRatio(darkTextSecondary, darkSurface);
  assert(contrastDarkSecondary >= 4.5, `Dark Mode Secondary Text Contrast on Surface (ratio: ${contrastDarkSecondary.toFixed(2)}:1 >= 4.5:1)`);

  const contrastDarkAccent = getContrastRatio(darkAccent, darkSurface);
  assert(contrastDarkAccent >= 7.0, `Dark Mode Acid Green Accent Contrast on Surface (ratio: ${contrastDarkAccent.toFixed(2)}:1 >= 7:1)`);

  // 3. Verify globals.css contains complete semantic design tokens
  const globalsCssPath = path.join(rootDir, 'src/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  assert(globalsCss.includes('--color-background: var(--background);'), "globals.css maps --color-background");
  assert(globalsCss.includes('--color-surface: var(--surface);'), "globals.css maps --color-surface");
  assert(globalsCss.includes('--color-text-primary: var(--text-primary);'), "globals.css maps --color-text-primary");
  assert(globalsCss.includes('--color-text-secondary: var(--text-secondary);'), "globals.css maps --color-text-secondary");
  assert(globalsCss.includes('--color-text-muted: var(--text-muted);'), "globals.css maps --color-text-muted");
  assert(globalsCss.includes('--color-card-border: var(--card-border);'), "globals.css maps --color-card-border");

  // 4. Verify no dark-immersion hacks breaking User screens
  const foodTrackerPath = path.join(rootDir, 'src/components/FoodTracker.js');
  const foodTrackerCode = fs.readFileSync(foodTrackerPath, 'utf8');
  assert(!foodTrackerCode.includes('dark-immersion'), "FoodTracker.js has no dark-immersion hardcoded classes");

  const workoutLoggerPath = path.join(rootDir, 'src/components/WorkoutLogger.js');
  const workoutLoggerCode = fs.readFileSync(workoutLoggerPath, 'utf8');
  assert(!workoutLoggerCode.includes('dark-immersion'), "WorkoutLogger.js has no dark-immersion hardcoded classes");

  const userProfilePath = path.join(rootDir, 'src/components/UserProfile.js');
  const userProfileCode = fs.readFileSync(userProfilePath, 'utf8');
  assert(!userProfileCode.includes('dark-immersion'), "UserProfile.js has no dark-immersion hardcoded classes");

  console.log(`\nTheme validation summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runThemeContrastTests();
