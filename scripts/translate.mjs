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
 * 4. Batch processing for efficiency
 *
 * Usage:
 *   node translate.mjs                    # Translate to all languages
 *   node translate.mjs --lang zh          # Translate to Chinese only
 *   node translate.mjs --dry-run          # Preview changes
 *   node translate.mjs --force            # Force re-translate all
 *
 * Environment Variables:
 *   TRANSLATION_API_KEY   - LemonData API key for translation
 *   TRANSLATION_API_BASE  - API base URL (default: https://api.lemondata.cc/v1)
 *   TRANSLATION_MODEL     - Model to use (default: gemini-2.0-flash)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const DOCS_DIR = path.join(import.meta.dirname, '..');
const CACHE_DIR = path.join(DOCS_DIR, '.cache');

// API configuration from environment (same as main site i18n-translate.ts)
// Default API base matches main site: crazyrouter.com
const TRANSLATION_API_KEY = process.env.TRANSLATION_API_KEY || '';
const TRANSLATION_API_BASE = process.env.TRANSLATION_API_BASE || 'https://crazyrouter.com/v1';
const TRANSLATION_MODEL = process.env.TRANSLATION_MODEL || 'gemini-3-flash-preview';

// Target languages for Mintlify docs (matches main site - 12 languages)
// NOTE: locale codes must match generate-docs-json.mjs LANGUAGES array
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

// Derive language directory names from TARGET_LANGUAGES to skip as source
const LANG_DIR_NAMES = new Set(Object.values(TARGET_LANGUAGES).map(l => l.path));

// Files/directories to skip
const SKIP_PATTERNS = [
  /^\./, // Hidden files
  /^scripts$/,
  /^node_modules$/,
  /\.json$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /^LICENSE$/,
  /^README\.md$/,
  /^skill$/, // Skip skill directory (Claude Code skill files)
  /^logo$/, // Skip logo directory
  /^images$/, // Skip images directory
];

// Links to lemondata.cc that should have /en/ replaced
const LEMONDATA_LINK_PATTERN = /https:\/\/lemondata\.cc\/en\//g;

// Calculate hash of content
function hash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 16);
}

// Load cache
function loadCache() {
  const cachePath = path.join(CACHE_DIR, 'translations.json');
  try {
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    }
  } catch {
    // Ignore
  }
  return {};
}

// Save cache
function saveCache(cache) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  const cachePath = path.join(CACHE_DIR, 'translations.json');
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n', 'utf-8');
}

// Replace /en/ links with target language
function replaceLanguageLinks(content, targetLang) {
  // Only replace lemondata.cc links, not external links like docs.anthropic.com
  return content.replace(LEMONDATA_LINK_PATTERN, `https://lemondata.cc/${targetLang}/`);
}

// Build translation prompt
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

