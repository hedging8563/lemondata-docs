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

// Translations for tab and group names per language
const translations = {
  zh: {
    tabs: { 'Documentation': '文档', 'API Reference': 'API 参考', 'Claw': 'Claw', 'Integrations': '集成' },
    groups: { 'Getting Started': '快速入门', 'Core Guides': '核心指南', 'Overview': '概览', 'Core': '核心', 'Text': '文本', 'Files & Batches': '文件与批处理', 'Images & Media': '图像与媒体', 'Async Jobs': '异步任务', 'Gemini Native': 'Gemini 原生', 'Consumer Chat': '消费级聊天平台', 'Workplace Chat': '企业聊天平台', 'Coding Tools': '编码工具', 'SDKs & Frameworks': 'SDK 与框架', 'Chat Apps': '聊天应用' }
  },
  'zh-Hant': {
    tabs: { 'Documentation': '文件', 'API Reference': 'API 參考', 'Claw': 'Claw', 'Integrations': '整合' },
    groups: { 'Getting Started': '快速入門', 'Core Guides': '核心指南', 'Overview': '概覽', 'Core': '核心', 'Text': '文字', 'Files & Batches': '檔案與批次', 'Images & Media': '圖像與媒體', 'Async Jobs': '非同步任務', 'Gemini Native': 'Gemini 原生', 'Consumer Chat': '消費級聊天平台', 'Workplace Chat': '企業聊天平台', 'Coding Tools': '程式工具', 'SDKs & Frameworks': 'SDK 與框架', 'Chat Apps': '聊天應用' }
  },
  ja: {
    tabs: { 'Documentation': 'ドキュメント', 'API Reference': 'APIリファレンス', 'Claw': 'Claw', 'Integrations': '連携' },
    groups: { 'Getting Started': 'はじめに', 'Core Guides': 'コアガイド', 'Overview': '概要', 'Core': 'コア', 'Text': 'テキスト', 'Files & Batches': 'ファイルとバッチ', 'Images & Media': '画像とメディア', 'Async Jobs': '非同期ジョブ', 'Gemini Native': 'Gemini ネイティブ', 'Consumer Chat': 'コンシューマーチャット', 'Workplace Chat': 'ワークプレースチャット', 'Coding Tools': 'コーディングツール', 'SDKs & Frameworks': 'SDK とフレームワーク', 'Chat Apps': 'チャットアプリ' }
  },
  ko: {
    tabs: { 'Documentation': '문서', 'API Reference': 'API 레퍼런스', 'Claw': 'Claw', 'Integrations': '통합' },
    groups: { 'Getting Started': '시작하기', 'Core Guides': '핵심 가이드', 'Overview': '개요', 'Core': '핵심', 'Text': '텍스트', 'Files & Batches': '파일 및 배치', 'Images & Media': '이미지 및 미디어', 'Async Jobs': '비동기 작업', 'Gemini Native': 'Gemini 네이티브', 'Consumer Chat': '일반 채팅 플랫폼', 'Workplace Chat': '업무용 채팅 플랫폼', 'Coding Tools': '코딩 도구', 'SDKs & Frameworks': 'SDK 및 프레임워크', 'Chat Apps': '채팅 앱' }
  },
  de: {
    tabs: { 'Documentation': 'Dokumentation', 'API Reference': 'API-Referenz', 'Claw': 'Claw', 'Integrations': 'Integrationen' },
    groups: { 'Getting Started': 'Erste Schritte', 'Core Guides': 'Kernleitfäden', 'Overview': 'Übersicht', 'Core': 'Kern', 'Text': 'Text & Chat', 'Files & Batches': 'Dateien & Batch-Jobs', 'Images & Media': 'Bilder & Medien', 'Async Jobs': 'Asynchrone Jobs', 'Gemini Native': 'Gemini nativ', 'Consumer Chat': 'Consumer-Chat', 'Workplace Chat': 'Arbeitsplatz-Chat', 'Coding Tools': 'Coding-Tools', 'SDKs & Frameworks': 'SDKs und Frameworks', 'Chat Apps': 'Chat-Apps' }
  },
  fr: {
    tabs: { 'Documentation': 'Documentation', 'API Reference': 'Référence API', 'Claw': 'Claw', 'Integrations': 'Intégrations' },
    groups: { 'Getting Started': 'Démarrage', 'Core Guides': 'Guides essentiels', 'Overview': 'Aperçu', 'Core': 'Essentiel', 'Text': 'Texte', 'Files & Batches': 'Fichiers & lots', 'Images & Media': 'Images & médias', 'Async Jobs': 'Tâches asynchrones', 'Gemini Native': 'Gemini natif', 'Consumer Chat': 'Chat grand public', 'Workplace Chat': 'Chat professionnel', 'Coding Tools': 'Outils de code', 'SDKs & Frameworks': 'SDKs & frameworks', 'Chat Apps': 'Apps de chat' }
  },
  es: {
    tabs: { 'Documentation': 'Documentación', 'API Reference': 'Referencia API', 'Claw': 'Claw', 'Integrations': 'Integraciones' },
    groups: { 'Getting Started': 'Primeros pasos', 'Core Guides': 'Guías principales', 'Overview': 'Descripción general', 'Core': 'Base', 'Text': 'Texto', 'Files & Batches': 'Archivos y lotes', 'Images & Media': 'Imágenes y medios', 'Async Jobs': 'Trabajos asíncronos', 'Gemini Native': 'Gemini nativo', 'Consumer Chat': 'Chat de consumo', 'Workplace Chat': 'Chat de trabajo', 'Coding Tools': 'Herramientas de código', 'SDKs & Frameworks': 'SDKs y frameworks', 'Chat Apps': 'Apps de chat' }
  },
  pt: {
    tabs: { 'Documentation': 'Documentação', 'API Reference': 'Referência da API', 'Claw': 'Claw', 'Integrations': 'Integrações' },
    groups: { 'Getting Started': 'Primeiros passos', 'Core Guides': 'Guias principais', 'Overview': 'Visão geral', 'Core': 'Essencial', 'Text': 'Texto', 'Files & Batches': 'Arquivos e lotes', 'Images & Media': 'Imagens e mídia', 'Async Jobs': 'Tarefas assíncronas', 'Gemini Native': 'Gemini nativo', 'Consumer Chat': 'Chat de consumo', 'Workplace Chat': 'Chat de trabalho', 'Coding Tools': 'Ferramentas de código', 'SDKs & Frameworks': 'SDKs e frameworks', 'Chat Apps': 'Apps de chat' }
  },
  ar: {
    tabs: { 'Documentation': 'التوثيق', 'API Reference': 'مرجع API', 'Claw': 'Claw', 'Integrations': 'التكاملات' },
    groups: { 'Getting Started': 'البدء', 'Core Guides': 'الأدلة الأساسية', 'Overview': 'نظرة عامة', 'Core': 'الأساسيات', 'Text': 'النص', 'Files & Batches': 'الملفات والدفعات', 'Images & Media': 'الصور والوسائط', 'Async Jobs': 'المهام غير المتزامنة', 'Gemini Native': 'Gemini الأصلي', 'Consumer Chat': 'دردشة المستهلك', 'Workplace Chat': 'دردشة العمل', 'Coding Tools': 'أدوات البرمجة', 'SDKs & Frameworks': 'SDKs وأطر العمل', 'Chat Apps': 'تطبيقات الدردشة' }
  },
  vi: {
    tabs: { 'Documentation': 'Tài liệu', 'API Reference': 'Tham chiếu API', 'Claw': 'Claw', 'Integrations': 'Tích hợp' },
    groups: { 'Getting Started': 'Bắt đầu', 'Core Guides': 'Hướng dẫn cốt lõi', 'Overview': 'Tổng quan', 'Core': 'Cốt lõi', 'Text': 'Văn bản', 'Files & Batches': 'Tệp và lô', 'Images & Media': 'Hình ảnh và phương tiện', 'Async Jobs': 'Tác vụ bất đồng bộ', 'Gemini Native': 'Gemini gốc', 'Consumer Chat': 'Chat tiêu dùng', 'Workplace Chat': 'Chat nơi làm việc', 'Coding Tools': 'Công cụ lập trình', 'SDKs & Frameworks': 'SDK và framework', 'Chat Apps': 'Ứng dụng chat' }
  },
  id: {
    tabs: { 'Documentation': 'Dokumentasi', 'API Reference': 'Referensi API', 'Claw': 'Claw', 'Integrations': 'Integrasi' },
    groups: { 'Getting Started': 'Memulai', 'Core Guides': 'Panduan inti', 'Overview': 'Ikhtisar', 'Core': 'Inti', 'Text': 'Teks', 'Files & Batches': 'Berkas & batch', 'Images & Media': 'Gambar & media', 'Async Jobs': 'Pekerjaan asinkron', 'Gemini Native': 'Gemini native', 'Consumer Chat': 'Chat konsumen', 'Workplace Chat': 'Chat kerja', 'Coding Tools': 'Alat coding', 'SDKs & Frameworks': 'SDK & framework', 'Chat Apps': 'Aplikasi chat' }
  },
  tr: {
    tabs: { 'Documentation': 'Dokümantasyon', 'API Reference': 'API Referansı', 'Claw': 'Claw', 'Integrations': 'Entegrasyonlar' },
    groups: { 'Getting Started': 'Başlarken', 'Core Guides': 'Temel kılavuzlar', 'Overview': 'Genel Bakış', 'Core': 'Temel', 'Text': 'Metin', 'Files & Batches': 'Dosyalar ve toplu işler', 'Images & Media': 'Görseller ve medya', 'Async Jobs': 'Asenkron işler', 'Gemini Native': 'Gemini yerel', 'Consumer Chat': 'Tüketici sohbeti', 'Workplace Chat': 'İşyeri sohbeti', 'Coding Tools': 'Kodlama araçları', 'SDKs & Frameworks': 'SDK\'lar ve framework\'ler', 'Chat Apps': 'Sohbet uygulamaları' }
  },
};

