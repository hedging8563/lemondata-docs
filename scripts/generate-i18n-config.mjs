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
  return pages.map(page => `${langCode}/${page}`);
}

// 为每个语言生成完整的 tabs 配置
function generateTabsForLanguage(tabs, langCode) {
  return tabs.map(tab => ({
    tab: tab.tab,
    groups: tab.groups.map(group => ({
      group: group.group,
      pages: prefixPages(group.pages, langCode)
    }))
  }));
}

// 生成 languages 配置 (每个语言包含完整的 tabs)
const languagesConfig = languages.map(lang => ({
  language: lang.code,
  tabs: generateTabsForLanguage(originalTabs, lang.code)
}));

// 构建新的 navigation 配置
docsJson.navigation = {
  global: {
    anchors: globalConfig.anchors || []
  },
  languages: languagesConfig
};

// 删除旧的 i18n 配置和 banner（如果存在）
delete docsJson.i18n;
delete docsJson.banner;

fs.writeFileSync(path.join(DOCS_DIR, 'docs.json'), JSON.stringify(docsJson, null, 2) + '\n', 'utf-8');
console.log('✅ Multi-language navigation generated');
console.log('   Languages:', languages.map(l => l.code).join(', '));
console.log('   Format: navigation.languages[].tabs[].groups[].pages[]');
