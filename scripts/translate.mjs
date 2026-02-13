#!/usr/bin/env node

/**
 * Mintlify Documentation Translation Script
 *
 * Translates MDX documentation files to multiple languages using LemonData API.
 *
 * Features:
 * 1. Preserves MDX structure (frontmatter, code blocks, components)
 * 2. Replaces /en/ links with target language paths
 * 3. Incremental translation with hash-based caching
 * 4. Concurrent translation across languages
 * 5. File filtering with glob patterns
 *
 * Usage:
 *   node translate.mjs                              # Translate all files to all languages
 *   node translate.mjs --lang zh                    # Translate to Chinese only
 *   node translate.mjs --file guides/agent-first-api.mdx  # Translate one file
 *   node translate.mjs --file "integrations/*.mdx"  # Translate matching files
 *   node translate.mjs --dry-run                    # Preview changes
 *   node translate.mjs --force                      # Force re-translate all
 *   node translate.mjs --concurrency 4              # Parallel languages (default: 3)
 *
 * Environment Variables:
 *   TRANSLATION_API_KEY   - LemonData API key for translation
 *   TRANSLATION_API_BASE  - API base URL (default: https://crazyrouter.com/v1)
 *   TRANSLATION_MODEL     - Model to use (default: gemini-3-flash-preview)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const DOCS_DIR = path.join(import.meta.dirname, '..');
const CACHE_DIR = path.join(DOCS_DIR, '.cache');

const TRANSLATION_API_KEY = process.env.TRANSLATION_API_KEY || '';
const TRANSLATION_API_BASE = process.env.TRANSLATION_API_BASE || 'https://crazyrouter.com/v1';
const TRANSLATION_MODEL = process.env.TRANSLATION_MODEL || 'gemini-3-flash-preview';

// Target languages (must match generate-docs-json.mjs)
const TARGET_LANGUAGES = {
  zh: { name: 'Simplified Chinese', nativeName: '简体中文', path: 'zh' },
  'zh-Hant': { name: 'Traditional Chinese', nativeName: '繁體中文', path: 'zh-Hant' },
  ja: { name: 'Japanese', nativeName: '日本語', path: 'ja' },
  ko: { name: 'Korean', nativeName: '한국어', path: 'ko' },
  de: { name: 'German', nativeName: 'Deutsch', path: 'de' },
  fr: { name: 'French', nativeName: 'Français', path: 'fr' },
  es: { name: 'Spanish', nativeName: 'Español', path: 'es' },
  pt: { name: 'Brazilian Portuguese', nativeName: 'Português', path: 'pt' },
  ar: { name: 'Arabic', nativeName: 'العربية', path: 'ar' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', path: 'vi' },
  id: { name: 'Indonesian', nativeName: 'Indonesian', path: 'id' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', path: 'tr' },
};

const LANG_DIR_NAMES = new Set(Object.values(TARGET_LANGUAGES).map(l => l.path));

const SKIP_PATTERNS = [
  /^\./, /^scripts$/, /^node_modules$/, /\.json$/, /\.svg$/, /\.png$/, /\.jpg$/,
  /^LICENSE$/, /^README\.md$/, /^skill$/, /^logo$/, /^images$/,
];

const LEMONDATA_LINK_PATTERN = /https:\/\/lemondata\.cc\/en\//g;

// --- Utilities ---

function contentHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 16);
}

function loadCache() {
  const cachePath = path.join(CACHE_DIR, 'translations.json');
  try {
    if (fs.existsSync(cachePath)) return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch { /* ignore */ }
  return {};
}

function saveCache(cache) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, 'translations.json'), JSON.stringify(cache, null, 2) + '\n', 'utf-8');
}

function replaceLanguageLinks(content, targetLang) {
  return content.replace(LEMONDATA_LINK_PATTERN, `https://lemondata.cc/${targetLang}/`);
}

// Simple glob matching: supports * and ** patterns
function matchGlob(filePath, pattern) {
  const regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\{\{GLOBSTAR\}\}/g, '.*');
  return new RegExp(`^${regex}$`).test(filePath);
}

// --- Translation API ---

function buildTranslationPrompt(content, targetLang, langConfig) {
  return `You are a professional technical documentation translator. Translate the following MDX documentation from English to ${langConfig.name} (${langConfig.nativeName}).

IMPORTANT RULES:
1. Translate ALL text content including headings, paragraphs, lists, and card titles/descriptions
2. DO NOT translate:
   - Code blocks (content between \`\`\` markers)
   - Inline code (content in backticks)
   - URLs and links
   - API endpoints and paths
   - Variable names and technical identifiers
   - Component names (like <Card>, <CodeGroup>, etc.)
   - Parameter names in API documentation
3. Keep the exact same MDX structure and formatting
4. Preserve all markdown syntax (**, *, #, etc.)
5. Keep line breaks and spacing consistent
6. For technical terms that are commonly kept in English (like "API", "SDK", "token"), keep them in English
7. The tone should be professional and technical
8. Return ONLY the translated content, no explanations

Content to translate:
${content}`;
}