// Navigation structure with tabs
const navigationTabs = {
  documentation: {
    tab: 'Documentation',
    groups: [
      {
        group: 'Getting Started',
        pages: ['introduction', 'quickstart', 'authentication']
      },
      {
        group: 'Core Guides',
        pages: [
          'guides/agent-first-api',
          'guides/api-formats',
          'guides/caching',
          'guides/prompt-cache',
          'guides/streaming',
          'guides/error-handling',
          'guides/rate-limits',
          'guides/billing',
          'guides/best-practices',
          'guides/video-generation'
        ]
      }
    ]
  },
  apiReference: {
    tab: 'API Reference',
    groups: [
      {
        group: 'Core',
        pages: [
          'api-reference/introduction',
          'api-reference/models/list-models',
          'api-reference/models/get-model',
          'api-reference/pricing/get-pricing',
          'api-reference/cache/cache-management'
        ]
      },
      {
        group: 'Text',
        pages: [
          'api-reference/chat/create-completion',
          'api-reference/responses/create-response',
          'api-reference/messages/create-message',
          'api-reference/embeddings/create-embedding',
          'api-reference/rerank/create-rerank'
        ]
      },
      {
        group: 'Files & Batches',
        pages: [
          'api-reference/files/upload-file',
          'api-reference/files/list-files',
          'api-reference/files/retrieve-file',
          'api-reference/files/retrieve-file-content',
          'api-reference/batches/create-batch',
          'api-reference/batches/list-batches',
          'api-reference/batches/retrieve-batch',
          'api-reference/batches/cancel-batch'
        ]
      },
      {
        group: 'Images & Media',
        pages: [
          'api-reference/images/create-image',
          'api-reference/images/edit-image',
          'api-reference/images/create-variation',
          'api-reference/images/get-image-status',
          'api-reference/audio/create-speech',
          'api-reference/audio/create-transcription',
          'api-reference/audio/create-translation',
          'api-reference/music/create-music',
          'api-reference/music/get-music-status',
          'api-reference/video/create-video',
          'api-reference/video/get-video-status',
          'api-reference/3d/create-3d',
          'api-reference/3d/get-3d-status'
        ]
      },
      {
        group: 'Async Jobs',
        pages: ['api-reference/tasks/get-task-status']
      },
      {
        group: 'Gemini Native',
        pages: [
          'api-reference/gemini/list-models',
          'api-reference/gemini/get-model',
          'api-reference/gemini/generate-content',
          'api-reference/gemini/stream-generate-content'
        ]
      }
    ]
  },
  claw: {
    tab: 'Claw',
    groups: [
      {
        group: 'Getting Started',
        pages: ['claw/introduction', 'claw/self-hosted', 'claw/lemondata-provider', 'claw/api']
      },
      {
        group: 'Consumer Chat',
        pages: [
          'claw/telegram',
          'claw/discord',
          'claw/whatsapp',
          'claw/qq'
        ]
      },
      {
        group: 'Workplace Chat',
        pages: [
          'claw/slack',
          'claw/feishu',
          'claw/wecom',
          'claw/dingtalk'
        ]
      }
    ]
  },
  integrations: {
    tab: 'Integrations',
    groups: [
      {
        group: 'Coding Tools',
        pages: [
          'integrations/cursor',
          'integrations/claude-code',
          'integrations/codex-cli',
          'integrations/gemini-cli',
          'integrations/opencode',
          'integrations/coding-agent-skill',
          'guides/ide-sdk-compatibility'
        ]
      },
      {
        group: 'SDKs & Frameworks',
        pages: [
          'integrations/openai-sdk',
          'integrations/anthropic-sdk',
          'integrations/vercel-ai-sdk',
          'integrations/langchain',
          'integrations/llamaindex',
          'integrations/dify',
          'guides/sdks'
        ]
      },
      {
        group: 'Chat Apps',
        pages: ['integrations/ai-chat-apps']
      }
    ]
  }
};

