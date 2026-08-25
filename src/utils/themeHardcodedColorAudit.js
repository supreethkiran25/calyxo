/**
 * Automated Hardcoded Color & Theme Linter
 * Scans src/ directory for hardcoded color values and dark-mode only classes
 * to ensure components strictly use semantic theme tokens.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../');

const IGNORED_DIRS = ['node_modules', 'dist', '.git', 'assets'];
const TARGET_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css'];

// Whitelisted files (e.g. 3D canvas textures, charting palettes, test runners)
const WHITELISTED_FILES = [
  'ThreeHealthCore.jsx',
  'RealisticWaterVessel.jsx',
  'ColorBends.jsx',
  'themeContrastTestRunner.js',
  'themeHardcodedColorAudit.js'
];

const SUSPICIOUS_PATTERNS = [
  { name: 'Hardcoded Dark BG Hex', regex: /bg-\[#(?:0|1)[0-9a-fA-F]{5}\]/g },
  { name: 'Hardcoded White Text', regex: /text-white(?!\/0)/g },
  { name: 'Hardcoded Black Text', regex: /text-black(?!\/0)/g },
  { name: 'Hardcoded White/Neutral Text Hex', regex: /text-\[#(?:f|F|e|E|0|1)[0-9a-fA-F]{5}\]/g },
  { name: 'Dark Immersion Hack', regex: /dark-immersion/g },
  { name: 'Hardcoded Inline Dark Hex', regex: /#0[a-fA-F0-9]{5}|#1[0-4][a-fA-F0-9]{4}/g }
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        getAllFiles(fullPath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (TARGET_EXTENSIONS.includes(ext) && !WHITELISTED_FILES.includes(file)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

export function runAudit() {
  console.log("==================================================");
  console.log("🔍 CALYXO THEME & HARDCODED COLOR AUDITOR");
  console.log("==================================================");

  const files = getAllFiles(srcDir);
  const violations = [];

  for (const filePath of files) {
    const relativePath = path.relative(srcDir, filePath);
    // Skip globals.css variable definitions
    if (relativePath === 'globals.css') continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Ignore comment lines
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      for (const pattern of SUSPICIOUS_PATTERNS) {
        const matches = line.match(pattern.regex);
        if (matches) {
          violations.push({
            file: relativePath,
            line: index + 1,
            pattern: pattern.name,
            match: matches[0],
            snippet: trimmed.substring(0, 100)
          });
        }
      }
    });
  }

  console.log(`Audited ${files.length} source files.`);
  if (violations.length === 0) {
    console.log("✅ 0 Hardcoded Color Violations Found! All components adhere to semantic tokens.");
  } else {
    console.warn(`⚠️ Found ${violations.length} potential hardcoded color violations:`);
    violations.slice(0, 40).forEach(v => {
      console.log(`  - [${v.file}:${v.line}] (${v.pattern}): "${v.match}" -> \`${v.snippet}\``);
    });
    if (violations.length > 40) {
      console.log(`  ... and ${violations.length - 40} more.`);
    }
  }

  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = runAudit();
  if (violations.length > 0) {
    process.exit(1);
  }
}
