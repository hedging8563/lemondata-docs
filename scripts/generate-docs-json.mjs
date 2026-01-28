#!/usr/bin/env node
/**
 * Generate docs.json with correct multi-language navigation structure
 * This enables the language switcher in Mintlify
 *
 * Correct format per Mintlify docs:
 * navigation.languages[].groups[].pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.join(__dirname, '..');

// Language configurations
const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian' },
  { code: 'tr', name: 'Türkçe' },
];

// Navigation groups structure
const navigationGroups = [
  {
    group: 'Getting Started',
    pages: ['introduction', 'quickstart', 'authentication']
  },
  {
    group: 'Guides',
    pages: [
      'guides/api-formats',
      'guides/sdks',
      'guides/streaming',
      'guides/caching',
      'guides/prompt-cache',
      'guides/error-handling',
      'guides/rate-limits',
      'guides/billing',
      'guides/best-practices',
      'guides/ide-sdk-compatibility'
    ]
  },
  {
    group: 'API Reference',
    pages: ['api-reference/introduction']
  },
  {
    group: 'Chat',
    pages: ['api-reference/chat/create-completion']
  },
  {
    group: 'Messages',
    pages: ['api-reference/messages/create-message']
  },
  {
    group: 'Responses',
    pages: ['api-reference/responses/create-response']
  },
  {
    group: 'Gemini',
    pages: [
      'api-reference/gemini/generate-content',
      'api-reference/gemini/stream-generate-content'
    ]
  },
  {
    group: 'Images',
    pages: [
      'api-reference/images/create-image',
      'api-reference/images/edit-image',
      'api-reference/images/create-variation',
      'api-reference/images/get-image-status'
    ]
  },
  {
    group: 'Video',
    pages: [
      'api-reference/video/create-video',
      'api-reference/video/get-video-status'
    ]
  },
  {
    group: 'Audio',
    pages: [
      'api-reference/audio/create-speech',
      'api-reference/audio/create-transcription',
      'api-reference/audio/create-translation'
    ]
  },
  {
    group: 'Music',
    pages: [
      'api-reference/music/create-music',
      'api-reference/music/get-music-status'
    ]
  },
  {
    group: '3D',
    pages: [
      'api-reference/3d/create-3d',
      'api-reference/3d/get-3d-status'
    ]
  },
  {
    group: 'Embeddings',
    pages: ['api-reference/embeddings/create-embedding']
  },
  {
    group: 'Rerank',
    pages: ['api-reference/rerank/create-rerank']
  },
  {
    group: 'Cache',
    pages: ['api-reference/cache/cache-management']
  },
  {
    group: 'Models',
    pages: [
      'api-reference/models/list-models',
      'api-reference/models/get-model'
    ]
  },
  {
    group: 'Pricing',
    pages: ['api-reference/pricing/get-pricing']
  },
  {
    group: 'IDE & CLI',
    pages: [
      'integrations/cursor',
      'integrations/claude-code',
      'integrations/claude-code-skill',
      'integrations/codex-cli',
      'integrations/gemini-cli',
      'integrations/opencode'
    ]
  },
  {
    group: 'SDKs',
    pages: [
      'integrations/openai-sdk',
      'integrations/anthropic-sdk',
      'integrations/vercel-ai-sdk'
    ]
  },
  {
    group: 'Frameworks',
    pages: [
      'integrations/langchain',
      'integrations/llamaindex',
      'integrations/dify'
    ]
  },
  {
    group: 'Chat Apps',
    pages: ['integrations/ai-chat-apps']
  }
];

// Check if a page exists for a language
function pageExists(langCode, pagePath) {
  const fullPath = langCode === 'en'
    ? path.join(docsRoot, `${pagePath}.mdx`)
    : path.join(docsRoot, langCode, `${pagePath}.mdx`);
  return fs.existsSync(fullPath);
}

// Generate groups for a language
function generateGroupsForLanguage(langCode) {
  const prefix = langCode === 'en' ? '' : `${langCode}/`;
  const groups = [];

  for (const groupConfig of navigationGroups) {
    const existingPages = groupConfig.pages
      .filter(page => pageExists(langCode, page))
      .map(page => prefix + page);

    if (existingPages.length > 0) {
      groups.push({
        group: groupConfig.group,
        pages: existingPages
      });
    }
  }

  return groups;
}

// Generate the full docs.json
function generateDocsJson() {
  const languagesConfig = languages.map(lang => {
    const groups = generateGroupsForLanguage(lang.code);
    return {
      language: lang.code,
      groups
    };
  });

  const docsJson = {
    "$schema": "https://mintlify.com/docs.json",
    "theme": "mint",
    "name": "LemonData",
    "colors": {
      "primary": "#7C3AED",
      "light": "#8B5CF6",
      "dark": "#6D28D9"
    },
    "favicon": "/favicon.svg",
    "logo": {
      "light": "/logo/light.svg",
      "dark": "/logo/dark.svg",
      "href": "https://lemondata.cc"
    },
    "api": {
      "baseUrl": "https://api.lemondata.cc",
      "auth": {
        "method": "bearer",
        "name": "Authorization"
      },
      "playground": {
        "mode": "interactive"
      }
    },
    "navigation": {
      "global": {
        "anchors": [
          {
            "anchor": "Models",
            "href": "https://lemondata.cc/en/models",
            "icon": "robot"
          },
          {
            "anchor": "Dashboard",
            "href": "https://lemondata.cc/dashboard",
            "icon": "gauge"
          },
          {
            "anchor": "API Status",
            "href": "https://lemondata.cc/status",
            "icon": "signal"
          }
        ]
      },
      "languages": languagesConfig
    },
    "navbar": {
      "links": [
        {
          "label": "Support",
          "href": "mailto:support@lemondata.cc"
        }
      ],
      "primary": {
        "type": "button",
        "label": "Get API Key",
        "href": "https://lemondata.cc/dashboard"
      }
    },
    "footer": {},
    "openapi": ["/openapi.json"]
  };

  return docsJson;
}

// Main
const docsJson = generateDocsJson();
const outputPath = path.join(docsRoot, 'docs.json');
fs.writeFileSync(outputPath, JSON.stringify(docsJson, null, 2) + '\n');

console.log('Generated docs.json with language switcher support');
console.log(`Languages: ${languages.map(l => l.code).join(', ')}`);

// Print summary
for (const lang of languages) {
  const groups = generateGroupsForLanguage(lang.code);
  const pageCount = groups.reduce((sum, g) => sum + g.pages.length, 0);
  console.log(`  ${lang.code}: ${pageCount} pages in ${groups.length} groups`);
}
