#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';

const DOCS_DIR = path.join(import.meta.dirname, '..');
const docsJson = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'docs.json'), 'utf-8'));

// 定义语言配置
const languages = [
  { code: 'en', default: true },
  { code: 'zh' },
  { code: 'zh-TW' },
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
function prefixPages(tabs, langCode) {
  if (langCode === 'en') return tabs; // 英文不加前缀

  return tabs.map(tab => ({
    ...tab,
    groups: tab.groups.map(group => ({
      ...group,
      pages: group.pages.map(page => `${langCode}/${page}`)
    }))
  }));
}

// 生成 languages 配置
const languagesConfig = languages.map(lang => {
  const config = {
    language: lang.code,
    tabs: prefixPages(originalTabs, lang.code)
  };

  if (lang.default) {
    config.default = true;
  }

  return config;
});

// 构建新的 navigation 配置
docsJson.navigation = {
  global: globalConfig,
  languages: languagesConfig
};

// 删除旧的 i18n 配置（如果存在）
delete docsJson.i18n;

fs.writeFileSync(path.join(DOCS_DIR, 'docs.json'), JSON.stringify(docsJson, null, 2) + '\n', 'utf-8');
console.log('✅ Multi-language navigation generated');
console.log('   Languages:', languages.map(l => l.code).join(', '));