// Check if a page exists for a language
function pageExists(langCode, pagePath) {
  const fullPath = langCode === 'en'
    ? path.join(docsRoot, `${pagePath}.mdx`)
    : path.join(docsRoot, langCode, `${pagePath}.mdx`);
  return fs.existsSync(fullPath);
}

// Translate a tab or group name for a given language
function translateTab(langCode, name) {
  return translations[langCode]?.tabs?.[name] ?? name;
}
function translateGroup(langCode, name) {
  return translations[langCode]?.groups?.[name] ?? name;
}

// Generate tabs for a language
function generateTabsForLanguage(langCode) {
  const prefix = langCode === 'en' ? '' : `${langCode}/`;
  const tabs = [];

  for (const [key, tabConfig] of Object.entries(navigationTabs)) {
    const groups = [];

    for (const groupConfig of tabConfig.groups) {
      const existingPages = groupConfig.pages
        .filter(page => pageExists(langCode, page))
        .map(page => prefix + page);

      if (existingPages.length > 0) {
        groups.push({
          group: translateGroup(langCode, groupConfig.group),
          pages: existingPages
        });
      }
    }

    if (groups.length > 0) {
      tabs.push({
        tab: translateTab(langCode, tabConfig.tab),
        groups
      });
    }
  }

  return tabs;
}

// Generate the full docs.json
function generateDocsJson() {
  const languagesConfig = languages.map(lang => {
    const tabs = generateTabsForLanguage(lang.code);
    return {
      language: lang.code,
      tabs
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
    "redirects": [
      {
        "source": "/integrations/claude-code-skill",
        "destination": "/integrations/coding-agent-skill"
      }
    ],
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
  const tabs = generateTabsForLanguage(lang.code);
  const pageCount = tabs.reduce((sum, tab) =>
    sum + tab.groups.reduce((gSum, g) => gSum + g.pages.length, 0), 0);
  console.log(`  ${lang.code}: ${pageCount} pages in ${tabs.length} tabs`);
}