// Call translation API
async function translateContent(content, targetLang) {
  if (!TRANSLATION_API_KEY) {
    throw new Error('TRANSLATION_API_KEY environment variable not set');
  }

  const langConfig = TARGET_LANGUAGES[targetLang];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${targetLang}`);
  }

  const prompt = buildTranslationPrompt(content, targetLang, langConfig);

  const response = await fetch(`${TRANSLATION_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TRANSLATION_API_KEY}`,
    },
    body: JSON.stringify({
      model: TRANSLATION_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 16384,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Translation API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const translatedText = data.choices?.[0]?.message?.content || '';

  // Replace /en/ links with target language
  return replaceLanguageLinks(translatedText, targetLang);
}

// Find all MDX files recursively
function findMdxFiles(dir, relativePath = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relativePath, entry.name);

    // Check skip patterns (static patterns + dynamic language directories)
    if (SKIP_PATTERNS.some(pattern => pattern.test(entry.name)) || LANG_DIR_NAMES.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findMdxFiles(fullPath, relPath));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(relPath);
    }
  }

  return files;
}

// Translate a single file
async function translateFile(filePath, targetLang, cache, options) {
  const sourcePath = path.join(DOCS_DIR, filePath);
  const targetDir = path.join(DOCS_DIR, TARGET_LANGUAGES[targetLang].path);
  const targetPath = path.join(targetDir, filePath);

  // Read source file
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const sourceHash = hash(sourceContent);

  // Check cache
  const cacheKey = filePath;
  const cached = cache[cacheKey];

  if (!options.force && cached?.sourceHash === sourceHash && cached.translations?.[targetLang]) {
    // Use cached translation
    if (!options.dryRun) {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(targetPath, cached.translations[targetLang], 'utf-8');
    }
    return { status: 'cached' };
  }

  if (options.dryRun) {
    return { status: 'translated' };
  }

  try {
    // Translate content
    const translatedContent = await translateContent(sourceContent, targetLang);

    // Save translated file
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, translatedContent, 'utf-8');

    // Update cache
    if (!cache[cacheKey]) {
      cache[cacheKey] = {
        sourceHash,
        translations: {},
        updatedAt: new Date().toISOString(),
      };
    }
    cache[cacheKey].sourceHash = sourceHash;
    cache[cacheKey].translations[targetLang] = translatedContent;
    cache[cacheKey].updatedAt = new Date().toISOString();

    return { status: 'translated' };
  } catch (error) {
    return { status: 'skipped', error: String(error) };
  }
}

// Update docs.json with language navigation
function updateDocsJson(languages) {
  const docsJsonPath = path.join(DOCS_DIR, 'docs.json');
  const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, 'utf-8'));

  // Add languages configuration if not present
  if (!docsJson.navigation) {
    docsJson.navigation = {};
  }

  // Build languages array for Mintlify
  const languagesConfig = [
    { locale: 'en', name: 'English', isDefault: true },
    ...languages.map(lang => ({
      locale: TARGET_LANGUAGES[lang].path,
      name: TARGET_LANGUAGES[lang].nativeName,
    })),
  ];

  docsJson.navigation.languages = languagesConfig;

  fs.writeFileSync(docsJsonPath, JSON.stringify(docsJson, null, 2) + '\n', 'utf-8');
  console.log(`📝 Updated docs.json with language navigation`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let lang;
  let force = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' && args[i + 1]) {
      lang = args[i + 1];
      i++;
    } else if (args[i] === '--force') {
      force = true;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  return { lang, force, dryRun };
}

// Main entry point
async function main() {
  console.log('🌍 Mintlify Documentation Translation\n');

  console.log(`📌 Translation Config:`);
  console.log(`   API Base: ${TRANSLATION_API_BASE}`);
  console.log(`   Model: ${TRANSLATION_MODEL}`);
  console.log(`   API Key: ${TRANSLATION_API_KEY ? '***configured***' : '❌ not set'}`);

  if (!TRANSLATION_API_KEY) {
    console.error('\n❌ TRANSLATION_API_KEY environment variable not set');
    console.error('   Set it with: export TRANSLATION_API_KEY=sk-your-key');
    process.exit(1);
  }

  const args = parseArgs();
  console.log(`\nOptions: force=${args.force}, dryRun=${args.dryRun}, lang=${args.lang || 'all'}\n`);

  // Determine target languages
  const targetLangs = args.lang
    ? [args.lang]
    : Object.keys(TARGET_LANGUAGES);

  // Validate target language
  if (args.lang && !TARGET_LANGUAGES[args.lang]) {
    console.error(`❌ Unsupported language: ${args.lang}`);
    console.error(`   Supported: ${Object.keys(TARGET_LANGUAGES).join(', ')}`);
    process.exit(1);
  }

  // Find all MDX files
  const mdxFiles = findMdxFiles(DOCS_DIR);
  console.log(`📚 Found ${mdxFiles.length} MDX files to translate\n`);

  // Load cache
  const cache = loadCache();

  // Track statistics
  const stats = {};

  // Translate to each language
  for (const lang of targetLangs) {
    console.log(`\n📝 Translating to ${TARGET_LANGUAGES[lang].name} (${TARGET_LANGUAGES[lang].nativeName})...`);
    stats[lang] = { translated: 0, cached: 0, errors: 0 };

    for (let i = 0; i < mdxFiles.length; i++) {
      const file = mdxFiles[i];
      process.stdout.write(`   [${i + 1}/${mdxFiles.length}] ${file}... `);

      const result = await translateFile(file, lang, cache, args);

      if (result.status === 'translated') {
        console.log('✅ translated');
        stats[lang].translated++;
      } else if (result.status === 'cached') {
        console.log('📦 cached');
        stats[lang].cached++;
      } else {
        console.log(`❌ error: ${result.error}`);
        stats[lang].errors++;
      }

      // Rate limiting between files
      if (result.status === 'translated' && i < mdxFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Save cache
  if (!args.dryRun) {
    saveCache(cache);

    // Update docs.json with language navigation
    updateDocsJson(targetLangs);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Translation Summary\n');

  for (const [lang, langStats] of Object.entries(stats)) {
    const langName = TARGET_LANGUAGES[lang]?.name || lang;
    console.log(`  ${langName.padEnd(20)} Translated: ${langStats.translated}, Cached: ${langStats.cached}, Errors: ${langStats.errors}`);
  }

  console.log('\n✅ Done!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
