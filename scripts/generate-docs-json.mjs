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
    groups: { 'Getting Started': '快速入门', 'Guides': '指南', 'Overview': '概览', 'Chat': '对话', 'Messages': '消息', 'Files': '文件', 'Batches': '批处理', 'Responses': '响应', 'Gemini': 'Gemini', 'Images': '图像', 'Video': '视频', 'Audio': '音频', 'Music': '音乐', '3D': '3D', 'Embeddings': '向量嵌入', 'Rerank': '重排序', 'Cache': '缓存', 'Models': '模型', 'Pricing': '定价', 'Chat Platforms': '聊天平台', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': '框架', 'Chat Apps': '聊天应用' }
  },
  'zh-Hant': {
    tabs: { 'Documentation': '文件', 'API Reference': 'API 參考', 'Claw': 'Claw', 'Integrations': '整合' },
    groups: { 'Getting Started': '快速入門', 'Guides': '指南', 'Overview': '概覽', 'Chat': '對話', 'Messages': '訊息', 'Files': '檔案', 'Batches': '批次', 'Responses': '回應', 'Gemini': 'Gemini', 'Images': '圖像', 'Video': '影片', 'Audio': '音訊', 'Music': '音樂', '3D': '3D', 'Embeddings': '向量嵌入', 'Rerank': '重新排序', 'Cache': '快取', 'Models': '模型', 'Pricing': '定價', 'Chat Platforms': '聊天平台', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': '框架', 'Chat Apps': '聊天應用' }
  },
  ja: {
    tabs: { 'Documentation': 'ドキュメント', 'API Reference': 'APIリファレンス', 'Claw': 'Claw', 'Integrations': '連携' },
    groups: { 'Getting Started': 'はじめに', 'Guides': 'ガイド', 'Overview': '概要', 'Chat': 'チャット', 'Messages': 'メッセージ', 'Files': 'ファイル', 'Batches': 'バッチ', 'Responses': 'レスポンス', 'Gemini': 'Gemini', 'Images': '画像', 'Video': '動画', 'Audio': '音声', 'Music': '音楽', '3D': '3D', 'Embeddings': 'エンベディング', 'Rerank': 'リランク', 'Cache': 'キャッシュ', 'Models': 'モデル', 'Pricing': '料金', 'Chat Platforms': 'チャットプラットフォーム', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'フレームワーク', 'Chat Apps': 'チャットアプリ' }
  },
  ko: {
    tabs: { 'Documentation': '문서', 'API Reference': 'API 레퍼런스', 'Claw': 'Claw', 'Integrations': '통합' },
    groups: { 'Getting Started': '시작하기', 'Guides': '가이드', 'Overview': '개요', 'Chat': '채팅', 'Messages': '메시지', 'Files': '파일', 'Batches': '배치', 'Responses': '응답', 'Gemini': 'Gemini', 'Images': '이미지', 'Video': '비디오', 'Audio': '오디오', 'Music': '음악', '3D': '3D', 'Embeddings': '임베딩', 'Rerank': '리랭크', 'Cache': '캐시', 'Models': '모델', 'Pricing': '요금', 'Chat Platforms': '채팅 플랫폼', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': '프레임워크', 'Chat Apps': '채팅 앱' }
  },
  de: {
    tabs: { 'Documentation': 'Dokumentation', 'API Reference': 'API-Referenz', 'Claw': 'Claw', 'Integrations': 'Integrationen' },
    groups: { 'Getting Started': 'Erste Schritte', 'Guides': 'Anleitungen', 'Overview': 'Übersicht', 'Chat': 'Chat', 'Messages': 'Nachrichten', 'Files': 'Dateien', 'Batches': 'Batch-Jobs', 'Responses': 'Antworten', 'Gemini': 'Gemini', 'Images': 'Bilder', 'Video': 'Video', 'Audio': 'Audio', 'Music': 'Musik', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Cache', 'Models': 'Modelle', 'Pricing': 'Preise', 'Chat Platforms': 'Chat-Plattformen', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Chat-Apps' }
  },
  fr: {
    tabs: { 'Documentation': 'Documentation', 'API Reference': 'Référence API', 'Claw': 'Claw', 'Integrations': 'Intégrations' },
    groups: { 'Getting Started': 'Démarrage', 'Guides': 'Guides', 'Overview': 'Aperçu', 'Chat': 'Chat', 'Messages': 'Messages', 'Files': 'Fichiers', 'Batches': 'Lots', 'Responses': 'Réponses', 'Gemini': 'Gemini', 'Images': 'Images', 'Video': 'Vidéo', 'Audio': 'Audio', 'Music': 'Musique', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Cache', 'Models': 'Modèles', 'Pricing': 'Tarifs', 'Chat Platforms': 'Plateformes de chat', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Apps de chat' }
  },
  es: {
    tabs: { 'Documentation': 'Documentación', 'API Reference': 'Referencia API', 'Claw': 'Claw', 'Integrations': 'Integraciones' },
    groups: { 'Getting Started': 'Primeros pasos', 'Guides': 'Guías', 'Overview': 'Descripción general', 'Chat': 'Chat', 'Messages': 'Mensajes', 'Files': 'Archivos', 'Batches': 'Lotes', 'Responses': 'Respuestas', 'Gemini': 'Gemini', 'Images': 'Imágenes', 'Video': 'Video', 'Audio': 'Audio', 'Music': 'Música', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Caché', 'Models': 'Modelos', 'Pricing': 'Precios', 'Chat Platforms': 'Plataformas de chat', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Apps de chat' }
  },
  pt: {
    tabs: { 'Documentation': 'Documentação', 'API Reference': 'Referência da API', 'Claw': 'Claw', 'Integrations': 'Integrações' },
    groups: { 'Getting Started': 'Primeiros passos', 'Guides': 'Guias', 'Overview': 'Visão geral', 'Chat': 'Chat', 'Messages': 'Mensagens', 'Files': 'Arquivos', 'Batches': 'Lotes', 'Responses': 'Respostas', 'Gemini': 'Gemini', 'Images': 'Imagens', 'Video': 'Vídeo', 'Audio': 'Áudio', 'Music': 'Música', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Cache', 'Models': 'Modelos', 'Pricing': 'Preços', 'Chat Platforms': 'Plataformas de chat', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Apps de chat' }
  },
  ar: {
    tabs: { 'Documentation': 'التوثيق', 'API Reference': 'مرجع API', 'Claw': 'Claw', 'Integrations': 'التكاملات' },
    groups: { 'Getting Started': 'البدء', 'Guides': 'الأدلة', 'Overview': 'نظرة عامة', 'Chat': 'الدردشة', 'Messages': 'الرسائل', 'Files': 'الملفات', 'Batches': 'المهام الدفعية', 'Responses': 'الاستجابات', 'Gemini': 'Gemini', 'Images': 'الصور', 'Video': 'الفيديو', 'Audio': 'الصوت', 'Music': 'الموسيقى', '3D': '3D', 'Embeddings': 'التضمينات', 'Rerank': 'إعادة الترتيب', 'Cache': 'التخزين المؤقت', 'Models': 'النماذج', 'Pricing': 'الأسعار', 'Chat Platforms': 'منصات الدردشة', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'أطر العمل', 'Chat Apps': 'تطبيقات الدردشة' }
  },
  vi: {
    tabs: { 'Documentation': 'Tài liệu', 'API Reference': 'Tham chiếu API', 'Claw': 'Claw', 'Integrations': 'Tích hợp' },
    groups: { 'Getting Started': 'Bắt đầu', 'Guides': 'Hướng dẫn', 'Overview': 'Tổng quan', 'Chat': 'Chat', 'Messages': 'Tin nhắn', 'Files': 'Tệp', 'Batches': 'Lô', 'Responses': 'Phản hồi', 'Gemini': 'Gemini', 'Images': 'Hình ảnh', 'Video': 'Video', 'Audio': 'Âm thanh', 'Music': 'Âm nhạc', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Bộ nhớ đệm', 'Models': 'Mô hình', 'Pricing': 'Bảng giá', 'Chat Platforms': 'Nền tảng chat', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Ứng dụng chat' }
  },
  id: {
    tabs: { 'Documentation': 'Dokumentasi', 'API Reference': 'Referensi API', 'Claw': 'Claw', 'Integrations': 'Integrasi' },
    groups: { 'Getting Started': 'Memulai', 'Guides': 'Panduan', 'Overview': 'Ikhtisar', 'Chat': 'Chat', 'Messages': 'Pesan', 'Files': 'Berkas', 'Batches': 'Batch', 'Responses': 'Respons', 'Gemini': 'Gemini', 'Images': 'Gambar', 'Video': 'Video', 'Audio': 'Audio', 'Music': 'Musik', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Cache', 'Models': 'Model', 'Pricing': 'Harga', 'Chat Platforms': 'Platform Chat', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Aplikasi Chat' }
  },
  tr: {
    tabs: { 'Documentation': 'Dokümantasyon', 'API Reference': 'API Referansı', 'Claw': 'Claw', 'Integrations': 'Entegrasyonlar' },
    groups: { 'Getting Started': 'Başlarken', 'Guides': 'Kılavuzlar', 'Overview': 'Genel Bakış', 'Chat': 'Sohbet', 'Messages': 'Mesajlar', 'Files': 'Dosyalar', 'Batches': 'Toplu İşler', 'Responses': 'Yanıtlar', 'Gemini': 'Gemini', 'Images': 'Görseller', 'Video': 'Video', 'Audio': 'Ses', 'Music': 'Müzik', '3D': '3D', 'Embeddings': 'Embeddings', 'Rerank': 'Rerank', 'Cache': 'Önbellek', 'Models': 'Modeller', 'Pricing': 'Fiyatlandırma', 'Chat Platforms': 'Sohbet Platformları', 'IDE & CLI': 'IDE & CLI', 'SDKs': 'SDKs', 'Frameworks': 'Frameworks', 'Chat Apps': 'Sohbet Uygulamaları' }
  },
};

// Navigation structure with tabs
const navigationTabs = {
  documentation: {
    tab: 'Documentation',
    groups: [
      {
        group: 'Getting Started',
        pages: ['introduction', 'quickstart', 'authentication', 'integrations/coding-agent-skill']
      },
      {
        group: 'Guides',
        pages: [
          'guides/agent-first-api',
          'guides/api-formats',
          'guides/caching',
          'guides/prompt-cache',
          'guides/sdks',
          'guides/streaming',
          'guides/error-handling',
          'guides/rate-limits',
          'guides/billing',
          'guides/best-practices',
          'guides/ide-sdk-compatibility',
          'guides/video-generation'
        ]
      }
    ]
  },
  apiReference: {
    tab: 'API Reference',
    groups: [
      {
        group: 'Overview',
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
        group: 'Files',
        pages: [
          'api-reference/files/upload-file',
          'api-reference/files/list-files',
          'api-reference/files/retrieve-file',
          'api-reference/files/retrieve-file-content'
        ]
      },
      {
        group: 'Batches',
        pages: [
          'api-reference/batches/create-batch',
          'api-reference/batches/list-batches',
          'api-reference/batches/retrieve-batch',
          'api-reference/batches/cancel-batch'
        ]
      },
      {
        group: 'Responses',
        pages: ['api-reference/responses/create-response']
      },
      {
        group: 'Gemini',
        pages: [
          'api-reference/gemini/list-models',
          'api-reference/gemini/get-model',
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
        group: 'Chat Platforms',
        pages: [
          'claw/telegram',
          'claw/discord',
          'claw/whatsapp',
          'claw/slack',
          'claw/feishu',
          'claw/wecom',
          'claw/dingtalk',
          'claw/qq'
        ]
      }
    ]
  },
  integrations: {
    tab: 'Integrations',
    groups: [
      {
        group: 'IDE & CLI',
        pages: [
          'integrations/cursor',
          'integrations/claude-code',
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
    ]
  },
  skills: {
    tab: 'Skills',
    groups: [
      {
        group: 'Overview',
        pages: ['skills/index', 'skills/publishing-pipeline']
      },
      {
        group: 'Categories',
        pages: [
          'skills/categories/index',
          'skills/categories/research',
          'skills/categories/coding',
          'skills/categories/writing',
          'skills/categories/data-analytics',
          'skills/categories/design',
          'skills/categories/planning',
          'skills/categories/communication',
          'skills/categories/productivity',
          'skills/categories/devops',
          'skills/categories/ai-ml',
          'skills/categories/security',
          'skills/categories/business'
        ]
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
