#!/usr/bin/env node

/**
 * Generate Mintlify i18n configuration
 *
 * Converts tabs-based navigation to languages array with tabs
 * for multi-language support (correct Mintlify format).
 *
 * Format: navigation.languages[].tabs[].groups[].pages[]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const DOCS_DIR = path.join(import.meta.dirname, '..');

// 读取原始配置（从 git 获取干净版本）
function getOriginalConfig() {
  const backupPath = path.join(DOCS_DIR, 'docs.original.json');
  if (fs.existsSync(backupPath)) {
    return JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  }
  return JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'docs.json'), 'utf-8'));
}

const docsJson = getOriginalConfig();

// 翻译映射表
const translations = {
  // Tab 名称
  'Documentation': {
    zh: '文档', 'zh-Hant': '文檔', ja: 'ドキュメント', ko: '문서',
    de: 'Dokumentation', fr: 'Documentation', es: 'Documentación', pt: 'Documentação',
    ar: 'التوثيق', vi: 'Tài liệu', id: 'Dokumentasi', tr: 'Dokümantasyon'
  },
  'API Reference': {
    zh: 'API 参考', 'zh-Hant': 'API 參考', ja: 'APIリファレンス', ko: 'API 레퍼런스',
    de: 'API-Referenz', fr: 'Référence API', es: 'Referencia API', pt: 'Referência da API',
    ar: 'مرجع API', vi: 'Tham chiếu API', id: 'Referensi API', tr: 'API Referansı'
  },
  'Integrations': {
    zh: '集成', 'zh-Hant': '整合', ja: '統合', ko: '통합',
    de: 'Integrationen', fr: 'Intégrations', es: 'Integraciones', pt: 'Integrações',
    ar: 'التكاملات', vi: 'Tích hợp', id: 'Integrasi', tr: 'Entegrasyonlar'
  },
  // Group 名称
  'Getting Started': {
    zh: '快速开始', 'zh-Hant': '快速開始', ja: 'はじめに', ko: '시작하기',
    de: 'Erste Schritte', fr: 'Démarrage', es: 'Primeros pasos', pt: 'Começando',
    ar: 'البدء', vi: 'Bắt đầu', id: 'Memulai', tr: 'Başlarken'
  },
  'Guides': {
    zh: '指南', 'zh-Hant': '指南', ja: 'ガイド', ko: '가이드',
    de: 'Anleitungen', fr: 'Guides', es: 'Guías', pt: 'Guias',
    ar: 'الأدلة', vi: 'Hướng dẫn', id: 'Panduan', tr: 'Kılavuzlar'
  },
  'Overview': {
    zh: '概述', 'zh-Hant': '概述', ja: '概要', ko: '개요',
    de: 'Übersicht', fr: 'Aperçu', es: 'Descripción general', pt: 'Visão geral',
    ar: 'نظرة عامة', vi: 'Tổng quan', id: 'Ikhtisar', tr: 'Genel Bakış'
  },
  'Chat': {
    zh: '对话', 'zh-Hant': '對話', ja: 'チャット', ko: '채팅',
    de: 'Chat', fr: 'Chat', es: 'Chat', pt: 'Chat',
    ar: 'الدردشة', vi: 'Trò chuyện', id: 'Obrolan', tr: 'Sohbet'
  },
  'Responses (OpenAI)': {
    zh: 'Responses (OpenAI)', 'zh-Hant': 'Responses (OpenAI)', ja: 'Responses (OpenAI)', ko: 'Responses (OpenAI)',
    de: 'Responses (OpenAI)', fr: 'Responses (OpenAI)', es: 'Responses (OpenAI)', pt: 'Responses (OpenAI)',
    ar: 'Responses (OpenAI)', vi: 'Responses (OpenAI)', id: 'Responses (OpenAI)', tr: 'Responses (OpenAI)'
  },
  'Messages (Anthropic)': {
    zh: 'Messages (Anthropic)', 'zh-Hant': 'Messages (Anthropic)', ja: 'Messages (Anthropic)', ko: 'Messages (Anthropic)',
    de: 'Messages (Anthropic)', fr: 'Messages (Anthropic)', es: 'Messages (Anthropic)', pt: 'Messages (Anthropic)',
    ar: 'Messages (Anthropic)', vi: 'Messages (Anthropic)', id: 'Messages (Anthropic)', tr: 'Messages (Anthropic)'
  },
  'Gemini (Google)': {
    zh: 'Gemini (Google)', 'zh-Hant': 'Gemini (Google)', ja: 'Gemini (Google)', ko: 'Gemini (Google)',
    de: 'Gemini (Google)', fr: 'Gemini (Google)', es: 'Gemini (Google)', pt: 'Gemini (Google)',
    ar: 'Gemini (Google)', vi: 'Gemini (Google)', id: 'Gemini (Google)', tr: 'Gemini (Google)'
  },
  'Embeddings': {
    zh: '向量嵌入', 'zh-Hant': '向量嵌入', ja: 'エンベディング', ko: '임베딩',
    de: 'Embeddings', fr: 'Embeddings', es: 'Embeddings', pt: 'Embeddings',
    ar: 'التضمينات', vi: 'Embeddings', id: 'Embeddings', tr: 'Embeddings'
  },
  'Rerank': {
    zh: '重排序', 'zh-Hant': '重排序', ja: 'リランク', ko: '리랭크',
    de: 'Rerank', fr: 'Rerank', es: 'Rerank', pt: 'Rerank',
    ar: 'إعادة الترتيب', vi: 'Rerank', id: 'Rerank', tr: 'Rerank'
  },
  'Images': {
    zh: '图像', 'zh-Hant': '圖像', ja: '画像', ko: '이미지',
    de: 'Bilder', fr: 'Images', es: 'Imágenes', pt: 'Imagens',
    ar: 'الصور', vi: 'Hình ảnh', id: 'Gambar', tr: 'Görseller'
  },
  'Audio': {
    zh: '音频', 'zh-Hant': '音訊', ja: 'オーディオ', ko: '오디오',
    de: 'Audio', fr: 'Audio', es: 'Audio', pt: 'Áudio',
    ar: 'الصوت', vi: 'Âm thanh', id: 'Audio', tr: 'Ses'
  },
  'Video': {
    zh: '视频', 'zh-Hant': '視頻', ja: 'ビデオ', ko: '비디오',
    de: 'Video', fr: 'Vidéo', es: 'Video', pt: 'Vídeo',
    ar: 'الفيديو', vi: 'Video', id: 'Video', tr: 'Video'
  },
  'Music': {
    zh: '音乐', 'zh-Hant': '音樂', ja: '音楽', ko: '음악',
    de: 'Musik', fr: 'Musique', es: 'Música', pt: 'Música',
    ar: 'الموسيقى', vi: 'Âm nhạc', id: 'Musik', tr: 'Müzik'
  },
  '3D Generation': {
    zh: '3D 生成', 'zh-Hant': '3D 生成', ja: '3D生成', ko: '3D 생성',
    de: '3D-Generierung', fr: 'Génération 3D', es: 'Generación 3D', pt: 'Geração 3D',
    ar: 'توليد ثلاثي الأبعاد', vi: 'Tạo 3D', id: 'Pembuatan 3D', tr: '3D Oluşturma'
  },
  'Models': {
    zh: '模型', 'zh-Hant': '模型', ja: 'モデル', ko: '모델',
    de: 'Modelle', fr: 'Modèles', es: 'Modelos', pt: 'Modelos',
    ar: 'النماذج', vi: 'Mô hình', id: 'Model', tr: 'Modeller'
  },
  'Pricing': {
    zh: '定价', 'zh-Hant': '定價', ja: '料金', ko: '가격',
    de: 'Preise', fr: 'Tarification', es: 'Precios', pt: 'Preços',
    ar: 'التسعير', vi: 'Giá cả', id: 'Harga', tr: 'Fiyatlandırma'
  },
  'Cache': {
    zh: '缓存', 'zh-Hant': '快取', ja: 'キャッシュ', ko: '캐시',
    de: 'Cache', fr: 'Cache', es: 'Caché', pt: 'Cache',
    ar: 'التخزين المؤقت', vi: 'Bộ nhớ đệm', id: 'Cache', tr: 'Önbellek'
  },
  'SDKs & Frameworks': {
    zh: 'SDK 和框架', 'zh-Hant': 'SDK 和框架', ja: 'SDK & フレームワーク', ko: 'SDK 및 프레임워크',
    de: 'SDKs & Frameworks', fr: 'SDKs & Frameworks', es: 'SDKs y Frameworks', pt: 'SDKs e Frameworks',
    ar: 'SDKs والأطر', vi: 'SDK & Framework', id: 'SDK & Framework', tr: 'SDK\'lar ve Framework\'ler'
  },
  'IDEs & CLI Tools': {
    zh: 'IDE 和 CLI 工具', 'zh-Hant': 'IDE 和 CLI 工具', ja: 'IDE & CLIツール', ko: 'IDE 및 CLI 도구',
    de: 'IDEs & CLI-Tools', fr: 'IDEs & Outils CLI', es: 'IDEs y herramientas CLI', pt: 'IDEs e ferramentas CLI',
    ar: 'IDEs وأدوات CLI', vi: 'IDE & Công cụ CLI', id: 'IDE & Alat CLI', tr: 'IDE\'ler ve CLI Araçları'
  },
  'Chat Applications': {
    zh: '聊天应用', 'zh-Hant': '聊天應用', ja: 'チャットアプリ', ko: '채팅 애플리케이션',
    de: 'Chat-Anwendungen', fr: 'Applications de chat', es: 'Aplicaciones de chat', pt: 'Aplicativos de chat',
    ar: 'تطبيقات الدردشة', vi: 'Ứng dụng chat', id: 'Aplikasi Chat', tr: 'Sohbet Uygulamaları'
  },
  // Anchor 名称
  'Dashboard': {
    zh: '控制台', 'zh-Hant': '控制台', ja: 'ダッシュボード', ko: '대시보드',
    de: 'Dashboard', fr: 'Tableau de bord', es: 'Panel', pt: 'Painel',
    ar: 'لوحة التحكم', vi: 'Bảng điều khiển', id: 'Dasbor', tr: 'Kontrol Paneli'
  },
  'API Status': {
    zh: 'API 状态', 'zh-Hant': 'API 狀態', ja: 'APIステータス', ko: 'API 상태',
    de: 'API-Status', fr: 'Statut API', es: 'Estado de API', pt: 'Status da API',
    ar: 'حالة API', vi: 'Trạng thái API', id: 'Status API', tr: 'API Durumu'
  }
};

// 翻译函数
function translate(text, langCode) {
  if (langCode === 'en') return text;
  return translations[text]?.[langCode] || text;
}

// 定义语言配置 (使用 Mintlify 支持的语言代码)
const languages = [
  { code: 'en', default: true },
  { code: 'zh' },
  { code: 'zh-Hant' },  // Mintlify 使用 zh-Hant 而非 zh-TW
  { code: 'ja' },
  { code: 'ko' },
  { code: 'de' },
  { code: 'fr' },
  { code: 'es' },
  { code: 'pt' },
  { code: 'ar' },
  { code: 'vi' },
  { code: 'id' },
  { code: 'tr' },
];

// 保存原始 tabs 配置
const originalTabs = docsJson.navigation.tabs;
const globalConfig = docsJson.navigation.global || {};

// 为每个页面路径添加语言前缀
function prefixPages(pages, langCode) {
  if (langCode === 'en') return pages;
  // zh-Hant 文件夹实际名称也是 zh-Hant
  return pages.map(page => `${langCode}/${page}`);
}

// 为每个语言生成完整的 tabs 配置
function generateTabsForLanguage(tabs, langCode) {
  return tabs.map(tab => ({
    tab: translate(tab.tab, langCode),
    groups: tab.groups.map(group => ({
      group: translate(group.group, langCode),
      pages: prefixPages(group.pages, langCode)
    }))
  }));
}

// 为每个语言生成 anchors 配置
function generateAnchorsForLanguage(anchors, langCode) {
  return anchors.map(anchor => {
    let href = anchor.href;
    // 更新 Models 链接到对应语言版本
    if (anchor.anchor === 'Models' && href.includes('/en/models')) {
      href = href.replace('/en/models', `/${langCode === 'zh-Hant' ? 'zh-TW' : langCode}/models`);
    }
    return {
      anchor: translate(anchor.anchor, langCode),
      href: href,
      icon: anchor.icon
    };
  });
}

// 生成 languages 配置 (每个语言包含完整的 tabs 和 anchors)
const languagesConfig = languages.map(lang => ({
  language: lang.code,
  tabs: generateTabsForLanguage(originalTabs, lang.code),
  anchors: generateAnchorsForLanguage(globalConfig.anchors || [], lang.code)
}));

// 构建新的 navigation 配置
// 保留 global anchors 作为默认值，同时每个语言有自己的翻译版本
docsJson.navigation = {
  global: globalConfig,
  languages: languagesConfig
};

// 删除旧的 i18n 配置和 banner（如果存在）
delete docsJson.i18n;
delete docsJson.banner;

fs.writeFileSync(path.join(DOCS_DIR, 'docs.json'), JSON.stringify(docsJson, null, 2) + '\n', 'utf-8');
console.log('✅ Multi-language navigation generated');
console.log('   Languages:', languages.map(l => l.code).join(', '));
console.log('   Format: navigation.languages[].tabs[].groups[].pages[]');