async function translateContent(content, targetLang) {
  const langConfig = TARGET_LANGUAGES[targetLang];
  const prompt = buildTranslationPrompt(content, targetLang, langConfig);

  const response = await fetch(`${TRANSLATION_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TRANSLATION_API_KEY}`,
    },
    body: JSON.stringify({
      model: TRANSLATION_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 16384,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API ${response.status}: ${error.slice(0, 200)}`);
  }

  const data = await response.json();
  const translatedText = data.choices?.[0]?.message?.content || '';
  return replaceLanguageLinks(translatedText, targetLang);
}

// --- File Discovery ---

function findMdxFiles(dir, relativePath = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relativePath, entry.name);

    if (SKIP_PATTERNS.some(p => p.test(entry.name)) || LANG_DIR_NAMES.has(entry.name)) continue;

    if (entry.isDirectory()) {
      files.push(...findMdxFiles(fullPath, relPath));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(relPath);
    }
  }
  return files;
}

// --- Single File Translation ---

async function translateFile(filePath, targetLang, cache, options) {
  const sourcePath = path.join(DOCS_DIR, filePath);
  const targetPath = path.join(DOCS_DIR, TARGET_LANGUAGES[targetLang].path, filePath);

  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const sourceH = contentHash(sourceContent);

  // Check cache
  const cached = cache[filePath];
  if (!options.force && cached?.sourceHash === sourceH && cached.translations?.[targetLang]) {
    if (!options.dryRun) {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(targetPath, cached.translations[targetLang], 'utf-8');
    }
    return 'cached';
  }

  if (options.dryRun) return 'would-translate';

  const translatedContent = await translateContent(sourceContent, targetLang);

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, translatedContent, 'utf-8');

  // Update cache
  if (!cache[filePath]) cache[filePath] = { sourceHash: sourceH, translations: {} };
  cache[filePath].sourceHash = sourceH;
  cache[filePath].translations[targetLang] = translatedContent;
  cache[filePath].updatedAt = new Date().toISOString();

  return 'translated';
}

// --- Concurrency Helper ---

async function pMap(items, fn, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

// --- CLI ---

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { lang: null, file: null, force: false, dryRun: false, concurrency: 3 };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lang': parsed.lang = args[++i]; break;
      case '--file': parsed.file = args[++i]; break;
      case '--force': parsed.force = true; break;
      case '--dry-run': parsed.dryRun = true; break;
      case '--concurrency': parsed.concurrency = parseInt(args[++i], 10) || 3; break;
    }
  }
  return parsed;
}

// --- Main ---

async function main() {
  console.log('🌍 Mintlify Documentation Translation\n');
  console.log(`📌 Config: model=${TRANSLATION_MODEL}, base=${TRANSLATION_API_BASE}`);
  console.log(`   API Key: ${TRANSLATION_API_KEY ? '✅ configured' : '❌ not set'}`);

  if (!TRANSLATION_API_KEY) {
    console.error('\n❌ Set TRANSLATION_API_KEY=sk-your-key');
    process.exit(1);
  }

  const args = parseArgs();

  // Validate language
  const targetLangs = args.lang ? [args.lang] : Object.keys(TARGET_LANGUAGES);
  if (args.lang && !TARGET_LANGUAGES[args.lang]) {
    console.error(`❌ Unsupported language: ${args.lang}. Supported: ${Object.keys(TARGET_LANGUAGES).join(', ')}`);
    process.exit(1);
  }

  // Find files
  let mdxFiles = findMdxFiles(DOCS_DIR);

  // Filter by --file pattern
  if (args.file) {
    const pattern = args.file;
    // Support exact match, glob, or prefix match
    mdxFiles = mdxFiles.filter(f => f === pattern || matchGlob(f, pattern) || f.startsWith(pattern.replace(/\*.*$/, '')));
    if (mdxFiles.length === 0) {
      console.error(`❌ No files match: ${pattern}`);
      console.error(`   Available files (sample): ${findMdxFiles(DOCS_DIR).slice(0, 5).join(', ')}`);
      process.exit(1);
    }
  }

  console.log(`\n📚 ${mdxFiles.length} files × ${targetLangs.length} languages = ${mdxFiles.length * targetLangs.length} translations`);
  console.log(`   Options: force=${args.force}, dryRun=${args.dryRun}, concurrency=${args.concurrency}`);
  if (args.file) console.log(`   Filter: ${args.file}`);
  console.log();

  const cache = loadCache();
  const stats = { translated: 0, cached: 0, errors: 0 };
  const total = mdxFiles.length * targetLangs.length;
  let done = 0;

  // Translate each file to all languages concurrently
  for (const file of mdxFiles) {
    const results = await pMap(targetLangs, async (lang) => {
      try {
        const status = await translateFile(file, lang, cache, args);
        done++;
        const pct = Math.round(done / total * 100);
        if (status === 'translated') {
          stats.translated++;
          process.stdout.write(`\r   [${pct}%] ${file} → ${lang} ✅`);
        } else if (status === 'cached') {
          stats.cached++;
        } else {
          process.stdout.write(`\r   [${pct}%] ${file} → ${lang} 📋 dry-run`);
        }
        return { lang, status };
      } catch (err) {
        done++;
        stats.errors++;
        console.error(`\n   ❌ ${file} → ${lang}: ${err.message}`);
        return { lang, status: 'error', error: err.message };
      }
    }, args.concurrency);

    // Brief pause between files to avoid rate limits
    if (stats.translated > 0) await new Promise(r => setTimeout(r, 200));
  }

  // Save cache
  if (!args.dryRun) {
    saveCache(cache);
  }

  // Summary
  console.log('\n\n' + '='.repeat(50));
  console.log(`📊 Done! Translated: ${stats.translated}, Cached: ${stats.cached}, Errors: ${stats.errors}`);
  if (stats.translated > 0 && !args.dryRun) {
    console.log(`\n💡 Run: node scripts/generate-docs-json.mjs  (to update navigation)`);
  }
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
