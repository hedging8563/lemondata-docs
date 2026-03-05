#!/usr/bin/env node
/**
 * Validate docs-mintlify content integrity before sync
 *
 * Checks:
 * 1. All mdx files start with valid --- frontmatter
 * 2. No AI thinking/chain-of-thought pollution in files
 * 3. Translated files have matching openapi fields with EN source
 * 4. docs.json tab/group names are translated for non-EN languages
 *
 * Usage:
 *   node scripts/validate-docs.mjs          # check all
 *   node scripts/validate-docs.mjs --fix    # auto-fix AI pollution (strip preamble)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.join(__dirname, '..');
const fix = process.argv.includes('--fix');

let errors = 0;
let warnings = 0;

function error(msg) { errors++; console.error(`  ERROR: ${msg}`); }
function warn(msg) { warnings++; console.warn(`  WARN:  ${msg}`); }

// Recursively find all .mdx files
function findMdxFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'scripts') {
      results.push(...findMdxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

// AI thinking pollution patterns
const AI_POLLUTION_PATTERNS = [
  /^\*\*Translation Task Assessment\*\*/i,
  /^\*\*Assessing the Translation\*\*/i,
  /^Translation Task/i,
  /^Let me translate/i,
  /^I'll translate/i,
  /^Here'?s the translation/i,
  /^Below is the translation/i,
  /^<thinking>/i,
  /^I need to translate/i,
];

// ── Check 1: Frontmatter and AI pollution ──
console.log('\n[1/4] Checking MDX frontmatter and AI pollution...');

const allMdx = findMdxFiles(docsRoot);
for (const filePath of allMdx) {
  const rel = path.relative(docsRoot, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Must start with ---
  if (!content.startsWith('---')) {
    error(`${rel}: does not start with --- frontmatter`);

    // Check if it's AI pollution before the frontmatter
    const fmIndex = content.indexOf('---');
    if (fmIndex > 0 && fix) {
      const fixed = content.slice(fmIndex);
      fs.writeFileSync(filePath, fixed);
      console.log(`  FIXED: stripped ${fmIndex} bytes of preamble from ${rel}`);
    }
    continue;
  }

  // Check for AI pollution patterns in first 500 chars after frontmatter
  const fmEnd = content.indexOf('---', 3);
  if (fmEnd === -1) {
    error(`${rel}: unclosed frontmatter`);
    continue;
  }
  const afterFm = content.slice(fmEnd + 3, fmEnd + 503).trim();
  for (const pattern of AI_POLLUTION_PATTERNS) {
    if (pattern.test(afterFm)) {
      error(`${rel}: AI thinking pollution detected after frontmatter`);
      break;
    }
  }
}

// ── Check 2: openapi field consistency ──
console.log('[2/4] Checking openapi field consistency across languages...');

// Parse frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
    if (m) fm[m[1]] = m[2];
  }
  return fm;
}

const langDirs = fs.readdirSync(docsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules' && d.name !== 'scripts' && d.name !== 'logo' && d.name !== 'images')
  .map(d => d.name)
  .filter(d => d !== 'api-reference' && d !== 'guides' && d !== 'claw' && d !== 'integrations'); // only lang dirs

for (const lang of langDirs) {
  const langDir = path.join(docsRoot, lang);
  const langMdx = findMdxFiles(langDir);

  for (const filePath of langMdx) {
    const rel = path.relative(path.join(docsRoot, lang), filePath);
    const enPath = path.join(docsRoot, rel);

    if (!fs.existsSync(enPath)) continue; // no EN source to compare

    const langContent = fs.readFileSync(filePath, 'utf-8');
    const enContent = fs.readFileSync(enPath, 'utf-8');

    const langFm = parseFrontmatter(langContent);
    const enFm = parseFrontmatter(enContent);

    // openapi field must match exactly
    if (enFm.openapi && langFm.openapi && enFm.openapi !== langFm.openapi) {
      error(`${lang}/${rel}: openapi mismatch — got "${langFm.openapi}", expected "${enFm.openapi}"`);
    }

    // If EN has openapi but translation doesn't, that's suspicious
    if (enFm.openapi && !langFm.openapi) {
      warn(`${lang}/${rel}: EN has openapi="${enFm.openapi}" but translation is missing it`);
    }
  }
}

// ── Check 3: docs.json menu translations ──
console.log('[3/4] Checking docs.json menu translations...');

const docsJsonPath = path.join(docsRoot, 'docs.json');
if (fs.existsSync(docsJsonPath)) {
  const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, 'utf-8'));
  const langs = docsJson.navigation?.languages || [];

  // Collect EN tab/group names as the "untranslated" baseline
  const enLang = langs.find(l => l.language === 'en');
  const enTabNames = new Set();
  const enGroupNames = new Set();
  // Terms that are the same across all languages (brand names, acronyms)
  // Terms that legitimately stay the same across many languages (brand names, acronyms, loanwords)
  const SKIP_TERMS = new Set([
    'Claw', 'Gemini', '3D', 'IDE & CLI', 'SDKs', 'Rerank', 'Cache', 'Embeddings', 'Frameworks',
    'Chat', 'Video', 'Audio', 'Documentation', 'Guides', 'Messages', 'Images'
  ]);

  if (enLang) {
    for (const tab of enLang.tabs || []) {
      enTabNames.add(tab.tab);
      for (const group of tab.groups || []) {
        enGroupNames.add(group.group);
      }
    }
  }

  for (const langConfig of langs) {
    if (langConfig.language === 'en') continue;

    for (const tab of langConfig.tabs || []) {
      // Tab is untranslated if it exactly matches the EN name and isn't a skip term
      if (enTabNames.has(tab.tab) && !SKIP_TERMS.has(tab.tab)) {
        warn(`${langConfig.language}: tab "${tab.tab}" appears untranslated (same as EN)`);
      }

      for (const group of tab.groups || []) {
        if (enGroupNames.has(group.group) && !SKIP_TERMS.has(group.group)) {
          warn(`${langConfig.language}: group "${group.group}" appears untranslated (same as EN)`);
        }
      }
    }
  }
} else {
  error('docs.json not found');
}

// ── Check 4: docs.json freshness ──
console.log('[4/4] Checking docs.json freshness...');

const scriptPath = path.join(docsRoot, 'scripts', 'generate-docs-json.mjs');
if (fs.existsSync(scriptPath) && fs.existsSync(docsJsonPath)) {
  const scriptMtime = fs.statSync(scriptPath).mtimeMs;
  const jsonMtime = fs.statSync(docsJsonPath).mtimeMs;

  if (scriptMtime > jsonMtime) {
    warn('generate-docs-json.mjs is newer than docs.json — run "node scripts/generate-docs-json.mjs" to regenerate');
  }
}

// ── Summary ──
console.log(`\n${'─'.repeat(50)}`);
console.log(`Scanned ${allMdx.length} MDX files`);
if (errors === 0 && warnings === 0) {
  console.log('All checks passed.');
  process.exit(0);
} else {
  if (errors > 0) console.log(`${errors} error(s)`);
  if (warnings > 0) console.log(`${warnings} warning(s)`);
  process.exit(errors > 0 ? 1 : 0);
}
