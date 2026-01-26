#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';

const DOCS_DIR = path.join(import.meta.dirname, '..');
const docsJson = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'docs.json'), 'utf-8'));

// 定义语言配置
const languages = [
  { locale: 'en', label: 'English', isDefault: true },
  { locale: 'zh', label: '简体中文' },
  { locale: 'zh-TW', label: '繁體中文' },
  { locale: 'ja', label: '日本語' },
  { locale: 'ko', label: '한국어' },
  { locale: 'de', label: 'Deutsch' },
  { locale: 'fr', label: 'Français' },
  { locale: 'es', label: 'Español' },
  { locale: 'pt', label: 'Português' },
  { locale: 'ar', label: 'العربية' },
  { locale: 'vi', label: 'Tiếng Việt' },
  { locale: 'id', label: 'Indonesian' },
  { locale: 'tr', label: 'Türkçe' },
];

// 基础导航配置（从当前 docs.json 提取）
const baseTabs = docsJson.navigation.tabs;

// 为每个页面路径添加语言前缀
function prefixPages(tabs, locale) {
  if (locale === 'en') return tabs; // 英文不加前缀

  return tabs.map(tab => ({
    ...tab,
    groups: tab.groups.map(group => ({
      ...group,
      pages: group.pages.map(page => `${locale}/${page}`)
    }))
  }));
}

// 生成 i18n 配置
const i18n = {
  default: 'en',
  locales: languages.map(lang => {
    const locale = {
      locale: lang.locale,
      label: lang.label,
    };

    // 为非默认语言添加导航配置
    if (!lang.isDefault) {
      locale.navigation = {
        tabs: prefixPages(baseTabs, lang.locale)
      };
    }

    return locale;
  })
};

// 更新 docs.json
// 移除 global.languages（不再需要）
if (docsJson.navigation.global && docsJson.navigation.global.languages) {
  delete docsJson.navigation.global.languages;
}

// 添加 i18n 配置
docsJson.i18n = i18n;

fs.writeFileSync(path.join(DOCS_DIR, 'docs.json'), JSON.stringify(docsJson, null, 2) + '\n', 'utf-8');
console.log('✅ i18n config generated');
console.log('   Locales:', languages.map(l => l.locale).join(', '));
